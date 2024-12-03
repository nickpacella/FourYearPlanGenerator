// app/api/updateSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, schedule } = body;

    if (!id || !schedule) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('FourYearPlanGen');
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { clerkId: userId, 'schedules.id': id },
      {
        $set: {
          'schedules.$.schedule': schedule,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Schedule not found or not updated' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
