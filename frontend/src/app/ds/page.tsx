'use client';
import { useError } from '@/hooks/useError';
import { AuthApi } from '@/utils/constants';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { getAcademicYears, getTermsInYear } from '@/utils/funcs';
import { getCurrentYear } from '@/utils/funcs/func2';
import DashboardTable from '@/components/dashboard/DashboardTable';
import Image from 'next/image';
import drop from '@/assets/dropdown.svg';

const DsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const meString = localStorage.getItem('rcaappuser');
  const [allTerms, setAllTerms] = useState<any>([]);
  const [data, setData] = useState<any>();
  const [err, setErr] = useState<any>();
  const me = meString ? JSON.parse(meString) : null;
  const [activeFilter, setActiveFilter] = useState('term');
  const [activeTerm, setActiveTerm] = useState<any>();

  const getDashboard = (id: string) => {
    setLoading(true);
    AuthApi.get(`/dashboard/logged-in-ds/${id}`)
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
    activeTerm && activeTerm.id && getDashboard(activeTerm.id);
  }, [activeTerm]);

  useEffect(() => {
    const fetch = async () => {
      const years = await getAcademicYears();
      const termPromises = years.data.map((year: any) => getTermsInYear(year.id));
      const termResponses = await Promise.all(termPromises);
      const allTerms = termResponses.flatMap((response, index) =>
        response.data.map((term: any) => ({
          ...term,
          name: `${years.data[index].name} ${term.name.replace('_', ' ')}`,
        })),
      );
      allTerms.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setAllTerms(allTerms);
      // const secondLastTermId = allTerms.length >= 2 ? allTerms[1].id : allTerms[0]?.id;
      // if (secondLastTermId) {
      //   getDashboard(secondLastTermId);
      // }
      setActiveTerm(allTerms[0]);
      setActiveFilter(allTerms[0].name);
    };

    fetch();
  }, []);

  const promsColumns = [
    {
      name: 'Level',
      getter: (data: any) => `${data?.myClazz?.className ?? '-'} `,
    },
    {
      name: 'Overall Performance',
      getter: (data: any) => (data.performance ? data.performance : '100%'),
    },
  ];

  const classesPerformanceColumns = [
    {
      name: 'Class',
      getter: (data: any) => `${data?.myClazz?.className ?? '-'} `,
    },
    {
      name: 'Overall Performance',
      getter: (data: any) => {
        const studentsNumber = data?.myClazz?.studentsNumber ?? 0;
        if (!studentsNumber) return '100%';

        const performance =
          ((studentsNumber * 40 - (data?.disciplineMarks ?? 0)) / (studentsNumber * 40)) * 100;
        return performance !== 0 ? performance.toFixed(2) + '%' : '100%';
      },
    },
  ];

  const groupByLevel = (classes: any) => {
    const grouped: { oLevel: any[]; aLevel: any[] } = { oLevel: [], aLevel: [] };
    classes.forEach((classData: any) => {
      const className: string = classData?.myClazz?.className ?? '';
      const level = parseInt(className.replace(/\D/g, '').charAt(0) || '0', 10);
      if (level >= 1 && level <= 3) grouped.oLevel.push(classData);
      else if (level >= 4 && level <= 6) grouped.aLevel.push(classData);
    });
    return grouped;
  };

  const calculateAveragePerformance = (classGroup: any) => {
    if (!classGroup.length) return '100%';

    let validClasses = 0;
    const totalPerformance = classGroup.reduce((acc: number, classData: any) => {
      const studentsNumber = classData?.myClazz?.studentsNumber ?? 0;
      if (!studentsNumber) return acc;

      validClasses += 1;
      return (
        acc +
        ((studentsNumber * 40 - (classData?.disciplineMarks ?? 0)) / (studentsNumber * 40)) * 100
      );
    }, 0);
    return validClasses ? (totalPerformance / validClasses).toFixed(2) + '%' : '100%';
  };

  const groupedClasses: any = data ? groupByLevel(data.classDisciplineResponseDTOList || []) : {};

  const promotionsPerformanceData = [
    {
      myClazz: { className: 'O-Level (S1 - S3)' },
      performance: calculateAveragePerformance(groupedClasses.oLevel || []),
    },
    {
      myClazz: { className: 'A-Level (S4 - S6)' },
      performance: calculateAveragePerformance(groupedClasses.aLevel || []),
    },
  ];

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
  return (
    <div className="flex flex-row gap-5  text-sm h-full">
      <div className="flex flex-col w-full p-3">
        <div className="flex items-center justify-between">
          <p className="text-[15px]  mt-2 text-slate-800">
            {getGreeting()}{' '}
            <span className="font-extrabold">{me?.firstName || me?.username || ' '}</span>
          </p>
          <div className="flex items-center gap-2 ">
            <p className="text-xs text-primary font-bold">View Analytics from </p>
            <Dropdown className="bg-[#DCEBE3]">
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
                >
                  Filter by <span className="ml-2 text-primary font-bold">{activeFilter}</span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="rounded-lg">
                {allTerms?.map((term: any, i: number) => {
                  return (
                    <DropdownItem
                      key={i}
                      value={term?.name}
                      className=" hover:bg-[#0A6B4F89]"
                      onClick={() => {
                        setActiveFilter(term.name.replace('_', ' '));
                        setActiveTerm(term);
                      }}
                    >
                      {term?.name}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <>
          <div className="">
            <Carousel
              responsive={responsive}
              autoPlay
              arrows={false}
              transitionDuration={2000}
              className="my-3"
              infinite
            >
              <Link
                href={'/student/appeals'}
                className="mx-1.5 h-full bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-primary text-primary from-white to-primary-50"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading
                    ? '--'
                    : data && typeof data.disciplinePerformance === 'number'
                      ? `${data.disciplinePerformance.toFixed(2)}%`
                      : '100%'}
                </p>

                <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
                  School Performance
                </p>
              </Link>
              <Link
                href={'/student/appeals'}
                className="mx-1.5 h-full bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-accent text-accent-dark from-white to-accent-light"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading
                    ? '--'
                    : data && data.worstDisciplineClass
                      ? data.worstDisciplineClass
                      : 'None'}
                </p>

                <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
                  Worst Class
                </p>
              </Link>
              <Link
                href={'/student'}
                className="mx-1.5 h-full bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-info text-info from-white to-info-light"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading
                    ? '--'
                    : data && data.bestDisciplineClass
                      ? data.bestDisciplineClass
                      : 'None'}
                </p>
                <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
                  Best Class
                </p>
              </Link>

              <Link
                href={'/student/deductions'}
                className="mx-1.5 h-full bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-primary-400 text-primary-600 from-white to-primary-50"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {' '}
                  {loading ? '--' : data && data.casesNumber ? data.casesNumber : '0'}
                </p>
                <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
                  Discipline Cases
                </p>
              </Link>
              <Link
                href={'/student/courses'}
                className="mx-1.5 h-full bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-primary text-primary from-white to-primary-50"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.dsAppealsNumber ? data.dsAppealsNumber : '0'}
                </p>
                <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
                  Appeals
                </p>
              </Link>
              <Link
                href={'/student/'}
                className="mx-1.5 h-full bg-gradient-to-br border border-gray-200 border-t-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-8 p-5 flex flex-col gap-2 items-end justify-center border-t-accent text-accent-dark from-white to-accent-light"
              >
                <p className="font-extrabold text-[27px] text-right">
                  {loading ? '--' : data && data.studentsNumber ? data.studentsNumber : '0'}
                </p>
                <p className="font-semibold text-[11px] text-right text-gray-500 uppercase tracking-wide">
                  Students
                </p>
              </Link>
            </Carousel>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 my-5 gap-5">
              {/* <div className="">
                <div className="flex flex-row justify-between items-center">
                  <p className="font-semibold">Cases</p>
                  <Link
                    href={'/student/performance'}
                    className="text-[#0357BD] font-semibold text-[12px]"
                  >
                    View more
                  </Link>
                </div>
                <DiscplineCasesForDS />
              </div> */}
              <DashboardTable
                columns={promsColumns}
                data={promotionsPerformanceData}
                loading={loading}
                // filter={allTerms}
                // onFilterchange={getDashboard}
                // selectedFilter={allTerms.length >= 2 ? allTerms[1] : allTerms[0]}
                title="Discipline by Level"
              />
              <DashboardTable
                columns={classesPerformanceColumns}
                data={(data?.classDisciplineResponseDTOList || [])
                  .filter((item: any) => item?.myClazz?.studentsNumber)
                  .sort((a: any, b: any) => {
                    const avgA =
                      ((a.myClazz.studentsNumber * 40 - (a.disciplineMarks ?? 0)) /
                        (a.myClazz.studentsNumber * 40)) *
                      100;
                    const avgB =
                      ((b.myClazz.studentsNumber * 40 - (b.disciplineMarks ?? 0)) /
                        (b.myClazz.studentsNumber * 40)) *
                      100;
                    return avgA - avgB;
                  })}
                loading={loading}
                // filter={allTerms}
                // onFilterchange={getDashboard}
                // selectedFilter={allTerms.length >= 2 ? allTerms[1] : allTerms[0]}
                title="Classes with Worst Performance"
              />
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default DsDashboard;
