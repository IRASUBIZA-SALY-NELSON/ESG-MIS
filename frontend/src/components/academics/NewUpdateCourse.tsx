'use client';
import React, { FC } from 'react';
import CustomInput from '../core/input';
import { Button } from '@mantine/core';
import { BiCheck } from 'react-icons/bi';
import { notifications } from '@mantine/notifications';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { AiOutlineReload } from 'react-icons/ai';
import { ICourse } from '@/types/course.type';

interface Props {
  refetch: () => void;
  onClose: () => void;
  isEdit?: boolean;
  data?: ICourse | null;
}

const NewUpdateCourse: FC<Props> = ({ refetch, onClose, isEdit, data: toUpdate }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({
    courseName: '',
    weight: '',
    credits: '',
  });
  const [data, setData] = React.useState({
    courseName: toUpdate?.courseName ?? '',
    weight: toUpdate?.courseWeight ?? '',
    credits: toUpdate?.courseCredits ?? '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.post('/courses/create', data);

      notifications.show({
        title: 'Course Created',
        message: 'Course has been created successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Failed to create course.',
        message: '',
        color: 'red',
      });
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Create Course',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.put(`/courses/update/${toUpdate?.id}`, data);

      notifications.show({
        title: 'Course Updated',
        message: 'Course has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
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

  return (
    <form
      onSubmit={isEdit ? handleUpdate : handleSubmit}
      className=" w-full flex p-5 flex-col gap-y-3"
    >
      <CustomInput
        label="Name"
        type="text"
        placeholder="Enter Course Name"
        onChange={(e) => {
          setData({ ...data, courseName: e.target.value });
        }}
        error={error.courseName}
        required
        value={data.courseName}
        name="courseName"
      />
      <CustomInput
        type="number"
        description="A course max marks"
        label="Max Marks"
        placeholder="Enter Course Max Marks"
        error={error.weight}
        value={data.weight}
        onChange={(e) => {
          setData({ ...data, weight: e.target.value });
        }}
        name="weight"
        required
      />
      <CustomInput
        type="number"
        label="Credit Hours"
        description="A course credit hours"
        placeholder="Enter Course Credit Hours"
        error={error.credits}
        value={data.credits}
        onChange={(e) => {
          setData({ ...data, credits: e.target.value });
        }}
        name="credits"
        required
      />
      <Button
        disabled={loading}
        type="submit"
        loading={loading}
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

export default NewUpdateCourse;
