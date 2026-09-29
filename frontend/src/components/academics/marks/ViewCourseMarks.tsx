import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import { IMark } from '@/types/marks.type';
import { Skeleton, Table } from '@mantine/core';
import React, { FC } from 'react';

interface Props {
  course: ICourse | null;
  academicYearId: string;
  termId: string;
}

const ViewCourseMarks: FC<Props> = ({ course, academicYearId, termId }) => {
  const {
    data: marks,
    loading,
    error,
  } = useGet<IMark[]>(`/academicMarks/all/academic-year/term/course/logged-in-student`, {
    query: {
      course: course?.id,
      'academic-year': academicYearId,
      term: termId,
    },
    defaultData: [],
  });
  return (
    <div className=" w-full flex-col flex">
      <h1 className="text-center">Marks</h1>
      <div className="flex flex-col gap-y-3">
        {course && !loading && !error && marks?.length === 0 && (
          <h1 className="text-center">You're not marked in this course yet</h1>
        )}
        {!loading && marks && marks?.length > 0 && (
          <Table className=" w-full">
            <thead>
              <Table.Tr>
                <Table.Th p={6} align="left" className=" p-2">
                  Course
                </Table.Th>
                <Table.Th p={6} align="left" className=" p-2">
                  Mark Type
                </Table.Th>
                <Table.Th p={6} align="left" className=" p-2">
                  Mark
                </Table.Th>
                <Table.Th p={6} align="left" className=" p-2">
                  Max Marks
                </Table.Th>
                <Table.Th p={6} align="left" className=" p-2">
                  Comment
                </Table.Th>
              </Table.Tr>
            </thead>
            <tbody>
              {marks?.map((mark, i) => {
                return (
                  <Table.Tr key={i}>
                    <Table.Td p={6} align="left" className=" p-2">
                      {mark.course?.courseName}
                    </Table.Td>
                    <Table.Td p={6} align="left" className=" p-2">
                      {mark.markType}
                    </Table.Td>
                    <Table.Td p={6} align="left" className=" p-2">
                      {mark.marks}
                    </Table.Td>
                    <Table.Td p={6} align="left" className=" p-2">
                      {mark.weight}
                    </Table.Td>
                    <Table.Td p={6} align="left" className=" p-2">
                      {mark.comment}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </tbody>
          </Table>
        )}
        {loading && (
          <div className="flex flex-col gap-y-3">
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center w-full">
            <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCourseMarks;
