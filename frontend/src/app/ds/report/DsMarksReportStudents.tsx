'use client';
import AcademicFilter from '@/components/academics/AcademicFilter';
import { DataTable } from '@/components/core/data-table';
import MainModal from '@/components/core/modals/modal';
import ViewStudentCases from '@/components/deductions/ViewStudentCases';
import useGet from '@/hooks/useGet';
import { DsStudentReport } from '@/types/marks.type';
import { Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';

const DsMarksReportStudents = () => {
  const [termId, setTermId] = useState<string>('');
  const { data, loading, error, get } = useGet<any[]>(`/deductions/student/report/${termId}`, {
    onMount: false,
  });
  const [viewCases, setViewCases] = useState({
    status: false,
    data: null as DsStudentReport | null,
  });

  useEffect(() => {
    if (!termId) return;
    get();
  }, [termId]);

  const columns: ColumnDef<DsStudentReport>[] = [
    {
      id: 'studentName',
      accessorKey: 'student',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          {row.original.student?.firstName ?? '-'} {row.original.student?.lastName ?? ''}
        </div>
      ),
    },
    {
      id: 'currentClass',
      accessorKey: 'student',
      header: 'Current Class',
      cell: ({ row }) => <div>{row.original.student?.currentClazz?.className ?? '-'}</div>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{row.original.totalMarks}</div>,
    },
    // view Cases
    {
      id: 'viewCases',
      accessorKey: 'student',
      header: 'View Cases',
      cell: ({ row }) => (
        <Button onClick={() => setViewCases({ status: true, data: row.original })}>
          View Cases
        </Button>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <AcademicFilter getTerm={(term) => term && setTermId(term?.id)} />
      <DataTable
        loading={loading}
        columns={columns}
        data={data ?? []}
        noDataMessage={termId ? 'No data found' : 'Select a term to view data'}
      />
      <MainModal
        isOpen={viewCases.status}
        onClose={() => setViewCases({ status: false, data: null })}
        title={`View Cases for ${viewCases.data?.student?.firstName ?? '-'} ${viewCases.data?.student?.lastName ?? ''}`}
        size={'xl'}
      >
        <ViewStudentCases
          data={viewCases.data}
          onClose={() => setViewCases({ status: false, data: null })}
        />
      </MainModal>
    </div>
  );
};

export default DsMarksReportStudents;
