'use client';

import { useRouter } from 'next/navigation';
import VoteCard from '@/components/core/VoteCards/VoteCard';
import { useEffect, useState } from 'react';
import {
  getAllCandidates,
  getAllPositions,
  getAllVotingSessions,
  getCandidatePostions,
} from '@/utils/funcs';
import { ClipLoader } from 'react-spinners';
import OnePosition from '@/components/core/VoteCards/OnePosition';
import { Modal } from '@mantine/core';
import VoteModal from '@/components/Elections/VoteModal';
import Link from 'next/link';
import MainModal from '@/components/core/modals/modal';

const Page = () => {
  const navigate = useRouter();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [votingSession, setVotingSession] = useState<any>();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Check if user has already voted
    const votedStatus = localStorage.getItem('vttd');
    if (votedStatus === '1') {
      setHasVoted(true);
    }

    const fetchData = async () => {
      try {
        const positionsData = await getAllPositions();
        setPositions(positionsData);

        const votingSessions = await getAllVotingSessions();
        setVotingSession(votingSessions[votingSessions.length - 1]);

        const candidatesData = await getAllCandidates();
        const candidatesWithPositions = await Promise.all(
          candidatesData.map(async (candidate: any) => {
            const position = await getCandidatePostions(candidate.id);
            return { ...candidate, position };
          }),
        );

        setCandidates(candidatesWithPositions);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const [voteModal, setVoteModal] = useState(false);
  const isReleased = votingSession?.resultStatus === 'RELEASED';

  return (
    <div className="w-full flex flex-col md:px-20 px-4 mb-6">
      <MainModal
        isOpen={voteModal}
        onClose={() => setVoteModal(false)}
        closeOnClickOutside
        size="md"
      >
        <VoteModal close={() => setVoteModal(false)} votes={votes} />
      </MainModal>

      <button
        type="button"
        onClick={() => navigate.push('/')}
        className="py-2 w-fit px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase"
      >
        Back to Portal
      </button>
      <div className="flex flex-col items-center justify-center w-full">
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <ClipLoader size={20} />
          </div>
        ) : hasVoted ? (
          <div className="text-center mt-10">
            <h3 className="text-3xl font-bold text-green-600">
              ✅ You have already voted successfully!
            </h3>
            <button className="w-auto mt-4 px-5 py-2 bg-[#0A6B4F] text-sm text-center text-white rounded-md">
              Wait for results to be released.
            </button>
          </div>
        ) : isReleased ? (
          <Link
            href={'/elections/results'}
            className="py-2 px-5 text-xs mt-8 text-white font-bold rounded-lg bg-[#0A6B4F] uppercase"
          >
            View Results
          </Link>
        ) : (
          <>
            <p className="text-3xl font-bold mt-4">{votingSession ? votingSession.title : '-'}</p>
            <div className="flex flex-col items-center justify-center pt-10 text-center mb-4">
              <h5 className="text-3xl font-bold mb-4">🗳️ Welcome to the Elections! 🎉</h5>
              <p className="text-lg font-semibold mb-6">Get ready to make your voice heard!</p>
              <ul className="list-none text-sm text-gray-700">
                <li className="text-lg mb-2">
                  🔍 Familiarize yourself with the positions and candidates.
                </li>
                <li className="text-lg mb-2">
                  🤔 Ask election officials if you have any questions about the process.
                </li>
                <li className="text-lg mb-2">🔍 Double-check your choices before submitting.</li>
                <li className="text-lg mb-2">
                  🚪 Maintain privacy in the voting booth. (virtual 😂)
                </li>
                <li className="text-lg mb-2">🙋‍♂️ Ask for assistance if needed.</li>
                <li className="text-lg mb-2">⌛ Be patient and follow election rules.</li>
              </ul>
              <p className="text-lg mt-6">Now, go ahead and cast your vote! 🎈</p>
            </div>
            <div className="w-full">
              {positions?.map(
                (position, i) =>
                  candidates.filter((candidate: any) =>
                    candidate.position.some(
                      (candidatePosition: any) => candidatePosition.name === position.name,
                    ),
                  ).length > 0 && (
                    <OnePosition
                      key={i}
                      position={position}
                      candidates={candidates}
                      setVotes={setVotes}
                      votingSession={votingSession}
                    />
                  ),
              )}
            </div>
            {!submitLoading ? (
              <button
                type="submit"
                onClick={() => setVoteModal(true)}
                className="w-[10rem] py-3 text-xs mt-8 mb-2 text-white self-center font-bold rounded-lg bg-[#0A6B4F] uppercase"
              >
                Submit
              </button>
            ) : (
              <div className="w-[10rem] flex items-center justify-center py-3 text-xs mt-8 mb-2 text-white self-center font-bold rounded-lg bg-[#0A6B4F] uppercase">
                <ClipLoader color="white" size={15} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
