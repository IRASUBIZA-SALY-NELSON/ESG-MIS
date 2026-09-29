'use client';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { DarkEye } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import AssignTeacherCourse from '@/components/staff/teachers/AssignTeacherCourses';
import TeacherProfileModal from '@/components/staff/teachers/TeacherProfileModal';
import useGet from '@/hooks/useGet';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiExport, BiImport } from 'react-icons/bi';
import { SlRefresh } from 'react-icons/sl';
import 'react-loading-skeleton/dist/skeleton.css';
import { ClipLoader } from 'react-spinners';
import backBtn from '../../../../assets/back.svg';

interface IsDeleteData {
  firstName?: string;
  lastName?: string;
  id?: string;
}

const AdminTeachers = () => {
  const {
    data: teachers,
    getPaginated,
    loading,
    paginateOpts,
    setPaginateOpts,
    setData,
    error,
    get,
  } = useGet<any[]>('/staff-members/all', {
    defaultData: [],
    paginated: true,
  });
  const [deleteTeacherLoad, setDelTeaLoad] = useState(false);
  const [isDelete, setIsDelete] = useState<{ status: boolean; data: IsDeleteData | null }>({
    status: false,
    data: null,
  });
  const onDelete = (data: any) => {
    setIsDelete({
      status: true,
      data,
    });
  };
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | undefined>();
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAssign, setIsAssign] = useState({
    status: false,
    data: null as Teacher | null,
  });
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#F5FAF7',
      borderRadius: '20px',
    },
  };

  const onDeleteStaff = () => {
    setDeleteLoading(true);
    AuthApi.delete(`staff-members/staff/delete/${isDelete?.data?.id}`)
      .then((res) => {
        setDeleteLoading(false);
      })
      .catch((err) => {
        setDeleteLoading(false);
      });
  };

  function openUserModal(id: string) {
    setUserModalOpen(true);
    setCurrentUser(teachers?.find((teacher) => teacher.id === id));
  }
  function closeUserModal() {
    setUserModalOpen(false);
  }

  const columns: ColumnDef<Teacher>[] = [
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
      header: 'Teacher Email',
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
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon onClick={() => openUserModal(row.original.id)} variant="transparent">
            <DarkEye />
          </ActionIcon>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <MainModal
        onClose={() => setIsDelete({ status: false, data: null })}
        size={'lg'}
        isOpen={isDelete.status}
      >
        <div className="p-12 flex flex-col gap-y-8 ">
          <p className={'text-gray-600 text-center font-medium text-[1.3rem]'}>
            Are you sure you want to delete
          </p>
          <h3 className="text-gray-600 text-center font-bold text-[2.7rem] tracking-widest">
            {isDelete.data?.firstName ?? 'This Staff Member'}
          </h3>
          <p className="text-gray-600 text-center font-medium text-[1.3rem]">
            from ESG&apos; Staff Members list{' '}
          </p>
          <div className="flex justify-center gap-x-12">
            <button
              className="px-6 py-2 bg-[#0A6B4F70] border border-[#0A6B4F70] rounded-lg text-primary-900 "
              onClick={() => setIsDelete({ status: false, data: isDelete.data })}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-primary-900 border border-primary-900 rounded-lg text-white"
              onClick={onDeleteStaff}
            >
              {deleteLoading ? (
                <div>
                  <ClipLoader size={20} />
                </div>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </MainModal>
      <MainModal
        isOpen={userModalOpen}
        onClose={closeUserModal}
        size={'auto'}
        title="Staff Members's Profile"
        closeOnClickOutside={true}
      >
        <TeacherProfileModal closeUserModal={closeUserModal} currentUser={currentUser} />
      </MainModal>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => {
            window.history.back();
          }}
          className="bg-transparent"
        >
          <Image src={backBtn} alt="" />
        </button>
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
          Other Staff Members
        </h2>
      </div>
      <div>
        <div className="flex flex-col-reverse sm:flex-row justify-end w-full my-5">
          <div className="flex items-center justify-end gap-3 w-full sm:w-[50%]">
            <Link href={'/pm/workers/others/create'}>
              <div className="bg-primary rounded-md text-white px-5 py-2">Create new Staff</div>
            </Link>
          </div>
        </div>
        <div className="flex w-full justify-end">
          <div className=" flex items-center gap-x-2">
            <ActionIcon title="Refresh" size={'lg'} onClick={get}>
              <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
            </ActionIcon>
            <Button
              className=" gap-x-2 bg-mainPurple"
              onClick={() => setShowExport(true)}
              variant="filled"
            >
              <BiExport size={20} className="mr-2" />
              Export
            </Button>
            <Button
              className=" gap-x-2 bg-mainPurple"
              onClick={() => setShowImport(true)}
              variant="filled"
            >
              <BiImport size={20} className="mr-2" />
              Import
            </Button>
          </div>
        </div>
        <div>
          {teachers?.length === 0 && !loading && !error ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-700">No Staff So Far</p>
            </div>
          ) : loading ? (
            <div className="overflow-x-auto ">
              <TableSkeleton columns={columns} />
            </div>
          ) : (
            !error && (
              <DataTable
                data={teachers}
                columns={columns}
                searchKey="firstName"
                // actionElement={

                // }
              />
            )
          )}
          {error && (
            <div className="flex flex-col items-center w-full">
              <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
              <Button onClick={get} mt={3} className="flex items-center gap-x-2" px={3}>
                <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Assign course */}
      <MainModal
        className="pl-11"
        title={`Assign ${isAssign.data?.firstName} Courses`}
        onClose={() =>
          setIsAssign({
            status: false,
            data: null,
          })
        }
        size={'lg'}
        isOpen={isAssign.status}
        closeOnClickOutside={false}
      >
        <AssignTeacherCourse
          onClose={() =>
            setIsAssign({
              status: false,
              data: null,
            })
          }
          refetch={get}
          data={isAssign.data!}
        />
      </MainModal>
      {/* export modal */}
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Teachers Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={teachers!} onClose={() => setShowExport(false)} />
      </MainModal>
      {/* import modal */}
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Teachers"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal="teachers"
          formatUrl="https://docs.google.com/spreadsheets/d/1ZB8M-HPUIqw6akJnAIoISZESAC3fo66SyKhZn5JrzXA/edit?usp=sharing"
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <ExcelImportPreviewer data={data} />}
        />
      </MainModal>
    </div>
  );
};

export default AdminTeachers;
