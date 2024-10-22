"use client"; // Ensure this component runs as a Client Component

import { useState, useEffect } from 'react';
import MajorDropdown from './MajorDropdown'; // Dropdown for selecting major
import ElectivesDropdown from './ElectivesDropdown'; // Dropdown for selecting electives
import MinorsDropdown from './MinorsDropdown'; // Dropdown for selecting minor

/**
 * Mapping of majors to their respective electives.
 * This defines which electives are available based on the selected major.
 */
const electivesByMajor: Record<string, string[]> = {
  CS: ['CS Elective 1', 'CS Elective 2', 'CS Elective 3'],
  Math: ['Math Elective 1', 'Math Elective 2', 'Math Elective 3'],
  EECE: ['EECE Elective 1', 'EECE Elective 2', 'EECE Elective 3'],
};

/**
 * Interface for the ClientPlan component's props.
 * Defines the expected props and their types.
 */
interface ClientPlanProps {
  setMajor: (major: string) => void;
  setMinor: (minor: string) => void;
  setElectives: (electives: string[]) => void;
  major: string;
  minor: string;
  electives: string[];
  scheduleId?: string; // Optional prop to determine if updating an existing schedule
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
  scheduleId, // Used to determine if updating an existing schedule
}: ClientPlanProps) {
  // State to hold the available electives based on the selected major
  const [availableElectives, setAvailableElectives] = useState<string[]>([]);
  
  // State to hold the generated plan (array of semesters, each containing courses)
  const [plan, setPlan] = useState<string[][] | null>(null);
  
  // State to indicate if the plan generation is in progress
  const [loading, setLoading] = useState<boolean>(false);
  
  // State to hold any error messages during plan generation
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect Hook
   * 
   * Updates the available electives whenever the selected major changes.
   * Resets the electives selection if the major is changed.
   */
  useEffect(() => {
    if (major) {
      // Update the available electives based on the selected major
      setAvailableElectives(electivesByMajor[major] || []);
      
      // Reset electives selection when major changes
      setElectives([]);
    }
  }, [major, setElectives]);

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
      alert('No schedule selected for updating.'); // Ensure a schedule ID is present
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
        console.error('Failed to update schedule');
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
    // Container with Tailwind CSS classes for layout and styling
    <div className="w-full flex space-x-8">
      
      {/* 
        Left Section: Contains the dropdowns for selecting major, minor, and electives,
        as well as the button to generate and update the plan.
      */}
      <div className="w-1/2">
        {/* Dropdown for selecting Major */}
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

      {/* 
        Right Section: Displays the generated schedule in a scrollable container.
        Shows semesters and the courses assigned to each.
      */}
      <div className="w-1/2 bg-gray-100 p-4 rounded-md overflow-y-auto max-h-screen">
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
