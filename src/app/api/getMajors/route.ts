// src/app/api/getMajors/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('CourseData');

    const majorData = await db.collection('Majors').findOne({});
    const majors = majorData?.majors.map((m: any) => m.name) || [];

    return NextResponse.json({ majors });
  } catch (error) {
    console.error('Error in GET /api/getMajors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
