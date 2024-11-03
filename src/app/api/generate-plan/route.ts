// src/app/api/generate-plan/route.ts

import { NextResponse } from 'next/server';
import { getMajors } from '@/lib/getMajors';
import { getCourses } from '@/lib/getCourses';
import { getMinors } from '@/lib/getMinors';

interface GeneratePlanRequest {
  major: string;
  electives: string[];
  minor: string;
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
 */
function distributeCourses(
  sortedCourses: string[],
  prerequisitesMap: Record<string, string[]>,
  totalSemesters: number = 8
): string[][] {
  const plan: string[][] = Array.from({ length: totalSemesters }, () => []);
  const courseSemesterMap: Record<string, number> = {};

  sortedCourses.forEach((course) => {
    const prereqs = prerequisitesMap[course] || [];
    let earliestSemester = 0;
    prereqs.forEach((prereq) => {
      if (courseSemesterMap[prereq] !== undefined) {
        earliestSemester = Math.max(
          earliestSemester,
          courseSemesterMap[prereq] + 1
        );
      }
    });

    let semester = earliestSemester;
    const coursesPerSemester = Math.ceil(sortedCourses.length / totalSemesters);
    while (
      semester < totalSemesters &&
      plan[semester].length >= coursesPerSemester
    ) {
      semester++;
    }

    if (semester >= totalSemesters) {
      semester = totalSemesters - 1;
    }

    plan[semester].push(course);
    courseSemesterMap[course] = semester;
  });

  return plan;
}

/**
 * Generate a four-year academic plan respecting prerequisites.
 */
export async function POST(request: Request) {
  try {
    const { major, electives, minor } = (await request.json()) as GeneratePlanRequest;

    // Validate incoming data
    if (!major || typeof major !== 'string') {
      return NextResponse.json(
        { error: 'Major is required and should be a string.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(electives) || !electives.every((e) => typeof e === 'string')) {
      return NextResponse.json(
        { error: 'Electives should be an array of strings.' },
        { status: 400 }
      );
    }

    if (minor && typeof minor !== 'string') {
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

    // Collect core and elective courses
    const coreCourses = selectedMajor.coreCourses;
    const electiveCourses = electives;

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
      ...electiveCourses,
      ...minorCourses,
    ]);
    const allCourses = Array.from(allCoursesSet);

    // Create a map for prerequisites
    const prerequisitesMap: Record<string, string[]> = {};
    courses.forEach((course) => {
      if (allCourses.includes(course.code)) {
        prerequisitesMap[course.code] = course.prerequisites;
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

    // Distribute courses across semesters
    const plan = distributeCourses(sortedCourses, prerequisitesMap, 8);

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
