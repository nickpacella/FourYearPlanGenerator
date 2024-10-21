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

export default function ClientPlan() {
  const [major, setMajor] = useState<string>(''); // state for the selected major
  const [electives, setElectives] = useState<string[]>([]); // state for selected electives
  const [availableElectives, setAvailableElectives] = useState<string[]>([]); // state for available electives based on major
  const [minors, setMinors] = useState<string[]>([]);
  const [plan, setPlan] = useState<string[][] | null>(null);

  // update the available electives whenever the major changes
  useEffect(() => {
    if (major) {
    // Set available electives based on selected major
      setAvailableElectives(electivesByMajor[major] || []);
    // Reset selected electives when changing the major
      setElectives([]);
    }
  }, [major]); // this effect runs every time `major` changes

  // function to fetch the generated plan
  async function fetchPlan() {
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          major,
          electives,
          minors,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received plan:', data.plan); // debugging
        setPlan(data.plan); // update the state with the fetched plan
      } else {
        console.error('Error generating the plan');
      }
    } catch (error) {
      console.error('Error generating the plan', error);
    }
  }


  return (
    <div className="w-full flex space-x-8">
      <div className="w-1/2">
        <MajorDropdown major={major} setMajor={setMajor} />
        {/* electives dropdown with checkboxes */}
        <ElectivesDropdown electives={electives} setElectives={setElectives} availableElectives={availableElectives} />
        <MinorsDropdown minors={minors} setMinors={setMinors} />
        
        <button
          onClick={fetchPlan}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
        >
          Update Plan
        </button>
      </div>

      {/* Display the dynamic schedule on the right */}
      <div className="w-1/2 bg-gray-100 p-4 rounded-md">
        <h3 className="text-lg font-semibold">Test Schedule</h3>
        {plan ? (
          plan.map((semester, index) => (
            <div key={index} className="mb-4">
              <h4 className="font-bold">Semester {index + 1}</h4>
              <ul>
              {semester.length > 1 ? (
              semester.slice(1).map((course, courseIndex) => (
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