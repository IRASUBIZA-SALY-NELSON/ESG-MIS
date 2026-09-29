'use client';
import { IPosition } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import React, { FC } from 'react';
import { BiCheck } from 'react-icons/bi';
import CustomInput from '../core/input';

interface Props {
  refetch: () => void;
  onClose: () => void;
  isEdit?: boolean;
  data?: IPosition | null;
}

const NewUpdatePosition: FC<Props> = ({ refetch, onClose, isEdit, data: toUpdate }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({
    name: '',
  });
  const [data, setData] = React.useState({
    name: toUpdate?.name ?? '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.post(`/positions/create?name=${data.name}`, data);

      notifications.show({
        title: 'Position Created',
        message: 'Position has been created successfully',
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
      const res = await AuthApi.put(`/positions/update/${toUpdate?.id}`, data);
      // const hasAcademicYearChanged = currentAcademicYear !== data.academicYear;
      // if (hasAcademicYearChanged) {
      //   await AuthApi.put(`/positions/update/academic-year/${toUpdate?.id}`, {
      //     academic_year_id: data.academicYear,
      //   });
      // }

      notifications.show({
        title: 'Position Updated',
        message: 'Position has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Update Position',
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
        label="Name"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        type="text"
      />
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

export default NewUpdatePosition;
