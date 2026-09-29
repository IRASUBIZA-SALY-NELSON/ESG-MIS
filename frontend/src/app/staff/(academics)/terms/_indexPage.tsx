'use client';
import NewUpdateTerm from '@/components/academics/NewUpdateTerm';
// import { DataTable } from '@/components/core/data-table';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { EditIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { ITerm } from '@/types/other.type';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

interface Props {
  terms: ITerm[];
}

const TermIndex: FC<Props> = ({ terms }) => {
  const { data, loading, error, get } = useGet<ITerm[]>('/terms/all', {
    defaultData: terms,
    // onMount: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as ITerm | null,
  });
  const [isView, setIsView] = useState({
    status: false,
    data: null as ITerm | null,
  });

  const onEdit = (data: ITerm) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const onView = (data: ITerm) => {
    setIsView({
      status: true,
      data,
    });
  };

  const columns: ColumnDef<ITerm>[] = [
    {
      accessorKey: 'name',
      header: 'Term Name',
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => <SortButton column={column} name="Start Date" />,
      cell: ({ row }) => <div>{dayjs(row.getValue('startDate')).format('DD/MM/YYYY')}</div>,
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => <SortButton column={column} name="End Date" />,
      cell: ({ row }) => <div>{dayjs(row.getValue('endDate')).format('DD/MM/YYYY')}</div>,
    },
    // actions
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon
            onClick={() => onView(row.original)}
            variant="transparent"
            color="red"
            radius="xl"
          >
            <EyeIcon />
          </ActionIcon>
          <ActionIcon
            onClick={() => onEdit(row.original)}
            variant="transparent"
            color="blue"
            radius="xl"
          >
            <EditIcon />
          </ActionIcon>
        </div>
      ),
    },
  ];

  return (
    <div className=" flex flex-col  w-full">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Terms</h1>
        <Button
          className=" gap-x-2 bg-mainPurple"
          onClick={() => setShowModal(true)}
          variant="filled"
        >
          New Term
        </Button>
      </div>
      {!loading && (
        <DataTable
          searchKey="name"
          data={data}
          columns={columns}
          tableClass="h-[60vh]"
          // searchElement={<p>ele</p>}
        />
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain */}
      {loading && (
        // <div className=" w-full flex items-center justify-center">
        //   <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
        // </div>
        <TableSkeleton columns={columns} />
      )}
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
        title={isEdit.status ? 'Edit Term' : 'New Term'}
        onClose={() => {
          setShowModal(false);
          setIsEdit({
            status: false,
            data: null,
          });
        }}
        closeOnClickOutside={false}
      >
        <NewUpdateTerm
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
        title="View Term"
        onClose={() => setIsView({ status: false, data: null })}
      >
        {/*  */}
      </MainModal>
    </div>
  );
};

export default TermIndex;
