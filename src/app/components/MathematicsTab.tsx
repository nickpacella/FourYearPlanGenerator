// MathematicsTab.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface MathematicsTabProps {
  onSelect: (courses: string[]) => void;
  selectedCourses: string[];
}

const MathematicsTab: React.FC<MathematicsTabProps> = ({ onSelect, selectedCourses }) => {
  // Section B: Path option selected ('option1' or 'option2')
  const [pathOption, setPathOption] = useState<'option1' | 'option2' | ''>('');
  // Selected course in Option 1's choice of MATH 2410 or 2600
  const [option1Course, setOption1Course] = useState<string>('');
  // Selected course in Section C
  const [additionalCourse, setAdditionalCourse] = useState<string>('');

  // List of required courses (MATH 1300 and 1301)
  const requiredCourses = ['MATH 1300', 'MATH 1301'];

  // Update selected courses whenever selections change
  useEffect(() => {
    let courses: string[] = [...requiredCourses];

    if (pathOption === 'option1') {
      courses.push('MATH 2300');
      if (option1Course) {
        courses.push(option1Course);
      }
    } else if (pathOption === 'option2') {
      courses.push('MATH 2500', 'MATH 2501');
    }

    if (additionalCourse) {
      courses.push(additionalCourse);
    }

    onSelect(courses);
  }, [pathOption, option1Course, additionalCourse, onSelect]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Mathematics Courses</h3>

      {/* Section A: Core Calculus Courses */}
      <div>
        <h4 className="font-semibold">Core Calculus Courses (Required)</h4>
        <ul>
          {requiredCourses.map((courseCode) => (
            <li key={courseCode}>
              <label>
                <input type="checkbox" checked disabled />
                <span className="ml-2">{courseCode}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Section B: Choose a Path */}
      <div className="mt-4">
        <h4 className="font-semibold">Choose a Path</h4>
        <div className="mt-2">
          {/* Option 1 */}
          <label className="flex items-center">
            <input
              type="radio"
              name="pathOption"
              value="option1"
              checked={pathOption === 'option1'}
              onChange={() => setPathOption('option1')}
            />
            <span className="ml-2">Option 1</span>
          </label>
          {pathOption === 'option1' && (
            <div className="ml-6 mt-2">
              <p>MATH 2300 (Required)</p>
              <p className="mt-2">Choose one of:</p>
              <label className="flex items-center mt-1">
                <input
                  type="radio"
                  name="option1Course"
                  value="MATH 2410"
                  checked={option1Course === 'MATH 2410'}
                  onChange={() => setOption1Course('MATH 2410')}
                />
                <span className="ml-2">MATH 2410</span>
              </label>
              <label className="flex items-center mt-1">
                <input
                  type="radio"
                  name="option1Course"
                  value="MATH 2600"
                  checked={option1Course === 'MATH 2600'}
                  onChange={() => setOption1Course('MATH 2600')}
                />
                <span className="ml-2">MATH 2600</span>
              </label>
            </div>
          )}

          {/* Option 2 */}
          <label className="flex items-center mt-2">
            <input
              type="radio"
              name="pathOption"
              value="option2"
              checked={pathOption === 'option2'}
              onChange={() => {
                setPathOption('option2');
                setOption1Course('');
              }}
            />
            <span className="ml-2">Option 2</span>
          </label>
          {pathOption === 'option2' && (
            <div className="ml-6 mt-2">
              <p>MATH 2500 (Required)</p>
              <p>MATH 2501 (Required)</p>
            </div>
          )}
        </div>
      </div>

      {/* Section C: Additional Course */}
      <div className="mt-4">
        <h4 className="font-semibold">Choose One Additional Course</h4>
        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="additionalCourse"
              value="MATH 2810"
              checked={additionalCourse === 'MATH 2810'}
              onChange={() => setAdditionalCourse('MATH 2810')}
            />
            <span className="ml-2">MATH 2810</span>
          </label>
          <label className="flex items-center mt-1">
            <input
              type="radio"
              name="additionalCourse"
              value="MATH 2820"
              checked={additionalCourse === 'MATH 2820'}
              onChange={() => setAdditionalCourse('MATH 2820')}
            />
            <span className="ml-2">MATH 2820</span>
          </label>
          <label className="flex items-center mt-1">
            <input
              type="radio"
              name="additionalCourse"
              value="MATH 3640"
              checked={additionalCourse === 'MATH 3640'}
              onChange={() => setAdditionalCourse('MATH 3640')}
            />
            <span className="ml-2">MATH 3640</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default MathematicsTab;
