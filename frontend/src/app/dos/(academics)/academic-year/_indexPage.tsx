'use client';
import NewUpdateAcadYear from '@/components/academics/NewUpdateAcadYear';
import ExportForm from '@/components/core/data-table/ExportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { EditIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { IAcademicYear } from '@/types/other.type';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiExport } from 'react-icons/bi';
import { SlRefresh } from 'react-icons/sl';

const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

interface Props {
  academicYears: IAcademicYear[];
  loading: boolean;
}

const AcademicYear: FC<Props> = ({ academicYears, loading }) => {
  const { error, get } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: academicYears,
    onMount: false,
  });
  const data = academicYears;
  const [showModal, setShowModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as IAcademicYear | null,
  });
  const [isView, setIsView] = useState({
    status: false,
    data: null as IAcademicYear | null,
  });

  const onEdit = (data: IAcademicYear) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const onView = (data: IAcademicYear) => {
    setIsView({
      status: true,
      data,
    });
  };

  const columns: ColumnDef<IAcademicYear>[] = [
    {
      accessorKey: 'name',
      header: 'Academic Year Name',
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'startYear',
      header: ({ column }) => <SortButton column={column} name="Start Year" />,
      cell: ({ row }) => <div>{row.getValue('startYear')}</div>,
    },
    {
      accessorKey: 'endYear',
      header: ({ column }) => <SortButton column={column} name="End Year" />,
      cell: ({ row }) => <div>{row.getValue('endYear')}</div>,
    },
  ];

  return (
    <div className=" flex flex-col  w-full">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Academic Years</h1>
        <Button
          className=" gap-x-2 bg-mainPurple"
          onClick={() => setShowModal(true)}
          variant="filled"
        >
          New Academic Year
        </Button>
      </div>
      {!loading && data && (
        <DataTable
          searchKey="name"
          data={data}
          columns={columns}
          tableClass="h-[60vh]"
          actionElement={
            <div className=" flex items-center gap-x-2">
              <ActionIcon title="Refresh" size={'lg'} onClick={get}>
                <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
              </ActionIcon>
              <Button
                className=" gap-x-2 bg-mainPurple"
                onClick={() => setShowExport(true)}
                variant="filled"
              >
                <BiExport size={20} className="mr-2" />
                Export
              </Button>
            </div>
          }
        />
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain */}
      {loading && <TableSkeleton columns={columns} />}
      {error && (
        <div className="flex flex-col items-center w-full">
          <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
          <Button onClick={get} mt={3} className="flex items-center gap-x-2" px={3}>
            <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}
      <MainModal
        size={'lg'}
        isOpen={showModal || isEdit.status}
        title={isEdit.status ? 'Edit Academic Year' : 'New Academic Year'}
        onClose={() => {
          setShowModal(false);
          setIsEdit({
            status: false,
            data: null,
          });
        }}
        closeOnClickOutside={false}
      >
        <NewUpdateAcadYear
          isEdit={isEdit.status}
          data={isEdit.data}
          refetch={get}
          onClose={() => {
            setShowModal(false);
            setIsEdit({
              status: false,
              data: null,
            });
          }}
        />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={isView.status}
        title="View Academic Year"
        onClose={() => setIsView({ status: false, data: null })}
      >
        {/*  */}
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Teachers Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default AcademicYear;
