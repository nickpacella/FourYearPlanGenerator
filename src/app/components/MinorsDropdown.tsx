interface MinorsDropdownProps {
    minors: string[];
    setMinors: (minors: string[]) => void;
  }
  
  export default function MinorsDropdown({ minors, setMinors }: MinorsDropdownProps) {
    return (
      <div>
        <label>Select Minor:</label>
        <select value={minors[0] || ""} onChange={(e) => setMinors([e.target.value])}>
          <option value="">Select Minor</option>
          <option value="Business">Business</option>
          <option value="Art">Art</option>
        </select>
      </div>
    );
  }
  