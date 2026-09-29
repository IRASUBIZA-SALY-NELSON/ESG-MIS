'use client';
import closeStudentModal from '@/assets/close.svg';
import drop from '@/assets/dropdown.svg';
import NoDataGif from '@/assets/noData.gif';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import { DeleteIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import DeleteAppeal from '@/components/students/DeleteAppeal';
import useGet from '@/hooks/useGet';
import { getAcademicYears, getStudentAppeals, getTermsInYear } from '@/utils/funcs';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { ClipLoader } from 'react-spinners';
interface Appeal {
  id: string;
  appealID: string;
  studentName: string;
  teacherName: string;
  lesson: string;
  status: string;
  comment?: string;
  message?: string;
  description: string;
  disciplineMarksReduction?: {
    reason?: string;
    casesCategories?: {
      name?: string;
    };
  };
  student: {
    firstName: string;
    lastName: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  course: {
    courseName: string;
  };
}
interface AcademicYear {
  name: string;
  id: string;
}
const AppealsPage = () => {
  const { data, error, get, loading } = useGet<any>(
    `/academicAppeals/all/{loggedIn-student}/paginated?limit=100&page=0`,
    { defaultData: [] },
  );

  const [activeNav, setActiveNav] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [showExport, setShowExport] = useState(false);
  const [appeals, setAppeals] = useState<any>([]);
  // const [err, setError] = useState(false);
  const [filteredAppeals, setFilteredAppeals] = useState<any>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [activeAcademicYear, setActiveAcademicYear] = useState<string | undefined>();
  const [terms, setTerms] = useState<any[]>([]);
  const [activeTerm, setActiveTerm] = useState<string | undefined>();
  const [termsFilter, setTermsFilter] = useState('Term');
  const [status, setStatus] = useState(undefined);
  const [opened, { open, close }] = useDisclosure(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deleteAppeal, setDeleteAppeal] = useState<{ status: boolean; appeal: Appeal | null }>({
    status: false,
    appeal: null,
  });
  const [openedAppeal, setOpenedAppeal] = useState<Appeal | null>(null);
  const [promptUser, setPromptUser] = useState(false);

  function openUserModal() {
    setUserModalOpen(true);
  }
  function closeUserModal() {
    setUserModalOpen(false);
  }
  const deleteAppealModal = (appeal: Appeal) => {
    setDeleteAppeal({ status: true, appeal });
  };
  useEffect(() => {
    if (activeAcademicYear != undefined && activeTerm != undefined) {
      setFilteredAppeals(() => {
        return appeals?.filter((app: any) => {
          if (activeTab == 'all') {
            return true;
          } else {
            return app.status == activeTab.toUpperCase();
          }
        });
      });
    }
  }, [activeTab]);
  useEffect(() => {
    getAcademicYears().then((res) => {
      setAcademicYears(res.data);
      setActiveAcademicYear(res.data[0].id);
      setAcadYearsFilter(res.data[0].name);
    });
  }, []);
  useEffect(() => {
    if (activeAcademicYear != undefined) {
      getTermsInYear(activeAcademicYear).then((res) => {
        setTerms(res.data);
        setActiveTerm(res.data[0].id);
        setTermsFilter(res.data[0].name);
      });
    }
  }, [activeAcademicYear]);
  useEffect(() => {
    !loading && activeAcademicYear != undefined && activeTerm != undefined;
    if (activeNav == 0) {
      if (!loading) {
        setAppeals(data?.content ?? []);
        setFilteredAppeals(data?.content ?? []);
      }
    }
    if (activeNav == 1) {
      getStudentAppeals('discipline').then((res) => {
        setAppeals(res);
        setFilteredAppeals(res);
      });
    }
  }, [activeAcademicYear, activeTerm, activeNav]);
  const columns: ColumnDef<Appeal>[] = [
    {
      accessorKey: 'lesson',
      header: 'Lesson',
      cell: ({ row }) => (
        <div>
          {row.original.course?.courseName ??
            row.original.disciplineMarksReduction?.casesCategories?.name ??
            row.original.disciplineMarksReduction?.reason ??
            '-'}
        </div>
      ),
    },
    {
      accessorKey: 'marks',
      header: 'Description',
      cell: ({ row }) => (
        <div>
          {(row.original.description ?? '').length > 100
            ? row.original.description.slice(0, 90) + '....'
            : (row.original.description ?? '-')}
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center  justify-center gap-2">
          <button
            onClick={() => {
              openUserModal();
              setOpenedAppeal(row.original);
            }}
          >
            <EyeIcon />
          </button>
          <button
            disabled={row.original.status !== 'PENDING'}
            onClick={() => {
              deleteAppealModal(row.original);
            }}
          >
            <DeleteIcon color={row.original.status === 'PENDING' ? '#FF0000' : '#CCC'} />
          </button>
          {/* )} */}
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <Modal opened={userModalOpen} onClose={closeUserModal} withCloseButton={false} size="auto">
        <div className="p-2 rounded-lg  min-w-[40vw]  text-center relative">
          <button
            onClick={closeUserModal}
            className="absolute -right-1 -top-1 bg-[#F5FAF7] p-3 rounded-full"
          >
            <Image src={closeStudentModal} alt="" className="w-5" />
          </button>
          <p className="my-5 font-semibold text-lg text-center">Appeal Description</p>
          <div className="flex gap-5">
            <div className="w-full">
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Student Name: </p>
                <p style={{ fontSize: '80%' }}>
                  {`${openedAppeal?.student?.firstName ?? '-'} ${openedAppeal?.student?.lastName ?? ''}`}
                </p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Course: </p>
                <p style={{ fontSize: '80%' }}>
                  {openedAppeal?.course?.courseName ??
                    openedAppeal?.disciplineMarksReduction?.casesCategories?.name ??
                    openedAppeal?.disciplineMarksReduction?.reason ??
                    '-'}
                </p>
              </div>
            </div>
          </div>
          <div className="text-left w-full max-w-[50vw] flex flex-col my-2 px-3 py-4 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Appeal description: </p>
            <p style={{ fontSize: '80%' }}>{openedAppeal?.description ?? '-'}</p>
          </div>
          <div className="text-left w-full max-w-[50vw] flex flex-col my-2 px-3 py-4 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Teacher's Comment: </p>
            <p style={{ fontSize: '80%' }}>
              {openedAppeal?.comment ?? openedAppeal?.message ?? '-'}
            </p>
          </div>
        </div>
      </Modal>
      <Modal
        opened={deleteAppeal.status}
        onClose={() => {
          setDeleteAppeal({ status: false, appeal: null });
        }}
        withCloseButton={false}
      >
        <DeleteAppeal
          appeal={deleteAppeal.appeal}
          status={activeNav == 0 ? 'academic' : 'discipline'}
          close={() => {
            setDeleteAppeal({ status: false, appeal: null });
          }}
        />
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
      <p className="font-medium text-[rgba(0,0,0,0.7)] text-xl">Appeals</p>
      <div className="my-2 flex items-center justify-center">
        <div className=" relative">
          <button
            className={`py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg ${
              activeNav != 0
                ? 'bg-[#DCEBE3] text-[#01382A]'
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => {
              if (activeNav !== 0) {
                setActiveNav(0);
                setActiveTab('all');
              }
            }}
          >
            Academic
          </button>
          <button
            className={`py-3  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeNav != 1
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => {
              if (activeNav !== 1) {
                setActiveNav(1);
                setActiveTab('all');
              }
            }}
          >
            Discipline
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-end w-full justify-between">
        <div className="w-full md: flex mt-4 mb-2 md:mb-0 relative">
          <button
            className={`py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg ${
              activeTab != 'all'
                ? 'bg-[#DCEBE3] text-[#01382A]'
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => activeTab !== 'all' && setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'pending'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => activeTab !== 'pending' && setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'reviewing'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('reviewing')}
          >
            In Review
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg  ml-[-13px] border-l-[2px] border-l-[#ccc] ${
              activeTab != 'approved'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => activeTab !== 'approved' && setActiveTab('approved')}
          >
            Approved
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'rejected'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => activeTab !== 'rejected' && setActiveTab('rejected')}
          >
            Rejected
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <Dropdown className="bg-[#DCEBE3]">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
              >
                Filter by <span className="ml-2 text-primary font-bold">{termsFilter}</span>
                <Image src={drop} alt="" className="w-3 h-3 ml-2" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="rounded-lg">
              {terms?.map((term: any, i: number) => {
                return (
                  <DropdownItem
                    key={i}
                    value={term.name.replace('_', ' ')}
                    className=" hover:bg-[#0A6B4F89]"
                    onClick={() => {
                      setTermsFilter(term.name.replace('_', ' '));
                      setActiveTerm(term.id);
                    }}
                  >
                    {term.name.replace('_', ' ')}
                  </DropdownItem>
                );
              })}
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
                      setActiveAcademicYear(year.id);
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
          <div className="w-full flex justify-center h-[500px] items-center">
            <ClipLoader size={20} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[400px] flex-col">
            <p className="text-xl">Server Error</p>
            <p className="my-2">Our Techinicians are addressing the issue</p>
            <button className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-red-500 text-white">
              <AiOutlineReload size={15} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        ) : (
          <div>
            {filteredAppeals?.length == 0 ? (
              <div className="flex flex-col h-[450px] gap-4  items-center justify-center ">
                <Image src={NoDataGif} alt="" className="w-[300px]" />
                <p className="text-sm text-gray-500">No Appeals So Far</p>
              </div>
            ) : (
              <div>
                <DataTable data={filteredAppeals} columns={columns} />
              </div>
            )}
          </div>
        )}
      </div>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Course Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={filteredAppeals!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default AppealsPage;
