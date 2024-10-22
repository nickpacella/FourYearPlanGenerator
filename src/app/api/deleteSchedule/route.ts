// app/api/deleteSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

// Define the Schedule type
type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

export async function DELETE(request: Request) {
  try {
    // Authenticate the user
    const { userId } = auth(); // Get the user's Clerk ID
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { id } = body; // The ID of the schedule to be deleted

    if (!id) {
      return NextResponse.json({ message: 'Schedule ID is required' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // Ensure this is your database name
    const usersCollection = db.collection('users');

    // Find the user by their Clerk ID
    const user = await usersCollection.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Filter out the schedule with the matching ID
    const updatedSchedules = user.schedules.filter(
      (schedule: Schedule) => schedule.id !== id
    );

    // If no schedules were removed, return a 404
    if (updatedSchedules.length === user.schedules.length) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
    }

    // Update the user document with the updated schedules array
    const result = await usersCollection.updateOne(
      { clerkId: userId },
      { $set: { schedules: updatedSchedules } }
    );

    // Return success if the schedule was deleted
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
