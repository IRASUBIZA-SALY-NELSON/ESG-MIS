'use client';
import MainModal from '@/components/core/modals/modal';
import ViewCourseClasses from '@/components/staff/teachers/ViewCourseClasses';
import { useTeacherContext } from '@/context/TeacherProvider';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { getCurrentTerm, getCurrentYear } from '@/utils/funcs/func2';
import { GroupedAcadCourse, GroupedCourse, groupCoursesByAcadYear } from '@/utils/funcs/func3';
import { Accordion, ActionIcon, Button, SimpleGrid } from '@mantine/core';
import { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { SlRefresh } from 'react-icons/sl';

const Courses = () => {
  const [showClass, setShowClass] = useState({
    isOpen: false,
    course: null as GroupedCourse | null,
    academicYearId: null as any,
    termId: null as any,
  });
  const { loading, error, get, courses } = useTeacherContext();
  const [groupedCourses, setGroupedCourses] = useState<GroupedAcadCourse[]>([]);
  const [recentAcadYear, setRecentAcadYear] = useState<IAcademicYear>();
  const [currentTerm, setCurrentTerm] = useState<ITerm>();

  useEffect(() => {
    if (!courses) return;
    if (!Array.isArray(courses)) {
      return;
    }
    const groupedCourses = groupCoursesByAcadYear(courses);

    const recentAcadYear = getCurrentYear(groupedCourses.map((item) => item.academicYear));
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const currentTerm = getCurrentTerm(courses?.map((course) => course.term)!);
    setRecentAcadYear(recentAcadYear);
    setCurrentTerm(currentTerm);
    setGroupedCourses(groupedCourses);
  }, [courses]);

  return (
    <div className="w-full  overflow-y-auto h-full p-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h5 className="font-semibold mt-4">Your Courses</h5>
          <p className=" text-[#1f1e1e] text-sm">Expand Academic year and terms to courses</p>
        </div>
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
        title="Select Class"
        isOpen={showClass.isOpen}
        onClose={() =>
          setShowClass({
            isOpen: false,
            course: null,
            academicYearId: null,
            termId: null,
          })
        }
      >
        <ViewCourseClasses
          course={showClass.course!}
          academicYearId={showClass.academicYearId}
          termId={showClass.termId}
        />
      </MainModal>
      {courses && !loading && !error && Object.keys(courses).length === 0 && (
        <h1 className="text-center">No Courses assigned to you</h1>
      )}
      {recentAcadYear && currentTerm && (
        <Accordion defaultValue={recentAcadYear?.name} defaultChecked>
          {groupedCourses.map((acadYear, i) => {
            return (
              <Accordion.Item key={i} value={acadYear.academicYear.name}>
                <Accordion.Control>{acadYear.academicYear.name}</Accordion.Control>
                <Accordion.Panel>
                  <Accordion defaultValue={currentTerm?.name}>
                    {acadYear.terms.map((term, j) => {
                      return (
                        <Accordion.Item key={j} value={term.term.name.replace('_', ' ')}>
                          <Accordion.Control>{term.term.name.replace('_', ' ')}</Accordion.Control>
                          <Accordion.Panel>
                            <SimpleGrid
                              cols={{ base: 1, xs: 2, sm: 3, xl: 4 }}
                              spacing={{ base: 10, sm: 'xl' }}
                              verticalSpacing={{ base: 'md', sm: 'xl' }}
                            >
                              {term.courses.map((course, k) => {
                                return (
                                  <div
                                    onClick={() =>
                                      setShowClass({
                                        isOpen: true,
                                        course: course,
                                        academicYearId: acadYear.academicYear.id,
                                        termId: term.term.id,
                                      })
                                    }
                                    role="button"
                                    className={` ${'bg-primary'} m-1 flex p-2 flex-col items-center justify-center hover:scale-105 duration-500 w-full max-w-xs aspect-video rounded-lg cursor-pointer`}
                                    key={k}
                                  >
                                    <h6 className=" text-white text-[17px] font-bold text-center">
                                      {course.course.courseName}
                                    </h6>
                                    <div className="flex text-center flex-wrap justify-center">
                                      {course.classes?.map((classItem, j) => {
                                        return (
                                          <h6
                                            key={j}
                                            className="text-white flex flex-wrap justify-center text-xs w-fit"
                                          >
                                            {course.classes[course.classes.length - 1] !=
                                            classItem ? (
                                              <span className=" whitespace-nowrap">
                                                {' '}
                                                {`${classItem.className} /`}
                                              </span>
                                            ) : (
                                              <span className=" whitespace-nowrap">{`${classItem.className}`}</span>
                                            )}
                                          </h6>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </SimpleGrid>
                          </Accordion.Panel>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default Courses;
