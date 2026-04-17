import React, { useState, useMemo } from 'react';
import { Heading } from '../../../data/Heading';

const HeadingSelector = ({ onHeadingSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHeading, setSelectedHeading] = useState(null);

  const filteredHeadings = useMemo(() => {
    return Heading.filter((heading) =>
      heading.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const onSelectHeading = (heading) => {
    setSelectedHeading(heading);
    if (onHeadingSelect) {
      onHeadingSelect(heading); // Pass selected heading to parent
    }
  };

  return (
    <div className="w-full sm:w-1/2 max-w-xs space-y-2 sm:mr-2">
      <input
        type="text"
        placeholder="Search heading..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
      />

      <ul className="border rounded text-sm space-y-1 max-h-40 overflow-y-auto bg-white">
        {filteredHeadings.map((heading, idx) => (
          <li
            key={idx}
            className={`cursor-pointer p-2 rounded ${
              selectedHeading === heading
                ? 'bg-blue-100 font-bold'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => onSelectHeading(heading)}
          >
            {heading}
          </li>
        ))}
        {filteredHeadings.length === 0 && (
          <li className="p-2 text-gray-500 italic">No headings found.</li>
        )}
      </ul>
    </div>
  );
};

export default HeadingSelector;
