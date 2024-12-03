// CSDepthTab.tsx
import React from 'react';

interface CSDepthTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockCSDepthCourses = [
  'CS 3300 - Artificial Intelligence',
  'CS 3310 - Machine Learning',
  'CS 3320 - Computer Networks',
  'CS 3330 - Database Systems',
  'CS 3340 - Computer Graphics',
  'CS 3350 - Cybersecurity',
  'CS 3860 - Special Topics in CS',
  'MATH 3320 - Advanced Calculus',
  'MATH 3620 - Abstract Algebra',
];

const CSDepthTab: React.FC<CSDepthTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    if (selectedCourses.includes(course)) {
      onSelect(selectedCourses.filter((c) => c !== course));
    } else {
      onSelect([...selectedCourses, course]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Select Computer Science Depth Courses (15 hours)
      </h3>
      <ul>
        {mockCSDepthCourses.map((course) => (
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

export default CSDepthTab;
