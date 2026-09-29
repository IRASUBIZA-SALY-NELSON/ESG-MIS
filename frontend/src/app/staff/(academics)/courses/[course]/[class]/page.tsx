'use client';
import AddUpdateStudentMarks from '@/components/academics/AddUpdateStudentMarks';
import { DataTable } from '@/components/core/data-table';
import ImportForm from '@/components/core/data-table/ImportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { EditIcon } from '@/components/core/icons/icons1';
import ExportTemplate from '@/components/core/modals/ExportTemplate';
import ExportMarks from '@/components/core/modals/ExportMarks';
import MainModal from '@/components/core/modals/modal';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import useGet from '@/hooks/useGet';
import { IMark } from '@/types/marks.type';
import { Student } from '@/types/student.types';
import { getCourseWeight } from '@/utils/funcs';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef, Table } from '@tanstack/react-table';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiChevronLeft, BiExport, BiImport } from 'react-icons/bi';
import { SlRefresh } from 'react-icons/sl';
import AddMarks from './_addMarks';
import { ITerm } from '@/types/other.type';
import { enumToCamelCase } from '@/utils/funcs/func1';
import { FaLock } from 'react-icons/fa';
import { Tooltip } from '@mantine/core';
import { toFixed } from '@/utils/funcs/func2';

const MarksPage = () => {
  const [activeTab, setActiveTab] = useState('cat');
  const [showExport, setShowExport] = useState(false);
  const [showExportMarks, setShowExportMarks] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [activeMenu, setActiveMenu] = useState('marks');
  const query = useParams();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const courseId = searchParams.get('courseId');
  const acaYearId = searchParams.get('academicYearId');
  const term_id = searchParams.get('termId');
  console.log(classId, courseId, acaYearId, term_id);
  const [termId, setTermId] = useState('');
  const [weight, setWeight] = useState<number | null>(null);
  const { data, loading, error, get } = useGet<IMark[]>(
    `/academicMarks/all/filtered-by-all-with-class`,
    {
      query: {
        classId,
        academicYearId: acaYearId,
        courseId,
        termId: termId ?? '',
      },
      // paginated: true,
      onMount: false,
      pagination: {
        limit: 50,
      },
    },
  );
  const {
    data: secondSittingData,
    loading: secondSittingLoading,
    error: secondSittingError,
    get: getSecondSitting,
  } = useGet<IMark[]>(`/academicMarks/all/second-sitting/filtered-by-all-with-class`, {
    query: {
      classId,
      academicYearId: acaYearId,
      courseId,
    },
    // paginated: true,
    onMount: false,
    pagination: {
      limit: 50,
    },
  });
  const [editMarks, setEditMarks] = useState({
    status: false,
    data: null as Student | null,
  });
  const [marksData, setMarksData] = useState<IMark[]>([]);
  const { data: terms, loading: termsLoading } = useGet<ITerm[]>(
    `/terms/all/academic-year/${acaYearId}`,
  );

  const columns: ColumnDef<IMark>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      accessorFn: (row) => row.student?.firstName,
      cell: ({ row }) => <div>{row.original?.student?.firstName}</div>,
    },
    {
      accessorKey: 'student.lastName',
      header: 'Last Name',
      cell: ({ row }) => <div>{row.original.student?.lastName}</div>,
    },
    {
      accessorKey: 'student.email',
      header: 'Email',
      cell: ({ row }) => <div>{row.original.student?.email}</div>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{toFixed(row.original.marks, 1)}</div>,
    },
    {
      accessorKey: 'weight',
      header: 'Max Marks',
      cell: ({ row }) => <div>{row.original.weight}</div>,
    },
    {
      header: 'Edit/View Marks',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          {/* <ActionIcon variant="transparent" onClick={() => {}}>
            <DarkEye />
          </ActionIcon> */}
          {row.original?.lockStatus === 'UNLOCKED' ? (
            <ActionIcon
              variant="transparent"
              onClick={() => {
                setEditMarks({
                  status: true,
                  data: row.original.student,
                });
              }}
            >
              <EditIcon />
            </ActionIcon>
          ) : (
            <Tooltip label="Locked">
              <ActionIcon variant="transparent" disabled={true}>
                <FaLock />
              </ActionIcon>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const searchStudents = (e: ChangeEvent<HTMLInputElement>, table: Table<any>) => {
    // table?.getColumn(searchKey)?.setFilterValue(e.target.value);
    table?.setGlobalFilter(e.target.value);
  };

  useEffect(() => {
    if (!terms) return;
    setTermId(terms[terms.length - 1].id);
  }, [terms]);

  useEffect(() => {
    if (!termId) return;
    if (activeTab === 'second_sitting') {
      getSecondSitting();
    } else {
      get();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId, activeTab]);

  // filter by markType
  useEffect(() => {
    if (activeTab === 'second_sitting') {
      if (secondSittingData) {
        setMarksData(secondSittingData);
      }
      return;
    }

    if (!data) return;
    if (activeTab === 'total') {
      // filter by markType EXAM and CAT in case there are other mark types (maybe in future)
      const _data = data.filter((d) => d.markType === 'CAT' || d.markType === 'EXAM');
      const combinedData = _data.map((d) => {
        // find the other mark type
        const sameCourseMarks = _data.find((m) => {
          return (
            m.course?.id === d.course?.id &&
            m.student?.id === d.student?.id &&
            m.markType !== d.markType
          );
        });

        console.log('Here are some marks ');
        console.log(sameCourseMarks, d);

        const totalMarks = ((sameCourseMarks?.marks ?? 0) + d.marks) as any;
        const totalWeight = ((sameCourseMarks?.weight ?? 0) + d.weight) as any;
        return { ...d, marks: totalMarks, weight: totalWeight };
      });
      // remove duplicates
      const filteredData = combinedData.filter(
        (d, i, self) => i === self.findIndex((t) => t.student.id === d.student.id),
      );

      setMarksData(filteredData);
      return;
    }
    console.log('data', data);
    const filteredData = data.filter((d) => d.markType === activeTab.toUpperCase());
    setMarksData(filteredData);
  }, [activeTab, data, secondSittingData]);

  const title = `${decodeURIComponent(query.course.toString())} (${decodeURIComponent(
    query.class.toString(),
  )})`;

  // get course weight
  useEffect(() => {
    getCourseWeight(courseId).then((res) => setWeight(res));
  }, [courseId]);

  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center gap-x-2">
          <ActionIcon radius={'xl'} size={25} variant="outline">
            <Link href="/staff/courses">
              <BiChevronLeft size={30} />
            </Link>
          </ActionIcon>
          <h5 className="font-semibold capitalize">
            {decodeURIComponent(query.course.toString())} (
            {decodeURIComponent(query.class.toString())})
          </h5>
          {/* <ActionIcon className="ml-12" size={25} variant="outline">
            <Link href="/staff/courses">All Courses</Link>
          </ActionIcon> */}
        </div>
      </div>
      <div className="flex w-full justify-center items-center">
        <div className="flex items-center gap-x-2">
          <button
            className={`py-2  text-[80%] px-5 rounded-lg ${
              activeMenu != 'marks'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => {
              if (activeMenu !== 'marks') get();
              setActiveMenu('marks');
            }}
          >
            Marks
          </button>
          <button
            className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
              activeMenu != 'students'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setActiveMenu('students')}
          >
            Students
          </button>
        </div>
      </div>
      <div className="flex justify-between mt-3 items-center">
        <div className="flex">
          {activeMenu === 'marks' && (
            <>
              <button
                className={`py-2  text-[80%] px-5 rounded-lg ${
                  activeTab != 'cat'
                    ? 'bg-[#43434305] text-[bg-primary] '
                    : 'bg-primary text-white font-bold'
                }`}
                onClick={() => setActiveTab('cat')}
              >
                CAT
              </button>
              <button
                className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
                  activeTab != 'exam'
                    ? 'bg-[#43434305] text-[bg-primary] '
                    : 'bg-primary text-white font-bold'
                }`}
                onClick={() => setActiveTab('exam')}
              >
                EXAM
              </button>
              <button
                className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
                  activeTab !== 'total'
                    ? 'bg-[#43434305] text-[bg-primary] '
                    : 'bg-primary text-white font-bold'
                }`}
                onClick={() => setActiveTab('total')}
              >
                TOTAL
              </button>
              <button
                className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
                  activeTab !== 'second_sitting'
                    ? 'bg-[#43434305] text-[bg-primary] '
                    : 'bg-primary text-white font-bold'
                }`}
                onClick={() => setActiveTab('second_sitting')}
              >
                SECOND SITTING
              </button>
            </>
          )}
        </div>
        <div className=" flex items-center gap-x-2">
          <AsyncSelect
            datasrc={`/terms/all/academic-year/${acaYearId}`}
            variant="default"
            onChange={(e) => setTermId(e)}
            value={termId ?? ''}
            placeholder="Select term"
          />
        </div>
      </div>
      {(activeTab === 'second_sitting' ? secondSittingLoading : loading) && (
        <TableSkeleton columns={columns} />
      )}
      {(activeTab === 'second_sitting' ? secondSittingError : error) && (
        <div className="flex flex-col items-center w-full">
          <span className="flex items-center justify-center text-red-700 text-sm">
            {activeTab === 'second_sitting' ? secondSittingError : error}
          </span>
          <Button
            onClick={activeTab === 'second_sitting' ? getSecondSitting : get}
            mt={3}
            className="flex items-center gap-x-2"
            px={3}
          >
            <AiOutlineReload
              size={20}
              className={`mr-2 ${(activeTab === 'second_sitting' ? secondSittingLoading : loading) ? 'animate-spin' : ''}`}
            />
            Retry
          </Button>
        </div>
      )}
      {!termId && (
        <h1 className=" text-sm text-center opacity-70 text-mainPurple">Please select a term</h1>
      )}
      {activeMenu === 'students' ? (
        <>
          <AddMarks termId={termId} />
        </>
      ) : (
        <>
          {!loading && !error && (
            <DataTable
              noDataMessage={`No ${activeTab} marks found`}
              renderCustomElement={(table) => (
                <div className="flex text-sm flex-col md:flex-row justify-between my-5">
                  <input
                    type="text"
                    value={table?.getState().globalFilter ?? ''}
                    onChange={(e) => searchStudents(e, table)}
                    className="bg-[rgba(67,67,67,0.02)] w-[250px] md:w-[30vw] my-1 md:my-auto px-3 h-12 rounded-md border-[1px] border-[rgba(67,67,67,0.03)]"
                    placeholder="Search ..."
                  />
                  <div className=" flex items-center gap-x-2">
                    <ActionIcon
                      title="Refresh"
                      size={'lg'}
                      onClick={activeTab === 'second_sitting' ? getSecondSitting : get}
                    >
                      <SlRefresh
                        size={20}
                        className={`${(activeTab === 'second_sitting' ? secondSittingLoading : loading) ? 'animate-spin' : ''}`}
                      />
                    </ActionIcon>
                    <Button
                      className=" gap-x-2 bg-mainPurple"
                      onClick={() => setShowExport(true)}
                      variant="filled"
                    >
                      <BiExport size={20} className="mr-2" />
                      Export Template
                    </Button>
                    <Button
                      className=" gap-x-2 bg-mainPurple"
                      onClick={() => setShowExportMarks(true)}
                      variant="filled"
                    >
                      <BiExport size={20} className="mr-2" />
                      Export Marks
                    </Button>
                    <Button
                      className=" gap-x-2 bg-mainPurple"
                      onClick={() => setShowImport(true)}
                      variant="filled"
                    >
                      <BiImport size={20} className="mr-2" />
                      Import Marks
                    </Button>
                  </div>
                </div>
              )}
              data={marksData ?? []}
              columns={columns}
              limit={50}
            />
          )}
        </>
      )}
      {/* Modals */}
      <MainModal
        isOpen={editMarks.status}
        onClose={() => setEditMarks({ status: false, data: null })}
        title={`Edit ${editMarks.data?.firstName} ${
          editMarks.data?.lastName
        } Marks in ${decodeURIComponent(query?.course.toString())}`}
        size={'xl'}
        closeOnClickOutside={false}
      >
        <AddUpdateStudentMarks
          student={editMarks.data}
          refetch={get}
          onClose={() => setEditMarks({ status: false, data: null })}
        />
      </MainModal>
      {/* import modal */}
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Marks"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal={`academic-marks?classId=${classId}&courseId=${courseId}&academicYearId=${acaYearId}&termId=${termId}`}
          formatUrl="https://docs.google.com/spreadsheets/d/1gbdwk7rQM6kVPFTmCsjZSKKq-aSq5TQygMBtyWSX49E/edit#gid=0"
          onClose={() => {
            (activeTab === 'second_sitting' ? getSecondSitting : get)();
            setShowImport(false);
          }}
          notes='To get a list of students to upload. Go to "Students" tab and click on "Export Students" button. Remember to Write mark type (`CAT`, `EXAM`,`SECOND_SITTING`) in the excel sheet.'
          renderPreview={(data) => <ExcelImportPreviewer data={data} />}
          title={`Import Marks for ${title} in ${enumToCamelCase(terms?.find((t) => t.id === termId)?.name)}`}
          // exportComponent={

          // }
        />
      </MainModal>
      {/* Export marks modal */}
      <MainModal
        size={'lg'}
        isOpen={showExportMarks}
        title="Export Marks (Excel / PDF)"
        onClose={() => setShowExportMarks(false)}
        closeOnClickOutside={false}
      >
        {classId && courseId && termId && (
          <ExportMarks
            onClose={() => setShowExportMarks(false)}
            tableName={`Marks - ${title}`}
            classId={classId}
            courseId={courseId}
            termId={termId}
            courseName={decodeURIComponent(query.course.toString())}
            className={decodeURIComponent(query.class.toString())}
            academicYearId={acaYearId ?? undefined}
          />
        )}
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Student Template By Course"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportTemplate
          data={data!}
          term_id={termId}
          classId={classId!}
          onClose={() => setShowExport(false)}
          tableName={`Students - ${title}`}
          weight={weight!}
          courseId={courseId!}
        />
      </MainModal>
    </div>
  );
};

export default MarksPage;
