// OpenElectivesTab.tsx
import React from 'react';

interface OpenElectivesTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockOpenElectives = [
  'ART 2100',
  'MUSC 2200',
  'LANG 2300',
  'COMM 2400',
  'ECON 2500',
  'CMA 1500',
  'CMA 1600',
];

const OpenElectivesTab: React.FC<OpenElectivesTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    if (selectedCourses.includes(course)) {
      onSelect(selectedCourses.filter((c) => c !== course));
    } else {
      onSelect([...selectedCourses, course]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Open Electives (18–20 hours)</h3>
      <ul>
        {mockOpenElectives.map((course) => (
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

export default OpenElectivesTab;
