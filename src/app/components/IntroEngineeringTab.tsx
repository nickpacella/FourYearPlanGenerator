// IntroEngineeringTab.tsx
import React from 'react';

interface IntroEngineeringTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockIntroEngineeringCourses = [
  'ES 1401 - Intro to Engineering Module I',
  'ES 1402 - Intro to Engineering Module II',
  'ES 1403 - Intro to Engineering Module III',
];

const IntroEngineeringTab: React.FC<IntroEngineeringTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    if (selectedCourses.includes(course)) {
      onSelect(selectedCourses.filter((c) => c !== course));
    } else {
      // Ensure only one course is selected (since it's 3 hours total)
      onSelect([course]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Introduction to Engineering Course</h3>
      <ul>
        {mockIntroEngineeringCourses.map((course) => (
          <li key={course}>
            <label>
              <input
                type="radio"
                name="introEngineeringCourse"
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

export default IntroEngineeringTab;
