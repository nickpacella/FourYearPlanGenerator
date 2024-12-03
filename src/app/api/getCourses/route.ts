// src/app/api/getCourses/route.ts

import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/getCourses';
import { Course } from '@/types/Course';

export async function GET() {
  try {
    const courses: Course[] = await getCourses();

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('Error in GET /api/getAllCourses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch courses.' },
      { status: 500 }
    );
  }
}
