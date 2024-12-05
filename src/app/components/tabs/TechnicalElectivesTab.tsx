// TechnicalElectivesTab.tsx
import React from 'react';

interface TechnicalElectivesTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const mockTechnicalElectives = [
  'ECE 2100',
  'ME 2200',
  'BME 2300',
  'MATH 3200',
  'CS 3400',
];

const TechnicalElectivesTab: React.FC<TechnicalElectivesTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = (course: string) => {
    if (selectedCourses.includes(course)) {
      onSelect(selectedCourses.filter((c) => c !== course));
      console.log(`Deselecting course: ${course}`);
    } else {
      onSelect([...selectedCourses, course]);
      console.log(`Selecting course: ${course}`);
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
