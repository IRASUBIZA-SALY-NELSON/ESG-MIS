'use client';
import { DataTable } from '@/components/core/data-table';
// import TeacherProfileModal from '@/components/students/TeacherProfileModal';
import useGet from '@/hooks/useGet';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { ClipLoader } from 'react-spinners';
import deleteAccount from '@/assets/deleteUserAvatar.svg';
import { Button, Modal } from '@mantine/core';
import { AiOutlineReload } from 'react-icons/ai';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import MainModal from '@/components/core/modals/modal';
import DeductStudent from '@/components/staff/ds/DeductStudent';
import TeacherProfileModal from '@/components/staff/teachers/TeacherProfileModal';

interface IsDeductData {
  firstName?: string;
  lastName?: string;
  id?: string;
}

const StudentTables = ({ students, academicYear }: { students: any; academicYear: string }) => {
  const [deleteTeacherLoad, setDelTeaLoad] = useState(false);
  const [activeTerm, setActiveTerm] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const {
  //   data: students,
  //   get,
  //   loading,
  //   error,
  // } = useGet<Teacher[]>(
  //   `/students/all/by-class-academic-year?academicYearId=a46da2c5-2a0f-4721-bcf3-0a9f202ec968&classId=${currentClass}&limit=100&page=0`,
  //   { defaultData: [] },
  // );
  useEffect(() => {
    AuthApi.get(`/terms/all/{by-academic-year}?academicYearId=${academicYear}&limit=100&page=0`)
      .then((res) => {
        setActiveTerm(res.data.data.content[res.data.data.content.length - 1]);
      })
      .catch((err) => {});
  }, []);
  const [isDeduct, setIsDeduct] = useState<{ status: boolean; data: IsDeductData | null }>({
    status: false,
    data: null,
  });
  const onDeduct = (data: any) => {
    setIsDeduct({
      status: true,
      data,
    });
  };
  // useEffect(() => {
  //   // AuthApi.get('/');
  // }, [currentClass]);

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
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | undefined>();
  const [userModalOpen, setUserModalOpen] = React.useState(false);

  function openModal(id: string) {
    setIsOpen(true);
    setCurrentUser(students?.find((teacher: any) => teacher.id === id));
  }

  function openUserModal(id: string) {
    setUserModalOpen(true);
    setCurrentUser(students?.find((teacher: any) => teacher.id === id));
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
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
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{String(40 - row.original.disciplineMarksToBeRemoved)}</div>,
    },
    {
      accessorKey: 'deduct',
      header: 'Deduct',
      cell: ({ row }) => (
        <div className="flex items-center  justify-center">
          <button
            onClick={() => onDeduct(row.original)}
            className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-3 py-1.5"
          >
            -
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 text-sm">
      <MainModal
        onClose={() => setIsDeduct({ status: false, data: null })}
        size={'lg'}
        isOpen={isDeduct.status}
      >
        <DeductStudent
          refetch={() => {}}
          studentName={isDeduct.data?.firstName + ' ' + isDeduct.data?.lastName}
          termId={activeTerm}
          studentId={isDeduct.data?.id as string}
          onCancel={() => {
            setIsDeduct({ status: false, data: null });
          }}
        />
      </MainModal>
      <Modal opened={modalIsOpen} onClose={closeModal}>
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
      <Modal opened={userModalOpen} onClose={closeModal}>
        <TeacherProfileModal closeUserModal={closeUserModal} currentUser={currentUser} />
      </Modal>
      <div>
        <div>
          {students?.length === 0 && !loading && !error ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-700">No Teachers So Far</p>
            </div>
          ) : loading ? (
            <div className="overflow-x-auto ">
              <TableSkeleton columns={columns} />
            </div>
          ) : (
            !error && <DataTable data={students} columns={columns} />
          )}
          {error && (
            <div className="flex flex-col items-center w-full">
              <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
              <Button mt={3} className="flex items-center gap-x-2" px={3}>
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

export default StudentTables;
