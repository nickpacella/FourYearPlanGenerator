// src/app/components/GeneratePlanButton.tsx

import React from 'react';

interface GeneratePlanButtonProps {
  onClick: () => void;
  generating: boolean;
  error: string | null;
}

const GeneratePlanButton: React.FC<GeneratePlanButtonProps> = ({
  onClick,
  generating,
  error,
}) => {
  return (
    <div className="mt-4">
      <button
        onClick={onClick}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
        disabled={generating}
      >
        {generating ? 'Generating Plan...' : 'Generate Plan'}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default GeneratePlanButton;
