"use client"; // Ensure this page runs as a Client Component

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // To get the ID from URL
import ClientPlan from '../../components/ClientPlan'; // Keep ClientPlan

// Define the Schedule type
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
  const [schedule, setSchedule] = useState<Schedule | null>(null); // Schedule can be of type Schedule or null
  const [isSaved, setIsSaved] = useState(false); // State to track save status
  const [major, setMajor] = useState<string>(''); // State for the selected major
  const [minor, setMinor] = useState<string>(''); // State for the selected minor
  const [electives, setElectives] = useState<string[]>([]); // State for selected electives
  const searchParams = useSearchParams(); // Get query params
  const scheduleId = searchParams.get('id'); // Get the schedule ID from the URL

  function generateRandomId() {
    return `_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Fetch the schedule if an ID is present in the URL and prepopulate dropdowns
  useEffect(() => {
    if (scheduleId) {
      const fetchSchedule = async () => {
        try {
          const response = await fetch(`/api/getSchedule?id=${scheduleId}`);
          const data = await response.json();

          const fetchedSchedule = data.schedule;

          if (fetchedSchedule) {
            setSchedule(fetchedSchedule);
            setMajor(fetchedSchedule.schedule.major);
            setMinor(fetchedSchedule.schedule.minor);
            setElectives(fetchedSchedule.schedule.electives);
          }
        } catch (error) {
          console.error('Error fetching schedule:', error);
        }
      };
      fetchSchedule();
    }
  }, [scheduleId]);

  // Function to handle saving the schedule (new schedule, not updating)
  const handleSaveSchedule = async () => {
    const scheduleName = prompt("Enter a name for your schedule:");
    if (!scheduleName || !major || !minor || electives.length === 0) {
      alert('Please ensure all fields are filled before saving.');
      return;
    }

    const scheduleToSave = {
      id: scheduleId ? scheduleId : generateRandomId(), // Use the existing id if editing, otherwise generate new
      name: scheduleName, // Save the entered name
      schedule: {
        major, // Save the selected major
        minor, // Save the selected minor
        electives, // Save the selected electives
      },
    };

    try {
      const response = await fetch('/api/saveSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleToSave), // Send the schedule with the selected values
      });

      if (response.ok) {
        setIsSaved(true); // Show success message
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

      {/* Render ClientPlan and pass the state setters and current values */}
      <ClientPlan
        setMajor={setMajor}
        setMinor={setMinor}
        setElectives={setElectives}
        major={major}
        minor={minor}
        electives={electives}
        scheduleId={scheduleId ?? undefined} // Convert null to undefined
      />

      {/* Save Button */}
      <button
        onClick={handleSaveSchedule}
        className="mt-6 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition"
      >
        Save Schedule
      </button>

      {/* Conditional Message */}
      {isSaved && (
        <p className="mt-4 text-green-700 font-medium">
          Schedule has been saved successfully!
        </p>
      )}
    </div>
  );
}
