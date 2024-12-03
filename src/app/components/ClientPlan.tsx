// ClientPlan.tsx

'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import MajorDropdown from './MajorDropdown';
import MinorsDropdown from './MinorsDropdown';
import MathematicsTab from './MathematicsTab';
import ScienceTab from './ScienceTab';
import LiberalArtsCoreTab from './LiberalArtsCoreTab';
import CSDepthTab from './CSDepthTab';
import CSProjectTab from './CSProjectTab';
import TechnicalElectivesTab from './TechnicalElectivesTab';
import OpenElectivesTab from './OpenElectivesTab';
import ComputersAndEthicsTab from './ComputersAndEthicsTab';
import WritingComponentTab from './WritingComponentTab';

import { Course } from '@/types/Course';
import 'tailwindcss/tailwind.css';

interface ClientPlanProps {
  scheduleId?: string;
  major: string;
  setMajor: (major: string) => void;
  minor: string;
  setMinor: (minor: string) => void;
  electives: string[];
  setElectives: (electives: string[]) => void;
}

const defaultCsSelections = {
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
};

// Constants for Progress Tracker
const COURSES_PER_SEMESTER = 5; // Maximum number of courses per semester
const CREDIT_HOURS_PER_COURSE = 3; // Credit hours per course

const ClientPlan: React.FC<ClientPlanProps> = ({
  scheduleId,
  major,
  setMajor,
  minor,
  setMinor,
  electives,
  setElectives,
}) => {
  const [activeTab, setActiveTab] = useState<string>('mathematics');
  const [highlightedCourses, setHighlightedCourses] = useState<Set<string>>(
    new Set()
  );
  const prevPlanRef = useRef<string[][] | null>(null);
  const [plan, setPlan] = useState<string[][] | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [completedCourses, setCompletedCourses] = useState<Set<string>[]>(
    []
  );
  const [csSelections, setCSSelections] = useState(defaultCsSelections);

  // State variables for course selections
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // State to hold the selected minor courses from MinorsDropdown.
  const [selectedMinorCourses, setSelectedMinorCourses] = useState<string[]>(
    []
  );

  // Fetch all courses data
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const isReconstructing = useRef(false);

  // State for Credit Hours Remaining
  const [creditHoursRemaining, setCreditHoursRemaining] =
    useState<number>(0);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const response = await fetch('/api/getCourses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses data');
        }
        const data = await response.json();
        setAllCourses(data.courses);
      } catch (error) {
        console.error('Error fetching all courses:', error);
      }
    };

    fetchAllCourses();
  }, []);

  // Build a mapping from course code to category
  const courseCategoryMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    allCourses.forEach((course) => {
      map[course.code] = course.categories; // Now mapping to array of categories
    });
    return map;
  }, [allCourses]);

  // Mapping from category names to csSelections keys
  const categoryToSelectionKey: Record<
    string,
    keyof typeof defaultCsSelections
  > = {
    Mathematics: 'mathCourses',
    Science: 'scienceCourses',
    'Intro to Engineering': 'introEngineeringCourse',
    'Liberal Arts Core': 'liberalArtsCourses',
    'CS Core': 'csCoreCourses',
    'CS Depth': 'csDepthCourses',
    Project: 'csProjectCourse',
    'Technical Electives': 'technicalElectives',
    'Open Electives': 'openElectives',
    'Computers and Ethics': 'computersAndEthicsCourse',
    'Writing Component': 'writingComponentCourse',
    // Add other categories if necessary
  };

  // Function to update selectedCourses based on csSelections and minor courses
  const updateSelectedCourses = useCallback(
    (selections: typeof csSelections) => {
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

      if (!isReconstructing.current) {
        setElectives(allSelectedCourses); // Pass electives back to parent
      }
    },
    [selectedMinorCourses, setElectives]
  );

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

  // Add this useEffect to automatically generate the plan when a saved schedule is loaded
  useEffect(() => {
    if (
      scheduleId &&
      selectedCourses.length > 0 &&
      !plan &&
      !generatingPlan
    ) {
      generatePlan();
    }
  }, [scheduleId, selectedCourses, plan, generatingPlan]);

  useEffect(() => {
    if (electives && electives.length > 0 && allCourses.length > 0) {
      isReconstructing.current = true; // Set the flag

      // Reconstruct csSelections
      const reconstructedSelections = { ...defaultCsSelections };
      electives.forEach((courseCode: string) => {
        const categories = courseCategoryMap[courseCode];
        if (categories && categories.length > 0) {
          categories.forEach((category) => {
            const selectionKey = categoryToSelectionKey[category];
            if (
              selectionKey &&
              reconstructedSelections[selectionKey]
            ) {
              if (
                !reconstructedSelections[selectionKey].includes(
                  courseCode
                )
              ) {
                reconstructedSelections[selectionKey].push(courseCode);
              }
            } else {
              console.warn(
                `Unknown category '${category}' for course ${courseCode}`
              );
            }
          });
        } else {
          console.warn(
            `No categories found for course ${courseCode}`
          );
        }
      });
      isReconstructing.current = true; // Set flag to prevent setElectives

      setCSSelections(reconstructedSelections);
      updateSelectedCourses(reconstructedSelections);

      isReconstructing.current = false; // Reset the flag
    }
  }, [
    electives,
    allCourses,
    courseCategoryMap
  ]);

  // Handler for the Update Plan button
  const handleUpdatePlan = async () => {
    await generatePlan();
    if (scheduleId) {
      await updateSchedule();
    }
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
            electives: selectedCourses, // Include electives
            plan, // Include the generated plan
          },
        }),
      });

      if (response.ok) {
        console.log('Schedule updated successfully!');
      } else {
        const errorData = await response.json();
        console.error(
          'Failed to update schedule:',
          errorData.error
        );
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

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
        const newPlan: string[][] = [...data.plan];
  
        // Ensure the plan has at least 8 semesters
        while (newPlan.length < 8) {
          newPlan.push([]);
        }
  
        // Add the minor courses to the 8th semester
        if (selectedMinorCourses.length > 0) {
          newPlan[7] = [...newPlan[7], ...selectedMinorCourses]; // Push minor courses into semester 8
        }
  
        setHighlightedCourses(new Set(selectedCourses));
        setPlan(newPlan);
        prevPlanRef.current = newPlan;
  
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
      setPlanError(
        'An unexpected error occurred while generating the plan.'
      );
    } finally {
      setGeneratingPlan(false);
    }
  };
  
  // Add minor course selections logic
  const handleMinorCoursesSelect = useCallback(
    (courses: string[]) => {
      setSelectedMinorCourses(courses);
      setCSSelections((prevSelections) => {
        const newSelections = { ...prevSelections };
        updateSelectedCourses(newSelections); // Update the state with minor selections
        return newSelections;
      });
    },
    [updateSelectedCourses]
  );

  // Function to calculate completed courses
  const calculateCompletedCourses = (
    plan: string[][]
  ): Set<string>[] => {
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
        // ClientPlan.tsx
{
  id: 'science',
  title: 'Science',
  content: (
    <>
      <ScienceTab
        onSelect={(courses) => {
          setCSSelections((prev) => ({
            ...prev,
            scienceCourses: courses,
          }));
          // Avoid calling updateSelectedCourses here if it affects scienceCourses
        }}
        selectedCourses={csSelections.scienceCourses}
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
                  const newSelections = {
                    ...csSelections,
                    liberalArtsCourses: courses,
                  };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={csSelections.liberalArtsCourses}
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
                  const newSelections = {
                    ...csSelections,
                    csDepthCourses: courses,
                  };
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
            <CSProjectTab
              onSelect={(courses) => {
                setCSSelections((prev) => ({
                  ...prev,
                  csProjectCourse: courses,
                }));
                updateSelectedCourses({
                  ...csSelections,
                  csProjectCourse: courses,
                });
              }}
              selectedCourses={csSelections.csProjectCourse}
            />
          ),
        },
        {
          id: 'technicalElectives',
          title: 'Technical Electives',
          content: (
            <>
              <TechnicalElectivesTab
                onSelect={(courses) => {
                  const newSelections = {
                    ...csSelections,
                    technicalElectives: courses,
                  };
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
                  const newSelections = {
                    ...csSelections,
                    openElectives: courses,
                  };
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
                  const newSelections = {
                    ...csSelections,
                    computersAndEthicsCourse: courses,
                  };
                  setCSSelections(newSelections);
                  updateSelectedCourses(newSelections);
                }}
                selectedCourses={
                  csSelections.computersAndEthicsCourse
                }
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
                  const newSelections = {
                    ...csSelections,
                    writingComponentCourse: courses,
                  };
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
          content: (
            <p>Please select a major to see its requirements.</p>
          ),
        },
      ];
    } else {
      return [
        {
          id: 'requirements',
          title: 'Requirements',
          content: (
            <p>
              Major requirements for {major} are not yet implemented.
            </p>
          ),
        },
      ];
    }
  };

  const tabs = getTabsForMajor();

  const renderTabContent = () => {
    const activeTabObj = tabs.find((tab) => tab.id === activeTab);
    return activeTabObj ? activeTabObj.content : null;
  };

  // Effect to calculate Credit Hours Remaining
  useEffect(() => {
    if (plan) {
      const totalSlots = plan.length * COURSES_PER_SEMESTER;
      const slotsUsed = plan.reduce(
        (sum, semester) => sum + semester.length,
        0
      );
      const emptySlots = totalSlots - slotsUsed;
      const creditHours = emptySlots * CREDIT_HOURS_PER_COURSE;
      setCreditHoursRemaining(creditHours);
    } else {
      setCreditHoursRemaining(0);
    }
  }, [plan]);

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
            {planError && (
              <p className="mt-2 text-red-500">{planError}</p>
            )}
          </div>
        </div>

 {/* Right side: Schedule */}
<div className="w-full bg-gradient-to-r from-pastel-pink via-pastel-purple to-pastel-blue p-6 rounded-lg shadow-lg overflow-y-auto max-h-screen">
  <h3 className="text-xl font-bold text-gray-800 mb-6">
    Generated Schedule
  </h3>
  {plan ? (
    <>
      <div className="grid grid-cols-4 gap-6">
        {plan.map((semester, index) => (
          <div
            key={index}
            className="bg-white border border-gray-300 rounded-md shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <h4 className="font-bold text-lg text-gray-700 underline mb-2">
              Semester {index + 1}
            </h4>
            {semester.length > 0 ? (
              <div className="space-y-2">
                {semester.map((course, courseIndex) => (
                  <div
                    key={courseIndex}
                    className={`
                      px-2 py-1 rounded-md text-gray-800 font-medium ${
                        highlightedCourses.has(course) ? 'bg-green-200' : ''
                      }`}
                  >
                    {course}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses assigned.</p>
            )}
          </div>
        ))}
      </div>
      {/* Credit Hours Remaining */}
      <div className="mt-6">
        <p className="text-lg font-semibold text-gray-900">
          Credit Hours Remaining: {creditHoursRemaining}
        </p>
      </div>
    </>
  ) : (
    <p className="text-gray-600 mt-4">Select courses to generate your academic plan.</p>
  )}
</div>



      </div>
    </div>
  );
};

export default ClientPlan;
