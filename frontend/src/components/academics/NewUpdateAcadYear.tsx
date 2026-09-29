'use client';
import { IAcademicYear } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { YearPicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import React, { FC, useEffect, useState } from 'react';
import { BiCheck } from 'react-icons/bi';
import InputWrapper from '../core/Input/InputWrapper';
import CustomInput from '../core/input';

interface Props {
  refetch: () => void;
  onClose: () => void;
  isEdit?: boolean;
  data?: IAcademicYear | null;
}

const NewUpdateAcadYear: FC<Props> = ({ refetch, onClose, isEdit, data: toUpdate }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({
    name: '',
    startYear: '',
    endYear: '',
  });
  const [data, setData] = React.useState({
    name: toUpdate?.name ?? '',
    startYear: toUpdate?.startYear ?? '',
    endYear: toUpdate?.endYear ?? '',
  });
  const [range, setRange] = useState<[Date | null, Date | null]>([
    toUpdate?.startYear ? new Date(Number(toUpdate.startYear), 0) : null,
    toUpdate?.endYear ? new Date(Number(toUpdate.endYear), 0) : null,
  ]);

  const handleRangeChange = (value: [Date | null, Date | null] | null) => {
    if (value) {
      setRange(value);

      console.log(value);
      // Immediately update data when range changes
      const startYear = value[0] instanceof Date ? String(value[0].getFullYear()) : '';
      const endYear = value[1] instanceof Date ? String(value[1].getFullYear()) : '';

      setData((prevData) => ({
        ...prevData,
        startYear,
        endYear,
      }));
    } else {
      setRange([null, null]);
      setData((prevData) => ({
        ...prevData,
        startYear: '',
        endYear: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that years are selected
    if (!data.startYear || !data.endYear) {
      setError({
        name: '',
        startYear: !data.startYear ? 'Start year is required' : '',
        endYear: !data.endYear ? 'End year is required' : '',
      });
      notifications.show({
        title: 'Validation Error',
        message: 'Please select both start year and end year',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    setError({ name: '', startYear: '', endYear: '' });
    try {
      const res = await AuthApi.post('/academic-years/create', data);

      notifications.show({
        title: 'AcademicYear Created',
        message: 'AcademicYear has been created successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      notifications.show({
        title: 'Failed to Create AcademicYear',
        message: resErr,
        color: 'red',
      });
      setError(resErr);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that years are selected
    if (!data.startYear || !data.endYear) {
      setError({
        name: '',
        startYear: !data.startYear ? 'Start year is required' : '',
        endYear: !data.endYear ? 'End year is required' : '',
      });
      notifications.show({
        title: 'Validation Error',
        message: 'Please select both start year and end year',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    setError({ name: '', startYear: '', endYear: '' });
    try {
      const res = await AuthApi.patch(`/academic-years/update/${toUpdate?.id}`, data);

      notifications.show({
        title: 'AcademicYear Updated',
        message: 'AcademicYear has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Update AcademicYear',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // auto fill name 'startYear/endYear'
  useEffect(() => {
    if (data.startYear && data.endYear) {
      setData((prevData) => ({
        ...prevData,
        name: `${data.startYear}/${data.endYear}`,
      }));
    } else {
      setData((prevData) => ({
        ...prevData,
        name: '',
      }));
    }
  }, [data.startYear, data.endYear]);

  return (
    <form
      onSubmit={isEdit ? handleUpdate : handleSubmit}
      className=" w-full flex p-5 flex-col gap-y-3"
    >
      <CustomInput
        label="Name"
        type="text"
        disabled={true}
        placeholder="Select Year Range to get the name"
        description="Select Year Range to get the name"
        onChange={(e) => {
          setData({ ...data, name: e.target.value });
        }}
        error={error.name}
        required
        value={data.name}
        name="name"
      />
      <InputWrapper
        label="Select Year Range (Start, End)"
        description="Select Year Range (Start, End) of the AcademicYear"
        error={error.startYear}
      >
        <YearPicker value={range} type="range" onChange={handleRangeChange} />
      </InputWrapper>
      <div className="flex items-center gap-x-4 flex-row">
        <span>Start Year: {data.startYear} </span>
        <span>End Year: {data.endYear} </span>
      </div>
      <Button
        disabled={loading}
        loading={loading}
        type="submit"
        variant="filled"
        className=" mt-4"
        w={60}
        mx={'auto'}
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default NewUpdateAcadYear;
