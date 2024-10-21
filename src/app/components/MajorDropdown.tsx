interface MajorDropdownProps {
    major: string;
    setMajor: (major: string) => void;
  }
  
  export default function MajorDropdown({ major, setMajor }: MajorDropdownProps) {
    return (
      <div>
        <label>Select Major:</label>
        <select value={major} onChange={(e) => setMajor(e.target.value)}>
          <option value="">Select Major</option>
          <option value="CS">Computer Science</option>
          <option value="Math">Mathematics</option>
          <option value="EECE">EECE</option>
        </select>
      </div>
    );
  }
  