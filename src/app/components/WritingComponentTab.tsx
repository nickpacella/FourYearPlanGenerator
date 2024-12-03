// WritingComponentTab.tsx
import React from 'react';

interface WritingComponentTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockWritingCourses = [
  'ENGL 1111W - Writing Seminar',
  'ENGL 2200W - Advanced Composition',
  'HIST 2000W - Historical Writing',
];

const WritingComponentTab: React.FC<WritingComponentTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    // Only one writing course should be selected
    onSelect([course]);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Writing Component Course (3 hours)</h3>
      <ul>
        {mockWritingCourses.map((course) => (
          <li key={course}>
            <label>
              <input
                type="radio"
                name="writingComponentCourse"
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

export default WritingComponentTab;
