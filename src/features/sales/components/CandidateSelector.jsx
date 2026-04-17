import React, { useState } from 'react';
import HeadingSelector from './HeadingSelector';
import ValueSelector from './ValueSelector';

const CandidateSelector = () => {
  const [selectedHeading, setSelectedHeading] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      <HeadingSelector onHeadingSelect={setSelectedHeading} />
      <ValueSelector
        selectedHeading={selectedHeading}
        onValueSelect={setSelectedValue}
      />
    </div>
  );
};

export default CandidateSelector;
