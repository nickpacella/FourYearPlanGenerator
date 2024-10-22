// src/app/api/generate-plan/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface GeneratePlanRequest {
  major: string;
  electives: string[];
  minor: string;
}

function generateFourYearPlan(
  major: string,
  electives: string[],
  minors: string[],
  coreCoursesByMajor: Record<string, string[]>,
  prerequisites: { course: string, requires: string }[]
): string[][] {
  const plan: string[][] = Array.from({ length: 8 }, () => []); // 8 semesters
  const completedCourses = new Set<string>(); // Track completed courses
  const maxClassesPerSemester = 4;

  // Combine core courses, electives, and minors
  let remainingCourses = [
    ...(coreCoursesByMajor[major] || []),
    ...electives,
    ...minors,
  ];

  // Create a prerequisite map where each course points to its prerequisites
  const prereqMap = new Map<string, string[]>();
  prerequisites.forEach((prereq) => {
    if (!prereqMap.has(prereq.course)) {
      prereqMap.set(prereq.course, []);
    }
    prereqMap.get(prereq.course)!.push(prereq.requires);
  });

  // Helper function to check if all prerequisites for a course are completed
  const canTakeCourse = (course: string): boolean => {
    const prereqs = prereqMap.get(course) || [];
    return prereqs.every((prereq) => completedCourses.has(prereq));
  };

  // Schedule the courses across 8 semesters
  for (let semester = 0; semester < 8; semester++) {
    let semesterCourses: string[] = [];
    let courseAddedThisSemester = false; // Flag to track if any courses were added in this loop

    // Try to fill the semester with up to 6 courses
    remainingCourses = remainingCourses.filter((course) => {
      // If semester is full, skip to the next semester
      if (semesterCourses.length >= maxClassesPerSemester) return true;

      // Check if prerequisites are satisfied for this course
      if (canTakeCourse(course)) {
        // Before adding, ensure this course and its prerequisite do not exist in the same semester
        const prereqs = prereqMap.get(course) || [];
        const existsInSameSemester = prereqs.some(prereq => semesterCourses.includes(prereq));

        if (!existsInSameSemester) {
          // Add the course to the semester and mark it as completed
          semesterCourses.push(course);
          completedCourses.add(course);
          courseAddedThisSemester = true;
          return false; // Remove the course from remainingCourses
        }
      }

      return true; // Keep course for the next semester
    });

    // If no courses could be added due to unmet prerequisites, stop filling the semester
    if (!courseAddedThisSemester && remainingCourses.length > 0) {
      break; // Move to the next semester
    }

    // Assign the courses to the current semester
    plan[semester] = semesterCourses;

    // If all courses are scheduled, exit the loop early
    if (remainingCourses.length === 0) break;
  }

  return plan;
}


export async function POST(request: Request) {
  try {
    const { major, electives, minor } = (await request.json()) as GeneratePlanRequest;

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

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('CourseData');

    // Fetch core courses for the major
    const majorData = await db.collection('Majors').findOne({});
    const coreCoursesByMajor: Record<string, string[]> = {};
    if (majorData) {
      const majorInfo = majorData.majors.find((m: any) => m.name === major);
      if (majorInfo) {
        coreCoursesByMajor[major] = majorInfo.courses;
      }
    }

    // Fetch prerequisites
  // Fetch prerequisites
const prerequisitesData = await db.collection('Prerequisites').findOne({});
let prerequisites: { course: string, requires: string }[] = [];

if (prerequisitesData && prerequisitesData.prerequisites) {
  prerequisites = prerequisitesData.prerequisites.map((prereq: any) => ({
    course: prereq.course,
    requires: prereq.requires,
  }));
}

// Convert single minor to array
const minorsArray = minor ? [minor] : [];

// Generate the plan
const plan = generateFourYearPlan(
  major,
  electives,
  minorsArray,
  coreCoursesByMajor,
  prerequisites // This is now the expected array of prerequisite objects
);


    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error in POST /api/generate-plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
