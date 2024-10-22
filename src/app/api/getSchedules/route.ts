// app/api/getSchedules/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // MongoDB client connection
import { auth } from '@clerk/nextjs/server'; // Clerk authentication

/**
 * GET Handler
 * 
 * Handles GET requests to retrieve all schedules associated with the authenticated user.
 * 
 * @returns A JSON response containing the list of schedules or an error message.
 */
export async function GET() {
  // Authenticate the user using Clerk
  const { userId } = auth();

  if (!userId) {
    // If the user is not authenticated, return a 401 Unauthorized response
    return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // Specify your database name
    const usersCollection = db.collection('users'); // Access the 'users' collection

    // Find the user document based on the Clerk ID and retrieve only the 'schedules' field
    const user = await usersCollection.findOne(
      { clerkId: userId },
      { projection: { schedules: 1 } }
    );

    if (!user || !user.schedules) {
      // If the user has no schedules, return an empty array
      return NextResponse.json({ schedules: [] });
    }

    // Return the user's schedules as a JSON response
    return NextResponse.json({ schedules: user.schedules });
  } catch (error) {
    // Log any unexpected errors and return a 500 Internal Server Error response
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
