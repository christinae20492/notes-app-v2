import React, { useEffect, useState } from "react";

interface MultiSelectProps {
  selectedNotes: any[];
}

export const MultiSelectCounter: React.FC<MultiSelectProps> = ({
  selectedNotes,
}) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const count = selectedNotes.length;

  useEffect(() => {
    setIsBouncing(true);
    const timeoutId = setTimeout(() => setIsBouncing(false), 300);
    return () => clearTimeout(timeoutId);
  }, [count]);

  return (
    <>
      <div className="w-full h-20 absolute top-0 bg-white shadow-md left-0 z-50 md:visible invisible">
        <h1
          className={`text-2xl p-6 font-semibold font-header ${
            isBouncing ? "animate-bounce" : ""
          }`}
        >
          {count} selected
        </h1>
      </div>
      <div className="w-fit h-fit top-10 rounded-lg sticky bg-white shadow-md left-0 z-50 md:invisible">
        <h1
          className={`text-2xl p-6 font-semibold font-header ${
            isBouncing ? "animate-bounce" : ""
          }`}
        >
          {count} selected
        </h1>
      </div>
    </>
  );
};
