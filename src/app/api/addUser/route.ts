import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const { userId } = auth();

    const client = await clientPromise;
    const db = client.db('FourYearPlanGen'); // make sure this matches your db name
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ clerkId: userId });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', user: existingUser });
    }

    const newUser = {
      clerkId: userId,
      schedules: [],
    };

    await usersCollection.insertOne(newUser);
    return NextResponse.json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
