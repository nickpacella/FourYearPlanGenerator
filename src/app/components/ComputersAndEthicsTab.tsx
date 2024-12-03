// ComputersAndEthicsTab.tsx
import React from 'react';

interface ComputersAndEthicsTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const computersAndEthicsCourse = 'CS 1151 - Computers and Ethics';

const ComputersAndEthicsTab: React.FC<ComputersAndEthicsTabProps> = ({ onSelect, selectedCourses }) => {
  const handleCourseToggle = () => {
    if (selectedCourses.includes(computersAndEthicsCourse)) {
      onSelect([]);
    } else {
      onSelect([computersAndEthicsCourse]);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Computers and Ethics Course (3 hours)</h3>
      <label>
        <input
          type="checkbox"
          checked={selectedCourses.includes(computersAndEthicsCourse)}
          onChange={handleCourseToggle}
        />
        <span className="ml-2">{computersAndEthicsCourse}</span>
      </label>
    </div>
  );
};

export default ComputersAndEthicsTab;
