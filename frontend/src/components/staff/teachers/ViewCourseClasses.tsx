import { IClass } from '@/types/class.type';
import { ICourse } from '@/types/course.type';
import { GroupedCourse } from '@/utils/funcs/func3';
import Link from 'next/link';
import { FC, useState } from 'react';

interface Props {
  course: GroupedCourse | null;
  academicYearId: string;
  termId: string;
  resourceRoute?: 'courses' | 'past-papers';
}

const ViewCourseClasses: FC<Props> = ({
  course,
  academicYearId,
  termId,
  resourceRoute = 'courses',
}) => {
  console.log(course);
  return (
    <div className="flex flex-col mt-5 gap-y-3">
      {course?.classes?.map((classItem, i) => {
        const href =
          resourceRoute === 'past-papers'
            ? `/staff/docs/past-papers/${course?.course.id}/class/${classItem.id}/term/${termId}`
            : `/staff/courses/${course?.course.courseName}/${classItem.className}?courseId=${course?.course.id}&classId=${classItem.id}&academicYearId=${academicYearId}&termId=${termId}`;
        return (
          <Link
            href={href}
            key={i}
            className="w-full bg-mainPurple hover:bg-primary-900 duration-300 py-2 text-white rounded-md overflow-hidden"
          >
            <h6 className="  bg-inherit text-center cursor-pointer ">{classItem.className}</h6>
          </Link>
        );
      })}
      {course && course.classes.length === 0 && (
        <h1 className="text-center">No Classes assigned to this course</h1>
      )}
      {/* {loading && (
        <div className="flex flex-col gap-y-3">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      )} */}
    </div>
  );
};

export default ViewCourseClasses;
