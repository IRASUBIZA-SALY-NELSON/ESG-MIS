'use client';
import { ISession } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import React, { FC } from 'react';
import { BiCheck } from 'react-icons/bi';
import CustomInput from '../core/input';
import { DateTimePicker } from '@mantine/dates';
import InputWrapper from '../core/Input/InputWrapper';

interface Props {
  refetch: () => void;
  onClose: () => void;
  isEdit?: boolean;
  data?: ISession | null;
}

const NewUpdateSession: FC<Props> = ({ refetch, onClose, isEdit, data: toUpdate }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({
    endDate: null,
    startDate: null,
    title: '',
  });
  const [data, setData] = React.useState({
    endDate: toUpdate?.endDate ?? new Date().toISOString(),
    startDate: toUpdate?.startDate ?? new Date().toISOString(),
    title: toUpdate?.title ?? '',
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.post('/voting_sessions/create', {
        ...data,
        startDate: dayjs(data.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(data.endDate).format('YYYY-MM-DD'),
      });

      notifications.show({
        title: 'Session Created',
        message: 'Session has been created successfully',
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
      const res = await AuthApi.put(`/voting_sessions/update/${toUpdate?.id}`, {
        ...data,
        startDate: dayjs(data.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(data.endDate).format('YYYY-MM-DD'),
      });

      notifications.show({
        title: 'Session Updated',
        message: 'Session has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Update Session',
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
      <CustomInput
        type="text"
        label="Title"
        value={data.title}
        placeholder="Enter Session Title"
        onChange={(e) => setData({ ...data, title: e.currentTarget.value })}
        error={error.title}
        // handleError={(e) => setError({ ...error, title: e })}
      />
      <InputWrapper label="Start Date" description="">
        <DateTimePicker
          value={new Date((data.startDate as any) ?? null)}
          onChange={(e) => {
            if (!e) return;
            setData({ ...data, startDate: e?.toString() });
          }}
          placeholder="Select Date & Time"
          px={8}
          variant="unstyled"
          error={error.startDate}
          clearable
        />
      </InputWrapper>
      <InputWrapper label="End Date" description="">
        <DateTimePicker
          value={new Date((data.endDate as any) ?? null)}
          minDate={new Date(data.startDate)}
          onChange={(e) => {
            if (!e) return;
            setData({ ...data, endDate: e?.toString() });
          }}
          placeholder="Select Date & Time"
          px={8}
          variant="unstyled"
          error={error.endDate}
          clearable
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

export default NewUpdateSession;
