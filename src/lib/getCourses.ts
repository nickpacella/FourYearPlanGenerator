// src/lib/getCourses.ts

import clientPromise from '@/lib/mongodb';
import { Course } from '@/types/Course';

export async function getCourses(filter: any = {}): Promise<Course[]> {
  try {
    const client = await clientPromise;
    const db = client.db('CourseData');

    const coursesCollection = db.collection<Course>('Courses');
    const coursesData = await coursesCollection.find(filter).toArray();

    if (!coursesData || coursesData.length === 0) {
      throw new Error('No courses found in the database.');
    }

    return coursesData;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}
