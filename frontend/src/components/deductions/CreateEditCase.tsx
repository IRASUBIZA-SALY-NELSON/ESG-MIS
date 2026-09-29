import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createCaseCategory, updateCaseCategory } from '@/utils/funcs';
import { notifications } from '@mantine/notifications';

interface FormValues {
  name: string;
  description: string;
  marks: number;
}

interface Props {
  defaultValue?: FormValues & { id: string };
  close: () => void;
}

const CreateEditCase: React.FC<Props> = ({ defaultValue, close }) => {
  const isEditing = !!defaultValue;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required'),
    marks: yup
      .number()
      .required('Marks is required')
      .positive('Marks must be positive')
      .integer('Marks must be an integer'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultValue,
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);

      setError(null);
      if (isEditing && defaultValue?.id) {
        await updateCaseCategory(defaultValue.id, data);
      } else {
        await createCaseCategory(data);
      }
      close();
    } catch (error) {
      isEditing
        ? notifications.show({
            title: `Oops! Something went wrong while updating case`,
            message:
              'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
            color: 'red',
            autoClose: 60000,
          })
        : notifications.show({
            title: `Oops! Something went wrong while creating a new case`,
            message:
              'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
            color: 'red',
            autoClose: 60000,
          });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reset(defaultValue);
  }, [defaultValue, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center px-10 py-5">
      <div className="my-2 w-full">
        <label className="block text-sm" htmlFor="name">
          Name
        </label>
        <input
          className="px-4 py-2 rounded-md border-mainGray  focus:border-mainPurple border w-full"
          type="text"
          id="name"
          {...register('name')}
        />
        <p className="text-red-500 italic text-xs"> {errors.name?.message}</p>
      </div>
      <div className="my-2 w-full">
        <label className="block text-sm" htmlFor="description">
          Description
        </label>
        <textarea
          className="px-4 py-2 rounded-md border-mainGray  focus:border-mainPurple border w-full"
          id="description"
          {...register('description')}
        />
        <p className="text-red-500 italic text-xs"> {errors.description?.message}</p>
      </div>
      <div className="my-2 w-full">
        <label className="block text-sm" htmlFor="marks">
          Marks
        </label>
        <input
          className="px-4 py-2 rounded-md border-mainGray  focus:border-mainPurple border w-full"
          type="number"
          id="marks"
          {...register('marks')}
        />
        <p className="text-red-500 italic text-xs"> {errors.marks?.message}</p>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        type="submit"
        className="text-white bg-mainPurple px-4 text-center py-2.5 rounded-md mt-5"
        disabled={loading}
      >
        {loading ? 'Loading...' : isEditing ? 'Edit' : 'Create'}
      </button>
    </form>
  );
};

export default CreateEditCase;
