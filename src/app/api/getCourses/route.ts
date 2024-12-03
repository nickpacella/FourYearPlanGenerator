// src/app/api/getCourses/route.ts

import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/getCourses';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filter = {};
    if (category) {
      filter = { categories: category };
    }

    const courses = await getCourses(filter);

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('Error in GET /api/getCourses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch courses.' },
      { status: 500 }
    );
  }
}
