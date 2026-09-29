'use client';
import { IClass } from '@/types/class.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button, MultiSelect, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState, useEffect } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiCheck } from 'react-icons/bi';
import InputWrapper from '../core/Input/InputWrapper';
import AsyncMultiSelect from '../core/selects/AsyncMultiSelect';
import { FaLock, FaLockOpen, FaUnlockAlt } from 'react-icons/fa';
import { IAcademicYear, ITerm } from '@/types/other.type';
import AsyncSelect from '../core/selects/AsyncSelect';

interface Props {
  onClose: () => void;
  academicYearId: string;
  data?: IClass;
  disabled?: boolean;
}

const PMUnlockManyStudents = ({ onClose, data: toUpdate, academicYearId, disabled }: Props) => {
  const [data, setData] = useState<any>({
    courseIdArray: toUpdate?.coursesList?.map((course) => course.id) ?? [],
    classId: toUpdate?.id ?? '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [termId, setTermId] = useState('');
  const [studentFetchTermId, setStudentFetchTermId] = useState(''); // Term used only for fetching students
  const [courseIds, setCourseIds] = useState<string[]>(
    toUpdate?.coursesList?.map((c) => c.id) ?? [],
  );
  const [isLoading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('cat');
  const [lockLoading, setLockLoading] = useState(false);
  const [terms, setTerms] = useState<any[]>([]);

  // Auto-fetch terms and set first term for student fetching on component mount
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await AuthApi.get(`/terms/all/academic-year/${academicYearId}`);
        const termsData = response?.data?.data || [];
        setTerms(termsData);
        if (termsData.length > 0) {
          setStudentFetchTermId(termsData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch terms:', error);
      }
    };

    if (academicYearId) {
      fetchTerms();
    }
  }, [academicYearId]);

  const handleUnlockManyStudents = async (e: any, classData: any) => {
    e.preventDefault();

    setLoading(true);

    // For second sitting, don't require term
    if (activeTab === 'second_sitting') {
      if (!students?.length || !courseIds?.length) {
        notifications.show({
          title: 'Missing selections',
          message: 'Please select at least one student and at least one course',
          color: 'red',
        });
        setLoading(false);
        return;
      }
      try {
        const res = await AuthApi.put(`/academicMarks/second-sitting/unlock/many-students`, {
          studentIds: students,
          courseIds: courseIds,
        });
        notifications.show({
          title: `Unlocked marks `,
          message: 'Unlocked marks successfully',
          color: 'green',
        });
        onClose();
      } catch (err) {
        const resErr = getResError(err);
        notifications.show({
          title: `Failed to Unlock marks `,
          message: resErr,
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // For CAT and EXAM, require term
    if (!termId || !students?.length || !courseIds?.length) {
      notifications.show({
        title: 'Missing selections',
        message: 'Please select term, at least one student and at least one course',
        color: 'red',
      });
      setLoading(false);
      return;
    }
    try {
      const res = await AuthApi.put(
        `/academicMarks/unlock/many-students/${termId}?academicMarkType=${activeTab?.toUpperCase()}`,
        {
          studentIds: students,
          courseIds: courseIds,
        },
      );

      notifications.show({
        title: `Unlocked marks `,
        message: 'Unlocked marks successfully',
        color: 'green',
      });
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: `Failed to Unlock marks `,
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLockManyStudents = async (classData: any) => {
    setLockLoading(true);

    // For second sitting, don't require term
    if (activeTab === 'second_sitting') {
      if (!students?.length || !courseIds?.length) {
        notifications.show({
          title: 'Missing selections',
          message: 'Please select at least one student and at least one course',
          color: 'red',
        });
        setLockLoading(false);
        return;
      }
      try {
        const res = await AuthApi.put(`/academicMarks/second-sitting/lock/many-students`, {
          studentIds: students,
          courseIds: courseIds,
        });
        notifications.show({
          title: `Locked marks`,
          message: 'Locked marks successfully',
          color: 'green',
        });
        onClose();
      } catch (err) {
        const resErr = getResError(err);
        notifications.show({
          title: `Failed to Lock marks`,
          message: resErr,
          color: 'red',
        });
      } finally {
        setLockLoading(false);
      }
      return;
    }

    // For CAT and EXAM, require term
    if (!termId || !students?.length || !courseIds?.length) {
      notifications.show({
        title: 'Missing selections',
        message: 'Please select term, at least one student and at least one course',
        color: 'red',
      });
      setLockLoading(false);
      return;
    }
    try {
      const res = await AuthApi.put(
        `/academicMarks/lock/many-students/${termId}?academicMarkType=${activeTab?.toUpperCase()}`,
        {
          studentIds: students,
          courseIds: courseIds,
        },
      );
      notifications.show({
        title: `Locked marks`,
        message: 'Locked marks successfully',
        color: 'green',
      });
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: `Failed to Lock marks`,
        message: resErr,
        color: 'red',
      });
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <form
      className=" w-full flex flex-col gap-y-3 p-4 md:p-6 lg:p-12"
      onSubmit={(e) => handleUnlockManyStudents(e, toUpdate)}
    >
      <h1 className=" text-center font-semibold text-sm">
        Unlock Or Lock All {toUpdate?.className} Courses
      </h1>
      <div className="flex flex-col md:flex-row justify-start gap-y-2">
        <div className="flex justify-between items-center gap-x-2">
          <span className=" font-medium text-sm">Academic Year</span>
          <AsyncSelect
            datasrc={`/academic-years/all`}
            variant="default"
            value={academicYearId}
            disabled={true}
            placeholder="Select academic year"
          />
        </div>
        {activeTab !== 'second_sitting' && (
          <div className="flex justify-between items-center gap-x-2">
            <span className=" font-medium text-sm">Term</span>
            <AsyncSelect
              datasrc={`/terms/all/academic-year/${academicYearId}`}
              variant="default"
              onChange={(e: any) => {
                setTermId(e);
                setStudentFetchTermId(e);
                setStudents([]);
              }}
              value={termId ?? ''}
              placeholder="Select term"
              setData={(data: any) => {
                setTerms(data);
                // Auto-select first term for second sitting student fetching
                if (data && data.length > 0 && !studentFetchTermId) {
                  setStudentFetchTermId(data[0].id);
                }
              }}
            />
          </div>
        )}
        {activeTab === 'second_sitting' && (
          <span className="text-xs text-gray-500 mt-1 ml-2">
            Term selection is not required for second sitting marks
          </span>
        )}
      </div>
      {(termId || (activeTab === 'second_sitting' && studentFetchTermId)) && (
        <InputWrapper label="Students" description={`Select Students `}>
          <AsyncMultiSelect
            datasrc={`/student-class-term/class/term?termId=${activeTab === 'second_sitting' ? studentFetchTermId : termId}&classId=${data.classId}`}
            getLabel={(data) => `${data?.firstName} ${data?.lastName}`}
            value={students}
            onChange={(e) => {
              setStudents(e);
            }}
          />
        </InputWrapper>
      )}
      <div className="flex items-center">
        <h2 className="mr-10 font-medium text-sm ">Mark Type: </h2>
        <button
          type="button"
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
          type="button"
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
          type="button"
          className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
            activeTab !== 'second_sitting'
              ? 'bg-[#43434305] text-[bg-primary] '
              : 'bg-primary text-white font-bold'
          }`}
          onClick={() => setActiveTab('second_sitting')}
        >
          SECOND SITTING
        </button>
      </div>
      <div>
        <p>Courses</p>
        {/* Old single-course select */}
        {/* <Select
          data={
            toUpdate?.coursesList?.map((course) => ({
              value: course.id,
              label: course.courseName,
            })) || []
          }
          placeholder="Select Course"
          value={courseId}
          onChange={(e) => {
            e && setCourseId(e);
          }}
        /> */}

        <MultiSelect
          data={
            toUpdate?.coursesList?.map((course) => ({
              value: course.id,
              label: course.courseName,
            })) || []
          }
          placeholder="Select Courses"
          value={courseIds}
          onChange={(vals) => setCourseIds(vals as string[])}
          searchable
          clearable
        />
      </div>
      <div className="flex gap-4 justify-center">
        <Button
          disabled={disabled || isLoading}
          variant="filled"
          loading={isLoading}
          className="flex mt-4 gap-3"
          // w={60}
          mx={'auto'}
          type="submit"
        >
          <FaLockOpen size={17} className="mr-2" /> Unlock All
        </Button>
        <Button
          disabled={disabled || lockLoading}
          variant="filled"
          loading={lockLoading}
          className="flex mt-4 gap-3"
          // w={60}
          mx={'auto'}
          type="button"
          onClick={() => handleLockManyStudents(toUpdate)}
        >
          <FaLock size={17} className="mr-2" /> Lock All
        </Button>
      </div>
    </form>
  );
};

export default PMUnlockManyStudents;
