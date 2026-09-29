'use client';
import useGet from '@/hooks/useGet';
import { IPosition } from '@/types/other.type';
import { Button } from '@mantine/core';
import React from 'react';
import PositionCard from './comps/PostionCard';
import MainModal from '@/components/core/modals/modal';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { getResError } from '@/utils/fetch';
import { BiImport } from 'react-icons/bi';
import { GroupedVotes } from './comps/utils';
import ExportVotes from './comps/ExportVotes';

interface Props {
  sessionId: string;
  canRelease?: boolean;
  styles?: string;
}

const SessionVoters = ({ sessionId, canRelease, styles }: Props) => {
  const { data: positions, loading: loadPositions } = useGet<IPosition[]>(
    `/positions/all/by-session/${sessionId}`,
    {
      defaultData: [],
      swr: true,
    },
  );
  const [showRelease, setShowRelease] = React.useState(false);
  const [releaseLoading, setReleaseLoading] = React.useState(false);
  const [showExport, setShowExport] = React.useState({
    show: false,
    data: null as any[] | null,
  });

  const releaseVotes = async () => {
    setReleaseLoading(true);
    try {
      const res = await AuthApi.put(
        `/voting_sessions/release-or-hold-results?action=release&sessionId=${sessionId}`,
      );

      notifications.show({
        title: 'Results Released',
        message: 'Results have been Released successfully',
        color: 'green',
      });
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Assign Positions',
        message: resErr,
        color: 'red',
      });
    }
    setShowRelease(false);
  };

  return (
    <div className={`${styles} w-full flex-col gap-y-4 p-4 items-center`}>
      <h1 className=" text-center font-semibold text-lg">Votes By Position and And Candidates</h1>
      <h1 className=" text-center  text-mainPurple font-bold text-sm">
        Current leaders are highlighted
      </h1>
      <div className="flex flex-col mt-4 gap-y-3">
        {canRelease && (
          <Button className="w-fit ml-auto" onClick={() => setShowRelease(true)}>
            Release Votes
          </Button>
        )}
        {/* <div className="flex items-center justify-end w-full">
          <Button
            className="w-fit ml-auto"
            leftSection={<BiImport />}
            onClick={() => {
              setShowExport({ ...showExport, show: true });
            }}
          >
            Export Votes
          </Button>
        </div> */}
        {positions?.map((position) => (
          <PositionCard
            setShowExport={setShowExport}
            canRelease={canRelease!}
            key={position.id}
            position={position}
          />
        ))}
        {/* {loadPositions && new Array(3).fill(0).map((_, i) => <Skeleton key={i} h={} />)}  */}
      </div>
      {/* release */}
      <MainModal
        onClose={() => setShowRelease(false)}
        isOpen={showRelease}
        title="Release Votes"
        tittleP="0"
      >
        <div className="flex flex-col gap-y-2">
          <h1 className="font-semibold">Are you sure you want to release votes?</h1>
          <div className="flex gap-x-2 w-full justify-between">
            <Button variant="outline" onClick={() => setShowRelease(false)}>
              Cancel
            </Button>
            <Button loading={releaseLoading} disabled={releaseLoading} onClick={releaseVotes}>
              Release
            </Button>
          </div>
        </div>
      </MainModal>
      <MainModal
        onClose={() => setShowExport({ ...showExport, show: false })}
        isOpen={showExport.show}
        title="Export Votes"
        tittleP="0"
      >
        <ExportVotes
          onClose={() => setShowExport({ ...showExport, show: false })}
          data={showExport.data}
        />
      </MainModal>
    </div>
  );
};

export default SessionVoters;
