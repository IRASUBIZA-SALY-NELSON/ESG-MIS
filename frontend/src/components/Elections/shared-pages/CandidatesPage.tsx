'use client';
import AssignCandidatePositions from '@/components/Elections/AssignCandidatePositions';
import NewUpdateCandidate from '@/components/Elections/NewUpdateCandidate';
import ExportForm from '@/components/core/data-table/ExportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
// import { DataTable } from '@/components/core/data-table';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { ICandidate } from '@/types/other.type';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { FaEye, FaTasks } from 'react-icons/fa';

const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

const CandidatePage = () => {
  const { data, loading, error, get } = useGet<ICandidate[]>('/candidates/all', {
    defaultData: [],
  });
  const [showExport, setShowExport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as ICandidate | null,
  });
  const [isView, setIsView] = useState({
    status: false,
    data: null as ICandidate | null,
  });
  const [isAssign, setIsAssign] = useState({
    status: false,
    data: null as ICandidate | null,
  });

  const onEdit = (data: ICandidate) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const onAssign = (data: ICandidate) => {
    setIsAssign({
      status: true,
      data,
    });
  };

  const onView = (data: ICandidate) => {
    setIsView({
      status: true,
      data,
    });
  };

  const columns: ColumnDef<ICandidate>[] = [
    {
      accessorKey: 'firstName',
      header: 'Candidate Name',
      cell: ({ row }) => (
        <div>
          {row.original?.student?.firstName} {row.original?.student?.lastName}{' '}
        </div>
      ),
    },
    {
      header: 'Gender',
      cell: ({ row }) => <div>{row.original?.student?.gender}</div>,
    },
    {
      header: 'Class',
      cell: ({ row }) => <div>{row.original?.student?.currentClass?.className}</div>,
    },
    {
      header: 'Assign Positions',
      cell: ({ row }) => (
        <div>
          <ActionIcon onClick={() => onAssign(row.original)} variant="transparent" radius="xl">
            <FaTasks />
          </ActionIcon>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon onClick={() => onView(row.original)} variant="transparent" radius="xl">
            <FaEye />
          </ActionIcon>
          <ActionIcon onClick={() => onEdit(row.original)} variant="transparent" radius="xl">
            <EditIcon />
          </ActionIcon>
        </div>
      ),
    },
  ];

  return (
    <div className=" flex flex-col  w-full">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Candidates</h1>
        <Button
          className=" gap-x-2 bg-mainPurple"
          onClick={() => setShowModal(true)}
          variant="filled"
        >
          New Candidate
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
        title={isEdit.status ? 'Edit Candidate' : 'New Candidate'}
        onClose={() => {
          setShowModal(false);
          setIsEdit({
            status: false,
            data: null,
          });
        }}
        closeOnClickOutside={false}
      >
        <NewUpdateCandidate
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
      {/* assign modal */}
      <MainModal
        size={'lg'}
        isOpen={isAssign.status}
        title={`Assign ${isAssign.data?.student?.firstName} ${isAssign.data?.student?.lastName} Position`}
        onClose={() => setIsAssign({ status: false, data: null })}
      >
        <AssignCandidatePositions
          data={isAssign.data}
          onClose={() => setIsAssign({ status: false, data: null })}
          refetch={get}
        />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Candidate"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default CandidatePage;
