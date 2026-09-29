'use client';
import drop from '@/assets/dropdown.svg';
import { DataTable } from '@/components/core/data-table';
import SearchForm from '@/components/core/data-table/SearchForm';
import SortButton from '@/components/core/data-table/sort-button';
import { EditIcon } from '@/components/core/icons/icons1';
import CancelDeduction from '@/components/core/modals/CancelDeduction';
import MainModal from '@/components/core/modals/modal';
import { IAcademicYear } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { getCurrentTerm } from '@/utils/funcs/func2';
import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { FcCancel } from 'react-icons/fc';
import { SlRefresh } from 'react-icons/sl';
import { ClipLoader } from 'react-spinners';

const AllDeductions = () => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [years, setYears] = useState<any[]>([]);
  const [termsFilter, setTermsFilter] = useState('Term');
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [activeYear, setActiveYear] = useState<any>();
  const [search, setSearch] = useState('');
  const [activeTerm, setActiveTerm] = useState<any>();
  const [deductions, setDeductions] = useState([]);
  const [shownDeductions, setShownDeductions] = useState([]);
  const [thisYearTerms, setTerms] = useState([]);
  const [showCancel, setShowCancel] = useState({
    show: false,
    deduction: null as any,
  });

  useEffect(() => {
    AuthApi.get('/academic-years/all')
      .then((res) => {
        setYears(res.data.data);
        setActiveYear(res.data.data.find((year: IAcademicYear) => year.status === 'ACTIVE').id);
        setAcadYearsFilter(
          res.data.data.find((year: IAcademicYear) => year.status === 'ACTIVE').name,
        );
      })
      .catch((err) => {});
  }, []);

  useEffect(() => {
    const fetch = () => {
      setLoading(true);
      setActiveTerm(null);
      if (activeYear != null) {
        AuthApi.get(`/terms/all/academic-year/${activeYear}`)
          .then((res) => {
            setTerms(res.data.data);
            const currentTerm = getCurrentTerm(res.data.data);
            setActiveTerm(currentTerm.id);
            setTermsFilter(currentTerm.name.replace('_', ' '));
          })
          .catch((err) => {});
      }
    };
    fetch();
  }, [activeYear]);

  const fetchDeductions = async () => {
    if (activeTerm != null) {
      setLoading(true);
      setErr(false);
      const staff: any = await localStorage.getItem('rcaappuser');
      AuthApi.get(`/deductions/academic-year/term/staff`, {
        params: {
          'academic-year': activeYear,
          term: activeTerm,
          staff: JSON.parse(staff).userTypesDTOList[0].user_id,
        },
      })
        .then((res) => {
          setDeductions(res.data.data);
          setShownDeductions(res.data.data);
        })
        .catch((err) => {
          setErr(true);
          notifications.show({
            title: 'Failed to get Deductions',
            message: err.message,
            color: 'red',
            autoClose: 60000,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  useEffect(() => {
    fetchDeductions();
  }, [activeTerm]);

  useEffect(() => {
    setShownDeductions(
      deductions.filter(
        (ded: any) =>
          ded?.student?.firstName.toLowerCase().includes(search.toLowerCase()) ||
          ded?.student?.lastName.includes(search),
      ),
    );
  }, [search]);

  const columns: ColumnDef<any>[] = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'name',
        header: 'Student Name',
        cell: ({ row }: { row: any }) => (
          <div>
            {row.original.student.firstName} {row.original.student.lastName}
          </div>
        ),
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }: { row: any }) => <div>{row.getValue('reason')}</div>,
      },
      {
        accessorKey: 'marks',
        header: 'Marks',
        cell: ({ row }: { row: any }) => <div>{row.getValue('marks')}</div>,
      },
      {
        accessorKey: 'by',
        header: 'By',
        cell: ({ row }: { row: any }) => (
          <div>
            {row.original.staffMember.firstName} {row.original.staffMember.lastName}
          </div>
        ),
      },
      {
        accessorKey: 'deductionStatus',
        header: ({ column }: { column: any }) => <SortButton column={column} name="Status" />,
        cell: ({ row }: { row: any }) => <div>{row.original.deductionStatus ?? 'N/A'}</div>,
      },
    ];

    const activeYearMatches =
      years?.find((year) => year?.id === activeYear)?.id !==
      years?.find((year) => year?.status === 'ACTIVE')?.id;

    if (!activeYearMatches) {
      baseColumns.push({
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-x-2">
            <ActionIcon variant="transparent" color="blue" onClick={() => {}}>
              <EditIcon />
            </ActionIcon>
            <ActionIcon
              variant="transparent"
              color="blue"
              onClick={() => {
                setShowCancel({
                  show: true,
                  deduction: row.original,
                });
              }}
            >
              <FcCancel size={25} />
            </ActionIcon>
          </div>
        ),
      });
    }

    return baseColumns;
  }, [activeYear, years, setShowCancel]);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex flex-col sm:flex-row justify-between">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Deductions</h2>
        <p className="text-[rgba(67,67,67,0.43)] my-2">All Deductions</p>
      </div>
      <div className="flex gap-2 w-full justify-end">
        <Dropdown className="bg-[#DCEBE3]">
          <DropdownTrigger>
            <Button
              variant="bordered"
              className="border-[1px] border-primary rounded-lg py-2 px-4 text-[80%]"
            >
              Filter by <span className="ml-2 text-primary font-bold">{termsFilter}</span>
              <Image src={drop} alt="" className="w-3 h-3 ml-2" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu className="rounded-lg">
            {thisYearTerms?.map((term: any, i) => {
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
              className="border-[1px] border-primary rounded-lg px-4 text-[80%]"
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
                  onClick={() => {
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
      </div>
      <div>
        {err && (
          <div className="flex items-center justify-center h-[400px] flex-col">
            <p className="text-xl">Server Error</p>
            <p className="my-2">Our Technicians are addressing the issue</p>
            <button className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-red-500 text-white">
              <AiOutlineReload size={15} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        )}
        <div>
          <div>
            {shownDeductions.length === 0 && search.length !== 0 && (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-gray-700 text-lg">No Results</p>
              </div>
            )}
            <DataTable
              noDataMessage="No Deductions So Far"
              renderCustomElement={(table) => (
                <div className="hidden sm:flex flex-row justify-between my-1.5">
                  <SearchForm table={table} setInput={setSearch} />
                  <div className="flex items-center mt-auto gap-x-2">
                    <ActionIcon title="Refresh" size={'lg'} onClick={fetchDeductions}>
                      <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
                    </ActionIcon>
                    {/* <MantineButton onClick={() => {}}>New Deduction</MantineButton> */}
                  </div>
                </div>
              )}
              data={deductions.reverse()}
              loading={loading}
              columns={columns}
              loader={
                <div className="flex h-[400px] items-center justify-center">
                  <ClipLoader color="black" size={20} />
                </div>
              }
            />
          </div>
        </div>
      </div>
      {/* cancel modal */}
      <MainModal
        isOpen={showCancel.show}
        onClose={() => setShowCancel({ show: false, deduction: null })}
        title="Cancel Deduction"
        closeOnClickOutside={false}
      >
        <CancelDeduction
          setShowCancel={setShowCancel}
          deduction={showCancel.deduction}
          refetch={fetchDeductions}
          onClose={() => setShowCancel({ show: false, deduction: null })}
        />
      </MainModal>
    </div>
  );
};

export default AllDeductions;
