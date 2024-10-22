"use client";

import { useState, useEffect } from 'react';
import MajorDropdown from './MajorDropdown';
import ElectivesDropdown from './ElectivesDropdown';
import MinorsDropdown from './MinorsDropdown';

const electivesByMajor: Record<string, string[]> = {
  CS: ['CS Elective 1', 'CS Elective 2', 'CS Elective 3'],
  Math: ['Math Elective 1', 'Math Elective 2', 'Math Elective 3'],
  EECE: ['EECE Elective 1', 'EECE Elective 2', 'EECE Elective 3'],
};

// Define prop types for ClientPlan
interface ClientPlanProps {
  setMajor: (major: string) => void;
  setMinor: (minor: string) => void;
  setElectives: (electives: string[]) => void;
  major: string;
  minor: string;
  electives: string[];
  scheduleId?: string; // Add this prop to know if we're updating an existing schedule
}

export default function ClientPlan({
  setMajor,
  setMinor,
  setElectives,
  major,
  minor,
  electives,
  scheduleId, // Use this prop for updating an existing schedule
}: ClientPlanProps) {
  const [availableElectives, setAvailableElectives] = useState<string[]>([]);
  const [plan, setPlan] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update available electives when major changes
  useEffect(() => {
    if (major) {
      setAvailableElectives(electivesByMajor[major] || []);
      setElectives([]); // Reset electives when major changes
    }
  }, [major, setElectives]);

  // Function to fetch the generated plan
  async function fetchPlan() {
    if (!major) {
      alert('Please select a major to generate the plan.');
      return;
    }

    console.log('Fetching plan with:', { major, electives, minor });

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          major,
          electives,
          minor, // Sending as string
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received plan:', data.plan);
        setPlan(data.plan);
      } else {
        const errorData = await response.json();
        console.error('Error generating the plan:', errorData.error);
        setError(errorData.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Error generating the plan', error);
      setError('An unexpected error occurred while generating the plan.');
    } finally {
      setLoading(false);
    }
  }

  // Function to update the schedule in MongoDB
  async function updateSchedule() {
    if (!scheduleId) {
      alert('No schedule selected for updating.'); // Make sure scheduleId is available
      return;
    }

    console.log('Updating schedule with:', { scheduleId, major, electives, minor });

    try {
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

  // Combined function to both fetch the plan and update the schedule
  const handleUpdatePlan = async () => {
    await fetchPlan(); // Fetch the plan
    await updateSchedule(); // Update the schedule
  };

  return (
    <div className="w-full flex space-x-8">
      <div className="w-1/2">
        <MajorDropdown major={major} setMajor={setMajor} />
        <ElectivesDropdown
          electives={electives}
          setElectives={setElectives}
          availableElectives={availableElectives}
        />
        <MinorsDropdown minor={minor} setMinor={setMinor} />

        <button
          onClick={handleUpdatePlan} // Calls the combined function to update the plan and schedule
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
          disabled={loading}
        >
          {loading ? 'Generating & Updating Plan...' : 'Update Plan'}
        </button>

        {error && (
          <p className="mt-4 text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* Display the dynamic schedule on the right */}
      <div className="w-1/2 bg-gray-100 p-4 rounded-md overflow-y-auto max-h-screen">
        <h3 className="text-lg font-semibold">Generated Schedule</h3>
        {plan ? (
          plan.map((semester, index) => (
            <div key={index} className="mb-4">
              <h4 className="font-bold">Semester {index + 1}</h4>
              <ul className="list-disc pl-5">
                {semester.length > 0 ? (
                  semester.map((course, courseIndex) => (
                    <li key={courseIndex}>{course}</li>
                  ))
                ) : (
                  <li>No courses for this semester.</li>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>Select a major and electives to generate your schedule.</p>
        )}
      </div>
    </div>
  );
}
