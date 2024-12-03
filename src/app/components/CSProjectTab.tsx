// CSProjectTab.tsx
import React from 'react';

interface CSProjectTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockCSProjectCourses = [
  'CS 3862 - Senior Design Project',
  'CS 4239 - Software Engineering Project',
  'CS 4249 - Systems Design Project',
];

const CSProjectTab: React.FC<CSProjectTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    // Only one project course should be selected
    onSelect([course]);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Computer Science Project Course (3 hours)</h3>
      <ul>
        {mockCSProjectCourses.map((course) => (
          <li key={course}>
            <label>
              <input
                type="radio"
                name="csProjectCourse"
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

export default CSProjectTab;
