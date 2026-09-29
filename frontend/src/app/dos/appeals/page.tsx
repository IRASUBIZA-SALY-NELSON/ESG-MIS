'use client';
import drop from '@/assets/dropdown.svg';
import ExportForm from '@/components/core/data-table/ExportForm';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { Dropdown, Button, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import closeStudentModal from '@/assets/close.svg';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { BiExport } from 'react-icons/bi';
import { SlRefresh } from 'react-icons/sl';
import { ActionIcon } from '@mantine/core';
import { DarkEye } from '@/components/core/icons/icons1';
import { DataTable } from '@/components/core/data-table';
import { Table } from '@tanstack/react-table';
import { ChangeEvent } from 'react';
import { ColumnDef } from '@tanstack/react-table';
interface Appeal {
  id: string;
  appealID: string;
  studentName: string;
  teacherName: string;
  lesson: string;
  status: string;
  description: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  course: {
    courseName: string;
  };
}
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}
interface AcademicYear {
  name: string;
  id: string;
}
export default function AppealsPage() {
  const { data, error, loading, get } = useGet('/academicAppeals/all', { defaultData: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [showExport, setShowExport] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [teachersFilter, setTeachersFilter] = useState('teachers');
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [activeTeacher, setActiveTeacher] = useState({ id: '' });
  const [activeAcademicYear, setActiveAcademicYear] = useState({ id: '', name: '' });
  const [status, setStatus] = useState(undefined);
  const [opened, { open, close }] = useDisclosure(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [searchKey, setSearchKey] = useState('email');
  const [appealsLoading, setAppealsLoading] = useState(false);

  const [openedAppeal, setOpenedAppeal] = useState({
    description: '',
    student: {
      firstName: '',
      lastName: '',
    },
    course: {
      courseName: '',
    },
  });
  const [tLoader, setTLoader] = useState(true);
  const [promptUser, setPromptUser] = useState(false);

  function openUserModal() {
    setUserModalOpen(true);
  }
  function closeUserModal() {
    setUserModalOpen(false);
  }

  useEffect(() => {
    setAppeals(data);
    setFilteredAppeals(data);
  }, [loading]);
  useEffect(() => {
    setAppealsLoading(true);
    setFilteredAppeals(() => {
      return data?.filter((app: Appeal) => {
        if (activeTab == 'all') {
          return true;
        } else {
          return app.status == activeTab.toUpperCase();
        }
      });
    });
    setAppealsLoading(false);
  }, [activeTab]);
  const filterByStatus = (stats: any, tab: string) => {
    setActiveTab(tab);
    setStatus(stats);
    setFilteredAppeals(() => {
      return appeals?.filter((app) => {
        if (activeTab == 'all') {
          return true;
        } else {
          return app.status == stats;
        }
      });
    });
  };
  const handleFilterByTeacher = async () => {
    if (activeTeacher.id != '' && activeAcademicYear.id != '') {
      await AuthApi.get(
        `/academicAppeals/all/by-status-teacher-and-academic_year?academicYearId=${activeAcademicYear.id}&status=PENDING&teacherId=${activeTeacher.id}`,
      )
        .then((res) => {
          setAppeals(res.data.data);
          setFilteredAppeals(res.data.data);
        })
        .catch((err) => {
          notifications.show({
            title: 'Failed to fetch appeals',
            message: err.message,
            color: 'red',
            autoClose: 60000,
          });
        });
    }
  };

  const searchStudents = (e: ChangeEvent<HTMLInputElement>, table: Table<any>) => {
    table?.getColumn(searchKey)?.setFilterValue(e.target.value);
  };
  const columns: ColumnDef<Appeal>[] = [
    {
      accessorKey: 'name',
      header: 'Student Name',
      cell: ({ row }) => (
        <div>{row.original.student?.firstName + ' ' + row.original.student?.lastName || ' '}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Student Email',
      cell: ({ row }) => <div>{row.original.student?.email || 'Not set'}</div>,
    },
    {
      accessorKey: 'lesson',
      header: 'Lesson',
      cell: ({ row }) => <div>{row.original.course.courseName}</div>,
    },
    {
      accessorKey: 'view',
      header: 'View',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon
            onClick={() => {
              setOpenedAppeal(row.original);
              openUserModal();
            }}
            variant="transparent"
          >
            <DarkEye />
          </ActionIcon>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <Modal
        opened={userModalOpen}
        onClose={close}
        withCloseButton={false}
        size="auto"
        closeOnClickOutside={true}
      >
        <div className="p-2 rounded-lg bg-[#F5FAF7] min-w-[40vw]  text-center relative">
          <button
            onClick={closeUserModal}
            className="absolute -right-1 -top-1 bg-[#F5FAF7] p-3 rounded-full"
          >
            <Image src={closeStudentModal} alt="" className="w-5" />
          </button>
          <p className="my-5 font-semibold text-lg text-center">Appeal Description</p>
          <div className="flex gap-5">
            <div className="w-[75%]">
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Student Name: </p>
                <p style={{ fontSize: '80%' }}>
                  {openedAppeal?.student?.firstName + ' ' + openedAppeal?.student?.lastName}
                </p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Course: </p>
                <p style={{ fontSize: '80%' }}>{openedAppeal.course.courseName}</p>
              </div>
            </div>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-4 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Appeal description: </p>
            <p style={{ fontSize: '80%' }}>{openedAppeal.description}</p>
          </div>
        </div>
      </Modal>
      <Modal opened={promptUser} onClose={close} withCloseButton={false} size="auto">
        <div className="p-2 rounded-lg bg-[#F5FAF7] min-w-[40vw]  text-center relative">
          <button
            onClick={() => setPromptUser(false)}
            className="absolute -right-1 -top-1 bg-[#F5FAF7] p-3 rounded-full"
          >
            <Image src={closeStudentModal} alt="" className="w-5" />
          </button>
          <p className="my-5 font-semibold text-lg text-center">
            Are you sure you want to set it as {status}?
          </p>

          <button
            className=" mx-4 py-3 px-7 rounded-lg"
            onClick={() => {
              setPromptUser(false);
            }}
          >
            Cancel
          </button>

          <button
            className=" mx-4 py-3 px-7 rounded-lg"
            onClick={() => {
              setPromptUser(false);
            }}
          >
            Yes
          </button>
        </div>
      </Modal>
      <h5 className="font-medium text-[rgba(0,0,0,0.7)]">Student Appeals</h5>
      <div className="flex flex-col md:flex-row items-end w-full justify-between">
        <div className="w-full md: flex mt-4 mb-2 md:mb-0 relative">
          <button
            className={`py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg ${
              activeTab != 'all'
                ? 'bg-[#DCEBE3] text-[#01382A]'
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => filterByStatus('all', 'all')}
          >
            All
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'pending'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => filterByStatus('PENDING', 'pending')}
          >
            Pending
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg  ml-[-13px] border-l-[2px] border-l-[#ccc] ${
              activeTab != 'approved'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => filterByStatus('APPROVED', 'approved')}
          >
            Approved
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'rejected'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => filterByStatus('REJECTED', 'rejected')}
          >
            Rejected
          </button>
        </div>
        <div className="flex gap-2 items-end">
          <Dropdown className="bg-[#DCEBE3]">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
              >
                Filter by <span className="ml-2 text-primary font-bold">{teachersFilter}</span>
                <Image src={drop} alt="" className="w-3 h-3 ml-2" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="rounded-lg overflow-y-auto">
              {tLoader ? (
                <DropdownItem className="flex w-full justify-center">
                  <h5 className="w-full flex justify-center mx-auto">
                    <ClipLoader size={20} className="mx-auto" />
                  </h5>
                </DropdownItem>
              ) : (
                teachers?.map((teacher: Teacher, i) => {
                  return (
                    <DropdownItem
                      key={i}
                      value={teacher.firstName}
                      className=" hover:bg-[#0A6B4F89]"
                      onClick={() => {
                        setTeachersFilter(teacher.firstName + ' ' + teacher.lastName);
                        setActiveTeacher(teacher);
                        handleFilterByTeacher();
                      }}
                    >
                      {teacher.firstName + ' ' + teacher.lastName}
                    </DropdownItem>
                  );
                })
              )}
            </DropdownMenu>
          </Dropdown>
          <Dropdown className="bg-[#DCEBE3]">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
              >
                Filter by <span className="ml-2 text-primary font-bold">{AcadYearsFilter}</span>
                <Image src={drop} alt="" className="w-3 h-3 ml-2" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {academicYears.map((year, i) => {
                return (
                  <DropdownItem
                    key={i}
                    value={year.name}
                    className=" hover:bg-[#0A6B4F89]"
                    onClick={() => {
                      setAcadYearsFilter(year.name);
                      setActiveAcademicYear(year);
                      handleFilterByTeacher();
                    }}
                  >
                    {year.name}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="mt-3" style={{ backgroundColor: 'transparent' }}>
        {loading ? (
          <div className="w-full flex flex-col items-center">
            <h5 className="my-3 mt-7 font-bold">Wait a bit...</h5>
            <ClipLoader />
          </div>
        ) : (
          <DataTable
            data={filteredAppeals}
            columns={columns}
            renderCustomElement={(table) => (
              <div className="flex text-sm flex-col md:flex-row justify-between my-5">
                <input
                  type="text"
                  value={(table?.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                  onChange={(e) => searchStudents(e, table)}
                  className="bg-[#43434305] w-[250px] md:w-[30vw] my-1 md:my-auto px-3 h-12 rounded-md border-[1px] border-[rgba(67,67,67,0.03)]"
                  placeholder="Search student"
                />
                <div className=" flex items-center gap-x-2">
                  <ActionIcon title="Refresh" size={'lg'} onClick={get}>
                    <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
                  </ActionIcon>
                  <Button
                    className="py-3 px-2 rounded-sm text-white gap-x-2 bg-mainPurple"
                    onClick={() => setShowExport(true)}
                  >
                    <BiExport size={20} className="mr-2" onClick={() => setShowExport(true)} />
                    Export Appeals
                  </Button>
                </div>
              </div>
            )}
          />
        )}
      </div>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Course Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={true}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
}
