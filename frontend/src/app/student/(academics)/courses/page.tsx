'use client';
import ViewCourseMarks from '@/components/academics/marks/ViewCourseMarks';
import MainModal from '@/components/core/modals/modal';
import { useUserContext } from '@/context/Usercontext';
import useGet from '@/hooks/useGet';
import { ICourse, TeacherCourses } from '@/types/course.type';
import { parseIntoObject, parseIntoObjectTerm } from '@/utils/funcs/func1';
import { ActionIcon, Button, SimpleGrid } from '@mantine/core';
import { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { SlRefresh } from 'react-icons/sl';

const CoursePage = () => {
  const { user } = useUserContext();
  const {
    data: courses,
    loading,
    error,
    get,
  } = useGet<TeacherCourses>(`/courses/all/by-loggedIn-student`, {
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
        <h5 className="font-semibold my-4 text-xl">Your Courses</h5>
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
      <MainModal
        title={`Marks for ${showMarks.course?.courseName}`}
        isOpen={showMarks.isOpen}
        size={'xl'}
        closeOnClickOutside={false}
        onClose={() =>
          setShowMarks({
            isOpen: false,
            course: null,
            academicYearId: null,
            termId: null,
          })
        }
      >
        <ViewCourseMarks
          course={showMarks.course!}
          academicYearId={showMarks.academicYearId}
          termId={showMarks.termId}
        />
      </MainModal>
      {courses && !loading && !error && Object.keys(courses).length === 0 && (
        <h1 className="text-center">No Courses assigned to you</h1>
      )}
      {courses &&
        Object.keys(courses).map((acadYear, i) => {
          return (
            <div key={acadYear} className="flex w-full flex-col gap-y-3 my-5">
              <h5 className="font-bold text-lg mb-4">
                {parseIntoObject(acadYear).AcademicYearName}
              </h5>
              <div className="flex flex-col-reverse">
                {Object.keys(courses[acadYear]).map((term) => (
                  <div key={term} className="flex w-full flex-col">
                    <h1 className="px-2 capitalize font-semibold mb-4">
                      {parseIntoObjectTerm(term).termName.toLowerCase().split('_').join(' ')}
                    </h1>
                    <SimpleGrid
                      key={term}
                      cols={{ base: 1, xs: 2, sm: 3, xl: 4 }}
                      spacing={{ base: 10, sm: 'xl' }}
                      verticalSpacing={{ base: 'md', sm: 'xl' }}
                    >
                      {/* <div className="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 w-full"> */}
                      {courses[acadYear][term].map((course) => (
                        <div
                          role="button"
                          className={` ${'bg-primary'} flex p-2 flex-col items-center justify-center hover:scale-105 duration-500 w-full max-w-xs aspect-video rounded-lg cursor-pointer`}
                          key={i}
                          // href={`/student/courses/${course.courseId}`}
                          onClick={() => {
                            setShowMarks({
                              isOpen: true,
                              course: course,
                              academicYearId: parseIntoObject(acadYear).AcademicYearId,
                              termId: parseIntoObjectTerm(term).termId,
                            });
                          }}
                        >
                          <h6 className=" text-white text-[17px] font-bold text-center">
                            {course.courseName}
                          </h6>
                        </div>
                      ))}
                    </SimpleGrid>
                    {/* </div> */}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default CoursePage;
