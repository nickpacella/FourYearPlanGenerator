// src/app/components/MajorMinorSelector.tsx

import React from 'react';
import MajorDropdown from './dropdowns/MajorDropdown';
import MinorsDropdown from './dropdowns/MinorsDropdown';

interface MajorMinorSelectorProps {
  major: string;
  setMajor: (major: string) => void;
  minor: string;
  setMinor: (minor: string) => void;
  setSelectedMinorCourses: (courses: string[]) => void;
}

const MajorMinorSelector: React.FC<MajorMinorSelectorProps> = ({
  major,
  setMajor,
  minor,
  setMinor,
  setSelectedMinorCourses,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row md:space-x-8">
      <div className="w-full md:w-1/2 space-y-4">
        <MajorDropdown onSelect={setMajor} selectedMajor={major} />
      </div>
      <div className="w-full md:w-1/2 space-y-4">
        <MinorsDropdown
          onSelect={setMinor}
          selectedMinor={minor}
          onSelectedCoursesChange={setSelectedMinorCourses}
        />
      </div>
    </div>
  );
};

export default MajorMinorSelector;
