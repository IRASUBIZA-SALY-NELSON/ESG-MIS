'use client';
import NewUpdateCourse from '@/components/academics/NewUpdateCourse';
import DeleteForm from '@/components/core/data-table/DeleteForm';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { DeleteIcon, EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import useDelete from '@/hooks/useDelete';
import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import { IAcademicYear } from '@/types/other.type';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiExport, BiPlus } from 'react-icons/bi';
import { SlRefresh } from 'react-icons/sl';
import drop from '@/assets/dropdown.svg';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Button as NextUiButton,
} from '@nextui-org/react';
import Image from 'next/image';

const DataTable = dynamic(
  () => import('@/components/core/data-table').then((module) => module.DataTable),
  { ssr: false },
);

const CoursePage = () => {
  const [activeYear, setActiveYear] = useState<IAcademicYear | null>(null);
  const [showModal, setShowModal] = useState(false);
  const {
    data: years,
    loading: yearsLoading,
    error: yearsError,
    get: getYears,
  } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });
  const {
    data: coursesData,
    error: coursesError,
    get: getCourses,
    loading: coursesLoading,
  } = useGet<ICourse[]>(activeYear ? `/courses/all/year/${activeYear?.id}` : undefined, {
    defaultData: [],
  });
  const { deleteData, loading: deleteLoading } = useDelete('/courses/delete');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as ICourse | null,
  });
  const [isDelete, setIsDelete] = useState({
    status: false,
    data: null as ICourse | null,
  });

  const onEdit = (data: ICourse) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const onDelete = (data: ICourse) => {
    setIsDelete({
      status: true,
      data,
    });
  };

  useEffect(() => {
    if (years) {
      const activeYear = years.find((year) => year.status === 'ACTIVE');
      activeYear ? setActiveYear(activeYear) : setActiveYear(null);
    }
  }, [years]);

  const columns: ColumnDef<ICourse>[] = [
    {
      accessorKey: 'courseName',
      header: 'Course Name',
      cell: ({ row }) => <div>{row.getValue('courseName')}</div>,
    },
    {
      accessorKey: 'courseCredits',
      header: ({ column }) => <SortButton column={column} name="Course Credits" />,
      cell: ({ row }) => <div>{row.getValue('courseCredits')}</div>,
    },
    {
      accessorKey: 'courseWeight',
      header: 'Course Max Marks',
      cell: ({ row }) => <div>{row.getValue('courseWeight')}</div>,
    },
  ];

  useEffect(() => {
    if (activeYear) {
      getCourses();
    }
  }, [activeYear]);

  return (
    <div className=" flex flex-col  w-full h-full pb-40">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold text-xl text-gray-700">Courses</h1>
        <div className="flex items-center justify-center gap-2">
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
      {!coursesLoading && !coursesError && activeYear && (
        <DataTable
          searchKey="course name"
          data={coursesData}
          columns={columns}
          tableClass=""
          actionElement={
            <RefreshExportComponent
              hideImport
              onExport={() => setShowExport(true)}
              onRefresh={getCourses}
              loading={coursesLoading}
            />
          }
        />
      )}
      {coursesLoading && <TableSkeleton columns={columns} />}
      {coursesError && (
        <div className="flex flex-col items-center w-full">
          <span className="flex items-center justify-center text-red-700 text-sm">
            {coursesError}
          </span>
          <Button onClick={getCourses} mt={3} className="flex items-center gap-x-2" px={3}>
            <AiOutlineReload size={20} className={`mr-2 ${coursesLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Course Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={coursesData!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default CoursePage;
