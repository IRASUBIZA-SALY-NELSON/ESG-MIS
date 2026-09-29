import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import closeModal from '@/assets/close.svg';
import Image from 'next/image';
import { AuthApi } from '@/utils/constants';
import { ClipLoader } from 'react-spinners';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { getResError } from '@/utils/fetch';

const VoteModal = ({ votes, close }: { votes: any[]; close: () => void }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useRouter();
  const onSubmit = async () => {
    setLoading(true);
    AuthApi.post(`/votes/create/list`, votes)
      .then((res) => {
        notifications.show({
          title: 'Vote Submitted Successfully!',
          message: 'Thank you for participating in the voting process.',
          color: 'green',
          autoClose: 60000,
        });
        localStorage.setItem('vttd', '1');
        close();
        navigate.push('/elections/after-vote');
      })
      .catch((err) => {
        notifications.show({
          title: 'Oops! Something went wrong while voting.',
          message: getResError(err),
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="p-2 rounded-lg text-center relative">
      <p className="my-2 font-semibold text-lg text-center">Vote</p>
      <p>Please make sure that these choices are correct and accurate </p>
      <div className="flex w-full justify-between my-2">
        <button
          className="px-4 py-2 text-mainPurple border-mainPurple border-2 rounded-md"
          onClick={close}
        >
          Cancel
        </button>
        {loading ? (
          <div className="px-4 py-2 text-white bg-mainPurple rounded-md w-[100px]">
            <ClipLoader color="white" size={15} />
          </div>
        ) : (
          <button className="px-4 py-2 text-white bg-mainPurple rounded-md" onClick={onSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default VoteModal;
