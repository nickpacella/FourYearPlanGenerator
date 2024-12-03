// src/components/ClientPlan.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import MajorDropdown from './MajorDropdown';
import ElectivesDropdown from './ElectivesDropdown';
import MinorsDropdown from './MinorsDropdown';
import { Course } from '@/types/Course';
import 'tailwindcss/tailwind.css';

/**
 * Interface defining the props expected by the ClientPlan component.
 */
interface ClientPlanProps {
  setMajor: (major: string) => void;
  setMinor: (minor: string) => void;
  setElectives: (electives: string[]) => void;
  major: string;
  minor: string;
  electives: string[];
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
  // State to hold available electives fetched from the backend.
  const [highlightedCourses, setHighlightedCourses] = useState<Set<string>>(new Set());

  // Ref to store the previous plan
  const prevPlanRef = useRef<string[][] | null>(null);

  const [availableElectives, setAvailableElectives] = useState<Course[]>([]);

  const [allElectives, setAllElectives] = useState<Course[]>([]);
  
  // State to manage loading status while fetching electives.
  const [loadingElectives, setLoadingElectives] = useState<boolean>(false);

  // State to manage any errors that occur during fetching electives.
  const [errorElectives, setErrorElectives] = useState<string | null>(null);

  // State to hold the generated academic plan.
  const [plan, setPlan] = useState<string[][] | null>(null);

  // State to indicate if the plan generation is in progress.
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);

  // State to hold any error messages during plan generation.
  const [planError, setPlanError] = useState<string | null>(null);

  // State to hold the courses completed up to each semester.
  const [completedCourses, setCompletedCourses] = useState<Set<string>[]>([]);

  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // State to hold the selected minor courses from MinorsDropdown.
  const [selectedMinorCourses, setSelectedMinorCourses] = useState<string[]>([]);

  // Fetch all electives on component mount
  useEffect(() => {
    async function fetchAllElectives() {
      try {
        setLoadingElectives(true);
        const res = await fetch('/api/getElectives');
        if (res.ok) {
          const data = await res.json();
          setAllElectives(data.electives);
        } else {
          console.error('Failed to fetch electives');
          setErrorElectives('Failed to fetch electives');
        }
      } catch (error) {
        console.error('Error fetching electives:', error);
        setErrorElectives('Error fetching electives');
      } finally {
        setLoadingElectives(false);
      }
    }

    fetchAllElectives();
  }, []);

  // Fetch all courses on component mount
  useEffect(() => {
    async function fetchAllCourses() {
      try {
        const res = await fetch('/api/getCourses');
        if (res.ok) {
          const data = await res.json();
          setAllCourses(data.courses);
        } else {
          console.error('Failed to fetch all courses');
        }
      } catch (error) {
        console.error('Error fetching all courses:', error);
      }
    }

    fetchAllCourses();
  }, []);

  // Create a course code to name map
  const courseCodeToNameMap: Record<string, string> = {};
  allCourses.forEach((course) => {
    courseCodeToNameMap[course.code] = course.name;
  });


  /**
   * useEffect to automatically generate the plan when the component mounts and major is set.
   */
  useEffect(() => {
    if (major && !plan) {
      generatePlan();
    }
  }, [major, minor, electives]);

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


  // Automatically generate initial plan when major is selected
  useEffect(() => {
    if (major) {
      generatePlan();
    } else {
      // Reset state if major is deselected
      setPlan(null);
      setCompletedCourses([]);
      setAvailableElectives([]);
      setSelectedMinorCourses([]);
    }
  }, [major, minor]);

  // Update available electives when major changes
  useEffect(() => {
    if (major) {
      // If electives are global, use allElectives
      // If electives are specific to majors, adjust the API accordingly
      setAvailableElectives(allElectives);
    } else {
      setAvailableElectives([]);
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
          minor: minor || '',
          electives: electives || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
  
        // Declare newPlan as a constant
        const newPlan: string[][] = [...data.plan];
  
        // Ensure the plan has at least 7 semesters
        while (newPlan.length < 7) {
          newPlan.push([]);
        }
  
        // Inject selected minor courses into semester 7 (index 6)
        if (selectedMinorCourses.length > 0) {
          newPlan[6] = Array.from(new Set([...newPlan[6], ...selectedMinorCourses]));
        }
  
        // Compare the old plan and new plan
        const oldPlan = prevPlanRef.current || [];
        const flatOld = oldPlan.flat();
        const flatNew = newPlan.flat();
  
        // Find the newly added courses
        const addedCourses = flatNew.filter((course) => !flatOld.includes(course));
  
        // Filter to electives
        const newlyAddedElectives = addedCourses.filter((course) =>
          electives.includes(course)
        );
  
        // Set highlightedCourses
        setHighlightedCourses(new Set(newlyAddedElectives));
  
        setPlan(newPlan);
        prevPlanRef.current = newPlan;
        // Calculate completed courses up to each semester
        const completed = calculateCompletedCourses(newPlan);
        setCompletedCourses(completed);
  
        setTimeout(() => {
          setHighlightedCourses(new Set());
        }, 2000);
  
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
   * Function to calculate completed courses up to each semester.
   */
  const calculateCompletedCourses = (plan: string[][]): Set<string>[] => {
    const completedCoursesPerSemester: Set<string>[] = [];
    const cumulativeCourses = new Set<string>();

    for (const semesterCourses of plan) {
      semesterCourses.forEach((course) => cumulativeCourses.add(course));
      completedCoursesPerSemester.push(new Set(cumulativeCourses));
    }

    return completedCoursesPerSemester;
  };

  /**
   * Function to check if an elective can be taken based on completed courses.
   */
  const canTakeElective = (elective: Course, completedCourses: Set<string>[]): boolean => {
    // Check if there is at least one semester where prerequisites are met
    for (let i = 0; i < completedCourses.length; i++) {
      const completed = completedCourses[i];
      const prerequisitesMet = elective.prerequisites.every((prereq) => completed.has(prereq));
      if (prerequisitesMet) {
        return true;
      }
    }
    return false;
  };

  // /**
  //  * Get the list of electives available based on the completed courses.
  //  */
  // const getAvailableElectives = (): Course[] => {
  //   if (completedCourses.length === 0) {
  //     return [];
  //   }
  //   return availableElectives.filter((elective) =>
  //     canTakeElective(elective, completedCourses)
  //   );
  // };

  return (
    <div className="w-full flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
      <div className="w-full md:w-1/2 space-y-4">
        {/* Major Selection */}
        <MajorDropdown onSelect={setMajor} selectedMajor={major} />
        
        {/* Minor Selection */}
        <MinorsDropdown
          onSelect={setMinor}
          selectedMinor={minor}
          onSelectedCoursesChange={setSelectedMinorCourses}
        />

        {/* Electives Selection */}
        {plan && (
          <>
            <ElectivesDropdown
              onSelect={setElectives}
              availableElectives={availableElectives}
              selectedElectives={electives}
              loading={loadingElectives}
              error={errorElectives}
              completedCourses={completedCourses}
              courseCodeToNameMap={courseCodeToNameMap}
            />

          {/* Generate Plan Button */}
        <button
          onClick={handleUpdatePlan}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
          disabled={generatingPlan}
        >
          {generatingPlan ? 'Generating Plan...' : 'Generate Plan'}
        </button>

          </>
        )}

        {/* Error Message */}
        {planError && (
          <p className="mt-4 text-red-500">
            {planError}
          </p>
        )}
      </div>

      {/* Right side: Schedule */}
      <div className="w-full md:w-1/2 bg-gray-100 p-4 rounded-md overflow-y-auto max-h-screen">
        <h3 className="text-lg font-semibold mb-4">Generated Schedule</h3>
        {plan ? (
          <div className="grid grid-cols-2 gap-4">
            {plan.map((semester, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-bold text-md mb-2">Semester {index + 1}</h4>
                {semester.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {semester.map((course, courseIndex) => (
                      <li key={courseIndex}
                      className={`
                        ${electives.includes(course) ? 'bg-green-300' : ''}
                        ${highlightedCourses.has(course) ? 'animate-pulseToSolidGreen' : ''}
                        px-2 py-1 rounded-md
                        `}
                      >
                        {course}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No courses assigned to this semester.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Select a major to generate your academic plan.</p>
        )}
      </div>
    </div>
  );
};

export default ClientPlan;
