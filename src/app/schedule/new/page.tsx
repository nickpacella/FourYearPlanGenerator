"use client"; // Ensure this page runs as a Client Component

import React, { useState } from 'react';
import ClientPlan from '../../components/ClientPlan';


export default function NewSchedulePage() {
  const [isSaved, setIsSaved] = useState(false); // State to track save status

  const handleSaveSchedule = () => {
    // Placeholder function for saving the schedule
    console.log("Schedule saved!");
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">Create a New Schedule</h1>
      <p className="text-lg text-gray-700">
        This is where your new schedule will be displayed and managed.
      </p>
      <p className="mt-4 text-gray-500">Start building your four-year plan here!</p>

      
      <ClientPlan />

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
