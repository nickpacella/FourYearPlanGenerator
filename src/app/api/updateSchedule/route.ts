// app/api/updateSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // MongoDB client connection
import { auth } from '@clerk/nextjs/server'; // Clerk authentication

/**
 * POST Handler
 * 
 * Handles POST requests to update an existing schedule with new data.
 * 
 * @param request - The incoming HTTP request.
 * @returns A JSON response indicating success or failure.
 */
export async function POST(request: Request) {
  try {
    // Authenticate the user using Clerk
    const { userId } = auth(); // Retrieve the user's Clerk ID
    if (!userId) {
      // If the user is not authenticated, return a 401 Unauthorized response
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body to extract the schedule ID and new schedule data
    const body = await request.json();
    const { id, schedule } = body;

    if (!id || !schedule) {
      // If required fields are missing, return a 400 Bad Request response
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // Specify your database name
    const usersCollection = db.collection('users'); // Access the 'users' collection

    // Update the specific schedule within the user's schedules array
    const result = await usersCollection.updateOne(
      { clerkId: userId, 'schedules.id': id }, // Query for the specific schedule
      {
        $set: {
          'schedules.$.schedule': schedule, // Update the schedule data
        },
      }
    );

    if (result.modifiedCount === 0) {
      // If no documents were modified, the schedule was not found or not updated
      return NextResponse.json({ message: 'Schedule not found or not updated' }, { status: 404 });
    }

    // Return a success response if the schedule was updated
    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    // Log any unexpected errors and return a 500 Internal Server Error response
    console.error('Error updating schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

