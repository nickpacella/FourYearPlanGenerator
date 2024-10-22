// src/components/MinorsDropdown.tsx

import { useEffect, useState } from 'react';

interface MinorsDropdownProps {
  minor: string;
  setMinor: (minor: string) => void;
}

export default function MinorsDropdown({ minor, setMinor }: MinorsDropdownProps) {
  const [minors, setMinors] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMinors() {
      try {
        const res = await fetch('/api/getMinors');
        if (res.ok) {
          const data = await res.json();
          setMinors(data.minors);
        } else {
          console.error('Failed to fetch minors');
        }
      } catch (error) {
        console.error('Error fetching minors:', error);
      }
    }

    fetchMinors();
  }, []);

  return (
    <div className="mt-4">
      <label htmlFor="minor-select" className="block font-medium">Select Minor:</label>
      <select
        id="minor-select"
        value={minor}
        onChange={(e) => setMinor(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select Minor</option>
        {minors.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
