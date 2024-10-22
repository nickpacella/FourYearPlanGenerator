// src/app/api/generatePlan/route.ts

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
  prerequisites: Record<string, string[]>
): string[][] {
  const plan: string[][] = Array.from({ length: 8 }, () => []); // 8 semesters
  const completedCourses = new Set<string>();
  const maxClassesPerSemester = 6;

  // Combine core courses, electives, and minors
  let remainingCourses = [
    ...(coreCoursesByMajor[major] || []),
    ...electives,
    ...minors,
  ];

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

      if (canTakeCourse(course)) {
        semesterClasses.push(course);
        completedCourses.add(course);
        return false; // Remove the course from remainingCourses
      }

      return true; // Course cannot be taken yet
    });

    plan[semester] = semesterClasses;

    if (remainingCourses.length === 0) break; // All courses have been scheduled
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
    const majorData = await db.collection('majors').findOne({});
    const coreCoursesByMajor: Record<string, string[]> = {};
    if (majorData) {
      const majorInfo = majorData.majors.find((m: any) => m.name === major);
      if (majorInfo) {
        coreCoursesByMajor[major] = majorInfo.courses;
      }
    }

    // Fetch prerequisites
    const prerequisitesData = await db.collection('prerequisites').findOne({});
    const prerequisites: Record<string, string[]> = {};
    if (prerequisitesData && prerequisitesData.prerequisites) {
      prerequisitesData.prerequisites.forEach((prereq: any) => {
        if (!prerequisites[prereq.course]) {
          prerequisites[prereq.course] = [];
        }
        prerequisites[prereq.course].push(prereq.requires);
      });
    }

    // Convert single minor to array
    const minorsArray = minor ? [minor] : [];

    // Generate the plan
    const plan = generateFourYearPlan(
      major,
      electives,
      minorsArray,
      coreCoursesByMajor,
      prerequisites
    );

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error in POST /api/generatePlan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
