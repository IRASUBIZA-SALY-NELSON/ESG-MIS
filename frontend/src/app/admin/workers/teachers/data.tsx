import { Teacher } from '@/types/teacher.type';
import { ColumnDef } from '@tanstack/react-table';

export const baseTeacherColumns: ColumnDef<Teacher>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
  },
  {
    accessorKey: 'email',
    header: 'Teacher Email',
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => <div>{row.getValue('gender')}</div>,
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
    cell: ({ row }) => <div className=" whitespace-nowrap">{row.getValue('phoneNumber')}</div>,
  },
];
