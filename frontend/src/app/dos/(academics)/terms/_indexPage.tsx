'use client';
import NewUpdateTerm from '@/components/academics/NewUpdateTerm';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
import drop from '@/assets/dropdown.svg';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { EditIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import useGet from '@/hooks/useGet';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { ActionIcon, Button as MButton } from '@mantine/core';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { AuthApi } from '@/utils/constants';
const DataTable = dynamic(
  () => import('@/components/core/data-table').then((mod) => mod.DataTable),
  { ssr: false },
);

interface Props {
  terms: ITerm[];
}

const TermIndex: FC<Props> = ({ terms }) => {
  const [activeYear, setActiveYear] = useState<IAcademicYear | null>(null);
  const {
    data: years,
    loading: yearLoading,
    error: yearError,
    get: getYears,
  } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });
  const { data, loading, error, get } = useGet<ITerm[]>(
    activeYear ? `/terms/all/academic-year/${activeYear?.id}` : undefined,
    {
      defaultData: terms,
    },
  );

  useEffect(() => {
    if (years) {
      const activeYear = years.find((year) => year.status === 'ACTIVE');
      activeYear ? setActiveYear(activeYear) : setActiveYear(years[-1]);
    }
  }, [years]);

  const [showModal, setShowModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
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
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (activeYear) {
      get();
    }
  }, [activeYear]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className="font-semibold">Terms</h1>
        <div className="flex items-center gap-2">
          <MButton
            className="gap-x-2 bg-mainPurple"
            onClick={() => setShowModal(true)}
            variant="filled"
          >
            New Term
          </MButton>
          {years && (
            <Dropdown className="bg-[#DCEBE3]">
              <DropdownTrigger>
                <Button className="border-[1px] border-primary rounded-lg p-3  text-[80%]">
                  Filter by{' '}
                  <span className="ml-2 text-primary font-bold">
                    {activeYear?.name || 'Select Year'}
                  </span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {years.map((year, i) => (
                  <DropdownItem
                    key={i}
                    value={year.name}
                    className="hover:bg-[#0A6B4F89]"
                    onClick={() => setActiveYear(year)}
                  >
                    {year.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
      {yearLoading && <div>Loading academic years...</div>}
      {yearError && <div className="text-red-700">Error loading academic years: {yearError}</div>}
      {!loading && (
        <DataTable
          searchKey="name"
          data={data}
          columns={columns}
          tableClass="h-[60vh]"
          actionElement={
            <RefreshExportComponent
              onExport={() => setShowExport(true)}
              onImport={() => setShowImport(true)}
              onRefresh={() => get()}
              loading={loading}
            />
          }
        />
      )}
      {loading && <TableSkeleton columns={columns} />}
      {error && (
        <div className="flex flex-col items-center w-full">
          <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
          <MButton onClick={() => get()} mt={3} className="flex items-center gap-x-2" px={3}>
            <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </MButton>
        </div>
      )}
      {/* add/update modal */}
      <MainModal
        size={'lg'}
        isOpen={showModal || isEdit.status}
        title={isEdit.status ? 'Edit Term' : 'New Term'}
        onClose={() => {
          setShowModal(false);
          setIsEdit({ status: false, data: null });
        }}
        closeOnClickOutside={false}
      >
        <NewUpdateTerm
          isEdit={isEdit.status}
          data={isEdit.data}
          refetch={() => get()}
          onClose={() => {
            setShowModal(false);
            setIsEdit({ status: false, data: null });
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
        {/* View term content */}
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Term"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Term"
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

export default TermIndex;
