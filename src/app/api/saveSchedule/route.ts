// app/api/saveSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = auth(); // get the user's Clerk ID
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // your database name
    const usersCollection = db.collection('users');

    // Schedule data coming from the frontend
    const scheduleData = await request.json();

    // Update the user's schedules array with the new schedule
    const result = await usersCollection.updateOne(
      { clerkId: userId },
      { $push: { schedules: scheduleData } } // push the new schedule to the array
    );

    return NextResponse.json({ message: 'Schedule saved successfully', result });
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
