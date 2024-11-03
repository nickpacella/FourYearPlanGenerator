// src/lib/getMajors.ts

import clientPromise from '@/lib/mongodb';
import { Major } from '@/types/Major';

export async function getMajors(): Promise<Major[]> {
  try {
    const client = await clientPromise;
    const db = client.db('CourseData');

    const majorsCollection = db.collection<Major>('Majors');
    const majorsData = await majorsCollection.find({}).toArray();

    if (!majorsData || majorsData.length === 0) {
      throw new Error('No majors found in the database.');
    }

    return majorsData;
  } catch (error) {
    console.error('Error fetching majors:', error);
    throw error;
  }
}
