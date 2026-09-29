'use client';
import backBtn from '@/assets/back.svg';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import ImportForm from '@/components/core/data-table/ImportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { MdLibraryBooks, MdClass, MdOutlineCalendarMonth } from 'react-icons/md';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { IoEyeOutline } from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import MainModal from '@/components/core/modals/modal';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import AssignTeacherClass from '@/components/staff/teachers/AssignTeacherClass';
import AssignTeacherCourse from '@/components/staff/teachers/AssignTeacherCourses';
import DeleteTeacher from '@/components/staff/teachers/DeleteTeacher';
import TeacherProfileModal from '@/components/staff/teachers/TeacherProfileModal';
import useDelete from '@/hooks/useDelete';
import useGet from '@/hooks/useGet';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiExport, BiImport } from 'react-icons/bi';
import { BsFillPersonLinesFill } from 'react-icons/bs';
import { FaTasks } from 'react-icons/fa';
import { SlRefresh } from 'react-icons/sl';
import 'react-loading-skeleton/dist/skeleton.css';
import { baseTeacherColumns } from './data';
import AcademicFilter from '@/components/academics/AcademicFilter';
import { ITerm } from '@/types/other.type';
import ViewAssignedCourses from '@/components/staff/teachers/ViewAssignedCourses';
import TeacherWorkingDays from '@/components/staff/teachers/TeacherWorkingDays';

interface IsDeleteData {
  firstName?: string;
  lastName?: string;
  id?: string;
}

const AdminTeachers = () => {
  const [deleteTeacherLoad, setDelTeaLoad] = useState(false);
  const [filterData, setFilterData] = useState<Teacher[]>([]);
  const {
    data: teachers,
    get,
    loading,
    error,
  } = useGet<Teacher[]>('/teachers/all', { defaultData: [] });
  const [isDelete, setIsDelete] = useState<{ status: boolean; data: IsDeleteData | null }>({
    status: false,
    data: null,
  });
  const { deleteData, loading: deleteLoading } = useDelete('/teachers/delete');
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | undefined>();
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [term, setTerm] = useState<ITerm | null>(null);
  const {
    data: termTeachers,
    get: getTermTeachers,
    loading: termLoading,
    error: termError,
  } = useGet<Teacher[]>(`/teachers/term/all/${term?.id}`, { defaultData: [], onMount: false });
  const [isAssign, setIsAssign] = useState({
    status: false,
    data: null as Teacher | null,
  });
  const [showAssignCourses, setShowAssignCourses] = useState({
    status: false,
    data: null as any,
  });
  const [isAssignClass, setIsAssignClass] = useState({
    status: false,
    data: null as any,
  });
  const [isAssignWorkingDays, setIsAssignWorkingDays] = useState({
    status: false,
    data: null as any,
  });

  const onDelete = (data: any) => {
    setIsDelete({
      status: true,
      data,
    });
  };

  function openUserModal(id: string) {
    setUserModalOpen(true);
    setCurrentUser(teachers?.find((teacher) => teacher.id === id));
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

  useEffect(() => {
    if (term) {
      getTermTeachers();
    }
  }, [term]);

  useEffect(() => {
    if (!term) setFilterData(teachers!);
    if (term) setFilterData(termTeachers!);
  }, [teachers, termTeachers]);

  const columns: ColumnDef<Teacher>[] = [
    ...baseTeacherColumns,
    {
      header: 'Assign Courses/View',
      cell: ({ row }) => (
        <div className="flex w-full justify-center items-center gap-2">
          <ActionIcon
            variant="transparent"
            onClick={() =>
              setIsAssign({
                status: true,
                data: row.original,
              })
            }
            title="Assign Courses"
          >
            <MdLibraryBooks size={20} />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            onClick={() =>
              setShowAssignCourses({
                status: true,
                data: row.original,
              })
            }
            title="View Assigned Courses"
          >
            <HiOutlineClipboardList size={20} />
          </ActionIcon>
        </div>
      ),
    },
    {
      header: 'Assign Class',
      cell: ({ row }) => (
        <div className="flex w-full justify-center items-center">
          <ActionIcon
            variant="transparent"
            onClick={() =>
              setIsAssignClass({
                status: true,
                data: row.original,
              })
            }
            title="Assign Class"
          >
            <MdClass size={20} />
          </ActionIcon>
        </div>
      ),
    },
    {
      header: 'Working Days',
      cell: ({ row }) => (
        <div className="flex w-full justify-center items-center">
          <ActionIcon
            variant="transparent"
            onClick={() =>
              setIsAssignWorkingDays({
                status: true,
                data: row.original,
              })
            }
            title="Assign Working Days"
          >
            <MdOutlineCalendarMonth size={20} />
          </ActionIcon>
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon
            onClick={() => openUserModal(row.original.id)}
            variant="transparent"
            title="View Teacher"
          >
            <IoEyeOutline size={20} />
          </ActionIcon>
          <Link href={`/admin/workers/teachers/edit/${row.original.id}`} title="Edit Teacher">
            <FiEdit size={20} />
          </Link>
          <ActionIcon
            variant="transparent"
            onClick={() => onDelete(row.original)}
            title="Delete Teacher"
          >
            <RiDeleteBin6Line size={20} />
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
        <DeleteTeacher
          teacherName={isDelete.data?.firstName + ' ' + isDelete.data?.lastName}
          onCancel={() => setIsDelete({ status: false, data: null })}
          onDelete={() => {
            deleteData(isDelete.data?.id);
            setIsDelete({ status: false, data: null });
            get();
          }}
        />
      </MainModal>
      <MainModal
        isOpen={userModalOpen}
        onClose={closeUserModal}
        size={'auto'}
        title="Teacher's Profile"
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
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Teachers</h2>
      </div>
      <div>
        <div className="flex flex-col-reverse sm:flex-row justify-end w-full my-5">
          <div className="flex items-center justify-end gap-3 w-full sm:w-[50%]">
            <Link href={'/admin/workers/teachers/create'}>
              <div className="bg-primary rounded-md text-white px-5 py-2">Create new teacher</div>
            </Link>
          </div>
        </div>
        <div>
          {teachers?.length === 0 && !loading && !error && (
            <div className="flex items-center justify-center">
              <p className="text-gray-700">No Teachers So Far</p>
            </div>
          )}
          {loading && (
            <div className="overflow-x-auto ">
              <TableSkeleton columns={columns} />
            </div>
          )}
          {!error && !loading && (
            <DataTable
              data={filterData}
              columns={columns}
              searchKey="firstName"
              renderCustomElement={() => {
                return <AcademicFilter getTerm={(term) => term && setTerm(term)} />;
              }}
              actionElement={
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
              }
            />
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
        title={`Assign ${isAssign.data?.firstName} a course`}
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
      {/* view assigned courses */}
      <MainModal
        size={'xl'}
        isOpen={showAssignCourses.status}
        title={`Assigned Courses for ${showAssignCourses.data?.firstName}`}
        onClose={() =>
          setShowAssignCourses({
            status: false,
            data: null,
          })
        }
        closeOnClickOutside={false}
      >
        <ViewAssignedCourses
          onClose={() => setShowAssignCourses({ status: false, data: null })}
          toUpdate={showAssignCourses.data}
        />
      </MainModal>
      {/* assign class as head-teacher */}
      <MainModal
        className="pl-11"
        title={
          <p className=" text-base text-left flex-1 w-full ">
            Assign {showAssignCourses.data?.firstName} to a class as Head Teacher
          </p>
        }
        onClose={() =>
          setIsAssignClass({
            status: false,
            data: null,
          })
        }
        size={'lg'}
        isOpen={isAssignClass.status}
        closeOnClickOutside={false}
      >
        <AssignTeacherClass
          onClose={() =>
            setIsAssignClass({
              status: false,
              data: null,
            })
          }
          refetch={get}
          data={isAssignClass.data}
        />
      </MainModal>

      {/* Assign Working Days*/}
      <MainModal
        className="pl-11"
        title={
          <p className=" text-base text-left flex-1 w-full ">
            Working Days For Instructor {isAssignWorkingDays.data?.firstName}
          </p>
        }
        onClose={() =>
          setIsAssignWorkingDays({
            status: false,
            data: null,
          })
        }
        size={'lg'}
        isOpen={isAssignWorkingDays.status}
        closeOnClickOutside={false}
      >
        <TeacherWorkingDays
          onClose={() =>
            setIsAssignWorkingDays({
              status: false,
              data: null,
            })
          }
          refetch={get}
          data={isAssignWorkingDays.data}
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
