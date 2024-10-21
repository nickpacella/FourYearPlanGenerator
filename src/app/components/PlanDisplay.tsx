import React from 'react'; // Import React

interface PlanDisplayProps {
  plan: string[][];
}

export default function PlanDisplay({ plan }: PlanDisplayProps) {
  return (
    {/* <div>
      <h2>Your 4-Year Plan</h2>
      {plan.map((semester, index) => (
        <div key={index}>
          <h3>Semester {index + 1}</h3>
          <ul>
            {semester.map((course) => (
              <li key={course}>{course}</li>
            ))}
          </ul>
        </div>
      ))}
    </div> */}
  );
}
