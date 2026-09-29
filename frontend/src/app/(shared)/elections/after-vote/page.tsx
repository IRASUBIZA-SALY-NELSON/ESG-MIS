'use client';
import { getAllVotingSessions } from '@/utils/funcs';
import Link from 'next/link';
import rcaLogo from '@/assets/rca2.png';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';

const AfterVot = () => {
  const [loading, setLoading] = useState(true);
  const [votingSession, setVotingSession] = useState<any>();
  const navigate = useRouter();
  if (localStorage.getItem('vttd') !== '1') {
    navigate.push('/election');
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const votingSessions = await getAllVotingSessions();

        setVotingSession(votingSessions[0]);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  return loading ? (
    <div className="flex items-center justify-center h-[500px]">
      <ClipLoader size={20} />
    </div>
  ) : (
    <div className="w-full flex flex-col items-center justify-center md:px-20 px-4 mb-6 py-10">
      <Image src={rcaLogo} alt="ESG Logo" width={130} height={100} className="" />
      <div className="w-full flex flex-col items-center gap-3">
        <h4 className="uppercase text-4xl font-bold mt-3 px-4 text-center">
          {votingSession ? votingSession?.title : '-'}
        </h4>
        <h5 className="text-xl font-semibold text-center px-3">Thanks for Voting</h5>
        {/* <p className="text-xl font-semibold">From {convertTimestampToTime(votingSession?.startDate)}  - To  {convertTimestampToTime(votingSession?.endDate)}</p> */}
        <h5 className=" text-center px-3 mt-3">
          Thank you for casting your vote! Please stay tuned for the results, which will be
          announced shortly.
        </h5>
      </div>
      <Link
        href={'/student'}
        className=" py-2 px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase text-center"
      >
        Back to Portal
      </Link>
    </div>
  );
};

export default AfterVot;
