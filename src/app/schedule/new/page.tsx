"use client"; // Ensure this page runs as a Client Component

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // To get the ID from URL
import ClientPlan from '../../components/ClientPlan'; // Import the ClientPlan component

/**
 * Type definition for a Schedule object.
 * This ensures consistency in the structure of schedule data throughout the application.
 */
type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

/**
 * NewSchedulePage Component
 * 
 * This component handles both creating a new schedule and updating an existing one.
 * It fetches schedule data if an ID is present in the URL, allows users to input schedule details,
 * and saves the schedule by interacting with the backend API.
 */
export default function NewSchedulePage() {
  // State to hold the current schedule. It can be null if no schedule is loaded.
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  
  // State to track if the schedule has been successfully saved.
  const [isSaved, setIsSaved] = useState(false);
  
  // States for the major, minor, and electives selections.
  const [major, setMajor] = useState<string>('');
  const [minor, setMinor] = useState<string>('');
  const [electives, setElectives] = useState<string[]>([]);
  
  // Hook to access search parameters from the URL.
  const searchParams = useSearchParams();
  
  // Extract the 'id' parameter from the URL to determine if we're editing an existing schedule.
  const scheduleId = searchParams.get('id');

  /**
   * Generates a random ID for a new schedule.
   * This function creates a unique identifier based on the current timestamp and a random string.
   * 
   * @returns A unique string ID.
   */
  function generateRandomId() {
    return `_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * useEffect Hook
   * 
   * Fetches the schedule data from the backend API if a schedule ID is present in the URL.
   * Upon successful fetch, it populates the state with the retrieved schedule details.
   */
  useEffect(() => {
    if (scheduleId) {
      const fetchSchedule = async () => {
        try {
          // Make a GET request to the /api/getSchedule endpoint with the schedule ID
          const response = await fetch(`/api/getSchedule?id=${scheduleId}`);
          const data = await response.json();

          const fetchedSchedule = data.schedule;

          if (fetchedSchedule) {
            // Update the state with the fetched schedule details
            setSchedule(fetchedSchedule);
            setMajor(fetchedSchedule.schedule.major);
            setMinor(fetchedSchedule.schedule.minor);
            setElectives(fetchedSchedule.schedule.electives);
          }
        } catch (error) {
          // Log any errors that occur during the fetch operation
          console.error('Error fetching schedule:', error);
        }
      };
      fetchSchedule();
    }
  }, [scheduleId]);

  /**
   * handleSaveSchedule Function
   * 
   * Handles the saving of a new schedule. It prompts the user for a schedule name,
   * validates the input fields, constructs the schedule object, and sends it to the backend API.
   * Upon successful save, it updates the UI to reflect the saved status.
   */
  const handleSaveSchedule = async () => {
    // Prompt the user to enter a name for the schedule
    const scheduleName = prompt("Enter a name for your schedule:");
    
    // Validate that all fields are filled
    if (!scheduleName || !major || !minor || electives.length === 0) {
      alert('Please ensure all fields are filled before saving.');
      return;
    }

    // Construct the schedule object to be saved
    const scheduleToSave = {
      id: scheduleId ? scheduleId : generateRandomId(), // Use existing ID if editing, else generate new
      name: scheduleName, // Set the schedule name
      schedule: {
        major, // Set the selected major
        minor, // Set the selected minor
        electives, // Set the selected electives
      },
    };

    try {
      // Make a POST request to the /api/saveSchedule endpoint with the schedule data
      const response = await fetch('/api/saveSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleToSave),
      });

      if (response.ok) {
        // If the save is successful, update the isSaved state to show a success message
        setIsSaved(true);
        console.log('Schedule saved successfully!');
      } else {
        // If the response is not OK, log the failure
        console.error('Failed to save schedule');
      }
    } catch (error) {
      // Log any errors that occur during the save operation
      console.error('Error saving schedule:', error);
    }
  };

  return (
    // Main container with Tailwind CSS classes for styling and layout
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      
      {/* Header: Displays whether the user is creating a new schedule or updating an existing one */}
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
        {scheduleId ? 'Update Schedule' : 'Create a New Schedule'}
      </h1>
      
      {/* Subtitle providing additional information */}
      <p className="text-lg text-gray-700">
        This is where your new schedule will be displayed and managed.
      </p>
      
      {/* Additional informational text */}
      <p className="mt-4 text-gray-500">Start building your four-year plan here!</p>

      {/* 
        ClientPlan Component
        Passes down state setters and current values as props.
        This component handles the selection of major, minor, and electives.
      */}
      <ClientPlan
        setMajor={setMajor}
        setMinor={setMinor}
        setElectives={setElectives}
        major={major}
        minor={minor}
        electives={electives}
        scheduleId={scheduleId ?? undefined} // Convert null to undefined for optional prop
      />

      {/* 
        Save Button
        Triggers the handleSaveSchedule function to save the current schedule.
      */}
      <button
        onClick={handleSaveSchedule}
        className="mt-6 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition"
      >
        Save Schedule
      </button>

      {/* 
        Conditional Message
        Displays a success message if the schedule has been saved.
      */}
      {isSaved && (
        <p className="mt-4 text-green-700 font-medium">
          Schedule has been saved successfully!
        </p>
      )}
    </div>
  );
}
