import { DisciplineMarksReduction, DsStudentReport } from '@/types/marks.type';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { DataTable } from '../core/data-table';

interface Props {
  data: DsStudentReport | null;
  onClose: () => void;
}

const ViewStudentCases = (props: Props) => {
  const { data, onClose } = props;

  const cols: ColumnDef<DisciplineMarksReduction>[] = [
    {
      accessorKey: 'casesCategories',
      header: 'Cases Name',
      cell: ({ row }) => <div>{row.original.casesCategories?.name}</div>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{row.original.marks}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <div>{row.original.reason}</div>,
    },
    {
      accessorKey: 'staffMember',
      header: 'Staff Member',
      cell: ({ row }) => (
        <div>
          {row.original.staffMember.firstName} {row.original.staffMember.lastName}
        </div>
      ),
    },
  ];
  return (
    <div className="w-full mt-5">
      <DataTable columns={cols} data={data?.disciplineMarksReductions ?? []} />
    </div>
  );
};

export default ViewStudentCases;
