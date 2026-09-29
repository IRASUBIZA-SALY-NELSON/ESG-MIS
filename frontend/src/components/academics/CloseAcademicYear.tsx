'use client';
import { IAcademicYear } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useState } from 'react';
import { BiXCircle } from 'react-icons/bi';

interface Props {
  refetch: () => void;
  onClose: () => void;
  data: IAcademicYear;
}

const CloseAcademicYear: FC<Props> = ({ refetch, onClose, data }) => {
  const [loading, setLoading] = useState(false);

  const handleCloseYear = async () => {
    setLoading(true);
    try {
      await AuthApi.put(`/academic-years/close/${data.id}`);
      notifications.show({
        title: 'Academic Year Closed',
        message:
          'The academic year has been successfully closed. Students will now be promoted to the next level.',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error: any) {
      console.log(error);
      const resErr = getResError(error);
      notifications.show({
        title: 'Failed to Close Academic Year',
        message: error.message || resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-5 flex flex-col items-center gap-y-4">
      <BiXCircle size={40} color="red" />
      <div className="text-center text-gray-700">
        <h2 className="text-xl font-semibold">Close Academic Year</h2>
        <p className="mt-2">
          By closing this academic year, all students will be promoted to the next level. Make sure
          you have finalized all records and evaluations for the year before proceeding.
        </p>
      </div>
      <Button
        disabled={loading}
        loading={loading}
        onClick={handleCloseYear}
        variant="filled"
        color="red"
        className="mt-4 w-48"
      >
        Confirm Close Year
      </Button>
    </div>
  );
};

export default CloseAcademicYear;
