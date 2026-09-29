'use client';

import Image from 'next/image';
import rcaLogo from '@/assets/rca2.png';
import VotePoster from '@/components/core/VoteCards/PosterCard';
import { useRouter } from 'next/navigation';
// import { candidates } from './config';

import { useEffect, useState } from 'react';
import { getAllCandidates, getAllVotingSessions, getCandidatePostions } from '@/utils/funcs';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { ISession } from '@/types/other.type';
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Elections = () => {
  const date = new Date();
  const navigate = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [votingSession, setVotingSession] = useState<any>();
  const [loading, setLoading] = useState(true);
  const getCandidatePosition = async (candidateId: string) => {
    const position = await getCandidatePostions(candidateId);
    return position;
  };
  if (!localStorage.getItem('vttd')) {
    localStorage.setItem('vttd', '0');
  }
  useEffect(() => {
    const fetch = async () => {
      const votingSessions = await getAllVotingSessions();

      setVotingSession(votingSessions[votingSessions.length - 1]);
      const candidatesData = await getAllCandidates();

      const candidatesWithPositions = await Promise.all(
        candidatesData.map(async (candidate: any) => {
          const position = await getCandidatePosition(candidate.id);
          return { ...candidate, position };
        }),
      );

      setCandidates(candidatesWithPositions);
      setLoading(false);
    };
    fetch();
  }, []);

  const convertTimestampToTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString('en-US', { timeZone: 'UTC' });

  // const votingStarted = new Date(votingSession?.startDate).getTime() < Date.now();

  //   'new Date(votingSession?.startDate).getTime()',
  //   new Date(votingSession?.startDate).getTime(),
  // );
  const isReleased = votingSession?.resultStatus === 'RELEASED';
  return (
    <div className="w-full  pt-[13vh] flex flex-col justify-center items-center pb-5 overflow-hidden relative">
      <button
        type="button"
        onClick={() => navigate.push('/')}
        className="absolute w-fit left-5 top-0  py-2 px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase"
      >
        Back to Portal
      </button>
      {loading ? (
        <div className="flex items-center h-[500px] justify-center">
          <ClipLoader size={20} />
        </div>
      ) : (
        <>
          <div className="w-full flex flex-col items-center">
            <Image src={rcaLogo} alt="ESG Logo" width={130} height={100} className="" />
            <h5 className="text-2xl uppercase font-extrabold mt-3 text-center px-4">
              {votingSession ? votingSession.title : '-'}
            </h5>
            <h5 className="text-[90%] font-bold mt-6 ">
              From {convertTimestampToTime(votingSession?.startDate)} - To{' '}
              {convertTimestampToTime(votingSession?.endDate)}
              {/* {dayNames[date.getDay() - 1]} {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}{' '}
              16:00-17:30 */}
            </h5>

            {localStorage.getItem('vttd') == '0' ? (
              <Link
                href={'/elections/vote'}
                className="py-2 px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase"
              >
                Vote Now
              </Link>
            ) : isReleased ? (
              <Link
                href={'/elections/results'}
                className="py-2 px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase"
              >
                View Results
              </Link>
            ) : (
              <button className="py-2 px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase cursor-not-allowed">
                Wait For Results
              </button>
            )}
          </div>

          <div className="w-full  candidates-slide flex  gap-5  px-5 mt-5">
            {candidates.map((candidate, i) => {
              return <VotePoster key={i} candidateData={candidate} />;
            })}
          </div>
          <div className="w-full candidates-slide2  flex  gap-5  px-5 mt-5">
            {candidates.map((candidate, i) => {
              return <VotePoster key={i} candidateData={candidate} />;
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Elections;
