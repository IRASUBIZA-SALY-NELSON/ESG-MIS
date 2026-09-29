'use client';
import { ITerm } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { enumToCamelCase } from '@/utils/funcs/func1';
import { Button, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import React, { FC } from 'react';
import { BiCheck } from 'react-icons/bi';
import InputWrapper from '../core/Input/InputWrapper';
import CustomInput from '../core/input';

interface Props {
  refetch: () => void;
  onClose: () => void;
  isEdit?: boolean;
  data?: ITerm | null;
}

const NewUpdateTerm: FC<Props> = ({ refetch, onClose, isEdit, data: toUpdate }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({
    academicYear: '',
    name: '',
    startDate: '',
    endDate: '',
  });
  const [data, setData] = React.useState({
    academicYear: toUpdate?.academicYearId ?? '',
    name: toUpdate?.name ?? '',
    startDate: toUpdate?.startDate ?? '',
    endDate: toUpdate?.endDate ?? '',
  });
  const currentAcademicYear = toUpdate?.academicYearId ?? '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.post('/terms/create', {
        ...data,
        startDate: dayjs(data.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(data.endDate).format('YYYY-MM-DD'),
      });

      notifications.show({
        title: 'Term Created',
        message: 'Term has been created successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error: any) {
      const resErr = getResError(error);
      notifications.show({
        title: 'Failed to create term',
        message: error.message || resErr,
        color: 'red',
      });
      setError(resErr);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.put(`/terms/update/${toUpdate?.id}`, {
        ...data,
        startDate: dayjs(data.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(data.endDate).format('YYYY-MM-DD'),
      });
      // const hasAcademicYearChanged = currentAcademicYear !== data.academicYear;
      // if (hasAcademicYearChanged) {
      //   await AuthApi.put(`/terms/update/academic-year/${toUpdate?.id}`, {
      //     academic_year_id: data.academicYear,
      //   });
      // }

      notifications.show({
        title: 'Term Updated',
        message: 'Term has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Update Term',
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
      {/* <CustomInput
        type={'text'}
        label="Name"
        placeholder="Enter Term Name"
        onChange={(e) => {
          setData({ ...data, name: e.target.value });
        }}
        error={error.name}
        required
        value={data.name}
        name="name"
      /> */}
      <InputWrapper label="Name">
        <Select
          data={['FIRST_TERM', 'SECOND_TERM', 'THIRD_TERM'].map((item) => ({
            value: item,
            label: enumToCamelCase(item),
          }))}
          value={data.name}
          onChange={(e) => {
            setData({ ...data, name: e as string });
          }}
          error={error.name}
          required
          variant="unstyled"
          px={8}
          placeholder="Select Term Name"
          className="w-full"
        />
      </InputWrapper>
      <CustomInput
        type={'select'}
        label="Academic Year"
        placeholder="Select Academic Year"
        onChange={(e) => {
          setData({ ...data, academicYear: e as string });
        }}
        error={error.academicYear}
        required
        datasrc="/academic-years/all"
        value={data.academicYear}
        name="academicYear"
      />
      <CustomInput
        // description="Term Start Date"
        label="Start Date"
        type="date"
        placeholder="Enter Term Start Date"
        error={error.startDate}
        value={data.startDate as any}
        onChange={(e) => {
          setData({ ...data, startDate: e as Date });
        }}
        name="startDate"
        required
      />
      <CustomInput
        label="End Date"
        type="date"
        placeholder="Enter Term End Date"
        error={error.endDate}
        value={data.endDate as any}
        onChange={(e) => {
          setData({ ...data, endDate: e as Date });
        }}
        name="endDate"
        required
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

export default NewUpdateTerm;
