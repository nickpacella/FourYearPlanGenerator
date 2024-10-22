// src/components/ElectivesDropdown.tsx

interface ElectivesDropdownProps {
  electives: string[];
  setElectives: (electives: string[]) => void;
  availableElectives: string[]; // Available electives passed from ClientPlan based on the selected major
}

export default function ElectivesDropdown({ electives, setElectives, availableElectives }: ElectivesDropdownProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    if (e.target.checked) {
      setElectives([...electives, selected]);
    } else {
      setElectives(electives.filter((elective) => elective !== selected));
    }
  };

  return (
    <div className="mt-4">
      <label className="block font-medium">Select Electives:</label>
      <div className="mt-2 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {availableElectives.map((elective) => (
          <div key={elective} className="flex items-center">
            <input
              type="checkbox"
              id={elective}
              value={elective}
              checked={electives.includes(elective)}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor={elective} className="ml-2 text-sm">
              {elective}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
