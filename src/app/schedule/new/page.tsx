"use client"; // Ensure this page runs as a Client Component

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // To get the ID from URL

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
  const searchParams = useSearchParams(); // Get query params
  const scheduleId = searchParams.get('id'); // Get the schedule ID from the URL

  function generateRandomId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  // Fetch the schedule if an ID is present in the URL
  useEffect(() => {
    if (scheduleId) {
      const fetchSchedule = async () => {
        const response = await fetch(`/api/getSchedule?id=${scheduleId}`);
        const data = await response.json();
        setSchedule(data.schedule); // Store the fetched schedule
      };
      fetchSchedule();
    }
  }, [scheduleId]);

  // Function to handle saving the schedule
  const handleSaveSchedule = async () => {
    const scheduleName = prompt("Enter a name for your schedule:");
    if (!scheduleName) {
      return; // User canceled
    }

    const mockSchedule = {
      id: generateRandomId(),
      name: scheduleName, // Save the entered name
      schedule: {
        major: "Computer Science",
        minor: "Math",
        electives: ["Elective1", "Elective2"]
      }
    };

    try {
      const response = await fetch('/api/saveSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSchedule), // Send schedule with name and ID
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
      {schedule ? (
        // Display the fetched schedule JSON
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
            Schedule: {schedule.name}
          </h1>
          <pre className="bg-gray-200 p-4 rounded-lg text-left">
            {JSON.stringify(schedule, null, 2)} {/* Pretty print the schedule JSON */}
          </pre>
        </div>
      ) : (
        // Default view when no schedule is selected (new schedule creation)
        <>
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">Create a New Schedule</h1>
          <p className="text-lg text-gray-700">
            This is where your new schedule will be displayed and managed.
          </p>
          <p className="mt-4 text-gray-500">Start building your four-year plan here!</p>

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
        </>
      )}
    </div>
  );
}
