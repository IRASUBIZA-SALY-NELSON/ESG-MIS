'use client';
import { getFile } from '@/utils/constants';
import Image, { StaticImageData } from 'next/image';
import { Dispatch, MouseEventHandler, useState } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
import vote from '@/assets/vote.png';
interface VoteCardProps {
  candidateData: {
    id: string;
    position: {
      id: string;
      name: string;
    }[];
    student: {
      firstName: string;
      lastName: string;
      profilePicture: string;
      currentClazz: {
        className: string;
      };
    };
  };
  selected: any;
  setSelected: Dispatch<any>;
  position: string;
}

const VoteCard = ({ candidateData, position, selected, setSelected }: VoteCardProps) => {
  return (
    <div
      onClick={() => {
        setSelected(candidateData);
      }}
      className={`w-full h-full flex items-center justify-center gap-4 ${
        selected?.id === candidateData.id ? 'bg-[#0A6B4F]' : 'bg-[#EEF7F2]'
      } border border-[#0A6B4F] rounded-lg relative px-3 pb-3 cursor-pointer pt-5`}
    >
      {candidateData.student?.profilePicture ? (
        <Image
          src={getFile(candidateData.student?.profilePicture) as string}
          alt="Profile"
          width={35}
          className="rounded-full object-center"
          height={35}
        />
      ) : (
        <Image src={vote} className="rounded-full" alt="" />
      )}
      <div
        className={`${
          selected?.id === candidateData.id ? 'text-white' : 'text-black'
        } flex flex-col items-start`}
      >
        <h4 className="font-bold text-sm">
          Name:{' '}
          <span className="font-medium">
            {candidateData.student.firstName + ' ' + candidateData.student.lastName}
          </span>
        </h4>
        <h4 className="font-bold text-sm">
          Class:{' '}
          <span className="font-medium">
            {candidateData.student.currentClazz
              ? candidateData.student.currentClazz?.className
              : '-'}
          </span>{' '}
        </h4>
        <h4 className="font-bold text-sm">
          Proposed Position: <span className="font-medium">{position}</span>{' '}
        </h4>
      </div>

      <span className="absolute top-2 right-2">
        <FaCircleCheck
          size={20}
          color={`${selected?.id === candidateData.id ? '#FFF' : '#0A6B4F'}`}
        />
      </span>
    </div>
  );
};
export default VoteCard;
