'use client';
import ViewTimeTable from '@/components/academics/ViewTimeTable';
import useGet from '@/hooks/useGet';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { ITimeTable } from '@/types/timetable.type';
import { AuthApi } from '@/utils/constants';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import drop from '@/assets/dropdown.svg';
import { notifications } from '@mantine/notifications';

const TimeTableIndex = () => {
  const [timeTables, setTimeTables] = useState<ITimeTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<IAcademicYear | null>(null);
  const [activeTerm, setActiveTerm] = useState<ITerm | null>(null);
  const {
    data: years,
    loading: yearLoading,
    error: yearError,
    get: getYears,
  } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });
  const {
    data: terms,
    loading: termsLoading,
    error: termsError,
    get: getTerms,
  } = useGet<ITerm[]>(activeYear ? `/terms/all/academic-year/${activeYear?.id}` : undefined, {
    defaultData: [],
  });

  useEffect(() => {
    if (activeYear) {
      console.log('Goign to ge terms');
      getTerms();
    }
  }, [activeYear]);

  useEffect(() => {
    if (years) {
      const activeYear = years.find((year) => year.status === 'ACTIVE');
      activeYear ? setActiveYear(activeYear) : setActiveYear(years[-1]);
    }
    if (terms) {
      setActiveTerm(terms[terms.length - 1]);
    }
  }, [years, terms]);

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const response = await AuthApi.get(`/timetables/terms/${activeTerm?.id}`);
        setTimeTables(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (activeTerm) {
      fetchTimetable();
    }
  }, [activeTerm]);

  const groupLessonsByClass = (lessons: any[]) => {
    return lessons.reduce((acc: Record<string, any[]>, lesson: any) => {
      console.log(lesson.className);
      const className = lesson.className;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(lesson);
      return acc;
    }, {});
  };

  // Group the lessons by class name
  const groupedLessons = timeTables ? groupLessonsByClass(timeTables.lessonList) : {};

  return (
    <div className="p-5">
      <div className="flex flex-col md:flex-row justify-between gap-2 mb-5">
        <p className="text-2xl font-semibold">TimeTables</p>
        <div className="flex items-center gap-2">
          {years && (
            <Dropdown className="bg-[#DCEBE3]">
              <DropdownTrigger>
                <Button className="border-[1px] border-[#0A6B4F] rounded-lg p-3  text-[80%]">
                  Filter by{' '}
                  <span className="ml-2 text-[#0A6B4F] font-bold">
                    {activeYear?.name || 'Select Year'}
                  </span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {years.map((year, i) => (
                  <DropdownItem
                    key={i}
                    value={year.name}
                    className="hover:bg-[#0A6B4F89]"
                    onClick={() => setActiveYear(year)}
                  >
                    {year.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
          {terms && (
            <Dropdown className="bg-[#DCEBE3]">
              <DropdownTrigger>
                <Button className="border-[1px] border-[#0A6B4F] rounded-lg p-3  text-[80%]">
                  Filter by{' '}
                  <span className="ml-2 text-[#0A6B4F] font-bold">
                    {activeTerm?.name || 'Select Term'}
                  </span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {terms.map((term, i) => (
                  <DropdownItem
                    key={i}
                    value={term.name}
                    className="hover:bg-[#0A6B4F89]"
                    onClick={() => setActiveTerm(term)}
                  >
                    {term.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center">
            <div className="spinner-border animate-spin border-4 border-t-4 border-mainPurple rounded-full w-12 h-12 mb-4"></div>
            <p className="text-lg text-gray-700">Loading...</p>
          </div>
        </div>
      ) : error?.includes('No timetable found for term') ? (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">No timetable found for this term.</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">
              Something went wrong. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-mainPurple text-white px-8 py-2 rounded-lg font-semibold hover:bg-mainPurple-dark transition duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedLessons).map((className) => (
            <div key={className} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-2xl font-semibold text-mainPurple mb-4">{className}</p>
              <ViewTimeTable title={className} lessons={groupedLessons[className] as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeTableIndex;
