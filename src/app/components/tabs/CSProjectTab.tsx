// CSProjectTab.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface CSProjectTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

interface Course {
  code: string;
  name: string;
  categories: string[];
  // Add other relevant fields if necessary
}

const CSProjectTab: React.FC<CSProjectTabProps> = ({ onSelect, selectedCourses }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/getCourses?category=Project'); // Adjust the endpoint as needed
        if (!response.ok) {
          throw new Error('Failed to fetch project courses.');
        }
        const data = await response.json();
        // Assuming the API returns an array of courses under data.courses
        const projectCourses: Course[] = data.courses.filter((course: Course) =>
          course.categories.includes('Project')
        );
        setCourses(projectCourses);
      } catch (err: any) {
        console.error('Error fetching project courses:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectCourses();
  }, []);

  const handleCourseToggle = (courseCode: string) => {
    // Since it's a radio button, only one course can be selected at a time
    onSelect([courseCode]);
  };

  if (loading) {
    return <p className="text-gray-600">Loading project courses...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (courses.length === 0) {
    return <p className="text-gray-600">No project courses available.</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Computer Science Project Course (3 credits)</h3>
      <ul>
        {courses.map((course) => (
          <li key={course.code}>
            <label className="flex items-center">
              <input
                type="radio"
                name="csProjectCourse"
                value={course.code}
                checked={selectedCourses.includes(course.code)}
                onChange={() => handleCourseToggle(course.code)}
                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2">{`${course.code}`}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CSProjectTab;
