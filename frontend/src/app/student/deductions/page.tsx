'use client';
import drop from '@/assets/dropdown.svg';
import ExportForm from '@/components/core/data-table/ExportForm';
import MainModal from '@/components/core/modals/modal';
import NoDataGif from '@/assets/noData.gif';
import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  divider,
} from '@nextui-org/react';
import { stat } from 'fs';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import deleteAccount from '@/assets/deleteUserAvatar.svg';
import closeStudentModal from '@/assets/close.svg';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from '@/components/core/icons/icons1';
import { DataTable } from '@/components/core/data-table';
import { AiOutlineReload } from 'react-icons/ai';
import AppealModal from '@/components/students/AppealModal';
import AppealDiscplineModal from '@/components/students/AppealDiscplineModal';
import { useError } from '@/hooks/useError';
import { fetchDeductions } from '@/utils/funcs';
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
const DeductionsPage = () => {
  const { data, error, get } = useGet<ICourse[]>('/ds-appeals/all', { defaultData: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [showExport, setShowExport] = useState(false);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [err, setErr] = useState(false);
  const [filteredMarks, setFilteredMarks] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [activeAcademicYear, setActiveAcademicYear] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [terms, setTerms] = useState<any[]>([]);
  const [activeTerm, setActiveTerm] = useState<string | undefined>();
  const [termsFilter, setTermsFilter] = useState('Term');
  const [years, setYears] = useState<any[]>([]);
  const [activeYear, setActiveYear] = useState<string | undefined>();
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
  useEffect(() => {
    AuthApi.get('/academic-years/all')
      .then((res) => {
        setYears(res.data.data);
        setActiveYear(res.data.data[res.data.data.length - 1].id);
        setAcadYearsFilter(res.data.data[res.data.data.length - 1].name);
      })
      .catch((err) => {});
  }, []);
  useEffect(() => {
    const fetch = () => {
      setLoading(true);
      setActiveTerm(undefined);
      if (activeYear !== undefined) {
        AuthApi.get(`/terms/all/academic-year/${activeYear}`)
          .then((res) => {
            setTerms(res.data.data);
            setActiveTerm(res.data.data[res.data.data.length - 1].id);
            setTermsFilter(res.data.data[res.data.data.length - 1].name);
          })
          .catch((err) => {});
      }
    };
    fetch();
  }, [activeYear]);
  useEffect(() => {
    setLoading(true);
    setErr(false);
    const fetchDeductions = async () => {
      if (activeTerm !== undefined || activeYear !== undefined) {
        const me: any = await localStorage.getItem('rcaappuser');
        AuthApi.get(`/deductions/academic-year/term/student`, {
          params: {
            'academic-year': activeYear,
            term: activeTerm,
            student: JSON.parse(me).userTypesDTOList[0].user_id,
          },
        })
          .then((res) => {
            setDeductions(res.data.data);
          })
          .catch((err) => {
            setErr(true);
            notifications.show({
              title: 'Failed to get Deductions',
              message: useError(err, 'Fetch Deductions'),
              color: 'red',
              autoClose: 60000,
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };
    fetchDeductions();
  }, [activeTerm]);
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <div>{row.getValue('reason')}</div>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{row.getValue('marks')}</div>,
    },
    {
      accessorKey: 'by',
      header: 'By',
      cell: ({ row }) => (
        <div>{row.original.staffMember?.firstName + ' ' + row.original.staffMember?.lastName}</div>
      ),
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
            className="px-4 py-1 rounded-full border bg-primary text-white"
          >
            <p>Appeal</p>
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full  overflow-y-auto  p-5">
      <Modal opened={appealModal} onClose={close} withCloseButton={false} size="auto">
        <AppealDiscplineModal close={closeAppealModal} deductionId={activeMarks?.id} />
      </Modal>
      <h5 className="font-medium text-[rgba(0,0,0,0.7)]">Discipline Cases</h5>
      <div className="flex flex-col md:flex-row items-end w-full justify-between">
        <div></div>
        <div className="flex gap-2  items-center">
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
                    onClick={async () => {
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
              {years.map((year, i) => {
                return (
                  <DropdownItem
                    key={i}
                    value={year.name}
                    className=" hover:bg-[#0A6B4F89]"
                    onClick={async () => {
                      setAcadYearsFilter(year.name);
                      setActiveYear(year.id);
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
        ) : err ? (
          <div className="flex items-center justify-center h-[400px] flex-col">
            <p className="text-xl">Server Error</p>
            <p className="my-2">Our Techinicians are addressing the issue</p>
            <button
              onClick={() => {
                setAcademicYears([]);
                setLoading(true);
                setTerms([]);
              }}
              className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-red-500 text-white"
            >
              <AiOutlineReload size={15} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        ) : (
          <div>
            {deductions?.length == 0 ? (
              <div className="flex flex-col h-[450px]  items-center justify-center ">
                <Image src={NoDataGif} alt="" className="w-[300px]" />
                <p className="text-sm text-gray-500">No Discpline Cases So Far</p>
              </div>
            ) : (
              <div>
                <DataTable data={deductions} columns={columns} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeductionsPage;
