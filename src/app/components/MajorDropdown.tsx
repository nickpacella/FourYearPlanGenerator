// src/components/MajorDropdown.tsx

'use client';

import React from 'react';

/**
 * Interface defining the props expected by the MajorDropdown component.
 */
interface MajorDropdownProps {
  /**
   * Function to update the selected major in the parent component.
   */
  onSelect: (major: string) => void;

  /**
   * Currently selected major.
   */
  selectedMajor: string;
}

/**
 * MajorDropdown Component
 *
 * Renders a dropdown menu for selecting a major.
 */
const MajorDropdown: React.FC<MajorDropdownProps> = ({ onSelect, selectedMajor }) => {
  /**
   * Handles changes in the select element.
   *
   * @param e - The change event from the select element.
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  };

  return (
    <div>
      <label htmlFor="major-dropdown" className="block text-sm font-medium text-gray-700">
        Select Major:
      </label>
      <select
        id="major-dropdown"
        value={selectedMajor}
        onChange={handleChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      >
        <option value="" disabled>
          Select a major
        </option>
        {/* Replace with actual major options */}
        <option value="Computer Science">Computer Science</option>

        {/* Add more majors as needed */}
      </select>
    </div>
  );
};

export default MajorDropdown;
