// ScienceTab.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface ScienceTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

interface Course {
  code: string;
  name: string;
}

const ScienceTab: React.FC<ScienceTabProps> = ({ onSelect, selectedCourses }) => {
  const [scienceCourses, setScienceCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScienceCourses = async () => {
      try {
        const response = await fetch('/api/getCourses?category=Science');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setScienceCourses(data.courses);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchScienceCourses();
  }, []);

  const handleCourseToggle = (courseCode: string) => {
    if (selectedCourses.includes(courseCode)) {
      onSelect(selectedCourses.filter((c) => c !== courseCode));
    } else {
      onSelect([...selectedCourses, courseCode]);
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error loading courses: {error}</div>;
  }

  if (scienceCourses.length === 0) {
    return <div>No Science courses found.</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Select Science Courses (Include at least one lab)
      </h3>
      <ul>
        {scienceCourses.map((course) => (
          <li key={course.code}>
            <label>
              <input
                type="checkbox"
                checked={selectedCourses.includes(course.code)}
                onChange={() => handleCourseToggle(course.code)}
              />
              <span className="ml-2">{course.code}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScienceTab;
