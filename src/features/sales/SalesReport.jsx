import React, { useState } from 'react';
import CandidateSelector from './components/CandidateSelector';

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([{ id: Date.now() }]);

  const addCandidate = () => {
    setCandidates([...candidates, { id: Date.now() }]);
  };

  return (
    <div className="space-y-6">
      {candidates.map((candidate, idx) => (
        <CandidateSelector key={candidate.id} />
      ))}

      <button
        onClick={addCandidate}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Another Candidate
      </button>
    </div>
  );
};

export default CandidateManager;
