import vote from '@/assets/vote.png';
import { EyeIcon } from '@/components/core/icons/icons1';
import { ICandidate, IPosition } from '@/types/other.type';
import { ActionIcon } from '@mantine/core';
import Image from 'next/image';
import React from 'react';
import VotersModal from '../VotersModal';
import { GroupedVotes } from './utils';

const CandidateCard = ({
  position,
  candidate,
  votes,
  isHighlighted,
  canRelease,
}: {
  position: IPosition;
  candidate: ICandidate;
  votes: GroupedVotes[''] | null;
  isHighlighted?: boolean;
  canRelease?: boolean;
}) => {
  const voteByCandidate = votes?.votes;
  const [showVotes, setShowVotes] = React.useState(false);

  return (
    <>
      <div
        className={`w-full  flex items-center justify-center gap-4
        ${isHighlighted ? ' bg-mainPurple/10 text-white' : ' bg-[#EEF7F2]'}
       border border-[#3f485e] rounded-lg h-full min-h-[11vh] relative px-3 pb-3 cursor-pointer pt-5`}
        onClick={() => {
          if (!canRelease) return;
          setShowVotes(true);
        }}
      >
        <Image src={vote} alt="" className="rounded-full" />
        <div className={`text-black w-full h-full flex flex-col items-start`}>
          <h4 className="font-bold text-sm">
            Name:{' '}
            <span className="font-medium">
              {candidate?.student?.firstName} {candidate?.student?.lastName}
            </span>
          </h4>
          <h4 className="font-bold text-sm">
            Class:{' '}
            <span className="font-medium">{candidate?.student?.currentClazz?.className}</span>
          </h4>
          <h4 className="font-bold text-sm">
            Votes: <span className="font-medium">{voteByCandidate?.length}</span>
          </h4>
          <h4 className="font-bold text-sm">
            Percentage:{' '}
            <span className="font-medium">
              {Number.isNaN(votes?.percentage) ? 0 : votes?.percentage.toFixed(1)} %
            </span>
          </h4>
        </div>
        {canRelease && (
          <ActionIcon variant="transparent" onClick={() => setShowVotes(true)}>
            <EyeIcon />
          </ActionIcon>
        )}
      </div>
      <VotersModal
        open={showVotes}
        votes={voteByCandidate}
        onClose={() => setShowVotes(false)}
        title={`${candidate?.student?.firstName} ${candidate?.student?.lastName} Votes`}
        description={`Those who voted for ${candidate?.student?.firstName} ${candidate?.student?.lastName} on ${position?.name} position`}
      />
    </>
  );
};

export default CandidateCard;
