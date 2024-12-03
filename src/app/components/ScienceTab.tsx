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
  prerequisites?: string[];
}

const ScienceTab: React.FC<ScienceTabProps> = ({ onSelect, selectedCourses }) => {
  const [scienceCourses, setScienceCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

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
        setError(err.message || 'An error occurred while fetching courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchScienceCourses();
  }, []);

  // Helper function to determine if a course is a lab
  const isLab = (courseCode: string): boolean => {
    return courseCode.endsWith('L');
  };

  // Helper function to get prerequisites of a course
  const getPrerequisites = (course: Course): string[] => {
    return course.prerequisites || [];
  };

  // Check if prerequisites for a course are met
  const prerequisitesMet = (course: Course): boolean => {
    const prereqs = getPrerequisites(course);
    return prereqs.every((prereq) => selectedCourses.includes(prereq));
  };

  const handleCourseToggle = (course: Course) => {
    const isSelected = selectedCourses.includes(course.code);

    if (isSelected) {
      // Deselect the course
      let updatedCourses = selectedCourses.filter((c) => c !== course.code);

      // Find and remove courses that depend on this course
      const dependentCourses = scienceCourses
        .filter(
          (c) =>
            c.prerequisites &&
            c.prerequisites.includes(course.code) &&
            updatedCourses.includes(c.code)
        )
        .map((c) => c.code);

      if (dependentCourses.length > 0) {
        updatedCourses = updatedCourses.filter((c) => !dependentCourses.includes(c));
        setSelectionError(
          `Deselecting ${course.code} also removed dependent courses: ${dependentCourses.join(', ')}`
        );
      } else {
        setSelectionError(null);
      }

      console.log('Deselecting course:', course.code);
      console.log('Updated selected courses:', updatedCourses);
      onSelect(updatedCourses);
    } else {
      // Check if selection limit is reached
      if (selectedCourses.length >= 4) {
        setSelectionError('You can only select up to 4 Science courses (12 credit hours).');
        return;
      }

      // If it's a lab, ensure prerequisites are met
      if (isLab(course.code) && !prerequisitesMet(course)) {
        const unmetPrereqs = getPrerequisites(course)
          .filter((prereq) => !selectedCourses.includes(prereq))
          .join(', ');
        setSelectionError(
          `Cannot select ${course.code} without completing prerequisites: ${unmetPrereqs}.`
        );
        return;
      }

      // Select the course
      const updatedCourses = [...selectedCourses, course.code];
      console.log('Selecting course:', course.code);
      console.log('Updated selected courses:', updatedCourses);
      onSelect(updatedCourses);
      setSelectionError(null);
    }
  };

  // Disable unchecked checkboxes if selection limit is reached
  const isSelectionLimitReached = selectedCourses.length >= 4;

  if (loading) {
    return <div>Loading Science courses...</div>;
  }

  if (error) {
    return <div>Error loading Science courses: {error}</div>;
  }

  if (scienceCourses.length === 0) {
    return <div>No Science courses available.</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Select Science Courses (Include at least one lab)
      </h3>
      {selectionError && (
        <div className="mb-2 text-red-500">{selectionError}</div>
      )}
      <ul>
        {scienceCourses.map((course) => {
          const lab = isLab(course.code);
          const prereqsMet = prerequisitesMet(course);
          const disabled =
            (lab && !prereqsMet) || (!selectedCourses.includes(course.code) && isSelectionLimitReached);
          const tooltip =
            lab && !prereqsMet
              ? `Requires prerequisites: ${getPrerequisites(course).join(', ')}`
              : isSelectionLimitReached
              ? 'Maximum of 4 Science courses (12 credit hours) allowed.'
              : '';

          return (
            <li key={course.code} className="mb-2">
              <label
                className={`flex items-center ${
                  disabled ? 'text-gray-400 cursor-not-allowed' : ''
                }`}
                title={tooltip}
              >
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(course.code)}
                  onChange={() => handleCourseToggle(course)}
                  disabled={disabled}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">{course.code} - {course.name}</span>
              </label>
              {lab && !prereqsMet && (
                <span className="ml-6 text-sm text-gray-500">
                  (Requires: {getPrerequisites(course).join(', ')})
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 text-sm text-gray-600">
        You can select up to 4 Science courses (12 credit hours). Labs require their prerequisites to be selected first.
      </div>
    </div>
  );
};

export default ScienceTab;
