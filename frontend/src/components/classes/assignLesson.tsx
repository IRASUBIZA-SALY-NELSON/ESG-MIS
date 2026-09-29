'use client';
import { IClass } from '@/types/class.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiCheck } from 'react-icons/bi';
import InputWrapper from '../core/Input/InputWrapper';
import AsyncMultiSelect from '../core/selects/AsyncMultiSelect';

interface Props {
  onClose: () => void;
  data?: IClass;
  disabled?: boolean;
}

const AssignCourse = ({ onClose, data: toUpdate, disabled }: Props) => {
  const [data, setData] = useState<any>({
    courseIdArray: toUpdate?.coursesList?.map((course) => course.id) ?? [],
    classId: toUpdate?.id ?? '',
  });
  console.log(data.courseIdArray);
  console.log(toUpdate);
  const [isLoading, setLoading] = useState<boolean>(false);
  const handleAssignCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.put('/classes/course/assign-or-remove/course', data);
      notifications.show({
        title: 'Course assigned',
        message: 'Course has been updated successfully',
        color: 'green',
      });
      onClose();
    } catch (err) {
      const resErr = getResError(err);
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
    <form className=" w-full flex flex-col gap-y-3 p-12" onSubmit={handleAssignCourse}>
      <h1 className=" text-center font-semibold text-sm">
        {disabled ? 'Assigned' : 'Assign'} Courses to {toUpdate?.className}
      </h1>
      <InputWrapper label="Courses">
        <AsyncMultiSelect
          datasrc="/courses/all/current-year"
          placeholder="Select Classes"
          labelKey="courseName"
          value={data.courseIdArray}
          onChange={(e) => {
            setData({ ...data, courseIdArray: e });
          }}
          disabled={disabled}
        />
      </InputWrapper>
      <Button
        disabled={disabled || isLoading}
        variant="filled"
        loading={isLoading}
        className=" mt-4"
        w={60}
        mx={'auto'}
        type="submit"
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default AssignCourse;
