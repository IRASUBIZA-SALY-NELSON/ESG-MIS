'use client';
import drop from '@/assets/dropdown.svg';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import { EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import ViewAppeal from '@/components/staff/ds/ViewAppeal';
import { IAcademicYear } from '@/types/other.type';
import { getAcademicYears, getDsAppeals } from '@/utils/funcs';
import { ActionIcon, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SlRefresh } from 'react-icons/sl';
import { ClipLoader } from 'react-spinners';
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
  const [finished, setFinished] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [err, setError] = useState(false);
  const [appeal, setAppeal] = useState<any>();
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [activeAcademicYear, setActiveAcademicYear] = useState({ id: '', name: '' });
  const [status, setStatus] = useState(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [opened, { open, close }] = useDisclosure(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
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

  function openUserModal(appeal: any) {
    setUserModalOpen(true);
    setAppeal(appeal);
  }
  function closeUserModal() {
    setUserModalOpen(false);
    setAppeal(null);
  }
  useEffect(() => {
    setLoading(true);
    setFilteredAppeals(() => {
      return appeals?.filter((app) => {
        if (activeTab == 'all') {
          return true;
        } else {
          return app.status == activeTab.toUpperCase();
        }
      });
    });
    finished && setLoading(false);
  }, [activeTab, appeals]);
  useEffect(() => {
    getAcademicYears().then((res) => {
      setAcademicYears(res.data);
      setActiveAcademicYear(res.data.find((year: IAcademicYear) => year.status === 'ACTIVE').id);
      setAcadYearsFilter(res.data.find((year: IAcademicYear) => year.status === 'ACTIVE').name);
    });
  }, []);
  useEffect(() => {
    searchQuery.length !== 0
      ? setFilteredAppeals((prevFilteredAppeals) =>
          prevFilteredAppeals.filter(
            (appeal) =>
              appeal.student?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              appeal.student?.lastName.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )
      : setFilteredAppeals(() => {
          return appeals?.filter((app) => {
            if (activeTab == 'all') {
              return true;
            } else {
              return app.status == activeTab.toUpperCase();
            }
          });
        });
  }, [searchQuery]);

  useEffect(() => {
    !loading && setLoading(true);
    getDsAppeals()
      .then((res) => {
        setAppeals(res.data);
        setFinished(true);
        setFilteredAppeals(res.data);
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [academicYears]);
  useEffect(() => {
    if (refreshing == true) {
      setLoading(true);
      getDsAppeals()
        .then((res) => {
          setAppeals(res.data);
          setFinished(true);
          setFilteredAppeals(
            res.data.filter(
              (appeal: any) => appeal.status.toLowerCase() === activeTab.toLowerCase(),
            ),
          );
        })
        .catch((err) => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    }
  });
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          {row.original.disciplineMarksReduction.student?.firstName +
            ' ' +
            row.original.disciplineMarksReduction.student?.lastName}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div>{row.getValue('description')}</div>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{row.original.disciplineMarksReduction.marks}</div>,
    },
    {
      accessorKey: 'view',
      header: 'View',
      cell: ({ row }) => (
        <div className="flex items-center  justify-center">
          <button
            onClick={() => {
              openUserModal(row.original);
            }}
          >
            <EyeIcon />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <Modal opened={userModalOpen} onClose={closeUserModal} withCloseButton={true} size="auto">
        <ViewAppeal appeal={appeal} close={closeUserModal} />
      </Modal>
      <h5 className="font-medium text-[rgba(0,0,0,0.7)]">Appeals</h5>
      <div className="flex flex-col md:flex-row items-end w-full justify-between">
        <div className="w-full md: flex mt-4 mb-2 md:mb-0 relative">
          <button
            className={`py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg ${
              activeTab != 'all'
                ? 'bg-[#DCEBE3] text-[#01382A]'
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'pending'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg  ml-[-13px] border-l-[2px] border-l-[#ccc] ${
              activeTab != 'approved'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'rejected'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected
          </button>
        </div>
        <div className="flex gap-2 items-end">
          <ActionIcon
            title="Refresh"
            size="lg"
            onClick={() => {
              setRefreshing(true);
            }}
          >
            <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
          </ActionIcon>
          {/* <Dropdown className="bg-[#DCEBE3]">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="border-[1px] border-primary rounded-lg py-2 px-4 text-[80%]"
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
                    }}
                  >
                    {year.name}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown> */}
        </div>
      </div>

      <div className="mt-3" style={{ backgroundColor: 'transparent' }}>
        {loading ? (
          <div className="w-full flex justify-center h-[500px] items-center">
            <ClipLoader size={20} />
          </div>
        ) : err ? (
          <div className="flex items-center justify-center h-[500px]">
            <p>An error Occured</p>
          </div>
        ) : (
          <div>
            {filteredAppeals?.length == 0 ? (
              <div className="flex h-[500px] items-center justify-center ">
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
        <ExportForm data={appeals!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default AppealsPage;
