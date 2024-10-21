// app/api/getSchedules/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // Update to your db name
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ clerkId: userId }, { projection: { schedules: 1 } });

    if (!user || !user.schedules) {
      return NextResponse.json({ schedules: [] });
    }

    return NextResponse.json({ schedules: user.schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
