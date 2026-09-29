'use client';
import React, { useState } from 'react';
import CustomInput from '../core/input';
import { Button } from '@mantine/core';
import { BiCheck } from 'react-icons/bi';
import { AiOutlineReload } from 'react-icons/ai';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { getResError } from '@/utils/fetch';

const EditClass = ({ data: toUpdate, refetch, onClose }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = React.useState({
    className: toUpdate?.className ?? '',
    studentsNumber: toUpdate?.studentsNumber ?? '',
  });
  const [error, setError] = React.useState({
    className: '',
    studentsNumber: '',
  });

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (error.className !== '') {
      notifications.show({
        title: 'Failed to Update Class',
        message: 'Class name should follow the pattern "Year {number}{letter}"',
        color: 'red',
      });
      return;
    }
    try {
      const res = await AuthApi.put(
        `/classes/update`,
        { className: data.className, studentsNumber: data.studentsNumber },
        {
          params: {
            id: toUpdate.id,
          },
        },
      );

      notifications.show({
        title: 'Class Updated',
        message: 'Class has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Update Course',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setData({
      ...data,
      className: value,
    });
    // Define the pattern using regular expressions
    const pattern = /^Year (\d{1,})[A-Za-z]$/;
    // Test if the input value matches the pattern
    if (pattern.test(value)) {
      setError({
        ...error,
        className: '',
      });
    } else {
      setError({
        ...error,
        className: 'Input should follow the pattern "Year {number}{letter}"',
      });
    }
  };
  return (
    <form className=" w-full flex p-5 flex-col gap-y-3" onSubmit={handleUpdate}>
      <CustomInput
        type="text"
        label="Class Name"
        placeholder="class name"
        description='Ex: "Year 1A"'
        name="name"
        required
        value={data?.className ?? ''}
        onChange={handleNameChange}
      />
      {error.className && <p className="text-red-500 text-sm">{error.className}</p>}
      <CustomInput
        type="number"
        label="Number of Students"
        name="numberOfStudents"
        required
        value={data?.studentsNumber ?? ''}
        onChange={(e: any) => setData({ ...data, studentsNumber: parseInt(e.target.value) })}
      />
      <Button
        variant="filled"
        className=" mt-4"
        w={60}
        mx={'auto'}
        type="submit"
        loading={loading}
        disabled={loading}
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default EditClass;
