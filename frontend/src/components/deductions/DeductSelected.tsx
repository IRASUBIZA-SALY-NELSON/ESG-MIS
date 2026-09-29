import React, { FormEvent, useState } from 'react';
import { AuthApi } from '@/utils/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { ClipLoader } from 'react-spinners';
import InputWrapper from '../core/Input/InputWrapper';
import AsyncSelect from '../core/selects/AsyncSelect';
import AsyncMultiSelect from '../core/selects/AsyncMultiSelect';
import { DateInput } from '@mantine/dates';
interface Props {
  onCancel: () => void;
  refetch: () => void;
}

const DeductMany: React.FC<Props> = ({ onCancel, refetch }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('DEDUCT');
  const [data, setData] = useState({
    casesCategoriesId: '',
    createdAt: '',
    termId: '',
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const deductions = [];
    for (const st of students) {
      deductions.push({
        action,
        ...data,
        studentId: st,
      });
    }

    AuthApi.post('/deductions/create/many-students/', deductions)
      .then((res) => {
        notifications.show({
          title: `Marks ${action?.toLowerCase()}ed successfully`,
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
            err.response.data.message ||
            'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
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
      <p className={'text-gray-600 text-center font-medium text-[1.3rem]'}>
        Deduct/Add to Many Students
      </p>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-y-2 mt-2">
        <InputWrapper label="Students" description={`Select Students to ${action?.toLowerCase()}`}>
          <AsyncMultiSelect
            datasrc="/students/all"
            // labelKey="firstName"
            getLabel={(data) => `${data?.firstName} ${data?.lastName}`}
            value={students}
            onChange={(e) => {
              setStudents(e);
            }}
          />
        </InputWrapper>
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
            setData({
              ...data,
              createdAt: e ? new Date(e).toISOString() : '',
            });
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
              {action}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DeductMany;
