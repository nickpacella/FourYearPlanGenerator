"use client"; // Ensure this component runs as a Client Component
// src/components/ClientPlan.tsx

'use client';

import { useState, useEffect } from 'react';
import MajorDropdown from './MajorDropdown';
import ElectivesDropdown from './ElectivesDropdown';
import MinorsDropdown from './MinorsDropdown';

interface ClientPlanProps {
  setMajor: (major: string) => void;
  setMinor: (minor: string) => void;
  setElectives: (electives: string[]) => void;
  major: string;
  minor: string;
  electives: string[];
  scheduleId?: string; // Optional prop for updating an existing schedule
}

/**
 * ClientPlan Component
 * 
 * This component provides dropdowns for selecting major, minor, and electives.
 * It handles the dynamic updating of available electives based on the selected major
 * and manages the generation and updating of the schedule plan.
 */
export default function ClientPlan({
  setMajor,
  setMinor,
  setElectives,
  major,
  minor,
  electives,
  scheduleId,
}: ClientPlanProps) {
  // State to hold the available electives based on the selected major
  const [availableElectives, setAvailableElectives] = useState<string[]>([]);
  
  // State to hold the generated plan (array of semesters, each containing courses)
  const [plan, setPlan] = useState<string[][] | null>(null);
  
  // State to indicate if the plan generation is in progress
  const [loading, setLoading] = useState<boolean>(false);
  
  // State to hold any error messages during plan generation
  const [error, setError] = useState<string | null>(null);

  const [allElectives, setAllElectives] = useState<string[]>([]);

  // Fetch electives on component mount
  useEffect(() => {
    async function fetchElectives() {
      try {
        const res = await fetch('/api/getElectives');
        if (res.ok) {
          const data = await res.json();
          setAllElectives(data.electives);
        } else {
          console.error('Failed to fetch electives');
        }
      } catch (error) {
        console.error('Error fetching electives:', error);
      }
    }

    fetchElectives();
  }, []);

  // Update available electives when major changes
  useEffect(() => {
    if (major) {
      // If electives are global, use allElectives
      // If electives are specific to majors, adjust the API accordingly
      setAvailableElectives(allElectives);
      setElectives([]); // Reset electives when major changes
    } else {
      setAvailableElectives([]);
    }
  }, [major, allElectives, setElectives]);

  /**
   * fetchPlan Function
   * 
   * Sends a POST request to the backend API to generate a plan based on the selected
   * major, minor, and electives. Updates the plan state with the received data.
   */
  async function fetchPlan() {
    if (!major) {
      alert('Please select a major to generate the plan.');
      return;
    }

    console.log('Fetching plan with:', { major, electives, minor });

    setLoading(true); // Indicate that the plan generation is in progress
    setError(null); // Reset any previous errors

    try {
      // Make a POST request to the /api/generate-plan endpoint with the selected options
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          major,
          electives,
          minor, // Send minor as a string
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received plan:', data.plan);
        setPlan(data.plan); // Update the plan state with the received data
      } else {
        const errorData = await response.json();
        console.error('Error generating the plan:', errorData.error);
        setError(errorData.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Error generating the plan', error);
      setError('An unexpected error occurred while generating the plan.');
    } finally {
      setLoading(false); // Reset the loading state
    }
  }

  /**
   * updateSchedule Function
   * 
   * Sends a POST request to the backend API to update an existing schedule with
   * the current selections. Requires a valid schedule ID.
   */
  async function updateSchedule() {
    if (!scheduleId) {
      alert('No schedule selected for updating.');
      return;
    }

    console.log('Updating schedule with:', { scheduleId, major, electives, minor });

    try {
      // Make a POST request to the /api/updateSchedule endpoint with the updated schedule data
      const response = await fetch('/api/updateSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: scheduleId, // Existing schedule ID to be updated
          schedule: {
            major,
            minor,
            electives,
          },
        }),
      });

      if (response.ok) {
        console.log('Schedule updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to update schedule:', errorData.error);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  }

  /**
   * handleUpdatePlan Function
   * 
   * Combines fetching the plan and updating the schedule into a single asynchronous operation.
   * Ensures that the plan is generated before attempting to update the schedule.
   */
  const handleUpdatePlan = async () => {
    await fetchPlan(); // Generate the plan
    await updateSchedule(); // Update the schedule with the new plan
  };

  return (
    <div className="w-full flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
      <div className="w-full md:w-1/2 space-y-4">
        <MajorDropdown major={major} setMajor={setMajor} />
        
        {/* Dropdown for selecting Electives */}
        <ElectivesDropdown
          electives={electives}
          setElectives={setElectives}
          availableElectives={availableElectives}
        />
        
        {/* Dropdown for selecting Minor */}
        <MinorsDropdown minor={minor} setMinor={setMinor} />

        {/* 
          Update Plan Button
          Triggers the handleUpdatePlan function to generate and update the schedule.
          Disabled while the plan is being generated.
        */}
        <button
          onClick={handleUpdatePlan}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
          disabled={loading}
        >
          {loading ? 'Generating & Updating Plan...' : 'Update Plan'}
        </button>

        {/* 
          Error Message
          Displays any errors that occur during the plan generation.
        */}
        {error && (
          <p className="mt-4 text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* Display the dynamic schedule on the right */}
      <div className="w-full md:w-1/2 bg-gray-100 p-4 rounded-md overflow-y-auto max-h-screen">
        <h3 className="text-lg font-semibold">Generated Schedule</h3>
        {plan ? (
          // Iterate over each semester and display its courses
          plan.map((semester, index) => (
            <div key={index} className="mb-4">
              <h4 className="font-bold">Semester {index + 1}</h4>
              <ul className="list-disc pl-5">
                {semester.length > 0 ? (
                  // List each course in the semester
                  semester.map((course, courseIndex) => (
                    <li key={courseIndex}>{course}</li>
                  ))
                ) : (
                  // Display a message if no courses are assigned to the semester
                  <li>No courses for this semester.</li>
                )}
              </ul>
            </div>
          ))
        ) : (
          // Prompt the user to generate a schedule if none exists
          <p>Select a major and electives to generate your schedule.</p>
        )}
      </div>
    </div>
  );
}
