import useGet from '@/hooks/useGet';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useEffect, useState } from 'react';
import { BiCheck } from 'react-icons/bi';

interface Props {
  onClose: () => void;
  data: Teacher;
  refetch: () => void;
}

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const hours = Array.from({ length: 10 }, (_, i) => (8 + i).toString().padStart(2, '0')); // 08 to 17
const minutes = ['00', '15', '30', '45'];
const defaultTime = { startHour: '08', startMinute: '30', endHour: '17', endMinute: '00' };

const TeacherWorkingDays: FC<Props> = ({ onClose, data: toUpdate, refetch }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(toUpdate?.workingDays ?? []);
  const [dayTimes, setDayTimes] = useState<Record<string, typeof defaultTime>>(() =>
    Object.fromEntries(days.map((d) => [d, { ...defaultTime }])),
  );

  const { data: academicYears } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });

  const activeAcademicYear = academicYears?.find((year) => year.status === 'ACTIVE');
  const { data: terms } = useGet<ITerm[]>(
    activeAcademicYear ? `/terms/all/academic-year/${activeAcademicYear.id}` : '/terms/all',
    {
      defaultData: [],
    },
  );
  const termId = terms && terms.length > 0 ? terms[terms.length - 1].id : null;

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleChangeTime = (day: string, key: keyof typeof defaultTime, value: string) => {
    setDayTimes((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termId) return;

    setLoading(true);

    const payload = days.map((day) => {
      const time = dayTimes[day];
      return {
        teacher: { id: toUpdate.id },
        term: { id: termId },
        dayOfWeek: day,
        startTime: `${time.startHour}:${time.startMinute}:00`,
        endTime: `${time.endHour}:${time.endMinute}:00`,
        available: selectedDays.includes(day),
      };
    });

    try {
      await AuthApi.post(`/teacher-availability/bulk`, payload);
      notifications.show({
        title: 'Working Days Updated',
        message: 'Teacher working days have been updated successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Update Working Days',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full flex flex-col gap-y-4 p-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-gray-700">Select Working Days and Time</h2>
        <div className="flex flex-col gap-3">
          {days.map((day) => (
            <div key={day} className="border rounded-md p-4">
              <div
                className={`w-full text-center py-2 px-4 rounded cursor-pointer border mb-3 
                  ${
                    selectedDays.includes(day)
                      ? 'bg-mainPurple text-white'
                      : 'bg-white text-gray-700'
                  } 
                  transition-all duration-200`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Start Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      data={hours}
                      value={dayTimes[day].startHour}
                      onChange={(val) => handleChangeTime(day, 'startHour', val!)}
                      disabled={!selectedDays.includes(day)}
                      placeholder="Hour"
                    />
                    <Select
                      data={minutes}
                      value={dayTimes[day].startMinute}
                      onChange={(val) => handleChangeTime(day, 'startMinute', val!)}
                      disabled={!selectedDays.includes(day)}
                      placeholder="Minute"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">End Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      data={hours}
                      value={dayTimes[day].endHour}
                      onChange={(val) => handleChangeTime(day, 'endHour', val!)}
                      disabled={!selectedDays.includes(day)}
                      placeholder="Hour"
                    />
                    <Select
                      data={minutes}
                      value={dayTimes[day].endMinute}
                      onChange={(val) => handleChangeTime(day, 'endMinute', val!)}
                      disabled={!selectedDays.includes(day)}
                      placeholder="Minute"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button
        disabled={loading || !termId}
        variant="filled"
        className="mt-4"
        w={60}
        loading={loading}
        mx="auto"
        type="submit"
      >
        <BiCheck size={25} />
      </Button>
    </form>
  );
};

export default TeacherWorkingDays;
