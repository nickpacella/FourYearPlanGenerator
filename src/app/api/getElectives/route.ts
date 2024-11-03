// src/app/api/getElectives/route.ts

import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/getCourses';
import { Course } from '@/types/Course';

export async function GET() {
  try {
    const courses: Course[] = await getCourses();

    // Assuming electives are courses categorized as 'Elective' or both 'Core' and 'Elective'
    const electives = courses
      .filter(course => course.categories.includes('Elective'))
      .map(course => course.code);

    return NextResponse.json({ electives });
  } catch (error: any) {
    console.error('Error in GET /api/getElectives:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch electives.' },
      { status: 500 }
    );
  }
}
