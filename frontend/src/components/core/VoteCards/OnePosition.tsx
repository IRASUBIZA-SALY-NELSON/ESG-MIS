import React, { useEffect, useState } from 'react';
import VoteCard from './VoteCard';

const OnePosition = ({ position, candidates, setVotes, votingSession, error }: any) => {
  const [selected, setSelected] = useState<any>(null);

  const profileString = localStorage.getItem('rcaappuser');
  const profile = profileString ? JSON.parse(profileString) : null;

  useEffect(() => {
    if (selected?.id) {
      setVotes((prevVotes: any) => {
        const votes = prevVotes.filter((vote: any) => vote.positionId !== position.id);
        return selected
          ? [
              ...votes,
              {
                candidateId: selected.id,
                positionId: position.id,
                voterId: profile.userTypesDTOList[0].user_id,
                votingSessionId: votingSession.id,
              },
            ]
          : votes;
      });
    }
  }, [selected]);

  const handleSelect = (candidate: any) => {
    // Deselect if the same candidate is clicked again
    setSelected((prevSelected: any) => (prevSelected?.id === candidate.id ? null : candidate));
  };

  return (
    <div className="w-full flex flex-col my-8 gap-4">
      <h4 className="text-2xl font-bold">{position.name}</h4>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates
          .filter((candidate: any) =>
            candidate.position.some(
              (candidatePosition: any) => candidatePosition.name === position.name,
            ),
          )
          .map((candidate: any, i: number) => (
            <VoteCard
              key={i}
              candidateData={candidate}
              position={position.name}
              selected={selected}
              setSelected={handleSelect}
            />
          ))}
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default OnePosition;
