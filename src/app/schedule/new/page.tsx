"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientPlan from '../../components/ClientPlan';
//import jsPDF from 'jspdf';
//import autoTable from 'jspdf-autotable';

type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

interface NameScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const NameScheduleModal: React.FC<NameScheduleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [scheduleName, setScheduleName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (scheduleName.trim()) {
      onSave(scheduleName);
      setScheduleName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        <h3 className="text-xl font-semibold mb-4">Name Your Schedule</h3>
        <input
          type="text"
          placeholder="Enter schedule name"
          value={scheduleName}
          onChange={(e) => setScheduleName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:border-indigo-500"
        />
        <div className="flex justify-around">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NewSchedulePage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [major, setMajor] = useState<string>('');
  const [minor, setMinor] = useState<string>('');
  const [electives, setElectives] = useState<string[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('id');

  function generateRandomId() {
    return `_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  const isLoading = useRef(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (scheduleId && !isLoading.current) {
        isLoading.current = true;
        try {
          const response = await fetch(`/api/getSchedule?id=${scheduleId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch schedule');
          }
          const data = await response.json();
          const fetchedSchedule = data.schedule;

          if (fetchedSchedule) {
            setSchedule(fetchedSchedule);
            setMajor(fetchedSchedule.schedule.major);
            setMinor(fetchedSchedule.schedule.minor);
            setElectives(fetchedSchedule.schedule.electives);
            console.log('Fetched schedule and set fields successfully');
          }
        } catch (error) {
          console.error('Error fetching schedule:', error);
        } finally {
          isLoading.current = false;
        }
      }
    };

    fetchSchedule();
  }, [scheduleId]);

  const handleSaveSchedule = () => {
    if (!major) {
      alert('Please ensure all fields are filled before saving.');
      return;
    }
    setModalOpen(true);
  };

// page.tsx

const saveSchedule = async (scheduleName: string) => {
  if (!major) {
    alert('Please ensure all fields are filled before saving.');
    return;
  }

  // Combine all selected courses into one array
  const allSelectedCourses = electives; // Assuming selectedCourses contains all courses

  const scheduleToSave = {
    id: generateRandomId(),
    name: scheduleName,
    schedule: {
      major,
      minor,
      electives: allSelectedCourses,
    },
  };

  try {
    const response = await fetch('/api/saveSchedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleToSave),
    });

    if (response.ok) {
      setIsSaved(true);
      console.log('Schedule saved successfully!');
    } else {
      console.error('Failed to save schedule');
    }
  } catch (error) {
    console.error('Error saving schedule:', error);
  } finally {
    setModalOpen(false);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
        {scheduleId ? 'Update Schedule' : 'Create a New Schedule'}
      </h1>
      <p className="text-lg text-gray-700">
        This is where your new schedule will be displayed and managed.
      </p>
      <p className="mt-4 text-gray-500">Start building your four-year plan here!</p>

      <ClientPlan
        setMajor={setMajor}
        setMinor={setMinor}
        setElectives={setElectives}
        major={major}
        minor={minor}
        electives={electives}
        scheduleId={scheduleId ?? undefined}
      />

      <div className="mt-4 text-indigo-700 font-medium"></div>

      <div className="flex space-x-4 mt-6">
        <button
          onClick={handleSaveSchedule}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition"
        >
          Save Schedule
        </button>
        
      </div>

      {isSaved && (
        <p className="mt-4 text-green-700 font-medium">
          Schedule has been saved successfully!
        </p>
      )}

      {/* Name Schedule Modal */}
      <NameScheduleModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveSchedule}
      />
    </div>
  );
}
