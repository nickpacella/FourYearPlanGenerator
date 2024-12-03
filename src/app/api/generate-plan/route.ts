// src/app/api/generate-plan/route.ts

import { NextResponse } from 'next/server';
import { getMajors } from '@/lib/getMajors';
import { getCourses } from '@/lib/getCourses';
import { Course } from '@/types/Course';

interface GeneratePlanRequest {
  major: string;
  courses: string[];
}

/**
 * Generate a four-year academic plan respecting prerequisites.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { major, courses } = body as GeneratePlanRequest;

    // Validate incoming data
    if (!major || typeof major !== 'string') {
      return NextResponse.json(
        { error: 'Major is required and should be a string.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(courses) || !courses.every((e) => typeof e === 'string')) {
      return NextResponse.json(
        { error: 'Courses should be an array of strings.' },
        { status: 400 }
      );
    }

    // Fetch all majors and courses from the database
    const [majors, allCourses] = await Promise.all([getMajors(), getCourses()]);

    // Find the selected major
    const selectedMajor = majors.find(
      (m) => m.name.toLowerCase() === major.toLowerCase()
    );

    if (!selectedMajor) {
      return NextResponse.json(
        { error: 'Selected major not found.' },
        { status: 404 }
      );
    }

    // Extract core courses from the selected major
    const coreCourses = selectedMajor.coreCourses || [];

    // Combine core courses with user-selected courses
    const allCoursesSet = new Set<string>([...coreCourses, ...courses]);

    // Convert the set back to an array
    const combinedCourses = Array.from(allCoursesSet);

    // Map to store course details and prerequisites
    const prerequisitesMap: Record<string, string[]> = {};
    const courseDetailsMap: Record<string, Course> = {};

    // Build the prerequisites map for the combined courses
    combinedCourses.forEach((courseCode) => {
      const course = allCourses.find((c) => c.code === courseCode);
      if (course) {
        prerequisitesMap[course.code] = course.prerequisites || [];
        courseDetailsMap[course.code] = course;
      } 
      // else {
      //   throw new Error(`Course ${courseCode} not found in the database.`);
      // }
    });

    // Perform topological sort to respect prerequisites
    let sortedCourses: string[];
    try {
      sortedCourses = topologicalSort(combinedCourses, prerequisitesMap);
    } catch (error: any) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Distribute courses across semesters
    const plan = distributeCourses(
      sortedCourses,
      prerequisitesMap,
      8, // totalSemesters
      6  // maxCoursesPerSemester
    );

    // Return the generated plan
    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('Error in POST /api/generate-plan:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Perform a topological sort on the courses to respect prerequisites.
 * Throws an error if a cycle is detected.
 */
function topologicalSort(
  courses: string[],
  prerequisitesMap: Record<string, string[]>
): string[] {
  const sorted: string[] = [];
  const visited: Record<string, boolean> = {};
  const temp: Record<string, boolean> = {};

  const visit = (course: string) => {
    if (temp[course]) {
      throw new Error(`Cycle detected involving course: ${course}`);
    }
    if (!visited[course]) {
      temp[course] = true;
      const prereqs = prerequisitesMap[course] || [];
      prereqs.forEach(visit);
      visited[course] = true;
      temp[course] = false;
      sorted.push(course);
    }
  };

  courses.forEach(visit);
  return sorted;
}

/**
 * Distribute courses across semesters while respecting prerequisites.
 * Corrected to ensure courses are scheduled after their prerequisites.
 */
function distributeCourses(
  sortedCourses: string[],
  prerequisitesMap: Record<string, string[]>,
  totalSemesters: number = 8,
  maxCoursesPerSemester: number = 6
): string[][] {
  const plan: string[][] = Array.from({ length: totalSemesters }, () => []);
  const courseSemesterMap: Record<string, number> = {};
  const semesterCourseCounts: number[] = Array(totalSemesters).fill(0);

  // Calculate total courses to schedule
  const totalCourses = sortedCourses.length;

  // Determine base semesters to spread courses over
  const baseSemesters = 6; // Adjust if needed

  // Calculate average courses per semester
  const minCoursesPerSemester = Math.floor(totalCourses / baseSemesters);
  const extraCourses = totalCourses % baseSemesters;

  // Initialize semester capacities
  const semesterCapacities: number[] = Array(totalSemesters).fill(maxCoursesPerSemester);
  for (let i = 0; i < baseSemesters; i++) {
    semesterCapacities[i] = minCoursesPerSemester;
    if (i < extraCourses) {
      semesterCapacities[i] += 1;
    }
  }

  // Helper function to find earliest semester for a course
  const findEarliestSemester = (course: string): number => {
    const prereqs = prerequisitesMap[course] || [];
    let earliestSemester = 0;
    for (const prereq of prereqs) {
      const prereqSemester = courseSemesterMap[prereq];
      if (prereqSemester !== undefined) {
        earliestSemester = Math.max(earliestSemester, prereqSemester + 1);
      } else {
        // Prerequisite not scheduled yet; this shouldn't happen due to topological sort
        throw new Error(`Prerequisite ${prereq} for course ${course} not scheduled yet.`);
      }
    }
    return earliestSemester;
  };

  // Schedule courses
  for (const course of sortedCourses) {
    let semester = findEarliestSemester(course);

    // Find the earliest semester with available capacity
    while (
      semester < totalSemesters &&
      semesterCourseCounts[semester] >= semesterCapacities[semester]
    ) {
      semester++;
    }

    if (semester >= totalSemesters) {
      throw new Error(`Unable to schedule course ${course}: not enough semesters.`);
    }

    plan[semester].push(course);
    courseSemesterMap[course] = semester;
    semesterCourseCounts[semester]++;
  }

  return plan;
}
