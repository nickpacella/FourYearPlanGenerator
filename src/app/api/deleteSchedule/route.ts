// app/api/deleteSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // MongoDB client connection
import { auth } from '@clerk/nextjs/server'; // Clerk authentication

/**
 * Type definition for a Schedule object.
 * Ensures consistency in the structure of schedule data.
 */
type Schedule = {
  id: string;
  name: string;
  schedule: {
    major: string;
    minor: string;
    electives: string[];
  };
};

/**
 * DELETE Handler
 * 
 * Handles DELETE requests to remove a specific schedule for an authenticated user.
 * 
 * @param request - The incoming HTTP request.
 * @returns A JSON response indicating success or failure.
 */
export async function DELETE(request: Request) {
  try {
    // Authenticate the user using Clerk
    const { userId } = auth(); // Retrieve the user's Clerk ID
    if (!userId) {
      // If the user is not authenticated, return a 401 Unauthorized response
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body to extract the schedule ID
    const body = await request.json();
    const { id } = body; // The ID of the schedule to be deleted

    if (!id) {
      // If no ID is provided, return a 400 Bad Request response
      return NextResponse.json({ message: 'Schedule ID is required' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // Specify your database name
    const usersCollection = db.collection('users'); // Access the 'users' collection

    // Find the user document based on the Clerk ID
    const user = await usersCollection.findOne({ clerkId: userId });

    if (!user) {
      // If the user is not found in the database, return a 404 Not Found response
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Filter out the schedule with the matching ID from the user's schedules
    const updatedSchedules = user.schedules.filter(
      (schedule: Schedule) => schedule.id !== id
    );

    // Check if any schedule was removed. If not, the schedule was not found.
    if (updatedSchedules.length === user.schedules.length) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
    }

    // Update the user's document in the database with the new schedules array
    const result = await usersCollection.updateOne(
      { clerkId: userId },
      { $set: { schedules: updatedSchedules } }
    );

    // Return a success response if the schedule was deleted
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    // Log any unexpected errors and return a 500 Internal Server Error response
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
