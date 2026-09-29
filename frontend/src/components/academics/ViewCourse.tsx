'use client';
import React, { FC, useEffect, useState } from 'react';
import { Button, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { ICourse } from '@/types/course.type';
import { IClass } from '@/types/class.type';
import useGet from '@/hooks/useGet';
import AsyncSelect from '../core/selects/AsyncSelect';

interface Props {
  refetch: () => void;
  onClose: () => void;
  isEdit?: boolean;
  data?: ICourse | null;
  year: string;
}

const ViewCourse: FC<Props> = ({ refetch, onClose, isEdit, data: toUpdate, year }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    courseName: '',
    weight: '',
    credits: '',
  });

  const [term, setTerm] = useState('');
  const [classId, setClassId] = useState('');

  // Get classes based on selected academic year or fallback to the current year
  const { data: classes, loading: classesLoading } = useGet<IClass[]>(`/classes/all/year/${year}`, {
    defaultData: [],
  });

  const handleExportAnalytics = async () => {
    if (!term || !classId) {
      notifications.show({
        title: 'Missing Filters',
        message: 'Please select a term or class before exporting.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      console.log({ year, term, classId, course: toUpdate?.id });
      await AuthApi.get(`exporting/term/{termId}/class/{classId}/course/{courseId}`, {
        params: {
          academicYear: year,
          termId: term,
          clasId: classId,
          courseId: toUpdate?.id,
        },
      });
      notifications.show({
        title: 'Analytics Exported',
        message: 'Analytics data has been successfully exported.',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      const resErr = getResError(error);
      setError(resErr);
      notifications.show({
        title: 'Failed to Export Analytics',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !term && !classId;

  return (
    <div className="w-full flex p-5 flex-col gap-y-3">
      <p>{toUpdate?.courseName} Analytics</p>

      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex md:flex-row flex-col">
          <AsyncSelect
            datasrc={`/terms/all/academic-year/${year}`}
            variant="default"
            label="Term"
            onChange={(e) => setTerm(e)}
            value={term ?? ''}
            placeholder="Select term"
          />
        </div>
        <Select
          placeholder="Select Class"
          label="Class"
          size="sm"
          w={150}
          data={[
            {
              group: 'Classes',
              items: [
                {
                  label: 'All',
                  value: 'all',
                },
                ...classes!.map((classIt) => ({
                  label: classIt.className,
                  value: classIt.id.toString(),
                })),
              ],
            },
          ]}
          searchable
          value={classId ?? 'all'}
          onChange={(e) => setClassId(e ?? '')}
          disabled={classesLoading}
        />
      </div>

      <Button
        disabled={isButtonDisabled || loading}
        onClick={handleExportAnalytics}
        loading={loading}
        variant="filled"
        className="mt-4"
        w={150}
        mx={'auto'}
      >
        Export Analytics
      </Button>
    </div>
  );
};

export default ViewCourse;
