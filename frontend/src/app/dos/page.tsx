'use client';
import Announcement from '@/components/Announcement/Announcement';
import ProjectsTable from '@/components/HomePage/ProjectsTable';
import { useUserContext } from '@/context/Usercontext';
import newOne from '../../assets/newOne.jpg';
import newTwo from '../../assets/newTwo.jpg';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthApi } from '@/utils/constants';
import { useError } from '@/hooks/useError';
import { notifications } from '@mantine/notifications';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import DashboardTable from '@/components/dashboard/DashboardTable';
import { getCurrentYear } from '@/utils/funcs/func2';
import { getAcademicYears, getTermsInYear } from '@/utils/funcs';
import Announcements from '@/components/dashboard/Announcements';

const DOSDashboard = () => {
  const [loading, setLoading] = useState(true);
  const meString = localStorage.getItem('rcaappuser');
  const [data, setData] = useState<any>();
  const [err, setErr] = useState<any>();
  const [thisYearTerms, setThisYearTerms] = useState<any>([]);
  const me = meString ? JSON.parse(meString) : null;
  const { profile } = useUserContext();

  const getDashboard = (id: string) => {
    AuthApi.get(`/dashboard/logged-in-pm/${id}`)
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
        setErr(true);
        notifications.show({
          title: 'Failed to get current year',
          message: 'No current year found',
          color: 'red',
          autoClose: 60000,
        });
        setLoading(false);
        return;
      }
      let terms = await getTermsInYear(currentYear.id);
      terms = terms.data;
      terms.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setThisYearTerms(terms);
      const secondLastTermId = terms.length >= 2 ? terms[1].id : terms[0].id;
      getDashboard(secondLastTermId);
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

  const classesPerformanceColumns = [
    {
      name: 'Class',
      getter: (data: any) => `${data?.myClazz?.className ?? '-'} `,
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

  return (
    <div className="relative  text-sm">
      <p className="text-[15px] font-semibold my-2">
        {getGreeting()} <span className="font-extrabold">Director of Studies</span>
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
              : data && data.totalMarksRegistered
                ? `${(
                    ((40 * data.studentsNumber - data.totalMarksRegistered) /
                      (40 * data.studentsNumber)) *
                    100
                  ).toFixed(2)}%`
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
            {loading ? '--' : data && data.worstClass ? data.worstClass : 'None'}
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
            {loading ? '--' : data && data.bestClass ? data.bestClass : 'None'}
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
                item.myClass &&
                item.myClass.className &&
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

export default DOSDashboard;
