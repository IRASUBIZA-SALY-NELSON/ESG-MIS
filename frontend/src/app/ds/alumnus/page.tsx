'use client';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import SortButton from '@/components/core/data-table/sort-button';
import { DarkEye, DeleteIcon, EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import PreviewDsExcel from '@/components/staff/ds/ExcelImportPreviewer';
import AssignStudentClass from '@/components/students/AssignStudentClass';
import AssignStudentRole from '@/components/students/AssignStudentRole';
import DeleteConfirmation from '@/components/students/DeleteStudent';
import StudentProfile from '@/components/students/StudentProfile';
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
import { FaTasks } from 'react-icons/fa';
import 'react-loading-skeleton/dist/skeleton.css';
import closeStudentModal from '../../../assets/close.svg';
import deleteAccount from '../../../assets/deleteUserAvatar.svg';
import SearchForm from '@/components/core/data-table/SearchForm';
import { SlRefresh } from 'react-icons/sl';
import TermClassAcademicSort from '@/components/core/filters/TermClassAcademicSort';
import UpdatePicture from '@/components/Profile/UpdatePicture';
import { CgProfile } from 'react-icons/cg';
import { IAcademicYear } from '@/types/other.type';

const AdminParentStudent = () => {
  const [activeYear, setActiveYear] = useState<IAcademicYear | null>(null);
  const {
    data: years,
    loading: yearLoading,
    error: yearError,
    get: getYears,
  } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });
  const {
    data: students,
    loading,
    setData,
    error,
    get: getData,
  } = useGet<Student[]>('/students/alumnus', {
    defaultData: [],
  });
  const [showImport, setShowImport] = useState(false);
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
  const {
    setInput,
    input,
    data: searchData,
  } = useSearch<any>(`/students/all/search/paginated`, {
    defaultData: students ?? [],
    searchKey: 'studentName',
    throttleTime: 500,
    setTableData: setData,
    get: getData,
  });
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

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

  useEffect(() => {
    if (students) {
      setFilteredStudents(students);
    }
  }, [students]);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex flex-row justify-between my-5">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">All ESG Alumus</h2>
      </div>
      {loading && <TableSkeleton columns={columns} />}
      {!loading && !error && (
        <DataTable
          // searchKey="firstName"
          columns={columns}
          data={filteredStudents ?? []}
          noDataMessage="No alumnus found"
          limit={30}
          renderCustomElement={(table) => {
            return (
              <div className="flex flex-col pb-3 gap-y-1 w-full ">
                {/* <TermClassAcademicSort setData={setFilteredStudents} data={students!} /> */}
                <div className="flex items-center justify-between gap-3 w-full ">
                  <SearchForm
                    setInput={setInput}
                    table={table}
                    searchKey={['firstName', 'lastName']}
                  />
                  <div className="flex items-center mt-auto gap-x-3">
                    <ActionIcon title="Refresh" size={'lg'} onClick={getData}>
                      <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
                    </ActionIcon>
                    <Button
                      className=" bg-mainPurple"
                      onClick={() => setShowExport(true)}
                      variant="filled"
                    >
                      <BiExport size={20} className="" />
                      <span className=" sm:hidden ml-2 lg:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}
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
      <MainModal title="Export data" isOpen={showExport} onClose={() => setShowExport(false)}>
        <ExportForm data={students!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default AdminParentStudent;
