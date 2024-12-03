// LiberalArtsCoreTab.tsx
import React from 'react';

interface LiberalArtsCoreTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockLiberalArtsCourses = [
  'HUM 1100 - Introduction to Humanities',
  'SOC 1200 - Introduction to Sociology',
  'PSY 1300 - General Psychology',
  'ENG 1400 - English Literature',
  'PHIL 1500 - Introduction to Philosophy',
  'HIST 1600 - World History',
];

const LiberalArtsCoreTab: React.FC<LiberalArtsCoreTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    if (selectedCourses.includes(course)) {
      onSelect(selectedCourses.filter((c) => c !== course));
    } else {
      onSelect([...selectedCourses, course]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Liberal Arts Core Courses (18 hours)</h3>
      <ul>
        {mockLiberalArtsCourses.map((course) => (
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

export default LiberalArtsCoreTab;
