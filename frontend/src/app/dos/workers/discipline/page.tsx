'use client';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { DarkEye, DeleteIcon, EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import DeleteDiscpline from '@/components/staff/ds/DeleteDs';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import TeacherProfileModal from '@/components/staff/teachers/TeacherProfileModal';
import useDelete from '@/hooks/useDelete';
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
import { FaTasks } from 'react-icons/fa';
import { SlRefresh } from 'react-icons/sl';
import 'react-loading-skeleton/dist/skeleton.css';
import { Modal } from '@mantine/core';
import { ClipLoader } from 'react-spinners';
import backBtn from '../../../../assets/back.svg';
import deleteAccount from '../../../../assets/deleteUserAvatar.svg';

interface DStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  lastLogin: any;
  gender: string;
  profilePicture: string;
  password: string;
  activationCode: string;
  status: string;
  phoneNumber: string;
  nationalId: any;
  roles: any;
  address: any;
  classes: any;
  courses: any;
}

interface IsDeleteData {
  firstName?: string;
  lastName?: string;
  id?: string;
}

const AdminTeachers = () => {
  const [deleteTeacherLoad, setDelTeaLoad] = useState(false);
  const {
    data: disciplines,
    get,
    loading,
    error,
  } = useGet<Teacher[]>('/staff-members/all-roles/DS', { defaultData: [] });

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
  const { deleteData, loading: deleteLoading } = useDelete('/staff-members/delete');

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
      zindex: '999',
    },
  };
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | undefined>();
  const [userModalOpen, setUserModalOpen] = React.useState(false);

  function openModal(id: string) {
    setIsOpen(true);
    setCurrentUser(disciplines?.find((teacher) => teacher.id === id));
  }

  function openUserModal(id: string) {
    setUserModalOpen(true);
    setCurrentUser(disciplines?.find((teacher) => teacher.id === id));
  }
  function closeUserModal() {
    setUserModalOpen(false);
  }

  function closeModal() {
    setIsOpen(false);
  }
  const deleteTeacher = () => {
    setDelTeaLoad(true);
    AuthApi.delete(`/teachers/delete/${currentUser?.id}`)
      .then((res) => {})
      .catch((err) => {})
      .finally(() => {
        setDelTeaLoad(false);
      });
  };

  const columns: ColumnDef<DStaff>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => <div>{row.getValue('firstName') || 'Not set'}</div>,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: ({ row }) => <div>{row.getValue('lastName') || 'Not set'}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email') || 'Not set'}</div>,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <div>{row.getValue('gender') || 'Not set'}</div>,
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }) => <div>{row.getValue('phoneNumber') || 'Not set'}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <button onClick={() => openUserModal(row.original.id)}>
            <DarkEye />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-y-2 h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <MainModal
        onClose={() => setIsDelete({ status: false, data: null })}
        size={'lg'}
        isOpen={isDelete.status}
      >
        <DeleteDiscpline
          memberName={isDelete.data?.firstName + ' ' + isDelete.data?.lastName}
          onCancel={() => setIsDelete({ status: false, data: null })}
          onDelete={() => {
            deleteData(isDelete.data?.id);
            setIsDelete({ status: false, data: null });
            get();
          }}
        />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Teachers Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={disciplines!} onClose={() => setShowExport(false)} />
      </MainModal>
      {/* import modal */}
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Discipline Staff"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal="students"
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <ExcelImportPreviewer data={data} />}
        />
      </MainModal>
      <Modal opened={modalIsOpen} onClose={closeModal} closeOnClickOutside>
        <div className="p-2 rounded-lg bg-[#F5FAF7] min-w-[40vw] py-10 text-center">
          <div className="flex items-center justify-center">
            <Image src={deleteAccount} alt="" className="w-20" />
          </div>
          <p className="mt-5">Are you sure you want to delete </p>
          <p className="my-5 font-semibold text-lg text-center">
            {currentUser?.firstName + ' ' + currentUser?.lastName}
          </p>
          <p>from ESG’s student list? </p>
          <div className="mt-5 flex gap-5 justify-center">
            <button
              onClick={closeModal}
              className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2"
            >
              Cancel
            </button>
            {deleteTeacherLoad ? (
              <div className="bg-primary rounded-md text-white px-12 py-2">
                <ClipLoader color="white" size={15} />
              </div>
            ) : (
              <button
                onClick={deleteTeacher}
                className="bg-primary rounded-md text-white px-5 py-2"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        onClose={() => setUserModalOpen(false)}
        opened={userModalOpen}
        closeOnClickOutside
        size={'xxl'}
      >
        <TeacherProfileModal
          closeUserModal={() => setUserModalOpen(false)}
          currentUser={currentUser}
        />
      </Modal>
      <div className="flex w-full justify-between items-center">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              window.history.back();
            }}
          >
            <Image src={backBtn} alt="" />
          </button>
          <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Discipline Staff</h2>
        </div>
        <div className="flex items-center justify-end gap-3 w-full sm:w-[50%]">
          {/* <Link href={'/admin/workers/teachers/create'}>
            <div className="bg-primary rounded-md text-white px-5 py-2">
              Create new DS
            </div>
          </Link> */}
        </div>
      </div>
      <div>
        <div>
          {disciplines?.length === 0 && !loading && !error ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-700">No Members So Far</p>
            </div>
          ) : loading ? (
            <div className="overflow-x-auto ">
              <TableSkeleton columns={columns} />
            </div>
          ) : (
            !error && (
              <DataTable
                data={disciplines}
                columns={columns}
                actionElement={
                  <div className=" flex items-center justify-end my-3 gap-x-2">
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
                }
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
    </div>
  );
};

export default AdminTeachers;
