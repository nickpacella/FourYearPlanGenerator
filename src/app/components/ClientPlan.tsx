// src/app/components/ClientPlan.tsx

'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import MajorMinorSelector from './MajorMinorSelector';
import CourseTabs from './tabs/CourseTabs';
import GeneratePlanButton from './GeneratePlanButton';
import ScheduleDisplay from './ScheduleDisplay';

import { Course } from '@/types/Course';
import { CsSelections } from '@/types/CsSelections'; // Define this type based on your state
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

const defaultCsSelections: CsSelections = {
  mathCourses: [],
  scienceCourses: [],
  introEngineeringCourse: [],
  liberalArtsCourses: [],
  csCoreCourses: [],
  csDepthCourses: [],
  csProjectCourse: [],
  technicalElectives: [],
  openElectives: [],
  computersAndEthicsCourse: [],
  writingComponentCourse: [],
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
  const [completedCourses, setCompletedCourses] = useState<Set<string>[]>([]);
  const [csSelections, setCSSelections] = useState<CsSelections>(defaultCsSelections);

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

  // Fetch courses on mount
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
  const categoryToSelectionKey = useMemo<Record<string, keyof CsSelections>>(
    () => ({
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
    }),
    []
  );

  // Function to update selectedCourses based on csSelections and minor courses
  const updateSelectedCourses = useCallback(
    (selections: CsSelections) => {
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
        console.log('Updated mathCourses:', courses); // Log updated mathCourses
        updateSelectedCourses(newSelections);
        return newSelections;
      });
    },
    [updateSelectedCourses]
  );

  // Function to generate the academic plan
  const generatePlan = useCallback(async () => {
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
  }, [major, selectedCourses, selectedMinorCourses]);

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
  }, [scheduleId, selectedCourses, plan, generatingPlan, generatePlan]);

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
    courseCategoryMap,
    categoryToSelectionKey,
    updateSelectedCourses,
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
      <MajorMinorSelector
        major={major}
        setMajor={setMajor}
        minor={minor}
        setMinor={setMinor}
        setSelectedMinorCourses={setSelectedMinorCourses}
      />

      {/* Main Content: Tabs and Schedule */}
      <div className="w-full flex flex-col md:flex-row md:space-x-8">
        {/* Left Side: Tabs and Content */}
        <div className="w-full md:w-1/2 space-y-4">
          <CourseTabs
            major={major}
            csSelections={csSelections}
            setCSSelections={setCSSelections}
            updateSelectedCourses={updateSelectedCourses}
            handleMathCoursesSelect={handleMathCoursesSelect}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Generate Plan Button */}
          <GeneratePlanButton
            onClick={handleUpdatePlan}
            generating={generatingPlan}
            error={planError}
          />
        </div>

        {/* Right side: Schedule */}
        <ScheduleDisplay
          plan={plan}
          highlightedCourses={highlightedCourses}
          creditHoursRemaining={creditHoursRemaining}
        />
      </div>
    </div>
  );
};

export default ClientPlan;
