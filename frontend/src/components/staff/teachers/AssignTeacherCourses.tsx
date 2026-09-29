import InputWrapper from '@/components/core/Input/InputWrapper';
import AsyncMultiSelect from '@/components/core/selects/AsyncMultiSelect';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import useGet from '@/hooks/useGet';
import { IAcademicYear } from '@/types/other.type';
import { Teacher, TeacherClassCourse } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useEffect, useState } from 'react';
import { BiCheck } from 'react-icons/bi';

interface Props {
  onClose: () => void;
  data: Teacher;
  refetch: () => void;
}

const AssignTeacherCourse: FC<Props> = ({ onClose, data: toUpdate, refetch }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState({
    classId: '',
    courseId: '',
    teacherId: toUpdate?.id,
    termId: '',
  });
  const [classIdArray, setClassIdArray] = useState<string[]>([]);
  const {
    data: courses,
    loading: loadingCourses,
    error,
    get: getCourses,
  } = useGet<TeacherClassCourse[]>(
    `/teacher-class-course/classes-in/teacher/${toUpdate?.id}/course/${data.courseId}/term/${data.termId}`,
    {
      defaultData: [],
      onMount: false,
    },
  );
  const [acaYearId, setAcadYearId] = useState<string>();
  const [academicYears, setAcademicYears] = useState<IAcademicYear[]>();

  const handleAssignLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // remove currently assigned courses
      const dt = classIdArray.map((classId) => ({
        classId,
        courseId: data.courseId,
        teacherId: data.teacherId,
        termId: data.termId,
      }));
      const res = await AuthApi.patch('/teacher-class-course/assign/many', dt);

      notifications.show({
        title: 'Courses Assigned',
        message: 'Courses have been assigned successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Update Course',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data.termId || !data.courseId) return;
    getCourses();
  }, [data.termId, data.courseId]);

  useEffect(() => {
    setAcadYearId(academicYears?.[academicYears.length - 1]?.id);
  }, [academicYears]);

  // set classIdArray
  useEffect(() => {
    const classList = courses?.map((course) => course.myClazz?.id);
    if (!classList) return;
    setClassIdArray(classList);
  }, [courses]);

  return (
    <form className=" w-full flex flex-col gap-y-3 p-12" onSubmit={handleAssignLesson}>
      {loadingCourses && <h1 className=" text-xs text-center">Loading...</h1>}
      <InputWrapper className=" w-full" label="Academic Year">
        <AsyncSelect
          datasrc={`/academic-years/all`}
          variant="unstyled"
          onChange={(e) => setAcadYearId(e)}
          value={acaYearId ?? ''}
          placeholder="Select academic year"
          setData={(data) => setAcademicYears(data)}
        />
      </InputWrapper>
      {acaYearId && (
        <InputWrapper className=" w-full" label="Term">
          <AsyncSelect
            datasrc={`/terms/all/academic-year/${acaYearId}`}
            variant="unstyled"
            onChange={(e) => setData({ ...data, termId: e })}
            value={data.termId}
            placeholder="Select term"
            setData={(data) => {
              // setData({ ...data, termId: data?.[data.length - 1].id });
            }}
            disabled={!acaYearId}
          />
        </InputWrapper>
      )}
      <InputWrapper label="Course" description="">
        {!loadingCourses && (
          <AsyncSelect
            datasrc="/courses/all/current-year"
            placeholder="select courses"
            labelKey="courseName"
            value={data.courseId}
            // value={courses?.map((course) => course.id)}
            onChange={(e) => {
              setData({ ...data, courseId: e });
            }}
            disabled={!data.termId}
          />
        )}
      </InputWrapper>
      <InputWrapper
        label="Classes"
        description="Select all classes the teacher he/she teaches this course"
      >
        {!loadingCourses && (
          <AsyncMultiSelect
            datasrc="/classes/all/current-year"
            placeholder="select classes"
            labelKey="className"
            value={classIdArray}
            // value={courses?.map((course) => course.id)}
            onChange={(e) => {
              setClassIdArray(e);
            }}
            disabled={!data.termId}
          />
        )}
      </InputWrapper>
      <Button
        disabled={loading || loadingCourses}
        loading={loading}
        variant="filled"
        className=" mt-4"
        w={60}
        mx={'auto'}
        type="submit"
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default AssignTeacherCourse;
