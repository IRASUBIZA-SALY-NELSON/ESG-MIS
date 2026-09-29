import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FaLockOpen, FaLock } from 'react-icons/fa';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { IClass } from '@/types/class.type';
import { IAcademicYear, ITerm } from '@/types/other.type';
import AsyncSelect from '../core/selects/AsyncSelect';
import { ClipLoader } from 'react-spinners';

interface Props {
  onClose: () => void;
  data?: IClass;
  disabled?: boolean;
  academicYearId: string;
}

const PMUnlockSingleLesson = ({ onClose, data: toUpdate, academicYearId }: Props) => {
  const [termId, setTermId] = useState('');
  const [activeTab, setActiveTab] = useState('cat');
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const handleUnlock = async (course: any) => {
    // For second sitting, don't require term
    if (activeTab === 'second_sitting') {
      setLoadingButton(course.id);
      try {
        const res = await AuthApi.put(`/academicMarks/second-sitting/unlock`, [course.id]);
        notifications.show({
          title: `${course?.courseName} Unlocked Successfully`,
          message: 'Course has been unlocked successfully',
          color: 'green',
        });
        onClose();
      } catch (err) {
        const resErr = getResError(err);
        notifications.show({
          title: `Failed to Unlock ${course?.courseName}`,
          message: resErr,
          color: 'red',
        });
      } finally {
        setLoadingButton(null);
      }
      return;
    }

    // For CAT and EXAM, require term
    if (!termId) {
      notifications.show({
        title: 'Please select academic year and term',
        message: 'Please select academic year and term',
        color: 'red',
      });
      return;
    }
    setLoadingButton(course.id);
    try {
      const res = await AuthApi.put(
        `/academicMarks/unlock/class/${toUpdate?.id}/${termId}/${course?.id}?academicMarkType=${activeTab.toUpperCase()}`,
      );
      notifications.show({
        title: `${course?.courseName} Unlocked Successfully`,
        message: 'Course has been unlocked successfully',
        color: 'green',
      });
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: `Failed to Unlock ${course?.courseName}`,
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoadingButton(null);
    }
  };

  const handleLock = async (course: any) => {
    // For second sitting, don't require term
    if (activeTab === 'second_sitting') {
      setLoadingButton(course.id);
      try {
        const res = await AuthApi.put(`/academicMarks/second-sitting/lock`, [course.id]);
        notifications.show({
          title: `${course?.courseName} Locked Successfully`,
          message: 'Course has been locked successfully',
          color: 'green',
        });
        onClose();
      } catch (err) {
        const resErr = getResError(err);
        notifications.show({
          title: `Failed to Lock ${course?.courseName}`,
          message: resErr,
          color: 'red',
        });
      } finally {
        setLoadingButton(null);
      }
      return;
    }

    // For CAT and EXAM, require term
    if (!termId) {
      notifications.show({
        title: 'Please select academic year and term',
        message: 'Please select academic year and term',
        color: 'red',
      });
      return;
    }
    setLoadingButton(course.id);
    try {
      const res = await AuthApi.put(
        `/academicMarks/lock/class/${toUpdate?.id}/${termId}/${course?.id}?academicMarkType=${activeTab.toUpperCase()}`,
      );
      notifications.show({
        title: `${course?.courseName} Locked Successfully`,
        message: 'Course has been locked successfully',
        color: 'green',
      });
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: `Failed to Lock ${course?.courseName}`,
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoadingButton(null);
    }
  };

  return (
    <form className="w-full flex flex-col gap-y-6 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-center text-xl font-semibold">All {toUpdate?.className} Courses</h1>
      <div className="flex flex-col md:flex-row justify-start gap-y-2">
        <div className="flex items-center gap-x-2">
          <span className=" font-medium text-sm">Academic Year</span>
          <AsyncSelect
            datasrc={`/academic-years/all`}
            variant="default"
            value={academicYearId}
            disabled={true}
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
              }}
              value={termId ?? ''}
              placeholder="Select term"
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
        <h2 className="mr-10 text-sm font-medium">Mark Type: </h2>
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
      {toUpdate?.coursesList?.map((course: any) => {
        return (
          <div
            key={course.id}
            className="flex flex-row justify-between items-center gap-x-4 bg-neutral-200 border border-neutral-300 py-4 px-2 rounded-lg"
          >
            <h5 className="text-md font-semibold">{course.courseName}</h5>
            <div className="flex gap-2">
              <Button
                disabled={loadingButton === course.id}
                variant="filled"
                loading={loadingButton === course.id}
                className="w-36"
                style={{ zIndex: 0 }}
                onClick={() => handleUnlock(course)}
              >
                <FaLockOpen className="mr-2" /> Unlock Lesson
              </Button>
              <Button
                disabled={loadingButton === course.id}
                variant="filled"
                loading={loadingButton === course.id}
                className="w-36"
                style={{ zIndex: 0 }}
                onClick={() => handleLock(course)}
              >
                <FaLock className="mr-2" /> Lock Lesson
              </Button>
            </div>
          </div>
        );
      })}
    </form>
  );
};

export default PMUnlockSingleLesson;
