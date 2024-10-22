// src/app/api/getElectives/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('CourseData');

    const electivesData = await db.collection('Electives').findOne({});
    const electives = electivesData?.electives || [];

    return NextResponse.json({ electives });
  } catch (error) {
    console.error('Error in GET /api/getElectives:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
