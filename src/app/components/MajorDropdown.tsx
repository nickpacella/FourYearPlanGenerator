// src/components/MajorDropdown.tsx

import { useEffect, useState } from 'react';

interface MajorDropdownProps {
  major: string;
  setMajor: (major: string) => void;
}

export default function MajorDropdown({ major, setMajor }: MajorDropdownProps) {
  const [majors, setMajors] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMajors() {
      try {
        const res = await fetch('/api/getMajors');
        if (res.ok) {
          const data = await res.json();
          setMajors(data.majors);
        } else {
          console.error('Failed to fetch majors');
        }
      } catch (error) {
        console.error('Error fetching majors:', error);
      }
    }

    fetchMajors();
  }, []);

  return (
    <div>
      <label htmlFor="major-select" className="block font-medium">Select Major:</label>
      <select
        id="major-select"
        value={major}
        onChange={(e) => setMajor(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select Major</option>
        {majors.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
