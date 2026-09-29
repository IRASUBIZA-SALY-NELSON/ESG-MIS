import { getFile } from '@/utils/constants';
import Image, { StaticImageData } from 'next/image';
import { MouseEventHandler } from 'react';
import { AccountBtn } from '../icons';
import vote from '@/assets/vote.png';
interface VoteCard {
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
}

const VotePoster = ({ candidateData }: VoteCard) => {
  return candidateData.position.map((pos, i) => {
    return (
      <div
        key={i}
        className={`min-w-[400px] h-full flex items-center gap-4  bg-[#EEF7F2]'
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
        <div className="text-black  flex flex-col items-start">
          <h4 className="font-bold text-[60%]">
            Name:{' '}
            <span className="font-medium">
              {candidateData.student.firstName + ' ' + candidateData.student.lastName}
            </span>
          </h4>
          <h4 className="font-bold text-[60%]">
            Class:{' '}
            <span className="font-medium">
              {candidateData.student.currentClazz
                ? candidateData.student.currentClazz?.className
                : '-'}
            </span>{' '}
          </h4>
          <h4 className="font-bold text-[60%]">
            Proposed Position: <span className="font-medium">{pos.name}</span>{' '}
          </h4>
        </div>
      </div>
    );
  });
};
export default VotePoster;
