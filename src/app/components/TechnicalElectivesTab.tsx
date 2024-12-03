// TechnicalElectivesTab.tsx
import React from 'react';

interface TechnicalElectivesTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockTechnicalElectives = [
  'ECE 2100 - Digital Logic Design',
  'ME 2200 - Mechanics of Materials',
  'BME 2300 - Biomedical Engineering Fundamentals',
  'MATH 3200 - Numerical Methods',
  'CS 3400 - Data Mining',
];

const TechnicalElectivesTab: React.FC<TechnicalElectivesTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    if (selectedCourses.includes(course)) {
      onSelect(selectedCourses.filter((c) => c !== course));
    } else {
      onSelect([...selectedCourses, course]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Technical Electives (6 hours)</h3>
      <ul>
        {mockTechnicalElectives.map((course) => (
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

export default TechnicalElectivesTab;
