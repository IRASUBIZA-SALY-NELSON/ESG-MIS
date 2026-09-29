'use client';
import AcademicFilter from '@/components/academics/AcademicFilter';
import { DataTable } from '@/components/core/data-table';
import MainModal from '@/components/core/modals/modal';
import ViewStudentCases from '@/components/deductions/ViewStudentCases';
import ViewStudentWithCases from '@/components/deductions/ViewStudentWithCases';
import useGet from '@/hooks/useGet';
import { DsCasesReport } from '@/types/marks.type';
import { toFixed } from '@/utils/funcs/func2';
import { Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';

const DsMarksReport = () => {
  const [termId, setTermId] = useState<string>('');
  const { data, loading, error, get } = useGet<any[]>(
    `/deductions/case-categories/report/${termId}`,
    {
      onMount: false,
    },
  );
  const [viewCases, setViewCases] = useState({
    status: false,
    data: null as DsCasesReport | null,
  });

  useEffect(() => {
    if (!termId) return;
    get();
  }, [termId]);

  const columns: ColumnDef<DsCasesReport>[] = [
    {
      id: 'caseName',
      accessorKey: 'casesCategories',
      header: 'Case  Name',
      cell: ({ row }) => <div>{row.original.casesCategories?.name ?? '-'}</div>,
    },
    {
      id: 'caseReason',
      accessorKey: 'casesCategories',
      header: 'Case  Reason',
      cell: ({ row }) => <div>{row.original.casesCategories?.description ?? '-'}</div>,
    },
    {
      id: 'caseMarks',
      accessorKey: 'casesCategories',
      header: 'Case Marks',
      cell: ({ row }) => <div>{row.original.casesCategories?.marks ?? '-'}</div>,
    },
    {
      accessorKey: 'percentage',
      header: 'Percentage',
      cell: ({ row }) => <div>{toFixed(row.original.percentage)}%</div>,
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
    <div className="flex w-full flex-col gap-4 mt-4">
      <p className=" text-sm">Viewing Report By Case Categories</p>
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
        title={`View Student Cases for ${viewCases.data?.casesCategories?.name ?? '-'} `}
        size={'xl'}
      >
        <ViewStudentWithCases
          data={viewCases.data}
          onClose={() => setViewCases({ status: false, data: null })}
        />
      </MainModal>
    </div>
  );
};

export default DsMarksReport;
