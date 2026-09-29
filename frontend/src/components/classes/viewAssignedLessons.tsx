'use client';
import React, { useState, useEffect } from 'react';
import { AuthApi } from '@/utils/constants';
import CustomInput from '../core/input';
import { Button } from '@mantine/core';
import { BiCheck } from 'react-icons/bi';

import { TagsInput } from '@mantine/core';

const ViewAssignedLesson = ({ onClose, data: toUpdate }: any) => {
  const [viewedData, setViewedData] = useState([]);
  const [isLoading, setIsloading] = useState(false);

  useEffect(() => {
    const fetchLessons = async (id: string) => {
      setIsloading(true);
      try {
        const response = await AuthApi.get(`/courses/class/${id}`);
        const isV = response.data.data.map((course: any) => course.courseName);
        console.log(isV);
        setViewedData(isV);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLessons(toUpdate.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    onClose();
  };

  return (
    <form className=" w-full flex flex-col gap-y-3 p-12">
      <CustomInput
        type="text"
        label="Class Name"
        placeholder="Alice Mukabaranga"
        name="name"
        value={toUpdate && toUpdate.className}
        required
      />
      <TagsInput
        styles={{
          root: {
            backgroundColor: '#E7F2EC',
            padding: '18px',
            borderRadius: '4px',
          },
          input: {
            backgroundColor: '#E7F2EC',
            border: 'none',
            padding: '2px',
          },
        }}
        label="Lessons"
        placeholder="Enter lessons"
        clearable
        value={viewedData.length > 0 ? viewedData : ['No lesson']}
      />
      <Button variant="filled" className=" mt-4" w={60} mx={'auto'} onClick={handleClose}>
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default ViewAssignedLesson;
