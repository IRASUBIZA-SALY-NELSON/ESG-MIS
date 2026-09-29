'use client';
import drop from '@/assets/dropdown.svg';
import NoDataGif from '@/assets/noData.gif';
import ExportForm from '@/components/core/data-table/ExportForm';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import {
  getAcademicYears,
  getAllTeachers,
  getAppeals,
  getDsAppeals,
  getStudentMarks,
  getTermsInYear,
} from '@/utils/funcs';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  divider,
} from '@nextui-org/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import closeStudentModal from '@/assets/close.svg';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/core/data-table';
import AppealModal from '@/components/students/AppealModal';
import { toFixed } from '@/utils/funcs/func2';
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
const AppealsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showExport, setShowExport] = useState(false);
  const [marks, setMarks] = useState<any[]>([]);
  const [err, setError] = useState(false);
  const [filteredMarks, setFilteredMarks] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [activeAcademicYear, setActiveAcademicYear] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [terms, setTerms] = useState<any[]>([]);
  const [activeTerm, setActiveTerm] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [termsFilter, setTermsFilter] = useState('Term');
  const [status, setStatus] = useState(undefined);
  const [activeMarks, setActiveMarks] = useState<any | undefined>(null);
  const [opened, { open, close }] = useDisclosure(true);
  const [appealModal, setUserModalOpen] = useState(false);
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
  const [promptUser, setPromptUser] = useState(false);

  function openAppealModal(data: any) {
    setActiveMarks(data);
    setUserModalOpen(true);
  }
  function closeAppealModal() {
    setUserModalOpen(false);
  }
  const filterByStatus = (stats: any, tab: string) => {
    setActiveTab(tab);
    setStatus(stats);
    setFilteredMarks(() => {
      return marks?.filter((app) => {
        if (stats == 'all') {
          return true;
        } else {
          return app.markType.toLowerCase() == stats.toLowerCase();
        }
      });
    });
  };
  useEffect(() => {
    getAcademicYears()
      .then((res) => {
        setAcademicYears(res.data);
        setAcadYearsFilter(res.data[0].name);

        setActiveAcademicYear(res.data[res.data.length - 1]);
        return getTermsInYear(res.data[res.data.length - 1]?.id);
      })
      .then((res) => {
        setTerms(res.data);
        setTermsFilter(res.data[res.data.length - 1].name);
        setActiveTerm(res.data[res.data.length - 1]);
        return getStudentMarks(
          res.data[res.data.length - 1].academicYear.id,
          res.data[res.data.length - 1].id,
        );
      })
      .then((res) => {
        setMarks(res.data);
        setFilteredMarks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        // setError(true);
        setLoading(false);
      });
  }, []);
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'lesson',
      header: 'Lesson',
      cell: ({ row }) => <div>{row.original.course.courseName}</div>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{toFixed(row.original.marks ?? 0)}</div>,
    },
    {
      header: 'Weight',
      cell: ({ row }) => <div>{row.original.weight}</div>,
    },
    {
      accessorKey: 'markType',
      header: 'Mark Type',
      cell: ({ row }) => <div>{row.getValue('markType')}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center  justify-center">
          <button
            onClick={() => {
              openAppealModal(row.original);
            }}
            className="px-4 py-1 rounded-full border text-white bg-mainPurple"
          >
            <p>Appeal</p>
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <Modal opened={appealModal} onClose={close} withCloseButton={false} size="auto">
        <AppealModal close={closeAppealModal} markId={activeMarks?.id} />
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
      <h5 className="font-medium text-[rgba(0,0,0,0.7)]">Performance</h5>
      <div className="flex flex-col md:flex-row items-end w-full justify-between">
        <div className=" md: flex mt-4 mb-2 md:mb-0 relative">
          <button
            className={`py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg ${
              activeTab != 'all'
                ? 'bg-[#DCEBE3] text-[#01382A]'
                : ' bg-primary text-white font-medium '
            }`}
            onClick={() => filterByStatus('all', 'all')}
          >
            All
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'cat'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium'
            }`}
            onClick={() => filterByStatus('CAT', 'cat')}
          >
            CAT
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg  ml-[-13px] border-l-[2px] border-l-[#ccc] ${
              activeTab != 'exam'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium'
            }`}
            onClick={() => filterByStatus('EXAM', 'exam')}
          >
            Exam
          </button>
        </div>
        <div className="flex gap-2  items-end items-center">
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
                      setActiveTerm({ id: term.id, name: term.name.replace('_', ' ') });
                      setLoading(true);
                      getStudentMarks(activeAcademicYear.id!, term.id)
                        .then((res) => {
                          setMarks(res.data);
                          setFilteredMarks(res.data);
                          setLoading(false);
                        })
                        .catch((err) => {
                          setError(true);
                          setLoading(false);
                        });
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
                      setActiveAcademicYear(year);
                      setLoading(true);
                      getTermsInYear(year.id)
                        .then((res) => {
                          setTerms(res.data);
                          setActiveTerm(res.data[0]);
                          return getStudentMarks(year.id, res.data[0].id);
                        })
                        .then((res) => {
                          setMarks(res.data);
                          setFilteredMarks(res.data);
                          setLoading(false);
                        })
                        .catch((err) => {
                          setError(true);
                          setLoading(false);
                        });
                    }}
                  >
                    {year.name}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
          {/* <div
            // className="bg-primary rounded-md text-white px-8 flex items-center justify-center py-3 text-sm"
            // onClick={() => setShowExport(true)}
          >
            Export
          </div> */}
        </div>
      </div>

      <div className="mt-3" style={{ backgroundColor: 'transparent' }}>
        {loading ? (
          <div className="w-full flex justify-center h-[500px] items-center">
            <ClipLoader size={20} />
          </div>
        ) : (
          <div>
            {filteredMarks?.length == 0 ? (
              <div className="flex flex-col h-[450px] gap-4  items-center justify-center ">
                <Image src={NoDataGif} alt="" className="w-[300px]" />
                <p className="text-sm text-gray-500">No Marks So Far</p>
              </div>
            ) : (
              <div>
                <DataTable data={filteredMarks} columns={columns} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppealsPage;
