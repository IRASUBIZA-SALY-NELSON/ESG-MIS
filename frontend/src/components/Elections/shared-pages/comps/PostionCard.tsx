import useGet from '@/hooks/useGet';
import { IPosition, ICandidate, IVote } from '@/types/other.type';
import { Button, Collapse, Skeleton } from '@mantine/core';
import CandidateCard from './CandidateCard';
import { GroupedVotes, groupVotesByCandidates } from './utils';
import { useEffect, useState } from 'react';
import React from 'react';
import VotingGraph from './VotingGraph';

interface Props {
  position: IPosition;
  canRelease: boolean;
  setShowExport: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      data: any[] | null;
    }>
  >;
}

const PositionCard = ({ position, canRelease, setShowExport }: Props) => {
  const { data: candidates, loading: loadCandidates } = useGet<ICandidate[]>(
    `/candidates/position/${position.id}`,
    {
      defaultData: [],
      swr: true,
    },
  );
  const { data: votes, loading: loadVotes } = useGet<IVote[]>(
    `/votes/all/position/${position.id}`,
    {
      defaultData: [],
      swr: true,
    },
  );
  const [groupedVotes, setGroupedVotes] = useState<GroupedVotes>({});
  const [showGraph, setShowGraph] = useState(false);
  const [sortedCandidates, setSortedCandidates] = useState<ICandidate[]>([]);

  useEffect(() => {
    if (!votes || !candidates) return;
    const grouped = groupVotesByCandidates(votes, candidates);

    setGroupedVotes(grouped);
    // add to export data
    setShowExport((prev) => ({
      ...prev,
      data: [
        ...(prev?.data ?? []),
        {
          position: position.name,
          votes: Object.keys(grouped).map((key) => ({
            candidate: candidates.find((c) => c.id === key),
            votes: grouped[key].votes.length,
          })),
        },
      ],
    }));
    // sort candidates by votes
    const sorted = candidates.sort((a, b) => {
      const aVotes = grouped[a.id]?.votes?.length ?? 0;
      const bVotes = grouped[b.id]?.votes?.length ?? 0;
      return bVotes - aVotes;
    });
    setSortedCandidates(sorted);
  }, [votes, candidates]);

  return (
    <div className="flex flex-col gap-y-2">
      <h1 className=" uppercase text-lg font-bold">{position.name}</h1>
      <div className="grid xl:grid-cols-3 sm:grid-cols-2 w-full gap-3">
        {sortedCandidates?.map((candidate, i) => {
          const candidateVotes = groupedVotes[candidate.id];
          return (
            <CandidateCard
              key={candidate.id}
              votes={candidateVotes}
              position={position}
              isHighlighted={i === 0}
              candidate={candidate}
              canRelease={canRelease}
            />
          );
        })}
        {!loadCandidates && candidates?.length === 0 && <h1>No Candidates on this Post</h1>}
        {(loadCandidates || loadVotes) &&
          new Array(3).fill(0).map((_, i) => <Skeleton key={i} h={100} w={'100%'} />)}
      </div>
      <div className="">
        <Button onClick={() => setShowGraph(!showGraph)} className="w-fit " variant="transparent">
          {showGraph ? 'Hide' : 'Show'} Graph
        </Button>
      </div>
      {/* {showGraph && candidates && <VotingGraph votes={groupedVotes} candidates={candidates} />} */}
      <Collapse in={showGraph}>
        {candidates && <VotingGraph votes={groupedVotes} candidates={candidates} />}
      </Collapse>
    </div>
  );
};

export default PositionCard;
