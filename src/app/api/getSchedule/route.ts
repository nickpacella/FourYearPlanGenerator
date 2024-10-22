// app/api/getSchedule/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // MongoDB client connection

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
 * GET Handler
 * 
 * Handles GET requests to retrieve a specific schedule by its ID.
 * 
 * @param request - The incoming HTTP request.
 * @returns A JSON response containing the schedule or an error message.
 */
export async function GET(request: Request) {
  // Extract search parameters from the request URL
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // Retrieve the 'id' parameter

  if (!id) {
    // If no ID is provided, return a 400 Bad Request response
    return NextResponse.json({ message: 'Schedule ID is required' }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // Specify your database name
    const usersCollection = db.collection('users'); // Access the 'users' collection

    // Find the user who owns the schedule with the given ID
    const user = await usersCollection.findOne(
      { 'schedules.id': id }, // Query for a user with the specific schedule ID
      { projection: { schedules: 1 } } // Only retrieve the 'schedules' field
    );

    if (!user) {
      // If no user or schedule is found, return a 404 Not Found response
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
    }

    // Find the specific schedule within the user's schedules array
    const schedule = user.schedules.find((s: Schedule) => s.id === id);

    // Return the found schedule as a JSON response
    return NextResponse.json({ schedule });
  } catch (error) {
    // Log any unexpected errors and return a 500 Internal Server Error response
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
