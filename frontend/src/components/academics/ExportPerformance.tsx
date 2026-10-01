'use client';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import AsyncSelect from '../core/selects/AsyncSelect';
import { downloadPerformancePdf } from '@/utils/pdf/downloadPerformancePdf';
import { getResError } from '@/utils/fetch';
import { BsFilePdf } from 'react-icons/bs';

interface Props {
  onClose: () => void;
  academicYearId: string;
  data?: { classId?: string | null };
}

const ExportPerformance = ({ onClose, data, academicYearId }: Props) => {
  const [termId, setTermId] = useState('');
  const [yearId, setYearId] = useState(academicYearId);
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('academic');

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termId) {
      notifications.show({
        title: 'Select a term',
        message: 'Choose the term to include in the ranking report.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      await downloadPerformancePdf({
        termId,
        academicYearId: yearId,
        classId: data?.classId || null,
        markType: activeTab.toUpperCase(),
      });
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Export failed',
        message: getResError(err) || 'Could not generate the ranking PDF.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className=" w-full flex flex-col gap-y-3 p-4 md:p-6" onSubmit={handleExport}>
      <p className="text-sm text-gray-600 text-center">
        Download a ranked PDF of student names and marks
        {data?.classId ? ' for this class' : ' for every class'}.
      </p>
      <div className="flex flex-col md:flex-row justify-start gap-y-2 gap-x-4">
        <div className="flex justify-between items-center gap-x-2">
          <span className=" font-medium text-sm">Academic Year</span>
          <AsyncSelect
            datasrc={`/academic-years/all`}
            variant="default"
            value={yearId}
            onChange={(e: any) => {
              setYearId(e);
            }}
            disabled={!!data?.classId}
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
          mx={'auto'}
          type="submit"
        >
          <BsFilePdf className="mr-2" />
          Download PDF
        </Button>
      </div>
    </form>
  );
};

export default ExportPerformance;
