'use client';
import ViewReportCard from '@/components/academics/ViewReportCard';
import { DataTable } from '@/components/core/data-table';
import MainModal from '@/components/core/modals/modal';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import { AuthApi, baseUrl } from '@/utils/constants';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { Student } from '@/types/student.types';
import { ActionIcon, Button, Input, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { HiDocumentReport } from 'react-icons/hi';
import { ClipLoader } from 'react-spinners';
import { getCookie } from 'cookies-next';
import { CiSearch } from 'react-icons/ci';
import { useUserContext } from '@/context/Usercontext';

const StaffReportsPage = () => {
  const { profile } = useUserContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState({
    status: false,
    student: null as Student | null,
    academicYearId: '',
  });
  const [openRelease, setOpenRelease] = useState<any>('');
  const [_error, setError] = useState('');
  const [loadingExport, setLoadingExport] = useState<boolean>(false);

  const [selectedFilters, setSelectedFilters] = useState({
    academicYear: '',
    term: '',
    classId: '',
  });

  const { data: academicYears, get: fetchAcademicYears } = useGet<IAcademicYear[]>(
    '/academic-years/all',
    {
      defaultData: [],
    },
  );
  const { data: terms, get: fetchTerms } = useGet<ITerm[]>(
    selectedFilters.academicYear
      ? `/terms/all/academic-year/${selectedFilters.academicYear}`
      : '/terms/all',
    {
      defaultData: [],
    },
  );
  const { data: classes, get: fetchClasses } = useGet<IClass[]>(`/classes/all`, {
    defaultData: [],
  });

  useEffect(() => {
    if (academicYears && selectedFilters.academicYear) {
      fetchTerms();
      setSelectedFilters((prev) => ({ ...prev, term: '' }));
    }
  }, [selectedFilters.academicYear, academicYears]);
  useEffect(() => {
    if (terms && terms.length > 0) {
      setSelectedFilters((prev) => ({
        ...prev,
        term: terms[terms.length - 1].id,
      }));
    }
    if (classes && profile?.id) {
      const cl = classes.find((cls) => cls.classTeacher?.id === profile.id);
      if (cl?.id) {
        setSelectedFilters((prev) => ({
          ...prev,
          classId: cl.id,
        }));
        getPaginated();
      }
    }
  }, [classes, profile?.id, terms]);
  useEffect(() => {
    if (academicYears)
      setSelectedFilters((prev) => ({
        ...prev,
        academicYear: academicYears?.filter((year) => year.status == 'ACTIVE')[0]?.id || '',
      }));
  }, [academicYears]);

  const {
    data: students,
    getPaginated,
    loading,
    paginateOpts,
    setPaginateOpts,
    setData,
    error,
  } = useGet<Student[]>('/students/student/search', {
    defaultData: [],
    paginated: true,
    pagination: {
      limit: 30,
    },
    onMount: false,
    query: {
      academicYearId: selectedFilters.academicYear,
      classId: selectedFilters.classId,
      termId: selectedFilters.term,
      searchQuery,
    },
  });

  useEffect(() => {
    getPaginated();
  }, [selectedFilters, searchQuery]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <div>{row.getValue('gender')}</div>,
    },
    {
      accessorKey: 'currentClazz',
      header: 'Current Class',
      cell: ({ row }) => <div>{row.getValue<IClass>('currentClazz')?.className}</div>,
    },
    {
      header: 'View Report',
      cell: ({ row }) => (
        <ActionIcon
          variant="transparent"
          onClick={() =>
            setOpenReport({
              status: true,
              student: row.original,
              academicYearId: selectedFilters.academicYear,
            })
          }
        >
          <HiDocumentReport size={25} />
        </ActionIcon>
      ),
    },
  ];

  const onReleaseReportExportPerformance = (action: string) => {
    setError('');
    // if (selectedFilters.term === '') {
    //   setError('Select term to release report cards');
    //   notifications.show({
    //     title: 'Error',
    //     message: 'Select Academic year and term to release report cards',
    //     color: 'red',
    //   });
    //   return;
    // }
    setOpenRelease(action);
  };

  const FilterDropDown = ({
    placeholderText,
    data,
    filterKey,
  }: {
    placeholderText: string;
    data: any[];
    filterKey: keyof typeof selectedFilters;
  }) => {
    const displayValue = selectedFilters[filterKey] === 'All' ? '' : selectedFilters[filterKey];
    return (
      <Select
        data={data}
        placeholder={placeholderText}
        value={displayValue}
        onChange={(value) => setSelectedFilters((prev) => ({ ...prev, [filterKey]: value }))}
        className="w-full md:w-fit px-3 py-2 text-base text-black font-semibold  border-none outline-none"
      />
    );
  };

  if (!selectedFilters.classId && !loading) {
    return (
      <div className="w-full h-full overflow-hidden flex flex-col items-center justify-center text-center space-y-2">
        <p className="text-xl font-semibold text-primary-purple">No Class Assigned</p>
        <p className="text-gray-600">You currently have no classes assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <MainModal
        isOpen={openReport.status}
        title={`Report Card for ${openReport.student?.firstName} ${openReport.student?.lastName}`}
        onClose={() =>
          setOpenReport({
            status: false,
            student: null,
            academicYearId: '',
          })
        }
        size="1000"
        closeOnClickOutside={false}
      >
        <ViewReportCard student={openReport.student} />
      </MainModal>
      <div className="hidden sm:flex flex-row justify-between mb-5">
        <p className=" text-base font-semibold">Students Report Cards</p>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-y-3 gap-x-10 mb-5">
        <div className="relative w-full lg:w-[20rem]">
          <span className="absolute top-4 left-4">
            <CiSearch size={25} color="" />
          </span>
          <input
            name="search"
            className="w-full p-3 py-4 pl-12 text-base text-black placeholder:text-black rounded-full bg-[#005DE908] border-none outline-none"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className=" flex flex-col md:flex-row  gap-x-2 justify-end flex-grow ">
          {selectedFilters.academicYear && (
            <>
              <FilterDropDown
                filterKey="term"
                placeholderText="Select Term"
                data={
                  terms?.map((term) => ({
                    label: term.name.replace('_', ' '),
                    value: term.id,
                  })) as any
                }
              />
            </>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={students ?? []}
        loading={loading}
        noDataMessage="No students found"
        paginationProps={{
          isPaginated: true,
          setPaginateOpts,
          paginateOpts,
        }}
        limit={30}
      />
    </div>
  );
};

export default StaffReportsPage;
