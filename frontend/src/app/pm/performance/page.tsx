'use client';
import NewClass from '@/components/classes';
import AssignLesson from '@/components/classes/assignLesson';
import DeleteClass from '@/components/classes/deleteClass';
import EditClass from '@/components/classes/editClass';
import { DataTable } from '@/components/core/data-table';
import MainModal from '@/components/core/modals/modal';
import useDelete from '@/hooks/useDelete';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { ImShuffle } from 'react-icons/im';
import ViewAssignedLesson from '@/components/classes/viewAssignedLessons';
import ImportForm from '@/components/core/data-table/ImportForm';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import ShuffleClass from '@/components/classes/shuffleClass';
import drop from '@/assets/dropdown.svg';
import { IAcademicYear } from '@/types/other.type';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Button as NextUiButton,
} from '@nextui-org/react';
import Image from 'next/image';
import ExportPerformance from '@/components/academics/ExportPerformance';

const ClassesPage = () => {
  const [activeYear, setActiveYear] = useState<IAcademicYear | null>(null);
  const {
    data: years,
    loading: yearsLoading,
    error: yearsError,
    get: getYears,
  } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });
  const {
    data: content,
    error,
    get,
    loading,
  } = useGet<any>(activeYear ? `/classes/all/year/${activeYear.id}` : undefined, {
    defaultData: [],
  });
  useEffect(() => {
    if (years) {
      const activeYear = years.find((year) => year.status === 'ACTIVE');
      activeYear ? setActiveYear(activeYear) : setActiveYear(null);
    }
  }, [years]);
  useEffect(() => {
    if (activeYear) {
      get();
    }
  }, [activeYear]);
  const [isShuffle, setIsShuffle] = useState({
    status: false,
    data: null as any,
  });
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as any,
  });
  const [isView, setIsView] = useState({
    status: false,
    data: null as any,
  });
  const [isDelete, setIsDelete] = useState({
    status: false,
    data: null as any,
  });
  const onEdit = (data: any) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const [classId, setClassId] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState<boolean>(false);

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
  };

  const columns: ColumnDef<IClass>[] = [
    {
      accessorKey: 'className',
      header: 'Class Name',
      cell: ({ row }) => <div className="capitalize">{row.getValue('className')}</div>,
    },
    {
      accessorKey: 'classTeacher',
      header: 'Headteacher Name',
      cell: ({ row }) => (
        <div className="capitalize">
          {(row.original.classTeacher?.firstName ?? '-') +
            ' ' +
            (row.original.classTeacher?.lastName ?? '-')}
        </div>
      ),
    },
    {
      accessorKey: 'studentsNumber',
      header: 'Student No',
      cell: ({ row }) => <div className="capitalize">{row.getValue('studentsNumber')}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div
          className="flex gap-2"
          onClick={() => {
            setClassId(row.original.id);
            setModalIsOpen(true);
          }}
        >
          <button className="px-10 py-3 text-white bg-mainPurple rounded-2xl font-semibold">
            Export Performance
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="flex flex-col w-full gap-y-3">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold text-2xl text-gray-800">Performance</h1>
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => {
              setClassId(null);
              setModalIsOpen(true);
            }}
            className="rounded-lg bg-primary text-white"
          >
            Export School Performance
          </Button>
          {years && (
            <Dropdown className="bg-[#DCEBE3]">
              <DropdownTrigger>
                <NextUiButton className="border-[1px] border-primary rounded-lg p-3  text-[80%]">
                  Filter by{' '}
                  <span className="ml-2 text-primary font-bold">
                    {activeYear?.name || 'Select Year'}
                  </span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </NextUiButton>
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
      <MainModal
        title="Export Performance"
        onClose={() => {
          setClassId(null);
          setModalIsOpen(false);
        }}
        size={'lg'}
        isOpen={modalIsOpen}
        closeOnClickOutside={false}
      >
        <ExportPerformance
          data={{ classId: classId }}
          onClose={() => {
            get();
            setClassId(null);
            setModalIsOpen(false);
          }}
          academicYearId={activeYear?.id || ''}
        />
      </MainModal>
      <DataTable searchKey="className" columns={columns} loading={loading} data={content} />

      {error && (
        <div className="flex flex-col irtems-center w-full">
          <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
          <Button onClick={get} mt={3} className="flex w-fit items-center gap-x-2" px={3}>
            <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
export default ClassesPage;
