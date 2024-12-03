// __tests__/lib/getCourses.test.ts

import { getCourses } from '../../src/lib/getCourses';
import { MongoClient, Db, Collection, FindCursor } from 'mongodb';
import { Course } from '../../src/types/Course';

const mockToArray = jest.fn();
const mockFindCursor = {
  toArray: mockToArray,
};
const mockCollection = {
  find: jest.fn().mockReturnValue(mockFindCursor),
};
const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};
const mockClient = {
  db: jest.fn().mockReturnValue(mockDb),
};

jest.mock('../../src/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve(mockClient),
}));

describe('getCourses', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch courses from the database', async () => {
    const mockCourses: Course[] = [
      {
        code: 'CS101',
        name: 'Intro to CS',
        prerequisites: [],
        department: 'Computer Science',
        credits: 3,
        offeredSemesters: ['Fall', 'Spring'],
        categories: ['Core'],
      },
      {
        code: 'MATH101',
        name: 'Calculus I',
        prerequisites: [],
        department: 'Mathematics',
        credits: 4,
        offeredSemesters: ['Fall', 'Spring'],
        categories: ['Core'],
      },
    ];

    // Set up the mock toArray to return the mockCourses
    mockToArray.mockResolvedValue(mockCourses);

    const courses = await getCourses();

    expect(mockClient.db).toHaveBeenCalledWith('CourseData');
    expect(mockDb.collection).toHaveBeenCalledWith('Courses');
    expect(mockCollection.find).toHaveBeenCalledWith({});
    expect(courses).toEqual(mockCourses);
  });

  it('should throw an error when no courses are found', async () => {
    // Set up the mock toArray to return an empty array
    mockToArray.mockResolvedValue([]);

    await expect(getCourses()).rejects.toThrow('No courses found in the database.');
  });

  it('should throw an error when the database operation fails', async () => {
    const errorMessage = 'Database error';
    // Set up the mock toArray to throw an error
    mockToArray.mockRejectedValue(new Error(errorMessage));

    await expect(getCourses()).rejects.toThrow(errorMessage);
  });
});
