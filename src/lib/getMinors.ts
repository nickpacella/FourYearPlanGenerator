// src/lib/getMinors.ts

import clientPromise from '@/lib/mongodb';
import { Minor } from '@/types/Minor';

export async function getMinors(): Promise<Minor[]> {
  try {
    const client = await clientPromise;
    const db = client.db('CourseData');

    const minorsCollection = db.collection<Minor>('Minors');
    const minorsData = await minorsCollection.find({}).toArray();

    if (!minorsData || minorsData.length === 0) {
      throw new Error('No minors found in the database.');
    }

    return minorsData;
  } catch (error) {
    console.error('Error fetching minors:', error);
    throw error;
  }
}
