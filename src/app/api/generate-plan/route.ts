// pages/api/generate-plan.ts

import { NextResponse } from 'next/server';

// Example data structures for core courses, electives, and prerequisites
const coreCoursesByMajor: Record<string, string[]> = {
  CS: ['CS101', 'CS102', 'CS103', 'CS201', 'CS202', 'CS203', 'CS301', 'CS302', 'CS303'],
  Math: ['Math101', 'Math102', 'Math103', 'Math201', 'Math202', 'Math203', 'Math301', 'Math302'],
  Business: ['Bus101', 'Bus102', 'Bus103', 'Bus201', 'Bus202', 'Bus203', 'Bus301', 'Bus302'],
};

const prerequisites: Record<string, string[]> = {
  CS102: ['CS101'],
  CS201: ['CS102'],
  CS202: ['CS201'],
  Math202: ['Math101', 'Math102'],
  Bus201: ['Bus101'],
  Bus202: ['Bus102'],
};

// Dynamic 4-year plan generator function
function generateFourYearPlan(major: string, electives: string[], minors: string[]): string[][] {
  const plan: string[][] = Array.from({ length: 8 }, () => []); // 8 semesters
  const completedCourses = new Set<string>();
  const maxClassesPerSemester = 6;

  // Combine core courses, electives, and minors
  let remainingCourses = [...(coreCoursesByMajor[major] || []), ...electives, ...minors];

  // Helper function to check if prerequisites are completed
  const canTakeCourse = (course: string): boolean => {
    const prereqs = prerequisites[course] || [];
    return prereqs.every((prereq) => completedCourses.has(prereq));
  };

  // Schedule the courses over 8 semesters
  for (let semester = 0; semester < 8; semester++) {
    let semesterClasses: string[] = [];

    remainingCourses = remainingCourses.filter((course) => {
      if (semesterClasses.length >= maxClassesPerSemester) return true; // Semester is full

      // Check if the course can be taken in this semester (prerequisites fulfilled)
      if (canTakeCourse(course)) {
        semesterClasses.push(course);
        completedCourses.add(course); // Mark course as completed
        return false; // Remove the course from remainingCourses
      }

      return true; // Course cannot be taken yet
    });

    plan[semester] = semesterClasses;

    if (remainingCourses.length === 0) break; // All courses have been scheduled
  }

  // Return the generated plan
  return plan;
}

export async function POST(request: Request) {
  try {
    const { major, electives, minor } = await request.json();

    // Validate incoming data
    if (!major) {
      return NextResponse.json({ error: 'Major is required.' }, { status: 400 });
    }

    if (!Array.isArray(electives)) {
      return NextResponse.json({ error: 'Electives should be an array of strings.' }, { status: 400 });
    }

    if (typeof minor !== 'string') {
      return NextResponse.json({ error: 'Minor should be a string.' }, { status: 400 });
    }

    // Convert single minor to array
    const minorsArray = minor ? [minor] : [];

    // Generate the plan
    const plan = generateFourYearPlan(major, electives, minorsArray);

    return NextResponse.json({ plan: plan });
  } catch (error) {
    console.error('Error in POST /api/generate-plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
