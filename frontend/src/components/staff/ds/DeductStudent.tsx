'use client';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import { AuthApi } from '@/utils/constants';
import { Input, Select } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';

const DeductStudent = ({
  studentName,
  studentId,
  termId,
  onCancel,
  refetch,
}: {
  studentName: string;
  studentId: string;
  termId: string;
  onCancel: () => void;
  refetch: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('DEDUCT');
  const [data, setData] = useState({
    casesCategoriesId: '',
    createdAt: '',
    termId: termId,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    AuthApi.post('/deductions/create', { ...data, action, studentId, termId })
      .then((res) => {
        notifications.show({
          title: 'Marks deducted successfully',
          message: '',
          color: 'green',
        });
        refetch();
        onCancel();
      })
      .catch((err) => {
        notifications.show({
          title: 'Oops! Something went wrong while removing the marks.',
          message:
            err?.response.data.status === 500
              ? 'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.'
              : err.message,
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="p-6 flex flex-col  gap-2">
      <p className={'text-gray-600 text-center font-medium text-[1.3rem]'}>Deduct Marks</p>
      <div className="text-left w-full flex flex-col  px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '60%' }} className="text-[#616161]">
          Name:{' '}
        </p>
        <p style={{ fontSize: '80%' }}>{studentName}</p>
      </div>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-y-2 mt-2">
        <Input.Wrapper label="Action" required>
          <Select
            data={['DEDUCT', 'ADD']}
            defaultValue="DEDUCT"
            onChange={(e) => {
              if (!e) return;
              setAction(e);
            }}
            placeholder="Select Action"
            size="sm"
          />
        </Input.Wrapper>
        <AsyncSelect
          label="Cases Categories"
          px={0}
          variant="default"
          datasrc="/case-categories/all"
          getLabel={(e) => `${e.name} (-${e.marks})`}
          onChange={(e) => {
            setData({ ...data, casesCategoriesId: e });
          }}
          required
        />
        <DateInput
          label="Date"
          placeholder="Select Date"
          required
          maxDate={new Date()}
          onChange={(e) => {
            // register('createdAt').onChange({ target: { value: e?.toISOString() } });
            setData({ ...data, createdAt: e?.toISOString() ?? '' });
          }}
        />
        <div className="flex justify-between items-center my-2">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg  text-gray-500">
            Cancel
          </button>
          {loading ? (
            <div className="px-6 py-3 bg-primary-900 border border-primary-900 rounded-lg text-white w-[100px] flex items-center justify-center">
              <ClipLoader color="white" size={15} />
            </div>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-primary-900 border border-primary-900 rounded-lg text-white"
            >
              Deduct
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
export default DeductStudent;
