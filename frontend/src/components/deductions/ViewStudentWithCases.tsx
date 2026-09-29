import { DisciplineMarksReduction, DsCasesReport } from '@/types/marks.type';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { DataTable } from '../core/data-table';

interface Props {
  data: DsCasesReport | null;
  onClose: () => void;
}

const ViewStudentWithCases = (props: Props) => {
  const { data, onClose } = props;

  const cols: ColumnDef<DisciplineMarksReduction>[] = [
    {
      accessorKey: 'student',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          {row.original.student.firstName} {row.original.student.lastName}
        </div>
      ),
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

export default ViewStudentWithCases;
