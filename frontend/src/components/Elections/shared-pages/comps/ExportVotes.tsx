import React from 'react';
import { GroupedVotes } from './utils';

interface Props {
  onClose: () => void;
  data: any[] | null;
}

const ExportVotes = ({ onClose, data }: Props) => {
  return (
    <div className="flex flex-col w-full gap-y-4 p-4">
      <span>Hints: </span>
      <ul className=" list-disc">
        <li className=" gap-3">
          <strong className=" font-bold">Export All Candidates </strong>
        </li>
      </ul>
    </div>
  );
};

export default ExportVotes;
