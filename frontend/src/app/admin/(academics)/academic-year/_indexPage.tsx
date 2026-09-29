'use client';
import NewUpdateAcadYear from '@/components/academics/NewUpdateAcadYear';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
// import { DataTable } from '@/components/core/data-table';
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
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import CloseAcademicYear from '@/components/academics/CloseAcademicYear';

const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

interface Props {
  academicYears: IAcademicYear[];
}

const AcademicYear: FC<Props> = ({ academicYears }) => {
  const { data, loading, error, get } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: academicYears,
  });
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as IAcademicYear | null,
  });
  const [isClose, setIsClose] = useState({
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

  const onClose = (data: IAcademicYear) => {
    setIsClose({
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
    // actions
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          {/* <ActionIcon
            onClick={() => onView(row.original)}
            variant="transparent"
            color="red"
            radius="xl"
          >
            <EyeIcon />
          </ActionIcon> */}
          <ActionIcon
            onClick={() => onEdit(row.original)}
            variant="transparent"
            color="blue"
            radius="xl"
          >
            <EditIcon />
          </ActionIcon>
          {row.original.status === 'ACTIVE' && (
            <button
              className="bg-mainPurple px-4 py-2 rounded-md text-white"
              onClick={() => onClose(row.original)}
            >
              Close
            </button>
          )}
        </div>
      ),
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
      {!loading && !error && (
        <DataTable
          searchKey="name"
          data={data}
          columns={columns}
          tableClass="h-[60vh]"
          actionElement={
            <RefreshExportComponent
              onExport={() => setShowExport(true)}
              onImport={() => setShowImport(true)}
              onRefresh={get}
              loading={loading}
            />
          }

          // searchElement={<p>ele</p>}
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
      {/* add/update modal */}
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
      {/* view modal */}
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
        title="Export Academic year"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={isClose.status}
        onClose={() => {
          setShowModal(false);
          setIsClose({
            status: false,
            data: null,
          });
        }}
        closeOnClickOutside={false}
      >
        <CloseAcademicYear
          data={isClose.data as any}
          onClose={() =>
            setIsClose({
              status: false,
              data: null,
            })
          }
          refetch={get}
        />
      </MainModal>
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Academic Year"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal="courses"
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <ExcelImportPreviewer data={data} />}
        />
      </MainModal>
    </div>
  );
};

export default AcademicYear;
