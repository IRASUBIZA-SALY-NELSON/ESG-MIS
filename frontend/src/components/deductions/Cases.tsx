'use client';
import NewUpdateTerm from '@/components/academics/NewUpdateTerm';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
// import { DataTable } from '@/components/core/data-table';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { DeleteIcon, EditIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import useGet from '@/hooks/useGet';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import CreateEditCase from './CreateEditCase';
import { CaseCategory } from '@/types/case-category.type';
import { deleteCaseCategory } from '@/utils/funcs';
import { ClipLoader } from 'react-spinners';
const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

const Cases: FC = () => {
  const { data, loading, error, get } = useGet<CaseCategory[]>('/case-categories/all');

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as CaseCategory | null,
  });
  const [isDeleting, setIsDeleting] = useState<CaseCategory | null>(null);

  const onEdit = (data: CaseCategory) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const columns: ColumnDef<CaseCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Case',
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{row.getValue('marks')}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon
            onClick={() => onEdit(row.original)}
            variant="transparent"
            color="blue"
            radius="xl"
          >
            <EditIcon />
          </ActionIcon>
          {isDeleting?.id == row.original.id ? (
            <ClipLoader color="blue" size={15} />
          ) : (
            <ActionIcon
              onClick={async () => {
                setIsDeleting(row.original);
                await deleteCaseCategory(row.original.id?.toString() as any);
                setIsDeleting(null);
                get();
              }}
              variant="transparent"
              color="blue"
              radius="xl"
            >
              <DeleteIcon />
            </ActionIcon>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className=" flex flex-col  w-full">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Discpline Cases</h1>
        <Button
          className=" gap-x-2 bg-mainPurple"
          onClick={() => setShowModal(true)}
          variant="filled"
        >
          New Case
        </Button>
      </div>
      {!loading && (
        <DataTable
          searchKey="name"
          data={data}
          columns={columns}
          tableClass="h-[60vh]"
          actionElement={
            <RefreshExportComponent onRefresh={get} loading={loading} hideExport hideImport />
          }
        />
      )}

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
        title={isEdit.data ? 'Edit Case ' : 'New Case'}
        onClose={() => {
          setShowModal(false);
          setIsEdit({
            status: false,
            data: null,
          });
        }}
        closeOnClickOutside={false}
      >
        <CreateEditCase
          defaultValue={isEdit.data as any}
          close={() => {
            setShowModal(false);
            setIsEdit({
              status: false,
              data: null,
            });
            get();
          }}
        />
      </MainModal>
    </div>
  );
};

export default Cases;
