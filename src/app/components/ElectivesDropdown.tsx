// src/components/ElectivesDropdown.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Course } from '@/types/Course';

/**
 * Interface defining the props expected by the ElectivesDropdown component.
 */
interface ElectivesDropdownProps {
  onSelect: (electives: string[]) => void;
  availableElectives: Course[];
  selectedElectives: string[];
  loading: boolean;
  error: string | null;
  completedCourses: Set<string>[];
  courseCodeToNameMap: Record<string, string>;
}

/**
 * ElectivesDropdown Component
 *
 * Renders a list of checkboxes for selecting multiple electives.
 * Displays prerequisites for each elective.
 * Shows missing prerequisites in red text.
 */
const ElectivesDropdown: React.FC<ElectivesDropdownProps> = ({
  onSelect,
  availableElectives,
  selectedElectives,
  loading,
  error,
  completedCourses,
  courseCodeToNameMap,
}) => {
  // State to trigger re-render when completedCourses changes
  const [_, setUpdate] = useState(0);

  useEffect(() => {
    // Trigger re-render when completedCourses changes
    setUpdate((u) => u + 1);
  }, [completedCourses]);

  /**
   * Determines if an elective is available based on prerequisites.
   * Returns an object with availability and missing prerequisites.
   */
  const getElectiveAvailability = (elective: Course) => {
    // Sets to store missing and satisfied prerequisites
    const missingPrerequisites = new Set<string>();
    const satisfiedPrerequisites = new Set<string>();

    // Check if there is any semester where prerequisites are met
    let prerequisitesMetInAnySemester = false;

    for (const completed of completedCourses) {
      const prerequisitesMet = elective.prerequisites.every((prereq) =>
        completed.has(prereq)
      );
      if (prerequisitesMet) {
        prerequisitesMetInAnySemester = true;
        break;
      }
    }

    if (prerequisitesMetInAnySemester) {
      return {
        available: true,
        missingPrerequisites: [],
        satisfiedPrerequisites: elective.prerequisites,
      };
    } else {
      // Determine missing prerequisites based on the last semester's completed courses
      const lastCompleted = completedCourses[completedCourses.length - 1] || new Set<string>();
      elective.prerequisites.forEach((prereq) => {
        if (lastCompleted.has(prereq)) {
          satisfiedPrerequisites.add(prereq);
        } else {
          missingPrerequisites.add(prereq);
        }
      });
      return {
        available: false,
        missingPrerequisites: Array.from(missingPrerequisites),
        satisfiedPrerequisites: Array.from(satisfiedPrerequisites),
      };
    }
  };

  /**
   * Handles the change event for a checkbox.
   * Adds or removes the elective from the selectedElectives array.
   */
  const handleCheckboxChange = (electiveCode: string) => {
    if (selectedElectives.includes(electiveCode)) {
      onSelect(selectedElectives.filter((e) => e !== electiveCode));
    } else {
      onSelect([...selectedElectives, electiveCode]);
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
        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
          {availableElectives.map((elective) => {
            const {
              available,
              missingPrerequisites,
              satisfiedPrerequisites,
            } = getElectiveAvailability(elective);

            const disabled = !available;
            const isSelected = selectedElectives.includes(elective.code);

            return (
              <div key={elective.code} className="flex items-start">
                <input
                  id={`elective-${elective.code}`}
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(elective.code)}
                  className="h-4 w-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={disabled}
                />
                <div className="ml-2">
                  <label
                    htmlFor={`elective-${elective.code}`}
                    className={`block text-sm ${
                      disabled ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    {elective.name}
                  </label>
                  {/* Display prerequisites */}
                  {elective.prerequisites.length > 0 ? (
                    <span className="block text-xs text-gray-500">
                      {disabled
                        ? 'Prerequisites not met:'
                        : 'Prerequisites:'}{' '}
                      {elective.prerequisites.map((prereq, index) => {
                        const isMissing = missingPrerequisites.includes(prereq);
                        return (
                          <span
                            key={index}
                            className={`${isMissing ? 'text-red-500' : ''}`}
                          >
                            {courseCodeToNameMap[prereq] || prereq}
                            {index < elective.prerequisites.length - 1
                              ? ', '
                              : ''}
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span className="block text-xs text-gray-500">
                      Prerequisites: None
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ElectivesDropdown;
