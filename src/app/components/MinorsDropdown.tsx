interface MinorsDropdownProps {
  minor: string;
  setMinor: (minor: string) => void;
}

export default function MinorsDropdown({ minor, setMinor }: MinorsDropdownProps) {
  return (
    <div>
      <label>Select Minor:</label>
      <select
        value={minor}
        onChange={(e) => setMinor(e.target.value)}
        className="ml-2 px-2 py-1 border rounded-md"
      >
        <option value="">Select Minor</option>
        <option value="Business">Business</option>
        <option value="Art">Art</option>
        {/* Add more options as needed */}
      </select>
    </div>
  );
}
