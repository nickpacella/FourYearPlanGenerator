// src/components/MinorsDropdown.tsx

'use client';

import React from 'react';

/**
 * Interface defining the props expected by the MinorsDropdown component.
 */
interface MinorsDropdownProps {
  /**
   * Function to update the selected minor in the parent component.
   */
  onSelect: (minor: string) => void;

  /**
   * Currently selected minor.
   */
  selectedMinor: string;
}

/**
 * MinorsDropdown Component
 *
 * Renders a dropdown menu for selecting a minor.
 */
const MinorsDropdown: React.FC<MinorsDropdownProps> = ({ onSelect, selectedMinor }) => {
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
      <label htmlFor="minor-dropdown" className="block text-sm font-medium text-gray-700">
        Select Minor:
      </label>
      <select
        id="minor-dropdown"
        value={selectedMinor}
        onChange={handleChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      >
        <option value="" disabled>
          Select a minor
        </option>
        {/* Replace with actual minor options */}
        <option value="Mathematics">Mathematics</option>
        <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
        {/* Add more minors as needed */}
      </select>
    </div>
  );
};

export default MinorsDropdown;
