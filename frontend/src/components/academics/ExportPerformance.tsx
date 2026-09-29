'use client';
import { IClass } from '@/types/class.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button, MultiSelect, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiCheck } from 'react-icons/bi';
import InputWrapper from '../core/Input/InputWrapper';
import AsyncMultiSelect from '../core/selects/AsyncMultiSelect';
import { FaLock, FaLockOpen, FaUnlockAlt } from 'react-icons/fa';
import { IAcademicYear, ITerm } from '@/types/other.type';
import AsyncSelect from '../core/selects/AsyncSelect';

interface Props {
  onClose: () => void;
  academicYearId: string;
  data?: any;
}

const ExportPerformance = ({ onClose, data, academicYearId }: Props) => {
  const [termId, setTermId] = useState('');
  const [yearId, setYearId] = useState(academicYearId);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('academic');

  const handleExportMarks = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    if (!termId) {
      notifications.show({
        title: 'Please select a term',
        message: 'Please select a term',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await AuthApi.get(
        `/exporting/students/performance/?termId=${termId}&academicYearId=${yearId}${
          data.classId ? `&classId=${data.classId}` : ''
        }&markType=${activeTab?.toUpperCase()}`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const filename = `performance_export_${Date.now()}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to export marks',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className=" w-full flex flex-col gap-y-3 p-4 md:p-6 lg:p-12"
      onSubmit={(e) => handleExportMarks(e)}
    >
      <div className="flex flex-col md:flex-row justify-start gap-y-2">
        <div className="flex justify-between items-center gap-x-2">
          <span className=" font-medium text-sm">Academic Year</span>
          <AsyncSelect
            datasrc={`/academic-years/all`}
            variant="default"
            value={yearId}
            onChange={(e: any) => {
              setYearId(e);
            }}
            disabled={data.classId}
            placeholder="Select academic year"
          />
        </div>
        <div className="flex justify-between items-center gap-x-2">
          <span className=" font-medium text-sm">Term</span>
          <AsyncSelect
            datasrc={`/terms/all/academic-year/${yearId}`}
            variant="default"
            onChange={(e: any) => {
              setTermId(e);
            }}
            value={termId ?? ''}
            placeholder="Select term"
          />
        </div>
      </div>
      <div className="flex items-center">
        <h2 className="mr-10 font-medium text-sm ">Mark Type: </h2>
        <button
          type="button"
          className={`py-2  text-[80%] px-5 rounded-lg ${
            activeTab != 'academic'
              ? 'bg-[#43434305] text-[bg-primary] '
              : 'bg-primary text-white font-bold'
          }`}
          onClick={() => setActiveTab('academic')}
        >
          ACADEMIC
        </button>
        <button
          type="button"
          className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
            activeTab != 'discipline'
              ? 'bg-[#43434305] text-[bg-primary] '
              : 'bg-primary text-white font-bold'
          }`}
          onClick={() => setActiveTab('discipline')}
        >
          DISCIPLINE
        </button>
      </div>
      <div className="flex gap-4 justify-center">
        <Button
          disabled={isLoading}
          variant="filled"
          loading={isLoading}
          className="flex mt-4 gap-3"
          // w={60}
          mx={'auto'}
          type="submit"
        >
          Export
        </Button>
      </div>
    </form>
  );
};

export default ExportPerformance;
