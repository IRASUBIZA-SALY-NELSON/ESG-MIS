import InputWrapper from '@/components/core/Input/InputWrapper';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useEffect, useState } from 'react';
import { BiCheck } from 'react-icons/bi';

interface Props {
  onClose: () => void;
  data: Teacher;
  refetch: () => void;
}

const AssignTeacherClass: FC<Props> = ({ onClose, data: toUpdate, refetch }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>({});
  const [classId, setClassId] = useState<any>(toUpdate?.currentClazz?.id ?? '');
  const { data: currentClazz, loading: loadingClass } = useGet<{ mentorClass: IClass }>(
    `/teachers/class/mentor/${toUpdate?.id}`,
  );

  const handleAssignClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.put(
        `/teachers/assign/class?teacherId=${toUpdate?.id}&classId=${classId}`,
        {
          teacherId: toUpdate?.id,
          classId,
        },
      );

      notifications.show({
        title: 'Class Assigned',
        message: 'Class have been assigned successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Assign Class',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentClazz?.mentorClass) {
      setClassId(currentClazz?.mentorClass?.id);
    }
  }, [currentClazz]);

  return (
    <form className=" w-full flex flex-col gap-y-3 p-12" onSubmit={handleAssignClass}>
      {/* <h1 className=" text-xs text-center">Loading...</h1>} */}
      <InputWrapper label="Class" description="">
        {
          <AsyncSelect
            datasrc="/classes/all/current-year"
            placeholder="Select Class"
            labelKey="className"
            value={classId}
            disabled={loading || loadingClass}
            onChange={(e) => {
              setClassId(e);
            }}
          />
        }
      </InputWrapper>
      <Button
        disabled={loading || loadingClass}
        variant="filled"
        className=" mt-4"
        w={60}
        loading={loading || loadingClass}
        mx={'auto'}
        type="submit"
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default AssignTeacherClass;
