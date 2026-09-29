'use client';
import AssignSessionPositions from '@/components/Elections/AssignSessionPositions';
import NewUpdateSession from '@/components/Elections/NewUpdateSession';
import ExportForm from '@/components/core/data-table/ExportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
// import { DataTable } from '@/components/core/data-table';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { ISession } from '@/types/other.type';
import { baseUrl } from '@/utils/constants';
import { ActionIcon, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ColumnDef } from '@tanstack/react-table';
import { getCookie } from 'cookies-next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next13-progressbar';
import { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiExport } from 'react-icons/bi';
import { FaEye, FaTasks } from 'react-icons/fa';

const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

const SessionsPage = () => {
  const { data, loading, error, get } = useGet<ISession[]>('/voting_sessions/all', {
    defaultData: [],
  });
  const [loadingExport, setLoadingExport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as ISession | null,
  });
  const [isAssign, setIsAssign] = useState({
    status: false,
    data: null as ISession | null,
  });
  const router = useRouter();

  const onEdit = (data: ISession) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const onAssign = (data: ISession) => {
    setIsAssign({
      status: true,
      data,
    });
  };

  const handleExportExcel = async (sessionId: string) => {
    setLoadingExport(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/exporting/election-results/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
        },
      });
      const blob = await res.blob();
      // export blob
      const url = window.URL.createObjectURL(blob);
      // window.open(url, '_blank');
      const link = document.createElement('a');
      link.href = url;
      const session = data?.find((item) => item.id === sessionId);
      link.download = `${session?.title}-Results.xlsx`;
      link.click();
      link.remove();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'There has been an error in generating the excel!',
        color: 'red',
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const columns: ColumnDef<ISession>[] = [
    {
      accessorKey: 'title',
      header: 'Session Title',
    },
    // start date
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => <span>{new Date(row.original.startDate).toLocaleString()}</span>,
    },
    // end date
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => <span>{new Date(row.original.endDate).toLocaleString()}</span>,
    },
    {
      header: 'Assign Positions',
      cell: ({ row }) => (
        <ActionIcon onClick={() => onAssign(row.original)} variant="transparent" radius="xl">
          <FaTasks />
        </ActionIcon>
      ),
    },
    {
      accessorKey: 'Voting',
      header: ({ column }) => (
        <div className=" text-center justify-center w-full flex mx-auto">Voting</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-x-2">
          <Button
            onClick={() => router.push(`sessions/voters/${row.original.id}`)}
            variant="outline"
            radius="0"
          >
            View votes
          </Button>
        </div>
      ),
    },
    {
      header: 'Export Results',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <Button
            onClick={() => handleExportExcel(row.original.id)}
            variant="outline"
            radius="0"
            color="green"
            loading={loadingExport}
            disabled={loadingExport}
            leftSection={<BiExport />}
          >
            Export Excel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className=" flex flex-col  w-full">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Sessions</h1>
        <Button
          className=" gap-x-2 bg-mainPurple"
          onClick={() => setShowModal(true)}
          variant="filled"
        >
          New Session
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
              onRefresh={get}
              hideImport
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
        title={isEdit.status ? 'Edit Session' : 'New Session'}
        onClose={() => {
          setShowModal(false);
          setIsEdit({
            status: false,
            data: null,
          });
        }}
        closeOnClickOutside={false}
      >
        <NewUpdateSession
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
        isOpen={isAssign.status}
        title={`Assign Position to  ${isAssign.data?.title}`}
        onClose={() => setIsAssign({ status: false, data: null })}
      >
        <AssignSessionPositions
          onClose={() => setIsAssign({ status: false, data: null })}
          data={isAssign.data}
          refetch={get}
        />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Session"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default SessionsPage;
