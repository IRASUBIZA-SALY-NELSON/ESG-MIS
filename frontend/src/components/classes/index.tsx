'use client';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import { BiCheck } from 'react-icons/bi';
import CustomInput from '../core/input';
import { Jockey_One, Kolker_Brush, Lakki_Reddy } from 'next/font/google';
import { GiJackPlug, GiKingJuMask } from 'react-icons/gi';
import { join } from 'path';
import { BsJournalBookmark } from 'react-icons/bs';

const NewClass = ({ refetch, onClose }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [className, setClassName] = useState<string>('Year');
  const [studentsNumber, setStudentsNumber] = useState('');

  const [error, setError] = React.useState({
    className: '',
    studentsNumber: '',
  });
  const payload = {
    className: className,
    studentsNumber: parseInt(studentsNumber),
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (error.className !== '') {
      notifications.show({
        title: 'Failed to Create Class',
        message: 'Class name should follow the pattern "Year {number}{letter}"',
        color: 'red',
      });
      return;
    }
    if (studentsNumber.length < 1 || !studentsNumber || !className) {
      setError({
        ...error,
        studentsNumber: 'Number of students is required',
      });
      return;
    }
    try {
      console.log({
        ...payload,
        code: 'Y' + payload.className[-2] + payload.className[-1],
      });
      const { data } = await AuthApi.post(`/classes/create`, {
        ...payload,
        code: 'Y' + payload.className[-2] + payload.className[-1],
      });

      notifications.show({
        title: 'Class Created',
        message: 'Class has been created successfully',
        color: 'green',
      });

      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(error);
      console.log(err);
      // toast.error('Class creation failed');
      notifications.show({
        title: 'Failed to Create Class',
        message: resErr,
        color: 'red',
      });
      setError(resErr);
    } finally {
      setLoading(false);
      // window.location.reload();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClassName(value);
    // Define the pattern using regular expressions
    const pattern = /^Year (\d{1,})[A-Z]$/;
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
    <form className=" w-full flex p-5 flex-col gap-y-3" onSubmit={handleSubmit}>
      <CustomInput
        label="Class Name"
        type="text"
        placeholder="class name"
        description='Example: "Year 1A"'
        name="name"
        required
        value={className}
        onChange={handleNameChange}
        error={error.className}
      />
      {error.className && <p className="text-red-500 text-sm">{error.className}</p>}
      <CustomInput
        label="Number of Students"
        name="numberOfStudents"
        type="number"
        required
        value={studentsNumber}
        onChange={(e) => setStudentsNumber(e.target.value)}
        error={error.studentsNumber}
      />

      <Button
        type="submit"
        variant="filled"
        className=" mt-4"
        w={60}
        mx={'auto'}
        loading={loading}
        disabled={loading}
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default NewClass;
