// src/app/components/ScheduleDisplay.tsx

import React from 'react';

interface ScheduleDisplayProps {
  plan: string[][] | null;
  highlightedCourses: Set<string>;
  creditHoursRemaining: number;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
  plan,
  highlightedCourses,
  creditHoursRemaining,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-pastel-pink via-pastel-purple to-pastel-blue p-6 rounded-lg shadow-lg overflow-y-auto max-h-screen">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Generated Schedule
      </h3>
      {plan ? (
        <>
          <div className="grid grid-cols-4 gap-6">
            {plan.map((semester, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-md shadow-md p-4 text-center hover:shadow-lg transition-shadow"
              >
                <h4 className="font-bold text-lg text-gray-700 underline mb-2">
                  Semester {index + 1}
                </h4>
                {semester.length > 0 ? (
                  <div className="space-y-2">
                    {semester.map((course, courseIndex) => (
                      <div
                        key={courseIndex}
                        className={`
                          px-2 py-1 rounded-md text-gray-800 font-medium ${
                            highlightedCourses.has(course)
                              ? 'bg-green-200'
                              : ''
                          }`}
                      >
                        {course}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No courses assigned.</p>
                )}
              </div>
            ))}
          </div>
          {/* Credit Hours Remaining */}
          <div className="mt-6">
            <p className="text-lg font-semibold text-gray-900">
              Credit Hours Remaining: {creditHoursRemaining}
            </p>
          </div>
        </>
      ) : (
        <p className="text-gray-600 mt-4">
          Select courses to generate your academic plan.
        </p>
      )}
    </div>
  );
};

export default ScheduleDisplay;
