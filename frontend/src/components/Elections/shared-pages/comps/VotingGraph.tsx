import React, { useEffect } from 'react';
import { GroupedVotes } from './utils';
import { DonutChart } from '@tremor/react';
import { ICandidate } from '@/types/other.type';

interface Props {
  votes: GroupedVotes;
  candidates: ICandidate[];
}

const VotingGraph = ({ votes, candidates }: Props) => {
  const [data, setData] = React.useState<any[]>([]);

  const customTooltip = ({ payload, active }: any) => {
    if (!active || !payload) return null;
    const categoryPayload = payload?.[0];
    if (!categoryPayload) return null;

    return (
      <div className="w-56 rounded-tremor-default text-tremor-default bg-tremor-background p-2 shadow-tremor-dropdown border border-tremor-border">
        <div className="flex flex-1 space-x-2.5">
          <div className={`w-1.5 flex flex-col bg-${categoryPayload?.color} rounded`} />
          <div className="w-full">
            <div className="flex items-center justify-between space-x-8">
              <p className=" text-tremor-content text-left">{categoryPayload.name}</p>
              <p className="font-medium text-right whitespace-nowrap text-tremor-content-emphasis">
                {categoryPayload.value} ({categoryPayload.payload.percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // if length > 6, make colors adding -100, -200, -300, -400, -500 to each color which is the tail of the color name but for the first 6 use the color name
  const makeColors = (length: number) => {
    const colors = ['blue', 'indigo', 'rose', 'green', 'yellow', 'red', 'gray'];
    const newColors = [];
    for (let i = 0; i < length; i++) {
      if (i < 6) {
        newColors.push(colors[i]);
      } else {
        newColors.push(`${colors[i % 6]}-${(i % 6) * 100}`);
      }
    }
    return newColors;
  };

  const colors = ['blue', 'indigo', 'rose', 'green', 'yellow', 'red', 'gray'];
  useEffect(() => {
    const data = candidates.map((candidate, i) => {
      const vote = votes[candidate.id];
      return {
        name: `${candidate.student.firstName} ${candidate.student.lastName}`,
        votes: vote?.votes?.length,
        percentage: vote?.percentage,
        color: colors[i] ?? 'gray',
      };
    });
    setData(data.sort((a, b) => b.votes - a.votes));
  }, [votes, candidates]);
  return (
    <div className="flex items-start md:gap-11">
      <DonutChart
        className="mt-6 aspect-square h-[300px] w-[300px]"
        data={data}
        category="votes"
        index="name"
        colors={colors}
        customTooltip={customTooltip}
        showLabel
        showAnimation
        // variant="pie"
      />
      <div className="flex flex-col gap-y-2 mt-11 ml-11">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-x-2">
            <div
              className={`w-2 h-2 rounded-full bg-${d.color}-500`}
              style={{ backgroundColor: d.color }}
            />
            <p className="text-tremor-content">{d.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingGraph;
