'use client';
import React, { useEffect, useState } from 'react';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { useError } from '@/hooks/useError';
import Link from 'next/link';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import DashboardTable from '@/components/dashboard/DashboardTable';
import { getAcademicYears, getTermsInYear } from '@/utils/funcs';
import { getCurrentYear } from '@/utils/funcs/func2';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [thisYearTerms, setThisYearTerms] = useState<any>([]);
  const meString = localStorage.getItem('rcaappuser');
  const [data, setData] = useState<any>();
  const [err, setErr] = useState<any>();
  const me = meString ? JSON.parse(meString) : null;
  const getDashboard = (id: string) => {
    AuthApi.get(`/dashboard/logged-in-admin/${id}`)
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        setErr(true);
        notifications.show({
          title: 'Failed to get Dashboard',
          message: useError(err, 'Get Dashboard Data'),
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    const fetch = async () => {
      const years = await getAcademicYears();
      const currentYear = getCurrentYear(years.data);

      if (!currentYear) {
        console.warn('No active academic year found.');
        return;
      }

      const termsResponse = await getTermsInYear(currentYear.id);
      const terms = termsResponse.data ?? [];

      terms.sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setThisYearTerms(terms);
      if (terms.length > 0) {
        const secondLastTermId = terms.length >= 2 ? terms[1].id : terms[0].id;
        getDashboard(secondLastTermId);
      }
    };

    fetch();
  }, []);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  const classesPerformanceColumns = [
    {
      name: 'Class',
      getter: (data: any) => `${data.myClazz?.className} `,
    },
    {
      name: 'CAT',
      getter: (data: any) => data.catOverAll.toFixed(2) + '%' || '100%',
    },
    {
      name: 'Exam',
      getter: (data: any) => data.examOverAll.toFixed(2) + '%' || '100%',
    },
  ];
  const coursesPerformanceColumns = [
    {
      name: 'Course',
      getter: (data: any) => `${data?.course?.courseName} `,
    },
    {
      name: 'CAT',
      getter: (data: any) =>
        typeof data.catOverAll === 'number' ? data.catOverAll.toFixed(2) + '%' : '100%',
    },
    {
      name: 'Exam',
      getter: (data: any) =>
        typeof data.examOverAll === 'number' ? data.examOverAll.toFixed(2) + '%' : '100%',
    },
  ];

  const getGreeting = () => {
    const currentTime = new Date().getHours();
    let greeting = '';
    if (currentTime >= 5 && currentTime < 12) {
      greeting = 'Good Morning ☀️';
    } else if (currentTime >= 12 && currentTime < 18) {
      greeting = 'Good Afternoon 🌤️';
    } else {
      greeting = 'Good Evening 🌙';
    }
    return greeting;
  };

  return (
    <div className="relative h-full text-sm">
      <p className="text-[15px] font-semibold my-2">
        {getGreeting()} <span className="font-extrabold">{me ? me.username : ' '}</span>
        <span className="ml-2 text-xs font-medium text-gray-500">IT Manager</span>
      </p>
      <Carousel
        responsive={responsive}
        autoPlay
        arrows={false}
        transitionDuration={2000}
        className="my-3"
        infinite
      >
        <Link
          href={'/student/'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-primary text-primary from-white to-primary-50"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading ? '--' : data && data.coursesNumber ? data.coursesNumber : '0'}
          </p>
          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Courses
          </p>
        </Link>
        <Link
          href={'/student/'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-accent text-accent-dark from-white to-accent-light"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading ? '--' : data && data.studentsNumber ? data.studentsNumber : '0'}
          </p>
          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Students
          </p>
        </Link>
        <Link
          href={'/student/'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-info text-info from-white to-info-light"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading ? '--' : data && data.classesNumber ? data.classesNumber : '0'}
          </p>
          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Classes
          </p>
        </Link>
        <Link
          href={'/student/'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-primary-400 text-primary-600 from-white to-primary-50"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading ? '--' : data && data.teachersNumber ? data.teachersNumber : '0'}
          </p>
          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Teachers
          </p>
        </Link>
        <Link
          href={'/student/'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-primary text-primary from-white to-primary-50"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading ? '--' : data && data.staffNumber ? data.staffNumber : '0'}
          </p>
          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Staffs
          </p>
        </Link>
        <Link
          href={'/student/appeals'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-accent text-accent-dark from-white to-accent-light"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading
              ? '--'
              : data && typeof data.disciplinePerformance === 'number'
                ? `${data.disciplinePerformance.toFixed(2)}%`
                : '100%'}
          </p>

          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Discpline Performance
          </p>
        </Link>
        <Link
          href={'/student/appeals'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-info text-info from-white to-info-light"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading
              ? '--'
              : data && data.worstDisciplineClass
                ? data.worstDisciplineClass
                : 'None'}
          </p>

          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Worst Class(Discpline)
          </p>
        </Link>
        <Link
          href={'/student'}
          className="mx-1.5 bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-primary-400 text-primary-600 from-white to-primary-50"
        >
          <p className="font-extrabold text-[27px] text-right">
            {loading ? '--' : data && data.bestDisciplineClass ? data.bestDisciplineClass : 'None'}
          </p>
          <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
            Best Class(Discpline)
          </p>
        </Link>
      </Carousel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <DashboardTable
          columns={classesPerformanceColumns}
          data={(data?.overAllMarksForClasses || [])
            .filter(
              (item: any) =>
                item.catOverAll !== null &&
                item.examOverAll !== null &&
                item.catOverAll !== undefined &&
                item.examOverAll !== undefined &&
                !isNaN(item.catOverAll) &&
                !isNaN(item.examOverAll),
            )
            .sort((a: any, b: any) => {
              const avgA = (a.catOverAll + a.examOverAll) / 2;
              const avgB = (b.catOverAll + b.examOverAll) / 2;
              return avgB - avgA;
            })}
          loading={loading}
          filter={thisYearTerms}
          onFilterchange={getDashboard}
          selectedFilter={thisYearTerms.length >= 2 ? thisYearTerms[1] : thisYearTerms[0]}
          title="Classes with Outstanding Performance"
        />
        <DashboardTable
          columns={coursesPerformanceColumns}
          data={(data?.overAllMarksForCourses || [])
            .filter(
              (item: any) =>
                item.catOverAll !== null &&
                item.examOverAll !== null &&
                item.catOverAll !== undefined &&
                item.examOverAll !== undefined &&
                !isNaN(item.catOverAll) &&
                !isNaN(item.examOverAll),
            )
            .sort((a: any, b: any) => {
              const avgA = (a.catOverAll + a.examOverAll) / 2;
              const avgB = (b.catOverAll + b.examOverAll) / 2;
              return avgB - avgA;
            })}
          loading={loading}
          filter={thisYearTerms}
          onFilterchange={getDashboard}
          selectedFilter={thisYearTerms.length >= 2 ? thisYearTerms[1] : thisYearTerms[0]}
          title="Highest Performing Courses"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
