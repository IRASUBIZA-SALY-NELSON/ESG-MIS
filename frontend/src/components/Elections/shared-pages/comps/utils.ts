import { ICandidate, IVote } from '@/types/other.type';

export interface GroupedVotes {
  [key: string]: {
    votes: IVote[];
    percentage: number;
  };
}

export const groupVotesByCandidates = (votes: IVote[], candidates: ICandidate[]) => {
  const groupedVotes: any = {};

  candidates.forEach((candidate) => {
    groupedVotes[candidate.id] = votes.filter((vote) => vote.candidate.id === candidate.id);
  });

  const sortedGroupedVotes: any = {};
  Object.keys(groupedVotes).forEach((key) => {
    sortedGroupedVotes[key] = groupedVotes[key].sort((a: IVote, b: IVote) => {
      return a?.voter?.firstName?.localeCompare(b?.voter?.firstName);
    });
  });

  //   return sortedGroupedVotes;
  // add percentages
  const groupedVotesFinal: GroupedVotes = {};
  Object.keys(sortedGroupedVotes).forEach((key) => {
    groupedVotesFinal[key] = {
      votes: sortedGroupedVotes[key],
      percentage: (sortedGroupedVotes[key].length / votes.length) * 100,
    };
  });

  return groupedVotesFinal;
};
