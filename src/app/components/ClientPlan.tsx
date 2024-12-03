// ClientPlan.tsx

// Existing imports
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MajorDropdown from './MajorDropdown';
import MinorsDropdown from './MinorsDropdown';
import MathematicsTab from './MathematicsTab';
import ScienceTab from './ScienceTab';
import IntroEngineeringTab from './IntroEngineeringTab';
import LiberalArtsCoreTab from './LiberalArtsCoreTab';
import CSCoreTab from './CSCoreTab';
import CSDepthTab from './CSDepthTab';
import CSProjectTab from './CSProjectTab';
import TechnicalElectivesTab from './TechnicalElectivesTab';
import OpenElectivesTab from './OpenElectivesTab';
import ComputersAndEthicsTab from './ComputersAndEthicsTab';
import WritingComponentTab from './WritingComponentTab';

import { Course } from '@/types/Course';
import 'tailwindcss/tailwind.css';

interface ClientPlanProps {
  setMajor: (major: string) => void;
  setMinor: (minor: string) => void;
  major: string;
  minor: string;
  scheduleId?: string;
}

const ClientPlan: React.FC<ClientPlanProps> = ({
  setMajor,
  setMinor,
  major,
  minor,
  scheduleId,
}) => {
  const [activeTab, setActiveTab] = useState<string>('mathematics');
  const [highlightedCourses, setHighlightedCourses] = useState<Set<string>>(new Set());
  const prevPlanRef = useRef<string[][] | null>(null);
  const [plan, setPlan] = useState<string[][] | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [completedCourses, setCompletedCourses] = useState<Set<string>[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [remainingCredits, setRemainingCredits] = useState<number>(0); // New state for progress tracker

  const [csSelections, setCSSelections] = useState({
    mathCourses: [] as string[],
    scienceCourses: [] as string[],
    introEngineeringCourse: [] as string[],
    liberalArtsCourses: [] as string[],
    csCoreCourses: [] as string[],
    csDepthCourses: [] as string[],
    csProjectCourse: [] as string[],
    technicalElectives: [] as string[],
    openElectives: [] as string[],
    computersAndEthicsCourse: [] as string[],
    writingComponentCourse: [] as string[],
  });

  const [selectedMinorCourses, setSelectedMinorCourses] = useState<string[]>([]);

  const updateSelectedCourses = useCallback((selections: typeof csSelections) => {
    const allSelectedCourses = [
      ...selections.mathCourses,
      ...selections.scienceCourses,
      ...selections.introEngineeringCourse,
      ...selections.liberalArtsCourses,
      ...selections.csCoreCourses,
      ...selections.csDepthCourses,
      ...selections.csProjectCourse,
      ...selections.technicalElectives,
      ...selections.openElectives,
      ...selections.computersAndEthicsCourse,
      ...selections.writingComponentCourse,
      ...selectedMinorCourses,
    ];
    setSelectedCourses(allSelectedCourses);
  }, [selectedMinorCourses]);

  const calculateRemainingCredits = useCallback(() => {
    if (!plan) {
      setRemainingCredits(0);
      return;
    }
    const emptySlots = plan.reduce((count, semester) => {
      return count + semester.filter((course) => course === '').length;
    }, 0);
    setRemainingCredits(emptySlots * 3);
  }, [plan]);

  const handleMathCoursesSelect = useCallback((courses: string[]) => {
    setCSSelections((prevSelections) => {
      const newSelections = { ...prevSelections, mathCourses: courses };
      updateSelectedCourses(newSelections);
      return newSelections;
    });
  }, [updateSelectedCourses]);

  const handleUpdatePlan = async () => {
    await generatePlan();
    if (scheduleId) {
      await updateSchedule();
    }
    calculateRemainingCredits(); // Update remaining credits when the plan is updated
  };

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
            csSelections,
            plan,
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

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!scheduleId) return;

      try {
        const response = await fetch(`/api/getSchedule?id=${scheduleId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch schedule data');
        }
        const data = await response.json();

        const scheduleData = data.schedule;
        const { major, minor, csSelections: savedCSSelections, plan } = scheduleData;

        setMajor(major);
        setMinor(minor);
        setPlan(plan);

        setCSSelections(savedCSSelections);
        updateSelectedCourses(savedCSSelections);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };

    fetchScheduleData();
  }, [scheduleId]);

  const generatePlan = async () => {
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
          courses: selectedCourses,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        console.log('Plan data received:', data);

        const newPlan: string[][] = [...data.plan];

        while (newPlan.length < 8) {
          newPlan.push([]);
        }

        setHighlightedCourses(new Set(selectedCourses));

        setPlan(newPlan);
        prevPlanRef.current = newPlan;

        const completed = calculateCompletedCourses(newPlan);
        setCompletedCourses(completed);

        calculateRemainingCredits(); // Calculate remaining credits when plan is generated

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

  const calculateCompletedCourses = (plan: string[][]): Set<string>[] => {
    const completedCoursesPerSemester: Set<string>[] = [];
    const cumulativeCourses = new Set<string>();

    for (const semesterCourses of plan) {
      semesterCourses.forEach((course) => cumulativeCourses.add(course));
      completedCoursesPerSemester.push(new Set(cumulativeCourses));
    }

    return completedCoursesPerSemester;
  };

  return (
    <div className="w-full space-y-8">
      {/* Major and Minor Selection at the top */}
      <div className="w-full flex flex-col md:flex-row md:space-x-8">
        <div className="w-full md:w-1/2 space-y-4">
          <MajorDropdown onSelect={setMajor} selectedMajor={major} />
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <MinorsDropdown
            onSelect={setMinor}
            selectedMinor={minor}
            onSelectedCoursesChange={setSelectedMinorCourses}
          />
        </div>
      </div>

      {/* Main Content: Tabs and Schedule */}
      <div className="w-full flex flex-col md:flex-row md:space-x-8">
        {/* Left Side: Tabs and Content */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="flex border-b overflow-x-auto">
            {getTabsForMajor().map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 -mb-px whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 border-b-2'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="mt-4">{renderTabContent()}</div>
          <div className="mt-4">
            <button
              onClick={handleUpdatePlan}
              className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
              disabled={generatingPlan}
            >
              {generatingPlan ? 'Generating Plan...' : 'Generate Plan'}
            </button>
            {planError && <p className="mt-2 text-red-500">{planError}</p>}
          </div>
        </div>

        {/* Right side: Schedule */}
        <div className="w-full md:w-1/3 bg-gray-100 p-4 rounded-md overflow-y-auto max-h-screen">
          <h3 className="text-lg font-semibold mb-4">Generated Schedule</h3>
          {plan ? (
            <div className="grid grid-cols-1 gap-4">
              {plan.map((semester, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-bold text-md mb-2">Semester {index + 1}</h4>
                  {semester.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {semester.map((course, courseIndex) => (
                        <li
                          key={courseIndex}
                          className={`px-2 py-1 rounded-md ${
                            highlightedCourses.has(course) ? 'bg-green-300' : ''
                          }`}
                        >
                          {course}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No courses assigned to this semester.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Select courses to generate your academic plan.</p>
          )}
          {/* Progress Tracker */}
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Credit Hours Remaining: {remainingCredits}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPlan;
