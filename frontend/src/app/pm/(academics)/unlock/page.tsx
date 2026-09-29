'use client';
import { DataTable } from '@/components/core/data-table';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { ActionIcon, Button, Select } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import UnlockAllClassLessons from '@/components/classes/unlockAllLessons';
import UnlockManyStudents from '@/components/classes/unlockManyStudents';
import PMUnlockSingleLesson from '@/components/classes/unlockSingleLesson';
import { SlRefresh } from 'react-icons/sl';
import { FaLockOpen } from 'react-icons/fa';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import { IAcademicYear } from '@/types/other.type';

const defaultAssign = {
  update: false,
  data: null as any,
  view: false,
  manyStudents: false,
};

const PMClassesPage = () => {
  const [acadId, setAcadId] = useState('');
  const {
    data: academicYears,
    get: fetchAcademicYears,
    loading: loadingAcademicYears,
  } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });
  const {
    data: content,
    error,
    get,
    loading,
  } = useGet<any>(acadId ? `/classes/all/year/${acadId}` : '/classes/all/current-year', {
    defaultData: [],
  });
  useEffect(() => {
    if (acadId) {
      get();
    }
  }, [acadId]);
  const [isView, setIsView] = useState({
    status: false,
    data: null as any,
  });
  const [isAssign, setIsAssign] = useState(defaultAssign);
  const onAssign = (data: any) => {
    console.log(data);
    setIsAssign({
      manyStudents: false,
      update: true,
      data,
      view: false,
    });
  };
  const onLockStudents = (data: any) => {
    console.log(data);
    setIsAssign({
      manyStudents: true,
      data,
      view: false,
      update: false,
    });
  };
  const onView = (data: any) => {
    setIsView({
      data,
      status: true,
    });
  };
  useEffect(() => {
    if (academicYears) {
      setAcadId(academicYears.filter((year) => year.status == 'ACTIVE')[0]?.id ?? '');
    }
  }, [academicYears]);

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
      header: 'Lessons No',
      cell: ({ row }) => <div className="capitalize">{row.original.coursesList?.length}</div>,
    },
    {
      accessorKey: 'assignLessons',
      header: 'Unlock Or Lock All Lessons',
      cell: ({ row }) => (
        <ActionIcon variant="transparent" onClick={() => onAssign(row.original)}>
          <FaLockOpen className={'text-[#0357BD]'} size={20} />
        </ActionIcon>
      ),
    },
    {
      accessorKey: 'lockStudent',
      header: 'Unlock Or Lock per Student',
      cell: ({ row }) => (
        <ActionIcon variant="transparent" onClick={() => onLockStudents(row.original)}>
          <FaLockOpen className={'text-[#0357BD]'} size={20} />
        </ActionIcon>
      ),
    },
    {
      accessorKey: 'lessons',
      header: 'Unlock Or Lock Lesson',
      cell: ({ row }) => (
        <ActionIcon variant="transparent" onClick={() => onView(row.original)}>
          <FaLockOpen className={'text-[#0357BD]'} size={20} />
        </ActionIcon>
      ),
    },
  ];
  return (
    <div className="flex flex-col w-full gap-y-3">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Unlock Or Lock Edit Marks Access</h1>
      </div>
      <MainModal
        className="pl-11"
        title="Unlock All Lessons"
        onClose={() => setIsAssign(defaultAssign)}
        size={'lg'}
        isOpen={isAssign.update || isAssign.view}
      >
        <UnlockAllClassLessons
          data={isAssign.data}
          onClose={() => {
            get();
            setIsAssign(defaultAssign);
          }}
          disabled={isAssign.view}
          academicYearId={acadId}
        />
      </MainModal>
      <MainModal
        className="pl-11"
        title="Unlock/Lock Marks for many students"
        onClose={() => setIsAssign(defaultAssign)}
        size={'lg'}
        isOpen={isAssign.manyStudents}
      >
        <UnlockManyStudents
          data={isAssign.data}
          onClose={() => {
            get();
            setIsAssign(defaultAssign);
          }}
          disabled={isAssign.view}
          academicYearId={acadId}
        />
      </MainModal>
      <MainModal
        className="pl-11"
        title="Unlock Single Lesson"
        onClose={() =>
          setIsView({
            status: false,
            data: null,
          })
        }
        size={'lg'}
        isOpen={isView.status}
      >
        <PMUnlockSingleLesson
          data={isView.data}
          academicYearId={acadId}
          onClose={() =>
            setIsView({
              status: false,
              data: null,
            })
          }
        />
      </MainModal>
      {!loading && content && (
        <>
          <div className="flex items-center gap-2 justify-end">
            <ActionIcon title="Refresh" size="lg" onClick={get} className="mr-5">
              <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
            </ActionIcon>
            <div>
              <p className="text-sm text-gray-500">Filter By Year</p>
              <Select
                data={academicYears?.map((year) => ({ label: year.name, value: year.id })) as any}
                placeholder={'Select Year'}
                value={acadId}
                onChange={(value) => value && setAcadId(value)}
                className="w-full md:w-fit px-3 py-2 text-base text-black font-semibold  border-none outline-none"
              />
            </div>
          </div>
          <DataTable
            searchKey="className"
            columns={columns}
            data={content}
            loading={loading || loadingAcademicYears}
          />
        </>
      )}
      {error && (
        <div className="flex flex-col items-center w-full">
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
export default PMClassesPage;
