import { Student } from '@/types/student.types';
import React, { useState } from 'react';
import ProfileInput from './ProfileInput';
import { Button } from '@mantine/core';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { notifications } from '@mantine/notifications';

interface Props {
  student: Student | null;
  onClose: () => void;
  refetch: () => void;
}

const UpdatePicture = ({ student, onClose, refetch }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfilePicture = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('profile', file as File);
      const res = await AuthApi.patch(`/auth/profile/${student?.user_id}`, formData);

      notifications.show({
        title: 'Profile Picture Updated',
        message: 'Profile Picture has been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Update Profile Picture',
        message: resErr,
        color: 'red',
      });
      setError(resErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex flex-col py-2 gap-y-2 w-full">
      <div className="flex max-w-[400px] mx-auto aspect-square justify-center overflow-auto w-full flex-col">
        <ProfileInput setSelectFile={setFile} />
      </div>
      {error && <div className=" text-red-500 text-sm font-semibold text-center">{error}</div>}
      <div className="flex items-center justify-between mt-2">
        <Button
          disabled={loading}
          className=" w-fit"
          color="red"
          variant="outline"
          onClick={() => onClose()}
        >
          Cancel
        </Button>
        <Button
          className=" w-fit"
          color="blue"
          //   variant="outline"
          onClick={updateProfilePicture}
          loading={loading}
          disabled={!file || loading}
        >
          Update
        </Button>
      </div>
    </div>
  );
};

export default UpdatePicture;
