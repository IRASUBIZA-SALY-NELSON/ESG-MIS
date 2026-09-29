'use client';
import AddUpdateStudentMarks from '@/components/academics/AddUpdateStudentMarks';
import { DataTable } from '@/components/core/data-table';
import SearchForm from '@/components/core/data-table/SearchForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import useSearch from '@/hooks/useSearch';
import { Student } from '@/types/student.types';
import { getCourseWeight } from '@/utils/funcs';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef, Table } from '@tanstack/react-table';
import { useParams, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { SlRefresh } from 'react-icons/sl';

type Props = {
  termId: string;
};

const AddMarks = ({ termId }: Props) => {
  const [weight, setWeight] = useState<number | null>(null);
  const [searchKey, setSearchKey] = useState('name');
  const query = useParams();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const courseId = searchParams.get('courseId');
  const acaYearId = searchParams.get('academicYearId');
  // const termId = searchParams.get('termId');
  const { data, loading, error, get, setData } = useGet<any[]>(
    `/student-class-term/class/term?classId=${classId}&termId=${termId}`,
  );
  const {
    setInput,
    input,
    data: searchData,
  } = useSearch<any>(`/students/all/search/paginated`, {
    defaultData: data ?? [],
    searchKey: 'studentName',
    throttleTime: 500,
    setTableData: setData,
    get,
  });

  const [editMarks, setEditMarks] = useState({
    status: false,
    data: null as Student | null,
  });

  // get course weight
  useEffect(() => {
    getCourseWeight(courseId).then((res) => setWeight(res));
  }, [courseId]);

  useEffect(() => {
    if (termId) {
      get();
    }
  }, [termId]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'firstName',
      header: ({ column }) => <SortButton column={column} name="First Name" />,
      cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
    },
    {
      accessorKey: 'lastName',
      header: ({ column }) => <SortButton column={column} name="Last Name" />,
      cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Student Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <div>{row.getValue('gender')}</div>,
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    },
  ];

  const searchStudents = (e: ChangeEvent<HTMLInputElement>, table: Table<any>) => {
    table?.getColumn(searchKey)?.setFilterValue(e.target.value);
  };

  const title = `${decodeURIComponent(query.course.toString())} (${decodeURIComponent(
    query.class.toString(),
  )})`;

  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
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
      {/* data-table */}
      {!loading && !error && data && (
        <DataTable
          noDataMessage="No students found"
          renderCustomElement={(table) => {
            return (
              <div className="flex md:items-center md:flex-row flex-col pb-3 justify-between gap-3 w-full ">
                <SearchForm setInput={setInput} table={table} searchKey="firstName" />
                <div className="flex items-center gap-x-3">
                  <ActionIcon title="Refresh" size={'lg'} onClick={get}>
                    <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
                  </ActionIcon>
                </div>
              </div>
            );
          }}
          data={data ?? []}
          columns={columns}
          limit={30}
        />
      )}
      {/* Modals */}
      <MainModal
        isOpen={editMarks.status}
        onClose={() => setEditMarks({ status: false, data: null })}
        title={`Edit ${editMarks.data?.firstName} ${
          editMarks.data?.lastName
        } Marks in ${decodeURIComponent(query?.course.toString())}`}
        size={'xl'}
        closeOnClickOutside={false}
      >
        <AddUpdateStudentMarks
          student={editMarks.data}
          refetch={get}
          onClose={() => setEditMarks({ status: false, data: null })}
        />
      </MainModal>
    </div>
  );
};

export default AddMarks;
