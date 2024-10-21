// app/api/getSchedule/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Define the Schedule type to ensure typing consistency
type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Schedule ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // Update to your database name
    const usersCollection = db.collection('users');

    // Find the schedule with the corresponding id
    const user = await usersCollection.findOne({ 'schedules.id': id }, { projection: { schedules: 1 } });

    if (!user) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
    }

    // Use Schedule type for 's' in .find()
    const schedule = user.schedules.find((s: Schedule) => s.id === id);

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
