'use client';
import React, { useEffect, useState } from 'react';
import StudentsTable from './StudentsTable';
import { useParams } from 'next/navigation';
import clsx from 'clsx';
import { AuthApi } from '@/utils/constants';
import { ClipLoader } from 'react-spinners';

const OneClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { prom } = useParams();
  const [activeClass, setActiveClass] = useState(0);
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState<any>();
  const [students, setStudents] = useState([]);
  const [thisYearClasses, setThisYearClasses] = useState<any[]>([]);
  useEffect(() => {
    AuthApi.get('/academic-years/all')
      .then((res) => {
        setYears(res.data.data);
        setActiveYear(res.data.data[0]);
      })
      .catch((err) => {});
    AuthApi.get('/classes/all', {
      params: {
        page: 0,
        limit: 100,
      },
    })
      .then((res) => {
        res.data.data
          .filter((classe: any) => classe.className.includes(prom))
          .map((classe: any) => setThisYearClasses((prev) => [...prev, classe]));
      })
      .catch((err) => {});
  }, []);
  useEffect(() => {
    setLoading(true);
    if (thisYearClasses[activeClass] !== undefined && activeYear?.id !== undefined) {
      // 5d2f3c3a-df73-436e-8ce0-7b81c8a09785
      AuthApi.get(
        `/students/all/by-class-academic-year?academicYearId=${activeYear?.id}&classId=${thisYearClasses[activeClass]?.id}&limit=100&page=0`,
      )
        .then((res) => {
          setStudents(res.data.content);
        })
        .catch((err) => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, [thisYearClasses]);
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex flex-col sm:flex-row justify-between">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
          Year {prom} /{' '}
          {
            thisYearClasses[activeClass]?.className.split(' ')[
              thisYearClasses[activeClass]?.className.split(' ').length - 1
            ]
          }
        </h2>
        <p className="text-[rgba(67,67,67,0.43)] my-2">Students in year {prom}</p>
      </div>
      <div className="hidden sm:flex flex-row justify-between my-5">
        <input
          type="text"
          className="bg-[rgba(67,67,67,0.09)] px-3 py-2 rounded-md border-[2px] border-[rgba(67,67,67,0.03)] w-[30vw]"
          placeholder="Search Student by Name"
        />
        <div className="flex flex-row gap-3">
          <button className="bg-primary rounded-md text-white px-5 py-2">Download Excel</button>
          <button className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-5 py-2">
            Upload Excel for all students
          </button>
        </div>
      </div>
      <div className="flex justify-between px-5">
        <div></div>
        <div className="flex gap-2 items-center">
          <p className="text-gray-700">Filter by Year</p>
          <select
            className="px-4 py-2 rounded-lg outline-none"
            onChange={(e: any) => setActiveYear(e.target.value)}
          >
            {years.length != 0 &&
              years?.map((year: any, i) => {
                return (
                  <option value={year.id} key={i}>
                    {year.name}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
      <div className="flex text-[rgba(1,56,42,0.80)] my-3 -space-x-2">
        {thisYearClasses.map((classe, i) => {
          return (
            <button
              key={i}
              onClick={() => activeClass != i && setActiveClass(i)}
              className={clsx(
                'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)]',
                activeClass == i && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
              )}
            >
              {
                thisYearClasses[i]?.className.split(' ')[
                  thisYearClasses[i]?.className.split(' ').length - 1
                ]
              }
            </button>
          );
        })}
      </div>
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <ClipLoader color="black" size={20} />
        </div>
      ) : (
        <div>
          {students?.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-gray-700 text-lg">No Students So Far</p>
            </div>
          ) : (
            <StudentsTable students={students} academicYear={activeYear?.id} />
          )}
        </div>
      )}
    </div>
  );
};

export default OneClass;
