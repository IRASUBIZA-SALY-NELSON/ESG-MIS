'use client';
import ViewCourseMarks from '@/components/academics/marks/ViewCourseMarks';
import MainModal from '@/components/core/modals/modal';
import { useUserContext } from '@/context/Usercontext';
import useGet from '@/hooks/useGet';
import { ICourse, TeacherCourses } from '@/types/course.type';
import { AuthApi } from '@/utils/constants';
import { parseIntoObject, parseIntoObjectTerm } from '@/utils/funcs/func1';
import { ActionIcon, Button, SimpleGrid } from '@mantine/core';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { SlRefresh } from 'react-icons/sl';

const StudentDocs = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [displayedCourses, setDisplayedCourses] = useState<any[]>([]);
  const getCourses = async () => {
    AuthApi.get('/courses/all')
      .then((res) => {
        setCourses(res.data.data);
        setLoading(false);
      })
      .catch((err) => {});
  };
  useEffect(() => {
    getCourses();
  }, []);
  useEffect(() => {
    setDisplayedCourses(courses.filter((course) => course.courseName.includes(search)));
  }, [search]);
  return (
    <div className="w-full flex flex-col px-2 ">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold my-4 text-[#00000060]">All Courses</h5>
        <div className="flex items-center gap-5 my-5">
          <input
            type="text"
            placeholder="Type to search Course"
            className="px-4 py-2 rounded-full border-mainPurple border outline-none bg-inherit text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
          <ActionIcon title="Refresh" size="lg" onClick={getCourses}>
            <SlRefresh size={20} className={`${loading ? 'animate-spin' : ''}`} />
          </ActionIcon>
        </div>
      </div>
      {loading && <h1 className=" text-center">Loading...</h1>}
      {courses && !loading && courses.length === 0 && (
        <h1 className="text-center">No Courses assigned to you</h1>
      )}
      <div>
        <div className="grid  grid-cols-2  lg:grid-cols-3 gap-5">
          {courses &&
            displayedCourses.map((course, i) => (
              <Link href={`/student/docs/past-papers/${course.id}`} key={course.id}>
                <div
                  className={` ${
                    i % 2 == 0 ? 'bg-primary' : 'bg-[#0A6B4F80]'
                  } flex p-2 flex-col items-center justify-center hover:scale-105 duration-500 w-full max-w-xs aspect-video rounded-lg cursor-pointer`}
                  key={i}
                >
                  <h6 className=" text-white  font-bold text-center">{course.courseName}</h6>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDocs;
