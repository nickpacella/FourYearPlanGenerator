// src/app/api/getElectives/route.ts

import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/getCourses';
import { Course } from '@/types/Course';

export async function GET() {
  try {
    const courses: Course[] = await getCourses();

    // Filter courses that are categorized as 'Elective'
    const electives = courses.filter(course => course.categories.includes('Elective'));

    // Return full course data for electives
    return NextResponse.json({ electives });
  } catch (error: any) {
    console.error('Error in GET /api/getElectives:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch electives.' },
      { status: 500 }
    );
  }
}
