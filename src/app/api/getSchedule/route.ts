// app/api/getSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing schedule id' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('FourYearPlanGen');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { clerkId: userId, 'schedules.id': id },
      { projection: { 'schedules.$': 1 } }
    );

    if (!user || !user.schedules || user.schedules.length === 0) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
    }

    const schedule = user.schedules[0];

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
