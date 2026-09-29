import InputWrapper from '@/components/core/Input/InputWrapper';
import CustomInput from '@/components/core/input';
import AsyncMultiSelect from '@/components/core/selects/AsyncMultiSelect';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { TagsInput, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiCheck } from 'react-icons/bi';
import AsyncSelect from '../core/selects/AsyncSelect';
import { Student } from '@/types/student.types';

interface Props {
  onClose: () => void;
  data: Student | null;
  refetch: () => void;
}

const AssignStudentRole: FC<Props> = ({ onClose, data: toUpdate, refetch }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>({
    studentId: toUpdate?.id ?? '',
    classId: toUpdate?.currentClazz?.id ?? '',
  });

  const handleAssignClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data.classId) return;
    setLoading(true);
    try {
      const res = await AuthApi.put('/students/assign/role', data, {
        params: data,
      });

      notifications.show({
        title: 'Role Assigned',
        message: 'Roles have been assigned successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Assign Roles',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className=" w-full flex flex-col gap-y-3" onSubmit={handleAssignClass}>
      <h1 className=" text-center mt-4 font-semibold text-sm">
        Assign Roles to {toUpdate?.firstName} {toUpdate?.lastName}
      </h1>
      <InputWrapper className=" mt-2" label="Role" description="">
        <AsyncSelect
          datasrc="/classes/all/current-year"
          placeholder="Select Role"
          labelKey="className"
          value={data.classId}
          disabled={loading}
          onChange={(e) => {
            setData({ ...data, classId: e });
          }}
        />
      </InputWrapper>
      <Button
        disabled={loading}
        variant="filled"
        className=" mt-4"
        loading={loading}
        w={60}
        mx={'auto'}
        type="submit"
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default AssignStudentRole;
