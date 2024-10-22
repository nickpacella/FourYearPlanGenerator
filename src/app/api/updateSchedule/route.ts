// src/app/api/updateSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface UpdateScheduleRequest {
  id: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
}

export async function POST(request: Request) {
  try {
    const { id, schedule } = (await request.json()) as UpdateScheduleRequest;

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required.' }, { status: 400 });
    }

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule data is required.' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('CourseData');

    // Update the schedule document
    const result = await db.collection('schedules').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...schedule } }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: 'Schedule updated successfully.' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Schedule not found or not updated.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in POST /api/updateSchedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
