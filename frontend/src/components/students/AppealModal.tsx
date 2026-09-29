import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import closeModal from '@/assets/close.svg';
import Image from 'next/image';
import { AuthApi } from '@/utils/constants';
import { ClipLoader } from 'react-spinners';
import { notifications } from '@mantine/notifications';
import { BiXCircle } from 'react-icons/bi';

const AppealModal = ({ markId, close }: { markId: string; close: () => void }) => {
  const [loading, setLoading] = useState(false);
  const schema = yup.object().shape({
    description: yup.string().required('Please provide the description for your appeal'),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = (data: any) => {
    setLoading(true);
    AuthApi.post('/academicAppeals/create?category=SINGLE_SUBJECT', {
      markId,
      description: data.description,
    })
      .then((res) => {
        notifications.show({
          title: 'Appeal sent to teacher successfully',
          message: 'Once the teacher reviews the appeal you will be notified',
          color: 'blue',
          autoClose: 60000,
        });
        close();
      })
      .catch((err) => {
        notifications.show({
          title: 'Failed to appeal',
          message: err.message,
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="p-2 rounded-lg  min-w-[40vw]  text-center relative">
      <button
        onClick={close}
        className="absolute -right-1 text-mainPurple -top-1  p-2 rounded-full"
      >
        <BiXCircle size={25} />
      </button>
      <p className="my-2 font-semibold text-lg text-center">Appeal Description</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea
          className="w-full rounded-md h-[100px] px-4 py-2 border outline-none"
          {...register('description')}
        ></textarea>
        <p className="text-red-500">{errors.description?.message}</p>
        {loading ? (
          <div className="px-4 py-2 rounded-md bg-mainPurple w-[100px] mx-auto ">
            <ClipLoader color="white" size={15} />
          </div>
        ) : (
          <input
            type="submit"
            value={'Confirm'}
            className="px-4 py-2 rounded-md cursor-pointer text-white bg-mainPurple"
          />
        )}
      </form>
    </div>
  );
};

export default AppealModal;
