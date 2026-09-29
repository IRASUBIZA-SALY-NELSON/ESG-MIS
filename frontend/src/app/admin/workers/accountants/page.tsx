'use client';
import { AuthApi } from '@/utils/constants';
import { DataTable } from '@/components/core/data-table';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Modal } from '@mantine/core';
import deleteAccount from '../../../../assets/deleteUserAvatar.svg';
import closeStudentModal from '../../../../assets/close.svg';
import backBtn from '../../../../assets/back.svg';
import 'react-loading-skeleton/dist/skeleton.css';
import { ClipLoader } from 'react-spinners';
import useGet from '@/hooks/useGet';
import useSearch from '@/hooks/useSearch';
import { ActionIcon, Button } from '@mantine/core';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { SlRefresh } from 'react-icons/sl';
import { BiExport, BiImport } from 'react-icons/bi';
import { DarkEye, DeleteIcon, EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';

interface Accountant {
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
const AdminAccountants = () => {
  const [deleteAccountantLoad, setDelAccLoad] = useState(false);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<Accountant | undefined>();
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const {
    data: content,
    get,
    loading,
    // paginateOpts,
    // setPaginateOpts,
    setData,
    error,
  } = useGet<any[]>('/staff-members/all-roles/ACCOUNTANT', {
    defaultData: [],
    // paginated: true,
  });
  const {
    setInput,
    input,
    data: searchData,
  } = useSearch<any>('/staff-members/all', {
    defaultData: [],
    searchKey: 'lastName',
    throttleTime: 500,
    setTableData: setData,
  });

  function openModal(id: string) {
    setIsOpen(true);
    setCurrentUser(content?.find((staff) => staff.id === id));
  }

  function openUserModal(id: string) {
    setUserModalOpen(true);
    setCurrentUser(content?.find((staff) => staff.id === id));
  }
  function closeUserModal() {
    setUserModalOpen(false);
  }

  function closeModal() {
    setIsOpen(false);
  }
  const deleteAccountant = () => {
    setDelAccLoad(true);
    AuthApi.delete(`/staff-members/staff/delete/${currentUser?.id}`).finally(() => {
      setDelAccLoad(false);
      closeModal();
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
    },
    {
      accessorKey: 'lastName',
      header: 'Second Name',
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
      header: 'Phone Number',
      cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon variant="transparent" onClick={() => openUserModal(row.original.id)}>
            <DarkEye />
          </ActionIcon>
          <Link href={`/admin/workers/accountants/edit/${row.original.id}`}>
            <EditIcon />
          </Link>
          <ActionIcon variant="transparent" onClick={() => openModal(row.original.id)}>
            <DeleteIcon />
          </ActionIcon>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <Modal opened={modalIsOpen} onClose={closeModal} closeOnClickOutside size={'auto'}>
        <div className="p-2 rounded-lg bg-[#F5FAF7] min-w-[40vw] py-10 text-center">
          <div className="flex items-center justify-center">
            <Image src={deleteAccount} alt="" className="w-20" />
          </div>
          <p className="mt-5">Are you sure you want to delete </p>
          <p className="my-5 font-semibold text-lg text-center">
            {currentUser?.firstName + ' ' + currentUser?.lastName}
          </p>
          <p>from ESG’s Accountant Staff Members? </p>
          <div className="mt-5 flex gap-5 justify-center">
            <button
              onClick={closeModal}
              className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2"
            >
              Cancel
            </button>
            {deleteAccountantLoad ? (
              <div className="bg-primary rounded-md text-white px-12 py-2">
                <ClipLoader color="white" size={15} />
              </div>
            ) : (
              <button
                onClick={deleteAccountant}
                className="bg-primary rounded-md text-white px-5 py-2"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </Modal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Staff Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={content!} onClose={() => setShowExport(false)} />
      </MainModal>
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Classes"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal="staff"
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <ExcelImportPreviewer data={data} />}
        />
      </MainModal>

      <Modal
        opened={userModalOpen}
        onClose={closeModal}
        closeOnClickOutside
        withCloseButton={false}
        size={'auto'}
      >
        <div className="p-2 rounded-lg bg-[#F5FAF7] w-[70vw]  text-center relative">
          <button
            onClick={closeUserModal}
            className="absolute -right-1 -top-1 bg-[#F5FAF7] p-3 rounded-full"
          >
            <Image src={closeStudentModal} alt="" className="w-5" />
          </button>
          <p className="my-5 font-semibold text-lg text-center">Accountant's Profile</p>
          <div className="flex gap-5">
            <div className="w-[25%]">
              <Image
                src={
                  currentUser?.profilePicture ||
                  'https://w7.pngwing.com/pngs/481/915/png-transparent-computer-icons-user-avatar-woman-avatar-computer-business-conversation-thumbnail.png'
                }
                alt=""
                className="w-[100%]"
                width={100}
                height={100}
              />
            </div>
            <div className="w-[75%]">
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Full Name: </p>
                <p style={{ fontSize: '80%' }}>
                  {currentUser?.firstName + ' ' + currentUser?.lastName}
                </p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Email: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.email}</p>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }}>Gender: </p>
                  <p style={{ fontSize: '80%' }}>{currentUser?.gender}</p>
                </div>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Phone: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.phoneNumber}</p>
              </div>
            </div>
          </div>

          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Province of Residence: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.address?.province || 'Not set'}</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>District: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.district || 'Not set'}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Sector: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.sector || 'Not set'}</p>
              </div>
            </div>
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Cell: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.cell || 'Not set'}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Village: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.village || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => {
            window.history.back();
          }}
        >
          <Image src={backBtn} alt="" />
        </button>
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Accountants</h2>
      </div>
      <div>
        <div className="flex flex-col sm:flex-row justify-between my-3">
          <div></div>
          <div className="flex items-center justify-end gap-3 w-full sm:w-[50%]">
            <Link href={'/admin/workers/accountants/create'}>
              <div className="bg-primary rounded-md text-white px-5 py-2">Add new accountant</div>
            </Link>
          </div>
        </div>
        {loading && <TableSkeleton columns={columns} />}
        {!loading && !error && (
          <DataTable
            searchKey="lastName"
            columns={columns}
            data={content!}
            actionElement={
              <div className=" flex items-center gap-x-2  my-2">
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
        )}
      </div>
    </div>
  );
};

export default AdminAccountants;
