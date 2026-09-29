import InputWrapper from '@/components/core/Input/InputWrapper';
import AsyncMultiSelect from '@/components/core/selects/AsyncMultiSelect';
import useGet from '@/hooks/useGet';
import { IPosition, ISession } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useEffect, useState } from 'react';
import { BiCheck } from 'react-icons/bi';

interface Props {
  onClose: () => void;
  data: ISession | null;
  refetch: () => void;
}

const AssignSessionPositions: FC<Props> = ({ onClose, data: toUpdate, refetch }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>({
    positionsIds: [],
    voteSessionId: toUpdate?.id,
  });
  const { data: assignedPositions, loading: loadingPositions } = useGet<IPosition[]>(
    `positions/all/by-session/${toUpdate?.id}`,
  );

  const handleAssignPosition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.patch('/voting_sessions/assign_positions', data);

      notifications.show({
        title: 'Positions Assigned',
        message: 'Positions have been assigned successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Assign Positions',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignedPositions) {
      setData({ ...data, positionsIds: assignedPositions.map((p) => p.id) });
    }
  }, [assignedPositions]);

  return (
    <form className=" w-full flex flex-col gap-y-3 p-12" onSubmit={handleAssignPosition}>
      <InputWrapper label="Positions" description="Select Positions">
        <AsyncMultiSelect
          datasrc="/positions/all"
          placeholder="Select Positions"
          value={data.positionsIds}
          onChange={(e) => {
            setData({ ...data, positionsIds: e });
          }}
        />
      </InputWrapper>
      <Button
        disabled={loading}
        variant="filled"
        className=" mt-4"
        w={60}
        loading={loading}
        mx={'auto'}
        type="submit"
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default AssignSessionPositions;
