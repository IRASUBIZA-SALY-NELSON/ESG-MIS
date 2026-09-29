'use client';

import SessionVoters from '@/components/Elections/shared-pages/SessionVoters';
import useGet from '@/hooks/useGet';
import { ISession } from '@/types/other.type';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import { Fragment, useEffect, useState } from 'react';

const Page = () => {
  const navigate = useRouter();
  const [currentVotingSession, setCurrentVotingSession] = useState<ISession | null>(null);

  const submit = (e: any) => {
    e.preventDefault();
  };

  const { data, loading } = useGet<ISession[]>('/voting_sessions/all', {
    defaultData: [],
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const now = new Date().getTime();
      let closestSession: ISession | null = null;
      let smallestTimeDiff = Infinity;

      data.forEach((session) => {
        const endDate = new Date(session.endDate).getTime();
        const timeDiff = Math.abs(endDate - now);

        if (timeDiff < smallestTimeDiff) {
          smallestTimeDiff = timeDiff;
          closestSession = session;
        }
      });

      setCurrentVotingSession(closestSession);
    }
  }, [data]);

  return (
    <div onSubmit={submit} className="w-full flex flex-col md:px-20 px-4 mb-6">
      <button
        type="button"
        onClick={() => navigate.push('/')}
        className="py-2 w-fit px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase"
      >
        Back to Portal
      </button>

      <div className="w-full flex flex-col items-center gap-3">
        <h4 className="uppercase text-4xl font-bold mt-3">ESG COMMITTEE ELECTIONS</h4>
        {loading ? (
          <h5 className="text-base font-semibold">Loading . . .</h5>
        ) : currentVotingSession ? (
          <h5 className="text-xl font-semibold">Welcome to the {currentVotingSession.title}</h5>
        ) : (
          <h5 className="text-xl font-semibold text-red-500">No active voting session found.</h5>
        )}
      </div>

      {loading ? (
        <div className="w-full flex justify-center mt-8">
          <ClipLoader size={30} />
        </div>
      ) : (
        <div>
          {currentVotingSession?.resultStatus === 'RELEASED' ? (
            <Fragment>
              <h5 className="text-3xl font-bold mt-10 uppercase">RESULTS</h5>
              <SessionVoters sessionId={currentVotingSession.id} styles="mt-6" />
            </Fragment>
          ) : (
            <div className="w-full flex justify-center mt-10">
              <button className="px-5 py-2 bg-[#0A6B4F] text-sm text-center text-white rounded-md">
                Wait for results to be released.
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
