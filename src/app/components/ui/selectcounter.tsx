import React, { useEffect, useState } from 'react';

interface MultiSelectProps {
  selectedNotes: any[];
}

export const MultiSelectCounter: React.FC<MultiSelectProps> = ({ selectedNotes }) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const count = selectedNotes.length;

  useEffect(() => {
    setIsBouncing(true);
    const timeoutId = setTimeout(() => setIsBouncing(false), 300);
    return () => clearTimeout(timeoutId);
  }, [count]);

  return (
    <div className="w-full h-28 absolute top-0 bg-white shadow-md -ml-4">
      <h1 className={`text-2xl p-6 font-semibold font-header ${isBouncing ? 'animate-bounce' : ''}`}>
        {count} selected
      </h1>
    </div>
  );
};
