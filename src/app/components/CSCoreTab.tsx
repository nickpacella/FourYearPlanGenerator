// CSCoreTab.tsx
import React from 'react';

interface CSCoreTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockCSCoreCourses = [
  'CS 1101 - Programming and Problem Solving',
  'CS 1104 - Intro to Programming in Python',
  'CS 2201 - Data Structures',
  'CS 3251 - Software Engineering',
  'CS 3270 - Operating Systems',
  'CS 2212 - Discrete Structures',
  'CS 3250 - Algorithms',
  'CS 2281 - Computer Organization',
  'CS 2281L - Computer Organization Lab',
  'CS 3281 - Advanced Systems Programming',
];

const CSCoreTab: React.FC<CSCoreTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    if (selectedCourses.includes(course)) {
      onSelect(selectedCourses.filter((c) => c !== course));
    } else {
      onSelect([...selectedCourses, course]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Computer Science Core Courses (25 hours)</h3>
      <ul>
        {mockCSCoreCourses.map((course) => (
          <li key={course}>
            <label>
              <input
                type="checkbox"
                checked={selectedCourses.includes(course)}
                onChange={() => handleCourseToggle(course)}
              />
              <span className="ml-2">{course}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CSCoreTab;
