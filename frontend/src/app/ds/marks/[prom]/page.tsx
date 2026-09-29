'use client';
import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/core/data-table';
import { useParams } from 'next/navigation';
import clsx from 'clsx';
import drop from '@/assets/dropdown.svg';
import { ClipLoader } from 'react-spinners';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import Image from 'next/image';
import { AiOutlineReload } from 'react-icons/ai';
import {
  getAcademicYears,
  getClassesInProm,
  getStudentsClassYear,
  getTermsInYear,
} from '@/utils/funcs';
import MainModal from '@/components/core/modals/modal';
import DeductStudent from '@/components/staff/ds/DeductStudent';
import { ColumnDef } from '@tanstack/react-table';
import DeductClass from '@/components/deductions/DeductClass';
import DeductMany from '@/components/deductions/DeductSelected';
import { getCurrentTerm, getCurrentYear } from '@/utils/funcs/func2';

interface IsDeductData {
  firstName?: string;
  lastName?: string;
  id?: string;
}

const OneClass = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { prom } = useParams();
  const [activeClass, setActiveClass] = useState<any | null>(null);
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [termFilter, setTermFilter] = useState('term');
  const [years, setYears] = useState<any[]>([]);
  const [activeYear, setActiveYear] = useState<string | undefined>();
  const [activeTerm, setActiveTerm] = useState<any>();
  const [students, setStudents] = useState<any[]>([]);
  const [shownStudents, setShownStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [thisYearClasses, setThisYearClasses] = useState<any[]>([]);
  const [thisYearTerms, setThisYearTerms] = useState<any[]>([]);
  const [isDeduct, setIsDeduct] = useState<{ status: boolean; data: IsDeductData | null }>({
    status: false,
    data: null,
  });
  const [isDeductClass, setIsDeductClass] = useState<{
    status: boolean;
    data: IsDeductData | null;
  }>({
    status: false,
    data: null,
  });
  const [deductMany, setDeductMany] = useState(false);
  const onDeduct = (data: any) => {
    setIsDeduct({
      status: true,
      data,
    });
  };

  const onDeductClass = (data: any) => {
    setIsDeductClass({
      status: true,
      data,
    });
  };
  useEffect(() => {
    setShownStudents(
      students.filter(
        (stud) =>
          stud.firstName.toLowerCase().includes(search.toLowerCase()) ||
          stud.lastName.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search]);
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setLoading(true);
        const academicYearsResponse = await getAcademicYears();
        const currentAcademicYear = getCurrentYear(academicYearsResponse.data);
        if (currentAcademicYear) {
          setActiveYear(currentAcademicYear.id);
          setAcadYearsFilter(currentAcademicYear.name);
        }
        setYears(academicYearsResponse.data);
      } catch (error) {
        setError(true);
      }
    };
    fetchAcademicYears();
  }, []);
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const termsInYearResponse = await getTermsInYear(activeYear as any);
        setThisYearTerms(termsInYearResponse.data);
        const currentTerm = getCurrentTerm(termsInYearResponse.data);
        setActiveTerm(currentTerm?.id);
        setTermFilter(currentTerm?.name);
      } catch (error) {
        setError(true);
      }
    };
    if (activeYear != undefined) fetchTerms();
  }, [activeYear]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setError(false);
        setLoading(true);
        const classesInPromResponse = await getClassesInProm(prom as string);
        setThisYearClasses(classesInPromResponse);
        setActiveClass(0);
      } catch (error) {
        setError(true);
      }
    };
    fetchClasses();
  }, [activeYear]);

  const fetchStudents = async () => {
    if (activeTerm !== undefined && thisYearClasses.length !== 0) {
      try {
        setError(false);
        !loading && setLoading(true);
        const studentsClassYearResponse = await getStudentsClassYear(
          activeTerm,
          thisYearClasses[activeClass].id,
        );
        setStudents(studentsClassYearResponse);
        setShownStudents(studentsClassYearResponse);
      } catch (error) {
        setError(true);
      } finally {
        setPageLoading(false);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeTerm !== undefined || thisYearClasses.length !== 0) fetchStudents();
  }, [activeClass, activeTerm, activeYear]);

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
      cell: ({ row }) => <div>{row.original.disciplineMarks}</div>,
    },
    {
      header: 'Deduct/Add',
      cell: ({ row }) => (
        <div className="flex items-center  justify-center">
          <button
            onClick={() => onDeduct(row.original)}
            className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-3 py-1.5"
          >
            - / +
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      {/* <MainModal
        onClose={() => setIsDeductClass({ status: false, data: null })}
        size={'lg'}
        isOpen={isDeductClass.status}
      >
        <DeductClass
          // classInfo={isDeductClass.data}
          termId={activeTerm}
          onCancel={() => {
            setIsDeductClass({ status: false, data: null });
          }}
          refetch={fetchStudents}
        />
      </MainModal> */}
      <MainModal onClose={() => setDeductMany(false)} size={'lg'} isOpen={deductMany}>
        <DeductMany
          onCancel={() => {
            setDeductMany(false);
          }}
          refetch={fetchStudents}
        />
      </MainModal>
      <MainModal
        onClose={() => setIsDeduct({ status: false, data: null })}
        size={'lg'}
        isOpen={isDeduct.status}
      >
        <DeductStudent
          studentName={isDeduct.data?.firstName + ' ' + isDeduct.data?.lastName}
          termId={activeTerm}
          studentId={isDeduct.data?.id as string}
          onCancel={() => {
            setIsDeduct({ status: false, data: null });
          }}
          refetch={fetchStudents}
        />
      </MainModal>
      {pageLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <ClipLoader color="black" size={20} />
        </div>
      ) : (
        <>
          {thisYearClasses.length === 0 && !loading ? (
            <div className="w-full h-[500px] flex items-center justify-center">
              <p>There are no classes so far</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between">
                <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
                  Year {prom} /{' '}
                  {
                    thisYearClasses[activeClass]?.className.split(' ')[
                      thisYearClasses[activeClass]?.className.split(' ').length - 1
                    ]
                  }
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onDeductClass(thisYearClasses[activeClass])}
                    className="px-4 py-2 bg-mainPurple text-white rounded-md"
                  >
                    Deduct/Add to Class
                  </button>
                  <button
                    onClick={() => setDeductMany(true)}
                    className="px-4 py-2 bg-mainPurple text-white rounded-md"
                  >
                    Deduct/Add to Many
                  </button>
                </div>
              </div>
              <div className="flex text-[rgba(1,56,42,0.80)] my-3 -space-x-2 text-xs">
                {thisYearClasses.map((classe, i) => {
                  return (
                    <button
                      key={i}
                      onClick={() => activeClass != i && setActiveClass(i)}
                      className={clsx(
                        'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)]',
                        activeClass == i && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
                      )}
                    >
                      {
                        thisYearClasses[i]?.className.split(' ')[
                          thisYearClasses[i]?.className.split(' ').length - 1
                        ]
                      }
                    </button>
                  );
                })}
              </div>
              <div className="hidden sm:flex flex-row justify-between my-5">
                <input
                  type="text"
                  className="bg-[rgba(67,67,67,0.09)] px-3 py-2 rounded-md border-[2px] border-[rgba(67,67,67,0.03)] w-[30vw] placeholder:text-xs"
                  placeholder="Search Student by Name"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex flex-row gap-3">
                  <Dropdown className="bg-[#DCEBE3] text-black">
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
                      >
                        Filter by <span className="ml-2 text-primary font-bold">{termFilter}</span>
                        <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      {thisYearTerms.map((term, i) => {
                        return (
                          <DropdownItem
                            key={i}
                            value={term.name.replace('_', ' ')}
                            className=" hover:bg-[#0A6B4F89]"
                            onClick={() => {
                              setTermFilter(term.name.replace('_', ' '));
                              setActiveTerm(term.id);
                            }}
                          >
                            {term.name.replace('_', ' ')}
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </Dropdown>
                  <Dropdown className="bg-[#DCEBE3] text-black">
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
                      >
                        Filter by{' '}
                        <span className="ml-2 text-primary font-bold">{AcadYearsFilter}</span>
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
              </div>
              <div>
                {loading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <ClipLoader color="black" size={20} />
                  </div>
                ) : (
                  <div>
                    {error ? (
                      <div className="flex items-center justify-center h-[400px] flex-col">
                        <p className="text-xl">Server Error</p>
                        <p className="my-2">Our Techinicians are addressing the issue</p>
                        <button
                          onClick={() => setActiveYear(activeYear)}
                          className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-red-500 text-white"
                        >
                          <AiOutlineReload
                            size={15}
                            className={`mr-2 ${loading ? 'animate-spin' : ''}`}
                          />
                          Retry
                        </button>
                      </div>
                    ) : (
                      <div>
                        {students?.length === 0 ? (
                          <div className="h-[400px] flex items-center justify-center">
                            <p className="text-gray-700 text-sm">No Students So Far</p>
                          </div>
                        ) : (
                          <div>
                            {shownStudents?.length === 0 && search.length !== 0 ? (
                              <div className="h-[400px] flex items-center justify-center">
                                <p className="text-gray-700 text-sm">
                                  No Results for <span className="text-mainPurple">{search}</span>
                                </p>
                              </div>
                            ) : (
                              <DataTable data={shownStudents} columns={columns} limit={30} />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OneClass;
