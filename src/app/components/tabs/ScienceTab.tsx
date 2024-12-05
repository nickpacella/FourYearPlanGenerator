'use client';

import React, { useState, useEffect } from 'react';

interface ScienceTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[]; // Used for initialization
}

interface Course {
  code: string;
  name: string;
  prerequisites?: string[];
}

const ScienceTab: React.FC<ScienceTabProps> = ({ onSelect, selectedCourses }) => {
  const [scienceCourses, setScienceCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionState, setSelectionState] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchScienceCourses = async () => {
      try {
        const response = await fetch('/api/getCourses?category=Science');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setScienceCourses(data.courses);

        // Initialize selection state based on selectedCourses prop
        const initialSelectionState: Record<string, boolean> = {};
        data.courses.forEach((course: Course) => {
          initialSelectionState[course.code] = selectedCourses.includes(course.code);
        });
        setSelectionState(initialSelectionState);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchScienceCourses();
  }, [selectedCourses]);

  const handleToggle = (courseCode: string) => {
    setSelectionState((prevState) => {
      const newState = { ...prevState, [courseCode]: !prevState[courseCode] };
      console.log(newState);
      // Update the selected courses list based on new state
      const updatedSelectedCourses = Object.keys(newState).filter(
        (code) => newState[code]
      );

      // Pass the updated selected courses list to the parent
      onSelect(updatedSelectedCourses);

      return newState;
    });
  };

  if (loading) {
    return <div>Loading Science courses...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading Science courses: {error}</div>;
  }

  if (scienceCourses.length === 0) {
    return <div>No Science courses available.</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Select Science Courses (Include at least one lab)
      </h3>
      <ul className="space-y-2">
        {scienceCourses.map((course) => {
          const isSelected = selectionState[course.code] || false;
          return (
            <li key={course.code}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(course.code)}
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <span>{course.code} - {course.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ScienceTab;
