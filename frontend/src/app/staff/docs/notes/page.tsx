'use client';
import ViewCourseMarks from '@/components/academics/marks/ ViewCourseMarks';
import MainModal from '@/components/core/modals/modal';
import { useUserContext } from '@/context/Usercontext';
import useGet from '@/hooks/useGet';
import { ICourse, TeacherCourses } from '@/types/course.type';
import { parseIntoObject, parseIntoObjectTerm } from '@/utils/funcs/func1';
import { ActionIcon, Button, SimpleGrid } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { SlRefresh } from 'react-icons/sl';

const StudentDocs = () => {
  const { user } = useUserContext();
  const {
    data: courses,
    loading,
    error,
    get,
  } = useGet<TeacherCourses>(`/courses/all/by-loggedIn-teacher`, {
    defaultData: {},
  });

  const [showMarks, setShowMarks] = useState({
    isOpen: false,
    course: null as ICourse | null,
    academicYearId: null as any,
    termId: null as any,
  });

  return (
    <div className="w-full flex flex-col px-2 ">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold my-4 text-[#00000060]">Your Courses</h5>
        <ActionIcon title="Refresh" size="lg" onClick={get}>
          <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
        </ActionIcon>
      </div>
      {loading && <h1 className=" text-center">Loading...</h1>}
      {error && (
        <div className="flex flex-col items-center w-full">
          <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
          <Button onClick={get} mt={3} className="flex items-center gap-x-2" px={3}>
            <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}
      {courses && !loading && !error && Object.keys(courses).length === 0 && (
        <h1 className="text-center">No Courses assigned to you</h1>
      )}
      {courses &&
        Object.keys(courses).map((acadYear, i) => {
          return (
            <div key={acadYear} className="flex w-full flex-col gap-y-3">
              <h5 className="font-semibold text-lg">
                {parseIntoObject(acadYear).AcademicYearName}
              </h5>
              <div className="flex flex-col-reverse">
                {Object.keys(courses[acadYear]).map((term) => (
                  <div key={term} className="flex w-full flex-col">
                    <h1 className="px-2 capitalize mb-3">
                      {parseIntoObjectTerm(term).termName.toLowerCase().split('_').join(' ')}
                    </h1>
                    {['1', '2', '3'].map((year) => (
                      <div key={year} className="grid grid-cols-3 gap-5">
                        {courses[acadYear][term].map((course) => {
                          const classForYear = course.classList.find((cls) =>
                            cls.className.includes(year),
                          );
                          if (classForYear) {
                            const courseName = `${course.courseName} (Year ${year})`;
                            return (
                              <Link
                                href={`/staff/docs/notes/${course.id}/class/${
                                  classForYear.id
                                }/term/${parseIntoObjectTerm(term).termId}`}
                                key={course.id}
                              >
                                <div
                                  className={` ${
                                    i % 2 === 0 ? 'bg-primary' : 'bg-[#0A6B4F80]'
                                  } flex p-2 flex-col items-center justify-center hover:scale-105 duration-500 w-full max-w-xs aspect-video rounded-lg cursor-pointer`}
                                  key={i}
                                  // href={`/student/courses/${course.courseId}`}
                                >
                                  <h6 className="text-white text-[17px] font-bold text-center">
                                    {courseName}
                                  </h6>
                                </div>
                              </Link>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default StudentDocs;
