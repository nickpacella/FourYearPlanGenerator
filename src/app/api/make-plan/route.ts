// src/app/api/generate-plan/route.ts

import { NextResponse } from 'next/server';
import { getMajors } from '@/lib/getMajors';
import { getCourses } from '@/lib/getCourses';
import { getMinors } from '@/lib/getMinors';
import { Course } from '@/types/Course';

interface GeneratePlanRequest {
  major: string;
  electives?: string[];
  minor?: string;
}

/**
 * Generate a four-year academic plan respecting prerequisites.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { major, electives, minor } = body as GeneratePlanRequest;

    // Provide default values if electives or minor are undefined
    const electivesList = Array.isArray(electives) ? electives : [];
    const minorSelection = minor && typeof minor === 'string' ? minor : '';

    // Validate incoming data
    if (!major || typeof major !== 'string') {
      return NextResponse.json(
        { error: 'Major is required and should be a string.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(electivesList) || !electivesList.every((e) => typeof e === 'string')) {
      return NextResponse.json(
        { error: 'Electives should be an array of strings.' },
        { status: 400 }
      );
    }

    if (minorSelection && typeof minorSelection !== 'string') {
      return NextResponse.json(
        { error: 'Minor should be a string.' },
        { status: 400 }
      );
    }

    // Fetch all majors, courses, and minors
    const majors = await getMajors();
    const courses = await getCourses();
    const minors = await getMinors();

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

    // Collect core courses
    const coreCourses = selectedMajor.coreCourses;

    // If a minor is selected, fetch its courses
    let minorCourses: string[] = [];
    if (minor) {
      const selectedMinor = minors.find(
        (m) => m.name.toLowerCase() === minor.toLowerCase()
      );
      if (selectedMinor) {
        minorCourses = [
          ...selectedMinor.requiredCourses,
          ...selectedMinor.electiveCourses,
        ];
      } else {
        return NextResponse.json(
          { error: 'Selected minor not found.' },
          { status: 404 }
        );
      }
    }

    // Combine all courses
    const allCoursesSet = new Set<string>([
      ...coreCourses,
      ...electivesList,
      ...minorCourses,
    ]);
    const allCourses = Array.from(allCoursesSet);

    // Create a map for prerequisites
    const prerequisitesMap: Record<string, string[]> = {};
    const courseDetailsMap: Record<string, Course> = {};
    courses.forEach((course) => {
      if (allCourses.includes(course.code)) {
        prerequisitesMap[course.code] = course.prerequisites;
        courseDetailsMap[course.code] = course;
      }
    });

    // Perform topological sort
    let sortedCourses: string[];
    try {
      sortedCourses = topologicalSort(allCourses, prerequisitesMap);
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Distribute courses across semesters using the corrected algorithm
    const plan = distributeCourses(
      sortedCourses,
      prerequisitesMap,
      8, // totalSemesters
      6  // maxCoursesPerSemester
    );

    // Log the generated plan for debugging
    console.log('Generated Plan:', plan);

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