// src/app/api/getMinors/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('CourseData');

    const minorsData = await db.collection('Minors').findOne({});
    const minors = minorsData?.minors || [];

    return NextResponse.json({ minors });
  } catch (error) {
    console.error('Error in GET /api/getMinors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
