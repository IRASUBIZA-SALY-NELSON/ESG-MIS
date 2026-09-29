'use client';
import NewUpdateAcadYear from '@/components/academics/NewUpdateAcadYear';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
// import { DataTable } from '@/components/core/data-table';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { DeleteIcon, EditIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import { IPosition } from '@/types/other.type';
import NewUpdatePosition from '@/components/Elections/NewUpdatePosition';
import { FaTasks } from 'react-icons/fa';
import useDelete from '@/hooks/useDelete';
import DeleteForm from '@/components/core/data-table/DeleteForm';

const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

const PositionsPage = () => {
  const { data, loading, error, get } = useGet<IPosition[]>('/positions/all', {
    defaultData: [],
  });
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { deleteData, loading: deleteLoading } = useDelete('/positions/delete_position');
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as IPosition | null,
  });
  const [isView, setIsView] = useState({
    status: false,
    data: null as IPosition | null,
  });
  const [isAssign, setIsAssign] = useState({
    status: false,
    data: null as IPosition | null,
  });
  const [isDelete, setIsDelete] = useState({
    status: false,
    data: null as IPosition | null,
  });

  const onEdit = (data: IPosition) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const onAssign = (data: IPosition) => {
    setIsAssign({
      status: true,
      data,
    });
  };

  const onDelete = (data: IPosition) => {
    setIsDelete({
      status: true,
      data,
    });
  };

  const columns: ColumnDef<IPosition>[] = [
    {
      accessorKey: 'name',
      header: 'Position Name',
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          {/* <ActionIcon onClick={() => onAssign(row.original)} variant="transparent" radius="xl">
            <FaTasks />
          </ActionIcon> */}
          <ActionIcon
            onClick={() => onEdit(row.original)}
            variant="transparent"
            color="blue"
            radius="xl"
          >
            <EditIcon />
          </ActionIcon>

          <ActionIcon
            onClick={() => onDelete(row.original)}
            variant="transparent"
            color="red"
            radius="xl"
          >
            <DeleteIcon />
          </ActionIcon>
        </div>
      ),
    },
  ];

  return (
    <div className=" flex flex-col  w-full">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Positions</h1>
        <Button
          className=" gap-x-2 bg-mainPurple"
          onClick={() => setShowModal(true)}
          variant="filled"
        >
          New Position
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
              hideImport
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
        title={isEdit.status ? 'Edit Position' : 'New Position'}
        onClose={() => {
          setShowModal(false);
          setIsEdit({
            status: false,
            data: null,
          });
        }}
        closeOnClickOutside={false}
      >
        <NewUpdatePosition
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
        title="View Position"
        onClose={() => setIsView({ status: false, data: null })}
      >
        {/*  */}
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={isAssign.status}
        title={`Assign Candidates to  ${isAssign.data?.name} Position`}
        onClose={() => setIsAssign({ status: false, data: null })}
      >
        {/*  */}
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Position"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
      {/* delete modal */}
      <MainModal
        size={'lg'}
        isOpen={isDelete.status}
        title="Delete Position"
        onClose={() => setIsDelete({ status: false, data: null })}
      >
        <DeleteForm
          onCancel={() => setIsDelete({ status: false, data: null })}
          onDelete={() => {
            deleteData(isDelete.data?.id);
            setIsDelete({ status: false, data: null });
            get();
          }}
          title={`${isDelete.data?.name} Position`}
          loading={deleteLoading}
        />
      </MainModal>
    </div>
  );
};

export default PositionsPage;
