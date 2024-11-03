// src/app/api/getMajors/route.ts

import { NextResponse } from 'next/server';
import { getMajors } from '@/lib/getMajors';

export async function GET() {
  try {
    const majors = await getMajors();

    // Extract only the names of the majors for the dropdown
    const majorNames = majors.map((major) => major.name);

    return NextResponse.json({ majors: majorNames });
  } catch (error: any) {
    console.error('Error in GET /api/getMajors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch majors.' },
      { status: 500 }
    );
  }
}
