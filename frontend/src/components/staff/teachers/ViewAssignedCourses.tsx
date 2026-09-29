import AcademicFilter from '@/components/academics/AcademicFilter';
import { DataTable } from '@/components/core/data-table';
import SortButton from '@/components/core/data-table/sort-button';
import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { Teacher, TeacherClassCourse } from '@/types/teacher.type';
import { getCurrentTerm, getCurrentYear } from '@/utils/funcs/func2';
import { Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
  toUpdate: Teacher | null;
}

const ViewAssignedCourses = ({ onClose, toUpdate }: Props) => {
  const [acadYear, setAcadYear] = React.useState<string>();
  const [term, setTerm] = React.useState<string>();
  const {
    data: courses,
    loading: loadingCourses,
    error,
    get: getCourses,
  } = useGet<TeacherClassCourse[]>(
    `/teacher-class-course/teacher/term/${toUpdate?.id}/term/${term}`,
    {
      defaultData: [],
      onMount: false,
    },
  );
  const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
  const [terms, setTerms] = useState<ITerm[]>([]);

  useEffect(() => {
    if (academicYears.length > 0 && !acadYear) {
      const currentYear = getCurrentYear(academicYears, true);
      if (currentYear) {
        setAcadYear(currentYear.id);
      }
    }
    if (terms.length > 0 && !term) {
      setTerm(getCurrentTerm(terms, true)?.id);
    }
  }, [terms, academicYears]);

  useEffect(() => {
    if (term) {
      getCourses();
    }
  }, [term]);

  const columns: ColumnDef<TeacherClassCourse>[] = [
    {
      header: ({ column }) => <SortButton column={column} name="Course Name" />,
      accessorKey: 'courseName',
      accessorFn: (row) => row.course?.courseName,
      cell: ({ row }) => <div>{row.original.course?.courseName}</div>,
    },
    {
      header: ({ column }) => <SortButton column={column} name="Course Credits" />,
      accessorKey: 'courseCredits',
      accessorFn: (row) => row.course?.courseCredits,
      cell: ({ row }) => <div>{row.original.course?.courseCredits}</div>,
    },
    {
      header: ({ column }) => <SortButton column={column} name="Class Name" />,
      accessorKey: 'className',
      accessorFn: (row) => row.myClazz?.className,
      cell: ({ row }) => <div>{row.original.myClazz?.className}</div>,
    },
  ];

  const mess =
    courses?.length === 0 && !term
      ? 'Select a term to view assigned courses'
      : 'No assigned courses';

  return (
    <div className=" w-full flex items-center flex-col  pt-3 gap-6">
      <AcademicFilter
        getAcademicYear={(academicYear) => setAcadYear(academicYear?.id)}
        getTerm={(term) => setTerm(term?.id)}
        setAcademicYears={setAcademicYears}
        setTerms={setTerms}
        academicYearId={acadYear}
        termId={term}
      />
      <DataTable
        columns={columns}
        data={courses}
        loading={loadingCourses}
        // error={error}
        noDataMessage={mess}
      />
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default ViewAssignedCourses;
