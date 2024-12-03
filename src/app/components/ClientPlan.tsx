// ClientPlan.tsx

'use client';

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

  // State variables for course selections
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // State variables for CS major
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

  // State to hold the selected minor courses from MinorsDropdown.
  const [selectedMinorCourses, setSelectedMinorCourses] = useState<string[]>([]);

  // Function to update selectedCourses based on csSelections and minor courses
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
      ...selectedMinorCourses, // Include minor courses
    ];
    setSelectedCourses(allSelectedCourses);
  }, [selectedMinorCourses]);

  const handleMathCoursesSelect = useCallback((courses: string[]) => {
    setCSSelections((prevSelections) => {
      const newSelections = { ...prevSelections, mathCourses: courses };
      updateSelectedCourses(newSelections);
      return newSelections;
    });
  }, [updateSelectedCourses]);

  // Handler for the Update Plan button
  const handleUpdatePlan = async () => {
    await generatePlan();
    if (scheduleId) {
      await updateSchedule();
    }
  };

  // Function to update an existing schedule
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

// Fetch existing schedule data on mount
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

// Memoized function to handle course selection
const handleMathCoursesSelect = useCallback(
  (courses: string[]) => {
    setCSSelections((prevSelections) => {
      const newSelections = { ...prevSelections, mathCourses: courses };
      updateSelectedCourses(newSelections);
      return newSelections;
    });
  },
  [updateSelectedCourses]
);
  
  // Function to generate the academic plan
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

        // Ensure the plan has at least 8 semesters
        while (newPlan.length < 8) {
          newPlan.push([]);
        }

        setHighlightedCourses(new Set(selectedCourses));

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

  // Function to calculate completed courses
  const calculateCompletedCourses = (plan: string[][]): Set<string>[] => {
    const completedCoursesPerSemester: Set<string>[] = [];
    const cumulativeCourses = new Set<string>();

    for (const semesterCourses of plan) {
      semesterCourses.forEach((course) => cumulativeCourses.add(course));
      completedCoursesPerSemester.push(new Set(cumulativeCourses));
    }

    return completedCoursesPerSemester;
  };

  // Function to get tabs based on the selected major
  const getTabsForMajor = () => {
    if (major === 'Computer Science') {
      return [
        {
          id: 'mathematics',
          title: 'Mathematics',
          content: (
            <>
              <MathematicsTab
        onSelect={handleMathCoursesSelect}
        selectedCourses={csSelections.mathCourses}
      />
            </>
          ),
        },
        {
          id: 'science',
          title: 'Science',
          content: (
            <>
              <ScienceTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, scienceCourses: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.scienceCourses}
              />
            </>
          ),
        },
        {
          id: 'introToEngineering',
          title: 'Intro to Engineering',
          content: (
            <>
              <IntroEngineeringTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, introEngineeringCourse: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.introEngineeringCourse}
              />
            </>
          ),
        },
        {
          id: 'liberalArtsCore',
          title: 'Liberal Arts Core',
          content: (
            <>
              <LiberalArtsCoreTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, liberalArtsCourses: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.liberalArtsCourses}
              />
            </>
          ),
        },
        {
          id: 'csCore',
          title: 'CS Core',
          content: (
            <>
              <CSCoreTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, csCoreCourses: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.csCoreCourses}
              />
            </>
          ),
        },
        {
          id: 'csDepth',
          title: 'CS Depth',
          content: (
            <>
              <CSDepthTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, csDepthCourses: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.csDepthCourses}
              />
            </>
          ),
        },
        {
          id: 'csProject',
          title: 'CS Project',
          content: (
            <>
              <CSProjectTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, csProjectCourse: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.csProjectCourse}
              />
            </>
          ),
        },
        {
          id: 'technicalElectives',
          title: 'Technical Electives',
          content: (
            <>
              <TechnicalElectivesTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, technicalElectives: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.technicalElectives}
              />
            </>
          ),
        },
        {
          id: 'openElectives',
          title: 'Open Electives',
          content: (
            <>
              <OpenElectivesTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, openElectives: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.openElectives}
              />
            </>
          ),
        },
        {
          id: 'computersAndEthics',
          title: 'Computers and Ethics',
          content: (
            <>
              <ComputersAndEthicsTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, computersAndEthicsCourse: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.computersAndEthicsCourse}
              />
            </>
          ),
        },
        {
          id: 'writingComponent',
          title: 'Writing Component',
          content: (
            <>
              <WritingComponentTab
                onSelect={(courses) => {
                  const newSelections = { ...csSelections, writingComponentCourse: courses };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.writingComponentCourse}
              />
            </>
          ),
        },
      ];
    } else if (major === '') {
      return [
        {
          id: 'requirements',
          title: 'Requirements',
          content: <p>Please select a major to see its requirements.</p>,
        },
      ];
    } else {
      return [
        {
          id: 'requirements',
          title: 'Requirements',
          content: <p>Major requirements for {major} are not yet implemented.</p>,
        },
      ];
    }
  };

  const tabs = getTabsForMajor();

  const renderTabContent = () => {
    const activeTabObj = tabs.find((tab) => tab.id === activeTab);
    return activeTabObj ? activeTabObj.content : null;
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
          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
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
          {/* Tab Content */}
          <div className="mt-4">{renderTabContent()}</div>
          {/* Generate Plan Button */}
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
        </div>
      </div>
    </div>
  );
};

export default ClientPlan;
