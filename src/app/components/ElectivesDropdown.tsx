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
    <div>
      <label>Select Electives :</label>
      <div>
        {availableElectives.map((elective) => (
          <div key={elective}>
            <input
              type="checkbox"
              id={elective}
              value={elective}
              checked={electives.includes(elective)}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={elective}>{elective}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
