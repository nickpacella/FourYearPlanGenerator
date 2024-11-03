"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientPlan from '../../components/ClientPlan';

type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

export default function NewSchedulePage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [major, setMajor] = useState<string>('');
  const [minor, setMinor] = useState<string>('');
  const [electives, setElectives] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('id');

  function generateRandomId() {
    return `_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  useEffect(() => {
    const fetchSchedule = async () => {
      if (scheduleId) {
        try {
          const response = await fetch(`/api/getSchedule?id=${scheduleId}`);
          const data = await response.json();
          const fetchedSchedule = data.schedule;

          if (fetchedSchedule) {
            setSchedule(fetchedSchedule);
            setMajor(fetchedSchedule.schedule.major);
            setMinor(fetchedSchedule.schedule.minor);
            setElectives(fetchedSchedule.schedule.electives);
            console.log("Fetched schedule and set fields successfully");
          }
        } catch (error) {
          console.error('Error fetching schedule:', error);
        }
      }
    };

    // Only fetch if schedule data has not been set yet to prevent re-fetching on re-renders
    if (!schedule && scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId, schedule]);

  const handleSaveSchedule = async () => {
    const scheduleName = prompt("Enter a name for your schedule:");

    if (!scheduleName || !major || !minor || electives.length === 0) {
      alert('Please ensure all fields are filled before saving.');
      return;
    }

    const scheduleToSave = {
      id: scheduleId ? scheduleId : generateRandomId(),
      name: scheduleName,
      schedule: {
        major,
        minor,
        electives,
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

      <button
        onClick={handleSaveSchedule}
        className="mt-6 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition"
      >
        Save Schedule
      </button>

      {isSaved && (
        <p className="mt-4 text-green-700 font-medium">
          Schedule has been saved successfully!
        </p>
      )}
    </div>  
  );
}
