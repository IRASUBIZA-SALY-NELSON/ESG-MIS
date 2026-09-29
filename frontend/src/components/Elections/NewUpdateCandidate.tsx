'use client';
import { ICandidate } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import React, { FC } from 'react';
import { BiCheck } from 'react-icons/bi';
import CustomInput from '../core/input';
import InputWrapper from '../core/Input/InputWrapper';
import AsyncSelect from '../core/selects/AsyncSelect';
import { getClassFromYears } from '@/utils/funcs/func2';

interface Props {
  refetch: () => void;
  onClose: () => void;
  isEdit?: boolean;
  data?: ICandidate | null;
}

const NewUpdateCandidate: FC<Props> = ({ refetch, onClose, isEdit, data: toUpdate }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({
    studentId: '',
  });
  const [data, setData] = React.useState({
    studentId: toUpdate?.id ?? '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.post('/candidates/create', data);

      notifications.show({
        title: 'Candidate Created',
        message: 'Candidate has been created successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      setError(resErr);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.put(`/candidates/update/${toUpdate?.id}`, data);

      notifications.show({
        title: 'Candidate Updated',
        message: 'Candidate has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Update Candidate',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={isEdit ? handleUpdate : handleSubmit}
      className=" w-full flex p-5 flex-col gap-y-3"
    >
      {/* TODO: select student in academic year */}
      <InputWrapper label="Student" description="Select Student">
        <AsyncSelect
          datasrc="/students/all"
          placeholder="Select Student"
          getLabel={(data) =>
            `${data?.firstName} ${data?.lastName} - ${data?.currentClazz?.className ?? 'N/A'}`
          }
          onChange={(e) => {
            setData((prev) => ({
              ...prev,
              studentId: e,
            }));
          }}
          value={data.studentId}
        />
      </InputWrapper>
      <Button
        disabled={loading}
        type="submit"
        variant="filled"
        loading={loading}
        className=" mt-4"
        w={60}
        mx={'auto'}
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default NewUpdateCandidate;
