'use client';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import MainModal from '@/components/core/modals/modal';
import TeacherProfileModal from '@/components/staff/teachers/TeacherProfileModal';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiExport } from 'react-icons/bi';
import { SlRefresh } from 'react-icons/sl';
import 'react-loading-skeleton/dist/skeleton.css';
import backBtn from '@/assets/back.svg';
import { DarkEye } from '@/components/core/icons/icons1';
import { IAcademicYear, ITerm } from '@/types/other.type';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import { useDisclosure } from '@mantine/hooks';
import { FiEye } from 'react-icons/fi';

const UnApploadedTeachers = () => {
  const [data, setData] = useState([]);
  const [opened, { open, close }] = useDisclosure();
  const [unApploadedTeachers, setUnApploadedTeachers] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [termId, setTermId] = useState('');
  const [term, setTerm] = useState<ITerm | null>(null);
  const [academicYear, setAcademicYear] = useState<IAcademicYear | null>(null);
  const [acaYearId, setAcadYearId] = useState('');
  const [terms, setTerms] = useState<ITerm[]>([]);
  const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showClasses, setShowClasses] = useState(false);
  const [individualClasses, setIndividualClasses] = useState<any>([]);
  const [teacher, setTeacher] = useState<Teacher>();
  const openTeacherModal = (teacher: Teacher) => {
    setTeacher(teacher);
    open();
  };
  const getUnApploadedTeachers = (id?: string) => {
    const tid = id || termId;
    if (!tid) return;
    setLoading(true);
    setError('');
    AuthApi.get(`/teachers/not_finished_marking/all/${tid}`)
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        setData(rows);
        const uniqueTeachers: Record<string, any> = {};
        rows.forEach((item: any) => {
          const teacher = item?.teacher ?? item;
          if (teacher?.id) uniqueTeachers[teacher.id] = teacher;
        });
        setUnApploadedTeachers(Object.values(uniqueTeachers) as any);
      })
      .catch(() => {
        setError('Could not load teachers');
        setUnApploadedTeachers([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (termId) {
      getUnApploadedTeachers();
    }
  }, [termId]);
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => <div>{row.original?.firstName || 'Not set'}</div>,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: ({ row }) => <div>{row.original?.lastName || 'Not set'}</div>,
    },
    {
      accessorKey: 'Email',
      header: 'Course',
      cell: ({ row }) => <div>{row.original?.email || 'Not set'}</div>,
    },
    {
      accessorKey: 'Class',
      header: 'View Classes',
      cell: ({ row }) => (
        <div className="w-1/2 flex justify-center">
          <span className="cursor-pointer" onClick={() => row.original?.id && openTeacherClasses(row.original.id)}>
            <FiEye color="#0357BD" size={18} />
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'View',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="w-full flex justify-center">
          <span onClick={() => openTeacherModal(row.original)}>
            <DarkEye />
          </span>
        </div>
      ),
    },
  ];

  const openTeacherClasses = (teacherId: string) => {
    const classes = data.filter((item: any) => {
      const teacher = item?.teacher ?? item;
      return teacher?.id === teacherId;
    });
    setIndividualClasses(classes);
    setShowClasses(true);
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm pb-9">
      <MainModal
        isOpen={opened}
        onClose={close}
        size={'auto'}
        title="Teacher's Profile"
        closeOnClickOutside={true}
      >
        <TeacherProfileModal closeUserModal={close} currentUser={teacher} />
      </MainModal>
      <div className="flex gap-2 items-center">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
          Teachers Who Have Not Uploaded Marks
        </h2>
      </div>
      <div>
        <div className="flex flex-col-reverse sm:flex-row justify-end w-full my-5">
          <div className="flex items-center justify-end gap-3 w-full sm:w-[50%]"></div>
        </div>
        <div>
          {!termId ? (
            <div>
              <div className="flex flex-col ml-auto gap-y-2">
                <div className="flex justify-between items-center gap-x-2">
                  <span className=" font-medium text-sm">Academic Year</span>
                  <AsyncSelect
                    datasrc={`/academic-years/all`}
                    variant="default"
                    onChange={(e) => setAcadYearId(e)}
                    value={acaYearId ?? ''}
                    placeholder="Select academic year"
                    setActive={(e) => setAcademicYear(e)}
                    setData={(data) => setAcademicYears(data)}
                  />
                </div>
                {acaYearId && (
                  <div className="flex justify-between items-center gap-x-2">
                    <span className=" font-medium text-sm">Term</span>
                    <AsyncSelect
                      datasrc={`/terms/all/academic-year/${acaYearId}`}
                      variant="default"
                      onChange={(e) => {
                        if (!e) return;
                        setTermId(e);
                      }}
                      value={termId ?? ''}
                      placeholder="Select term"
                      setActive={(e) => setTerm(e)}
                      setData={(data) => setTerms(data)}
                    />
                  </div>
                )}
              </div>

              <div className="w-full mt-10">
                <h4 className="text-md font-bold text-center w-full">
                  Select Academic Year and Term
                </h4>
              </div>
            </div>
          ) : loading ? (
            <div className="overflow-x-auto ">
              <TableSkeleton columns={columns} />
            </div>
          ) : unApploadedTeachers?.length === 0 && !loading && !error ? (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-700">No Teachers Found!</p>
              <p className="text-gray-700">Everyone Uploaded Marks!</p>
            </div>
          ) : (
            !error && (
              <DataTable
                data={unApploadedTeachers}
                columns={columns}
                searchKey="firstName"
                renderCustomElement={(table) => (
                  <div className="flex flex-col ml-auto gap-y-2">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className=" font-medium text-sm">Academic Year</span>
                      <AsyncSelect
                        datasrc={`/academic-years/all`}
                        variant="default"
                        onChange={(e) => setAcadYearId(e)}
                        value={acaYearId ?? ''}
                        placeholder="Select academic year"
                        setActive={(e) => setAcademicYear(e)}
                        setData={(data) => setAcademicYears(data)}
                      />
                    </div>
                    {acaYearId && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className=" font-medium text-sm">Term</span>
                        <AsyncSelect
                          datasrc={`/terms/all/academic-year/${acaYearId}`}
                          variant="default"
                          onChange={(e) => setTermId(e)}
                          value={termId ?? ''}
                          placeholder="Select term"
                          setActive={(e) => setTerm(e)}
                          setData={(data) => setTerms(data)}
                        />
                      </div>
                    )}
                  </div>
                )}
                actionElement={
                  <div className=" flex items-center gap-x-2">
                    <ActionIcon
                      title="Refresh"
                      size={'lg'}
                      onClick={() => getUnApploadedTeachers()}
                    >
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
                  </div>
                }
              />
            )
          )}
          {error && (
            <div className="flex flex-col items-center w-full">
              <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
              <Button
                onClick={() => getUnApploadedTeachers()}
                mt={3}
                className="flex items-center gap-x-2"
                px={3}
              >
                <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Teachers Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showClasses}
        title={`${individualClasses[0]?.teacher?.firstName}'s classes with unapploaded marks`}
        onClose={() => setShowClasses(false)}
      >
        <div className="flex flex-col space-y-4">
          {' '}
          {individualClasses.map((individualClass: any, index: any) => (
            <div
              key={individualClass.id || index}
              className="bg-gray-100 p-4 py-2 rounded-md flex items-center shadow-sm"
            >
              <div className="flex-grow">
                <p className="text-[100%] font-medium">
                  Course: {individualClass?.examCourseStudentsRelation?.course?.courseName}
                </p>
                <p className="text-[80%] text-gray-600 w-full flex justify-between">
                  Class: {individualClass?.examCourseStudentsRelation?.myClazz?.className}
                </p>
                <p className="text-[80%] text-gray-600 w-full flex justify-between">
                  Number of Students:{' '}
                  {individualClass?.examCourseStudentsRelation?.numberOfStudents}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MainModal>
    </div>
  );
};

export default UnApploadedTeachers;
