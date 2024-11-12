'use client';

import React, { useState, useEffect } from 'react';

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

  /**
   * Function to update the selected minor courses in the parent component.
   */
  onSelectedCoursesChange: (courses: string[]) => void;
}

/**
 * Mapping of minors to their predefined courses that should be injected into semester 7.
 */
const fixedMinorCourses: Record<string, string[]> = {
  'Data Science': ['DS 1000', 'DS 3100', 'DS 3850'],
  'Scientific Computing': ['CS 2204'],
  'Electrical and Computer Engineering': ['ECE 2112', 'ECE 2112L'],
};

/**
 * MinorsDropdown Component
 *
 * Renders a dropdown menu for selecting a minor and displays course options
 * for Data Science, Electrical and Computer Engineering, and Scientific Computing.
 * Selected minor courses, along with predefined courses, are passed to the parent component
 * for injection into the academic plan.
 */
const MinorsDropdown: React.FC<MinorsDropdownProps> = ({
  onSelect,
  selectedMinor,
  onSelectedCoursesChange,
}) => {
  const [selectedCourses, setSelectedCourses] = useState<{
    section1: string;
    section2: string;
    section3: string;
    section4: string;
    section5: string;
  }>({
    section1: '',
    section2: '',
    section3: '',
    section4: '',
    section5: '',
  });

  /**
   * Handles changes in the minor selection.
   *
   * @param e - The change event from the select element.
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinor = e.target.value;
    onSelect(newMinor);
    // Reset selected courses when minor changes
    setSelectedCourses({
      section1: '',
      section2: '',
      section3: '',
      section4: '',
      section5: '',
    });
  };

  /**
   * Handles changes in the course selection for each section.
   *
   * @param section - The section number being updated.
   * @param course - The selected course value.
   */
  const handleCourseChange = (
    section: 'section1' | 'section2' | 'section3' | 'section4' | 'section5',
    course: string
  ) => {
    setSelectedCourses((prevState) => ({ ...prevState, [section]: course }));
  };

  /**
   * useEffect to notify parent component of selected minor courses whenever they change.
   * It includes both user-selected courses from the form and predefined courses for the minor.
   */
  useEffect(() => {
    // Retrieve user-selected courses from the form
    const userSelected = Object.values(selectedCourses).filter(
      (course) => course !== ''
    );

    // Retrieve predefined courses based on the selected minor
    const predefined = selectedMinor ? fixedMinorCourses[selectedMinor] || [] : [];

    // Combine both lists, ensuring no duplicates
    const combinedCourses = Array.from(new Set([...userSelected, ...predefined]));

    onSelectedCoursesChange(combinedCourses);
  }, [selectedCourses, selectedMinor, onSelectedCoursesChange]);

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
        <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
        <option value="Data Science">Data Science</option>
        <option value="Scientific Computing">Scientific Computing</option>
      </select>

      {/* Conditionally render course options for Data Science */}
      {selectedMinor === 'Data Science' && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Data Science Core Courses</h3>

          <div className="flex justify-between mt-3 space-x-4">
            {/* Section 2: Computer Programming */}
            <div className="flex-1">
              <p className="text-sm font-medium">Computer Programming:</p>
              {['DS 1100', 'CS 1100', 'CS 2201', 'CS 2204'].map((course) => (
                <div key={course} className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="section2"
                      value={course}
                      checked={selectedCourses.section2 === course}
                      onChange={() => handleCourseChange('section2', course)}
                      className="form-radio"
                    />
                    <span className="ml-2">{course}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Section 3: Introduction to Statistics */}
            <div className="flex-1">
              <p className="text-sm font-medium">Introduction to Statistics:</p>
              {[
                'DS 2100',
                'BME 2400',
                'BSCI 3270',
                'CE 3300',
                'ECON 1500',
                'ECON 1510',
                'MATH 2810',
                'MATH 2821',
                'PSY 2100',
                'PSY-PC 2100',
                'SOC 2100',
              ].map((course) => (
                <div key={course} className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="section3"
                      value={course}
                      checked={selectedCourses.section3 === course}
                      onChange={() => handleCourseChange('section3', course)}
                      className="form-radio"
                    />
                    <span className="ml-2">{course}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Section 5: Machine Learning */}
            <div className="flex-1">
              <p className="text-sm font-medium">Machine Learning:</p>
              {['DS 3262', 'CS 3262', 'CS 4262', 'ECON 3750', 'MATH 3670'].map((course) => (
                <div key={course} className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="section5"
                      value={course}
                      checked={selectedCourses.section5 === course}
                      onChange={() => handleCourseChange('section5', course)}
                      className="form-radio"
                    />
                    <span className="ml-2">{course}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conditionally render course options for Electrical and Computer Engineering */}
      {selectedMinor === 'Electrical and Computer Engineering' && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Electrical and Computer Engineering Core Courses</h3>

          <div className="flex justify-between mt-3 space-x-4">
            {/* Section 1: Programming */}
            <div className="flex-1">
              <p className="text-sm font-medium">Programming:</p>
              {['CS 1101', 'CS 1104'].map((course) => (
                <div key={course} className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="section1"
                      value={course}
                      checked={selectedCourses.section1 === course}
                      onChange={() => handleCourseChange('section1', course)}
                      className="form-radio"
                    />
                    <span className="ml-2">{course}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Section 2: Digital Systems or Computer Architecture */}
            <div className="flex-1">
              <p className="text-sm font-medium">Digital Systems or Computer Architecture:</p>
              {['ECE 2123 & 2123L', 'ECE 2123L & 2123', 'ECE 2281 & 2281L'].map((course) => (
                <div key={course} className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="section2"
                      value={course}
                      checked={selectedCourses.section2 === course}
                      onChange={() => handleCourseChange('section2', course)}
                      className="form-radio"
                    />
                    <span className="ml-2">{course}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Section 4: Electives from ECE list */}
            <div className="flex-1">
              <p className="text-sm font-medium">Electives (Choose one):</p>
              {[
                'ECE 2213 - Circuits II',
                'ECE 2213L - Circuits II Laboratory',
                'ECE 2214 - Analog Circuits and Systems',
                'ECE 2218 - Microcontrollers',
                'ECE 2218L - Microcontrollers Laboratory',
                'ECE 2281 - Computer Architecture',
                'ECE 2281L - Computer Architecture Laboratory',
                'ECE 3214 - Signals and Systems',
                'ECE 3233 - Electromagnetics',
                'ECE 3235 - Electronics I',
                'ECE 3235L - Electronics I Laboratory',
              ].map((course) => (
                <div key={course} className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="section4"
                      value={course}
                      checked={selectedCourses.section4 === course}
                      onChange={() => handleCourseChange('section4', course)}
                      className="form-radio"
                    />
                    <span className="ml-2">{course}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conditionally render course options for Scientific Computing */}
      {selectedMinor === 'Scientific Computing' && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Scientific Computing Core Courses</h3>

          <div className="flex justify-between mt-3 space-x-4">
            {/* Section 1: Core Courses */}
            <div className="flex-1">
              <p className="text-sm font-medium">Core Courses:</p>
              {['CS 1101', 'CS 1103', 'CS 1104'].map((course) => (
                <div key={course} className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="section1"
                      value={course}
                      checked={selectedCourses.section1 === course}
                      onChange={() => handleCourseChange('section1', course)}
                      className="form-radio"
                    />
                    <span className="ml-2">{course}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Section 3: Elective Courses */}
            <div className="flex-1">
              <p className="text-sm font-medium">Elective Courses:</p>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="section3"
                    value="Course List A"
                    checked={selectedCourses.section3 === 'Course List A'}
                    onChange={() => handleCourseChange('section3', 'Course List A')}
                    className="form-radio"
                  />
                  <span className="ml-2">
                    Course List A (Mathematical, Quantitative, Data Science Methods)
                  </span>
                </label>
              </div>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="section3"
                    value="Course List B"
                    checked={selectedCourses.section3 === 'Course List B'}
                    onChange={() => handleCourseChange('section3', 'Course List B')}
                    className="form-radio"
                  />
                  <span className="ml-2">
                    Course List B (Computational, Simulation, Modeling Methods)
                  </span>
                </label>
              </div>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="section3"
                    value="Independent Study"
                    checked={selectedCourses.section3 === 'Independent Study'}
                    onChange={() => handleCourseChange('section3', 'Independent Study')}
                    className="form-radio"
                  />
                  <span className="ml-2">
                    Independent Study (SC 3850/3851 with affiliated faculty)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinorsDropdown;
