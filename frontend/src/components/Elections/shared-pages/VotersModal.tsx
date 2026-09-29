import MainModal from '@/components/core/modals/modal';
import { IVote } from '@/types/other.type';
import Image from 'next/image';
import React from 'react';
import voteImg from '@/assets/vote.png';

interface Props {
  onClose: () => void;
  votes: IVote[] | null | undefined;
  open: boolean;
  title?: string;
  description?: string;
}

const VotersModal = ({ onClose, votes, open, title, description }: Props) => {
  return (
    <MainModal size={'xl'} tittleP="0" onClose={onClose} isOpen={open} title={title}>
      <div className="flex flex-col w-full gap-y-2">
        <span className=" text-sm opacity-80">{description}</span>
        <h1 className=" font-semibold">TOTAL Votes: {votes?.length}</h1>
        {votes?.map((vote) => (
          <div key={vote.id} className="flex items-start gap-4 w-full">
            <Image src={voteImg} alt="" className="rounded-full" />
            <div className={`text-black w-full h-full flex flex-col items-start`}>
              <h4 className="font-bold text-sm">
                Name:{' '}
                <span className="font-medium">
                  {vote.voter?.firstName ?? ''} {vote.voter?.lastName ?? ''}
                </span>
              </h4>
              <h4 className="font-bold text-sm">
                Class:{' '}
                <span className="font-medium">{vote?.voter?.currentClass?.className ?? 'N/A'}</span>
              </h4>
            </div>
          </div>
        ))}
      </div>
    </MainModal>
  );
};

export default VotersModal;
