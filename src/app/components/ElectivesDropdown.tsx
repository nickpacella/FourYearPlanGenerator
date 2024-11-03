// src/components/ElectivesDropdown.tsx

'use client';

import React from 'react';

/**
 * Interface defining the props expected by the ElectivesDropdown component.
 */
interface ElectivesDropdownProps {
  /**
   * Function to update the selected electives in the parent component.
   */
  onSelect: (electives: string[]) => void;

  /**
   * Array of available elective options to display in the dropdown.
   */
  availableElectives: string[];

  /**
   * Array of currently selected electives.
   */
  selectedElectives: string[];

  /**
   * Boolean indicating whether the electives are currently being loaded.
   */
  loading: boolean;

  /**
   * Optional error message to display if fetching electives fails.
   */
  error: string | null;
}

/**
 * ElectivesDropdown Component
 *
 * Renders a list of checkboxes for selecting multiple electives.
 */
const ElectivesDropdown: React.FC<ElectivesDropdownProps> = ({
  onSelect,
  availableElectives,
  selectedElectives,
  loading,
  error,
}) => {
  /**
   * Handles the change event for a checkbox.
   * Adds or removes the elective from the selectedElectives array.
   *
   * @param elective - The elective associated with the checkbox.
   */
  const handleCheckboxChange = (elective: string) => {
    if (selectedElectives.includes(elective)) {
      onSelect(selectedElectives.filter((e) => e !== elective));
    } else {
      onSelect([...selectedElectives, elective]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Select Electives:
      </label>
      {loading ? (
        <p className="mt-1 text-sm text-gray-500">Loading electives...</p>
      ) : error ? (
        <p className="mt-1 text-sm text-red-500">Error: {error}</p>
      ) : (
        <div className="mt-2 space-y-2">
          {availableElectives.map((elective) => (
            <div key={elective} className="flex items-center">
              <input
                id={`elective-${elective}`}
                type="checkbox"
                checked={selectedElectives.includes(elective)}
                onChange={() => handleCheckboxChange(elective)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor={`elective-${elective}`} className="ml-2 block text-sm text-gray-700">
                {elective}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectivesDropdown;
