// src/components/ClientPlan.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import MajorDropdown from './MajorDropdown';
import ElectivesDropdown from './ElectivesDropdown';
import MinorsDropdown from './MinorsDropdown';

/**
 * Interface defining the props expected by the ClientPlan component.
 */
interface ClientPlanProps {
  /**
   * Function to update the selected major in the parent component.
   */
  setMajor: (major: string) => void;

  /**
   * Function to update the selected minor in the parent component.
   */
  setMinor: (minor: string) => void;

  /**
   * Function to update the selected electives in the parent component.
   */
  setElectives: (electives: string[]) => void;

  /**
   * Currently selected major.
   */
  major: string;

  /**
   * Currently selected minor.
   */
  minor: string;

  /**
   * Currently selected electives.
   */
  electives: string[];

  /**
   * Optional schedule ID, used when updating an existing schedule.
   */
  scheduleId?: string;
}

/**
 * ClientPlan Component
 *
 * Handles the selection of major, minor, and electives.
 * Fetches available electives based on selected major and minor.
 * Generates and displays the academic plan.
 */
const ClientPlan: React.FC<ClientPlanProps> = ({
  setMajor,
  setMinor,
  setElectives,
  major,
  minor,
  electives,
  scheduleId,
}) => {
  /**
   * State to hold available electives fetched from the backend.
   */
  const [availableElectives, setAvailableElectives] = useState<string[]>([]);

  /**
   * State to manage loading status while fetching electives.
   */
  const [loadingElectives, setLoadingElectives] = useState<boolean>(false);

  /**
   * State to manage any errors that occur during fetching electives.
   */
  const [errorElectives, setErrorElectives] = useState<string | null>(null);

  /**
   * State to hold all electives (fetched once on mount).
   */
  const [allElectives, setAllElectives] = useState<string[]>([]);

  /**
   * State to hold the generated academic plan.
   * The plan is an array of semesters, each containing an array of courses.
   */
  const [plan, setPlan] = useState<string[][] | null>(null);

  /**
   * State to indicate if the plan generation is in progress.
   */
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);

  /**
   * State to hold any error messages during plan generation.
   */
  const [planError, setPlanError] = useState<string | null>(null);

  // Fetch all electives on component mount
  useEffect(() => {
    async function fetchAllElectives() {
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

    fetchAllElectives();
  }, []);

  // Update available electives when major changes
  useEffect(() => {
    if (major) {
      // If electives are global, use allElectives
      // If electives are specific to majors, adjust the API accordingly
      setAvailableElectives(allElectives);
      //setElectives([]); // Reset electives when major changes
      console.log("hi from if statement client plan set electives")
    } else {
      setAvailableElectives([]);
      console.log("hi from  else statement client plan set electives")
      setElectives([]); // Optionally reset electives if major is deselected
    }
  }, [major, allElectives, setElectives]);

  /**
   * Function to generate the academic plan by sending selected options to the backend.
   */
  const generatePlan = async () => {
    if (!major) {
      alert('Please select a major to generate the plan.');
      return;
    }

    setGeneratingPlan(true);
    setPlanError(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          major,
          minor,
          electives,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan); // Assuming the backend returns a 'plan' array
      } else {
        const errorData = await response.json();
        setPlanError(errorData.error || 'Failed to generate the plan.');
      }
    } catch (error: any) {
      console.error('Error generating the plan:', error);
      setPlanError('An unexpected error occurred while generating the plan.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  /**
   * Function to update an existing schedule by sending updated selections to the backend.
   */
  const updateSchedule = async () => {
    if (!scheduleId) {
      alert('No schedule selected for updating.');
      return;
    }

    try {
      const response = await fetch('/api/updateSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: scheduleId,
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
  };

  /**
   * Handler for the Update Plan button.
   * Generates the plan and updates the schedule if scheduleId is present.
   */
  const handleUpdatePlan = async () => {
    await generatePlan();
    if (scheduleId) {
      await updateSchedule();
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
      <div className="w-full md:w-1/2 space-y-4">
        {/* Major Selection */}
        <MajorDropdown onSelect={setMajor} selectedMajor={major} />

        {/* Electives Selection */}
        <ElectivesDropdown
          onSelect={setElectives}
          availableElectives={availableElectives}
          selectedElectives={electives}
          loading={loadingElectives}
          error={errorElectives}
        />

        {/* Minor Selection */}
        <MinorsDropdown onSelect={setMinor} selectedMinor={minor} />

        {/* Update Plan Button */}
        <button
          onClick={handleUpdatePlan}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
          disabled={generatingPlan}
        >
          {generatingPlan ? 'Generating & Updating Plan...' : 'Generate & Update Plan'}
        </button>

        {/* Error Message */}
        {planError && (
          <p className="mt-4 text-red-500">
            {planError}
          </p>
        )}
      </div>

      {/* Display the dynamic schedule on the right */}
      <div className="w-full md:w-1/2 bg-gray-100 p-4 rounded-md overflow-y-auto max-h-screen">
        <h3 className="text-lg font-semibold mb-4">Generated Schedule</h3>
        {plan ? (
          plan.map((semester, index) => (
            <div key={index} className="mb-6">
              <h4 className="font-bold text-md mb-2">Semester {index + 1}</h4>
              {semester.length > 0 ? (
                <ul className="list-disc list-inside">
                  {semester.map((course, courseIndex) => (
                    <li key={courseIndex}>{course}</li>
                  ))}
                </ul>
              ) : (
                <p>No courses assigned to this semester.</p>
              )}
            </div>
          ))
        ) : (
          <p>Select a major, minor, and electives to generate your academic plan.</p>
        )}
      </div>
    </div>
  );
};

export default ClientPlan;
