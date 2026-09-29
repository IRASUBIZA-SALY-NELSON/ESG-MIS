'use client';
import { IClass } from '@/types/class.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiCheck } from 'react-icons/bi';
import InputWrapper from '../core/Input/InputWrapper';
import AsyncMultiSelect from '../core/selects/AsyncMultiSelect';
import { FaLock, FaLockOpen, FaUnlockAlt } from 'react-icons/fa';
import { IAcademicYear, ITerm } from '@/types/other.type';
import AsyncSelect from '../core/selects/AsyncSelect';

interface Props {
  onClose: () => void;
  data?: IClass;
  disabled?: boolean;
  academicYearId: string;
}

const PMUnlockAllClassLessons = ({ onClose, data: toUpdate, academicYearId, disabled }: Props) => {
  const [data, setData] = useState<any>({
    courseIdArray: toUpdate?.coursesList?.map((course) => course.id) ?? [],
    classId: toUpdate?.id ?? '',
  });
  const [termId, setTermId] = useState('');
  const [term, setTerm] = useState<ITerm | null>(null);
  const [academicYear, setAcademicYear] = useState<IAcademicYear | null>(null);
  const [terms, setTerms] = useState<ITerm[]>([]);
  const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('cat');
  const [lockLoading, setLockLoading] = useState(false);

  const handleUnlockAllCourses = async (e: any, classData: any) => {
    e.preventDefault();

    setLoading(true);

    // For second sitting, don't require term or academic year
    if (activeTab === 'second_sitting') {
      try {
        const res = await AuthApi.put(`/academicMarks/second-sitting/unlock`, data.courseIdArray);
        notifications.show({
          title: `Unlocked All courses for ${classData?.className}`,
          message: 'Unlocked All Courses successfully',
          color: 'green',
        });
        onClose();
      } catch (err) {
        const resErr = getResError(err);
        notifications.show({
          title: `Failed to Unlock All Courses for ${classData?.className}`,
          message: resErr,
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // For CAT and EXAM, require term and academic year
    if (!termId && !academicYearId) {
      notifications.show({
        title: 'Please select academic year and term',
        message: 'Please select academic year and term',
        color: 'red',
      });
      setLoading(false);
      return;
    }
    try {
      const res = await AuthApi.put(
        `/academicMarks/unlock?markType=${activeTab?.toUpperCase()}&termId=${termId}`,
        data.courseIdArray,
      );
      notifications.show({
        title: `Unlocked All courses for ${classData?.className}`,
        message: 'Unlocked All Courses successfully',
        color: 'green',
      });
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: `Failed to Unlock All Courses for ${classData?.className}`,
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLockAllCourses = async (classData: any) => {
    setLockLoading(true);

    // For second sitting, don't require term or academic year
    if (activeTab === 'second_sitting') {
      try {
        const res = await AuthApi.put(`/academicMarks/second-sitting/lock`, data.courseIdArray);
        notifications.show({
          title: `Locked All courses for ${classData?.className}`,
          message: 'Locked All Courses successfully',
          color: 'green',
        });
        onClose();
      } catch (err) {
        const resErr = getResError(err);
        notifications.show({
          title: `Failed to Lock All Courses for ${classData?.className}`,
          message: resErr,
          color: 'red',
        });
      } finally {
        setLockLoading(false);
      }
      return;
    }

    // For CAT and EXAM, require term and academic year
    if (!termId && !academicYearId) {
      notifications.show({
        title: 'Please select academic year and term',
        message: 'Please select academic year and term',
        color: 'red',
      });
      setLockLoading(false);
      return;
    }
    try {
      const res = await AuthApi.put(
        `/academicMarks/lock?markType=${activeTab?.toUpperCase()}&termId=${termId}`,
        data.courseIdArray,
      );
      notifications.show({
        title: `Locked All courses for ${classData?.className}`,
        message: 'Locked All Courses successfully',
        color: 'green',
      });
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: `Failed to Lock All Courses for ${classData?.className}`,
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
      onSubmit={(e) => handleUnlockAllCourses(e, toUpdate)}
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
            setActive={(e: any) => setAcademicYear(e)}
            setData={(data: any) => setAcademicYears(data)}
          />
        </div>
        {academicYearId && activeTab !== 'second_sitting' && (
          <div className="flex justify-between items-center gap-x-2">
            <span className=" font-medium text-sm">Term</span>
            <AsyncSelect
              datasrc={`/terms/all/academic-year/${academicYearId}`}
              variant="default"
              onChange={(e: any) => {
                setTermId(e);
              }}
              value={termId ?? ''}
              placeholder="Select term"
              setActive={(e: any) => setTerm(e)}
              setData={(data: any) => setTerms(data)}
            />
          </div>
        )}
        {activeTab === 'second_sitting' && (
          <span className="text-xs text-gray-500 mt-1 ml-2">
            Term selection is not required for second sitting marks
          </span>
        )}
      </div>
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
      <InputWrapper label="Courses">
        <AsyncMultiSelect
          datasrc="/courses/all"
          placeholder=""
          labelKey="courseName"
          value={data.courseIdArray}
          onChange={(e) => {
            setData({ ...data, courseIdArray: e });
          }}
          disabled={true}
        />
      </InputWrapper>
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
          onClick={() => handleLockAllCourses(toUpdate)}
        >
          <FaLock size={17} className="mr-2" /> Lock All
        </Button>
      </div>
    </form>
  );
};

export default PMUnlockAllClassLessons;
