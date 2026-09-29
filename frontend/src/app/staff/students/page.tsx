'use client';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { DarkEye, DeleteIcon, EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import AssignStudentClass from '@/components/students/AssignStudentClass';
import AssignStudentRole from '@/components/students/AssignStudentRole';
import DeleteConfirmation from '@/components/students/DeleteStudent';
import StudentImportGuide from '@/components/students/StudentImportGuide';
import StudentImportPreview from '@/components/students/StudentImportPreview';
import StudentProfile from '@/components/students/StudentProfile';
import { STUDENT_IMPORT_COLUMNS } from '@/components/students/studentImportColumns';
import useGet from '@/hooks/useGet';
import useSearch from '@/hooks/useSearch';
import { IClass } from '@/types/class.type';
import { Student } from '@/types/student.types';
import { AuthApi } from '@/utils/constants';
import { ActionIcon, Button, Select } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BiExport, BiImport } from 'react-icons/bi';
import { FaPlus, FaTasks } from 'react-icons/fa';
import 'react-loading-skeleton/dist/skeleton.css';
import closeStudentModal from '../../../assets/close.svg';
import deleteAccount from '../../../assets/deleteUserAvatar.svg';
import SearchForm from '@/components/core/data-table/SearchForm';
import { SlRefresh } from 'react-icons/sl';
import UpdatePicture from '@/components/Profile/UpdatePicture';
import { CiSearch } from 'react-icons/ci';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { Router } from 'next/router';
import { useRouter } from 'next13-progressbar';

const Page = () => {
  const router = useRouter();
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStudent, setCurrentStudent] = useState<any | null>();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [isAssignClass, setIsAssignClass] = useState({
    status: false,
    data: null as Student | null,
  });
  const [isAssignRole, setIsAssignRole] = useState({
    status: false,
    data: null as Student | null,
  });
  const [updateProfile, setUpdateProfile] = useState({
    status: false,
    data: null as Student | null,
  });
  const [showExport, setShowExport] = useState(false);
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

  function openUserModal(stud: any) {
    setUserModalOpen(true);
    setCurrentStudent(stud);
  }
  function closeUserModal() {
    setUserModalOpen(false);
  }

  function closeModal() {
    setIsOpen(false);
  }
  const deleteStudent = (id: string) => {
    AuthApi.delete(`/users/student/delete/${id}`);
  };

  const onAssignClass = (data: any) => {
    setIsAssignClass({
      status: true,
      data,
    });
  };

  const onAssignRole = (data: any) => {
    setIsAssignRole({
      status: true,
      data,
    });
  };

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
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <div>{row.getValue('gender')}</div>,
    },
    {
      accessorKey: 'currentClazz',
      header: ({ column }) => <SortButton column={column} name="Current Class" />,
      cell: ({ row }) => <div>{row.getValue<IClass>('currentClazz')?.className}</div>,
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon variant="transparent" onClick={() => openUserModal(row.original)}>
            <DarkEye />
          </ActionIcon>
        </div>
      ),
    },
  ];

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
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex flex-row justify-between my-5">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">All ESG Students</h2>
        <div className="flex items-center gap-2">
          <Button disabled={!students} onClick={() => setShowExport(true)}>
            <BiExport size={20} />
            <span className="ml-2">Export</span>
          </Button>
        </div>
      </div>

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

      <MainModal isOpen={modalIsOpen} onClose={closeModal} title="Delete Student" size={'md'}>
        <DeleteConfirmation
          deleteAccount={deleteAccount}
          currentStudent={currentStudent}
          closeModal={closeModal}
          deleteStudent={() => deleteStudent(currentStudent?.id)}
        />
      </MainModal>
      <MainModal
        isOpen={userModalOpen}
        onClose={closeUserModal}
        title="Student Details"
        size={'lg'}
      >
        <StudentProfile
          closeUserModal={closeUserModal}
          currentStudent={currentStudent}
          closeStudentModal={closeStudentModal}
        />
      </MainModal>
      <MainModal
        title="Assign Class"
        isOpen={isAssignClass.status}
        onClose={() => setIsAssignClass({ status: false, data: null })}
      >
        <AssignStudentClass
          data={isAssignClass.data}
          onClose={() => setIsAssignClass({ status: false, data: null })}
          refetch={getPaginated}
        />
      </MainModal>
      <MainModal
        title="Assign Role"
        isOpen={isAssignRole.status}
        onClose={() => setIsAssignRole({ status: false, data: null })}
      >
        <AssignStudentRole
          data={isAssignRole.data}
          onClose={() => setIsAssignRole({ status: false, data: null })}
          refetch={getPaginated}
        />
      </MainModal>
      <MainModal title="Export data" isOpen={showExport} onClose={() => setShowExport(false)}>
        <ExportForm data={students!} onClose={() => setShowExport(false)} />
      </MainModal>
      <MainModal
        title={`Update ${updateProfile.data?.firstName}'s Picture`}
        isOpen={updateProfile.status}
        onClose={() =>
          setUpdateProfile({
            status: false,
            data: null,
          })
        }
        tittleP="px-"
        closeOnClickOutside={false}
        size={'xl'}
      >
        <UpdatePicture
          student={updateProfile.data}
          onClose={() => {
            setUpdateProfile({
              status: false,
              data: null,
            });
          }}
          refetch={getPaginated}
        />
      </MainModal>
      {/* Import */}
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Students"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal="students"
          title="Import students from Excel"
          endpoint="/students/import"
          sendJson
          columns={STUDENT_IMPORT_COLUMNS}
          templateName="ESG-student-import-template.xlsx"
          guide={<StudentImportGuide />}
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <StudentImportPreview data={data} />}
        />
      </MainModal>
    </div>
  );
};

export default Page;
