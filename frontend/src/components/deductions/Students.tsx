'use client';
import { DataTable } from '@/components/core/data-table';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import useSearch from '@/hooks/useSearch';
import { IClass } from '@/types/class.type';
import { Student } from '@/types/student.types';
import { ActionIcon, Select } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import 'react-loading-skeleton/dist/skeleton.css';
import SearchForm from '@/components/core/data-table/SearchForm';
import { SlRefresh } from 'react-icons/sl';
import TermClassAcademicSort from '@/components/core/filters/TermClassAcademicSort';
import DeductStudent from '@/components/staff/ds/DeductStudent';
import DeductMany from '@/components/deductions/DeductSelected';
import DeductClass from '@/components/deductions/DeductClass';
import { getAcademicYears, getTermsInYear } from '@/utils/funcs';
import { getCurrentTerm, getCurrentYear } from '@/utils/funcs/func2';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { CiSearch } from 'react-icons/ci';

interface IsDeductData {
  firstName?: string;
  lastName?: string;
  id?: string;
}

const Students = () => {
  const [isDeduct, setIsDeduct] = useState<{ status: boolean; data: IsDeductData | null }>({
    status: false,
    data: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeductClass, setIsDeductClass] = useState<boolean>(false);
  const [deductMany, setDeductMany] = useState(false);
  const onDeduct = (data: any) => {
    setIsDeduct({
      status: true,
      data,
    });
  };
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
  const { data: classes, get: fetchClasses } = useGet<IClass[]>(
    selectedFilters.academicYear
      ? `/classes/all/year/${selectedFilters.academicYear}`
      : '/classes/all',
    {
      defaultData: [],
    },
  );

  useEffect(() => {
    if (!selectedFilters.academicYear) {
      setSelectedFilters({
        academicYear: academicYears?.find((year) => year.status === 'ACTIVE')?.id || '',
        classId: '',
        term: '',
      });
    }
  }, [academicYears]);

  useEffect(() => {
    if (academicYears && selectedFilters.academicYear) {
      fetchTerms();
      setSelectedFilters((prev) => ({ ...prev, term: '' }));
    }
  }, [selectedFilters.academicYear, academicYears]);
  useEffect(() => {
    if (selectedFilters.academicYear) {
      fetchClasses();
      setSelectedFilters((prev) => ({ ...prev, classId: '' }));
    }
  }, [selectedFilters.academicYear]);
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
    paginated: Boolean(selectedFilters.academicYear),
    pagination: {
      limit: 30,
    },
    query: {
      academicYearId: selectedFilters.academicYear,
      classId: selectedFilters.classId,
      termId: selectedFilters.term,
      searchQuery,
    },
  });

  useEffect(() => {
    if (!selectedFilters.academicYear) return;
    getPaginated();
  }, [selectedFilters, searchQuery]);

  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
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
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'currentClazz',
      header: ({ column }) => <SortButton column={column} name="Current Class" />,
      cell: ({ row }) => <div>{row.getValue<IClass>('currentClazz')?.className}</div>,
    },
    {
      header: 'Deduct/Add',
      cell: ({ row }) => (
        <div className="flex items-center  justify-center">
          <button
            onClick={() => onDeduct(row.original)}
            disabled={
              selectedFilters.academicYear !==
              academicYears?.find((year) => year.status === 'ACTIVE')?.id
            }
            className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-3 py-1.5"
          >
            - / +
          </button>
        </div>
      ),
    },
  ];
  useEffect(() => {
    if (students) {
      setFilteredStudents(students);
    }
  }, [students]);
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
        className="w-fit px-3 py-2 text-base text-black font-semibold  border-none outline-none"
      />
    );
  };
  return (
    <div>
      <div className="flex justify-end mb-5">
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setIsDeductClass(true)}
            className="px-4 py-2 bg-mainPurple text-white rounded-md"
          >
            Deduct/Add to Class
          </button>
          <button
            onClick={() => setDeductMany(true)}
            className="px-4 py-2 bg-mainPurple text-white rounded-md"
          >
            Deduct/Add to Many
          </button>
        </div>
      </div>
      <MainModal onClose={() => setIsDeductClass(false)} size={'lg'} isOpen={isDeductClass}>
        <DeductClass
          onCancel={() => {
            setIsDeductClass(false);
          }}
          refetch={getPaginated}
        />
      </MainModal>
      <MainModal onClose={() => setDeductMany(false)} size={'lg'} isOpen={deductMany}>
        <DeductMany
          onCancel={() => {
            setDeductMany(false);
          }}
          refetch={getPaginated}
        />
      </MainModal>
      <MainModal
        onClose={() => setIsDeduct({ status: false, data: null })}
        size={'lg'}
        isOpen={isDeduct.status}
      >
        <DeductStudent
          studentName={isDeduct.data?.firstName + ' ' + isDeduct.data?.lastName}
          termId={selectedFilters.term}
          studentId={isDeduct.data?.id as string}
          onCancel={() => {
            setIsDeduct({ status: false, data: null });
          }}
          refetch={getPaginated}
        />
      </MainModal>

      <div className="flex items-center gap-10 mb-5">
        <div className="relative w-[20rem]">
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
        <div className=" flex gap-2 justify-end flex-grow ">
          <FilterDropDown
            filterKey="academicYear"
            placeholderText="Select Academic Year"
            data={academicYears?.map((year) => ({ label: year.name, value: year.id })) as any}
          />
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
              <FilterDropDown
                filterKey="classId"
                placeholderText="Select Class"
                data={
                  classes?.map((classItem) => ({
                    label: classItem.className,
                    value: classItem.id,
                  })) || []
                }
              />
            </>
          )}
        </div>
      </div>
      {loading && <TableSkeleton columns={columns} />}
      {!loading && !error && (
        <DataTable
          // searchKey="firstName"
          columns={columns}
          data={filteredStudents ?? []}
          noDataMessage="No students found"
          paginationProps={{
            isPaginated: true,
            setPaginateOpts,
            paginateOpts,
          }}
          limit={30}
        />
      )}
    </div>
  );
};

export default Students;
