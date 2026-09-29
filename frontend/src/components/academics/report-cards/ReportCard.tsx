/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DsReport, ETerm, IReportCard } from '@/types/marks.type';
import { ITerm } from '@/types/other.type';
import { getFile, rcaLogo } from '@/utils/constants';
import { toFixed } from '@/utils/funcs/func2';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { grades } from './data';
import {
  ETerms,
  getGrade,
  getOrderedCourses,
  getSittingStatus,
  getTermPercentage,
  getTotalTermMarks,
  getTotalYearMarksByCourse,
  getYearTotalMarks,
  getFinalCoursePercentage,
  getFinalCourseGrade,
} from './utils';

// The 'theme' object is your Tailwind theme config
const tw = createTw({
  theme: {
    fontFamily: {
      sans: ['Comic Sans'],
    },
    extend: {
      colors: {
        custom: '#bada55',
      },
    },
  },
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingHorizontal: '1cm',
    paddingVertical: '1cm',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid black',
    paddingVertical: '1cm',
    // fontFamily: "Roman",
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '1cm',
  },
});
const headerTextTw = tw('font-bold text-[8px]');
const headerGradeTextTw = tw('font-bold text-[6px]');

const midTextTw = tw('font-bold text-[7px]');
const smallTextTw = tw('font-bold text-[6px]');
const lgTextTw = tw('font-bold text-[9px]');
// timesNewRoman
// Font.register({
//   family: "Roman",
//   src: `https://fonts.gstatic.com/s/timesnewroman/v16/S6uyw4BMUTPHjx4wWw.ttf`,
// });

// const secW = `w-[${(6 / 21) * 100}%]`;
const getW = (num: number) => `w-[${(num / 21) * 100}%]`;
export const getTerm = (term: number) => {
  switch (term) {
    case 1:
      return 'FIRST TERM';
    case 2:
      return 'SECOND TERM';
    case 3:
      return 'THIRD TERM';
    default:
      return '';
  }
};

const CheckIcon = () => (
  <Image
    style={{
      width: 10,
      height: 10,
      objectFit: 'cover',
      aspectRatio: 1 / 1,
      position: 'absolute',
      bottom: 0,
      left: 3,
    }}
    src="https://cdn-icons-png.flaticon.com/512/33/33281.png"
  />
);

export default ({
  info,
  terms,
  dsMarks,
  viewAll,
  qrCodeImageUrl,
  studentClassTermData,
  isPM,
}: {
  info: IReportCard;
  terms?: ITerm[];
  dsMarks?: DsReport;
  viewAll?: boolean;
  qrCodeImageUrl?: string | null;
  studentClassTermData?: any;
  isPM?: boolean;
}) => {
  //   'getFile(info.studentInfo?.userProfilePic)',
  //   getFile(info?.studentInfo?.userProfilePic),
  // );
  const courses = getOrderedCourses(info);
  const studentClassTermArr = (studentClassTermData ?? []).filter((dt: any) => {
    return dt?.term?.academicYear?.id === info?.academicYearInfo?.id;
  });
  const studentClassTerm = studentClassTermArr[studentClassTermArr.length - 1];
  const getTermInfo = (ti: number) =>
    ETerms[ti] in info.reportCard ? info.reportCard[ETerms[ti]] : null;

  // Determine if all marks should be shown (for PM portal or when viewAll is true)
  const shouldShowAll = viewAll || isPM;

  const getMarkByType = (course: string, term: number, type: string) => {
    const termInfo = getTermInfo(term);
    if (!termInfo) return null;
    const courseMark = termInfo[course];
    if (!courseMark) return null;
    const markInfo = courseMark.find((c) => c.markType === type);
    if (!markInfo) return null;
    return markInfo.marks;
  };

  const hasThirdTerm = ETerms[2] in info.reportCard;
  const yearTotals = getYearTotalMarks(info.reportCard);
  const yearPercentage = ((yearTotals.marks / yearTotals.weight) * 100).toFixed(2);
  const thirdTerm = terms?.find((term) => term.name === ETerm.THIRD_TERM);
  const isThirdTermReleased =
    thirdTerm?.termMarksStatus === 'EXAM' || (shouldShowAll && terms?.length === 3);

  const isYearReleased = hasThirdTerm && isThirdTermReleased;

  // find the last term that has marks
  const lastTerm = terms?.find(
    (term) => term.termMarksStatus === 'EXAM' || term.termMarksStatus === 'CAT',
  );
  return (
    <Document
      author="Tr Damascene"
      keywords="report card, student, school, education, academic, grade, result, transcript, marksheet, marklist, mark list, mark sheet, report"
      subject="Report Card"
      title={`${info?.studentInfo?.firstName} ${info?.studentInfo?.lastName} Report Card`}
    >
      <Page size={{ width: 800, height: 1020 }} style={styles.page}>
        <View style={[styles.container, tw('h-full relative')]}>
          <View style={styles.header}>
            <View style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Text style={[headerTextTw]}>REPUBLIC OF RWANDA</Text>
              <Text style={[headerTextTw]}>MINISTRY OF EDUCATION</Text>
              <Text style={[headerTextTw]}>ECOLE DES SCIENCES DE GISENYI</Text>
              <Image style={{ width: 80 }} src={rcaLogo} />
              <Text style={[midTextTw]}>Telephone:(+250)788548000</Text>
              <Text style={[midTextTw]}>Email: papiasni@gmail.com</Text>
            </View>
            <View
              style={{
                width: 100,
                objectFit: 'cover',
                aspectRatio: 6 / 7,
                border: '1px solid #e3e5e7',
                overflow: 'hidden',
              }}
            >
              {info.studentInfo.userProfilePic && (
                <Image
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    objectPosition: 'center',
                  }}
                  src={getFile(info.studentInfo.userProfilePic) as string}
                />
              )}
            </View>
            <View style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Text style={[lgTextTw]}>
                Academic Year : {info?.academicYearInfo?.startYear}-
                {info?.academicYearInfo?.endYear}
              </Text>
              <View style={[tw('flex flex-row items-center')]}>
                <Text style={[lgTextTw]}>Class: </Text>
                <Text style={[lgTextTw]}>{studentClassTerm?.myClazz?.className}</Text>
              </View>
              <Text style={[lgTextTw]}>
                Name: {info?.studentInfo?.firstName} {info?.studentInfo?.lastName}
              </Text>
            </View>
          </View>
          <View style={[tw('flex flex-row justify-center w-full mt-11')]}>
            <Text style={[lgTextTw, tw('underline font-black')]}>TRANSCRIPT</Text>
          </View>
          <View style={[tw('flex flex-col mt-6 w-full')]}>
            {/* courses, first term,..., total, grade container */}
            <View style={tw('flex-row w-full border border-black border-x-0')}>
              {/* course */}
              <View style={tw(`flex flex-col ${getW(6)} p-3 border-l-0 border-black`)}>
                <Text style={[headerTextTw, tw('text-center')]}>COURSES</Text>
              </View>
              {/* terms */}
              {[1, 2, 3].map((term) => (
                <View key={term} style={tw(`flex flex-col ${getW(6)} border-l border-black`)}>
                  <Text style={[headerTextTw, tw('text-center py-1')]}>{getTerm(term)}</Text>

                  <View style={tw('flex flex-row border-t border-black')}>
                    <View style={tw(`flex flex-col w-1/3 border-l-0 border-black`)}>
                      <Text style={[headerTextTw, tw('text-center py-1')]}>CAT</Text>
                    </View>
                    <View style={tw(`flex flex-col w-1/3 border-l border-black`)}>
                      <Text style={[headerTextTw, tw('text-center py-1')]}>EXAM</Text>
                    </View>
                    <View style={tw(`flex flex-col w-1/3 border-l border-black`)}>
                      <Text style={[headerTextTw, tw('text-center py-1')]}>TOT</Text>
                    </View>
                  </View>
                </View>
              ))}
              {/* year(total) */}
              <View style={tw(`flex flex-col ${getW(3.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center py-1')]}>YEAR</Text>
                <View style={tw('flex flex-row border-t border-black')}>
                  <View style={tw(`flex flex-col w-2/3 border-l-0 border-black`)}>
                    <Text style={[headerTextTw, tw('text-center py-1')]}>TOT</Text>
                  </View>
                  <View style={tw(`flex flex-col w-1/3 border-l border-black`)}>
                    <Text style={[headerTextTw, tw('text-center py-1')]}>%</Text>
                  </View>
                </View>
              </View>
              {/* second sitting */}
              <View style={tw(`flex flex-col ${getW(2.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center py-1')]}>2ND SITTING</Text>
                <View style={tw('flex flex-row border-t border-black')}>
                  <View style={tw(`flex flex-col w-2/3 border-l-0 border-black`)}>
                    <Text style={[headerTextTw, tw('text-center py-1')]}>TOT</Text>
                  </View>
                  <View style={tw(`flex flex-col w-1/3 border-l border-black`)}>
                    <Text style={[headerTextTw, tw('text-center py-1')]}>%</Text>
                  </View>
                </View>
              </View>
              {/* grade */}
              <View style={tw(`flex flex-col ${getW(1.5)} border-l py-2.5 border-black`)}>
                <Text style={[headerGradeTextTw, tw('text-center py-1')]}>GRADE</Text>
              </View>
              {/* second sitting grade */}
            </View>
            {/* discipline mark */}
            <View style={tw('flex-row w-full border-black border-b')}>
              <Text style={[headerTextTw, tw(`text-left ${getW(6)} p-1`)]}>DISCIPLINE</Text>
              {/* terms */}
              {[1, 2, 3].map((term) => {
                const dsMark = () => {
                  switch (term) {
                    case 1:
                      return dsMarks?.firstTermMarks;
                    case 2:
                      return dsMarks?.secondTermMarks;
                    case 3:
                      return dsMarks?.thirdTermMarks;
                    default:
                      return 0;
                  }
                };
                // const isDsInRed = dsMark?.() < 20;
                const shouldShowAll = viewAll || isPM;
                const termInfo = terms?.find((t) => t.name === ETerms[term - 1]);
                const isExamReleased = termInfo?.termMarksStatus === 'EXAM' || shouldShowAll;
                return (
                  <View key={term} style={tw(`flex flex-row ${getW(6)} border-l border-black`)}>
                    {/* CAT */}
                    <Text style={[headerTextTw, tw('text-center w-full py-1')]}></Text>
                    <Text style={[headerTextTw, tw('text-center w-full py-1')]}></Text>
                    {/* EXAM */}
                    <Text style={[headerTextTw, tw('text-center w-full py-1')]}></Text>
                    <Text style={[headerTextTw, tw('text-center w-full py-1')]}></Text>
                    {/* TOT */}
                    <Text style={[headerTextTw, tw('text-center w-full border-l py-1')]}>
                      {isExamReleased && dsMark()}
                    </Text>
                    <Text
                      style={[headerTextTw, tw('text-center border-l bg-[#b3b3b3]  w-full py-1')]}
                    >
                      40
                    </Text>
                  </View>
                );
              })}
              {/* year(total) */}
              {/* Year Total */}
              <View style={tw(`flex flex-row ${getW(3.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center w-full py-1')]}>
                  {isThirdTermReleased &&
                    (dsMarks?.firstTermMarks ?? 0) +
                      (dsMarks?.secondTermMarks ?? 0) +
                      (dsMarks?.thirdTermMarks ?? 0)}
                </Text>
                <Text style={[headerTextTw, tw('text-center w-full bg-[#b3b3b3]  py-1')]}>120</Text>
                <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}></Text>
              </View>
              {/* Second Sitting */}
              <View style={tw(`flex flex-row ${getW(2.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center w-full py-1')]}></Text>
                <Text style={[headerTextTw, tw('text-center w-full bg-[#b3b3b3]  py-1')]}></Text>
                <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}></Text>
              </View>
              <View style={tw(`flex flex-row ${getW(1.5)} border-l py-2.5 border-black`)}></View>
            </View>
            {/* separator void with mark title */}
            <Text style={[headerTextTw, tw('text-center w-full py-1')]}>MARKS</Text>
            {/* academic marks */}
            {courses.map((course, i) => {
              const totalCourseMarks = getTotalYearMarksByCourse(info.reportCard, course);
              const isTotalInRed =
                Number(totalCourseMarks?.marks) < Number(totalCourseMarks?.weight) / 2;
              const courseYearPercentage = (
                (totalCourseMarks?.marks / totalCourseMarks?.weight) *
                100
              ).toFixed(1);
              return (
                <View key={course} style={[tw('flex-row w-full border-black border-t')]}>
                  <Text style={[headerTextTw, tw(`text-left ${getW(6)} p-1`)]}>{course}</Text>
                  {/* terms */}
                  {[1, 2, 3].map((term, ti) => {
                    const termMarks = info.reportCard[ETerms[ti]];
                    const courseMarks = termMarks ? termMarks[course] : null;
                    const catMarks = courseMarks?.find((mark) => mark.markType === 'CAT');
                    const examMarks = courseMarks?.find((mark) => mark.markType === 'EXAM');
                    const allAvailable = catMarks && examMarks;

                    const isCatInRed = Number(catMarks?.marks) < Number(catMarks?.weight) / 2;
                    const isExamInRed = Number(examMarks?.marks) < Number(examMarks?.weight) / 2;

                    // release
                    const termInfo = terms?.find((t) => t.name === ETerms[ti]);
                    // When viewAll is true or isPM is true (PM portal), show all marks regardless of term status
                    // Otherwise, check term status for release
                    const isExamReleased = shouldShowAll
                      ? !!examMarks
                      : !!examMarks &&
                        (termInfo?.termMarksStatus === 'EXAM' ||
                          termInfo?.termMarksStatus === 'CAT');
                    const isCatReleased = shouldShowAll
                      ? !!catMarks
                      : !!catMarks &&
                        (termInfo?.termMarksStatus === 'CAT' ||
                          termInfo?.termMarksStatus === 'EXAM');
                    const allReleased = isCatReleased && isExamReleased;
                    return (
                      <View key={term} style={tw(`flex flex-row ${getW(6)} border-l border-black`)}>
                        {/* CAT */}
                        <Text
                          style={[
                            headerTextTw,
                            tw(
                              `text-center w-full py-1 ${
                                !isCatReleased
                                  ? 'bg-[#edebeb]'
                                  : isCatInRed
                                    ? 'text-red-600'
                                    : 'text-black'
                              }`,
                            ),
                          ]}
                        >
                          {isCatReleased && toFixed(catMarks?.marks, 1)}
                        </Text>
                        <Text
                          style={[
                            headerTextTw,
                            tw('text-center bg-[#b3b3b3]  border-l w-full py-1'),
                          ]}
                        >
                          {isCatReleased && catMarks?.weight}
                        </Text>
                        {/* EXAM */}
                        <Text
                          style={[
                            headerTextTw,
                            tw(
                              `text-center border-l w-full py-1  ${
                                !isExamReleased
                                  ? 'bg-[#edebeb]'
                                  : isExamInRed
                                    ? 'text-red-600'
                                    : 'text-black'
                              }`,
                            ),
                          ]}
                        >
                          {isExamReleased && toFixed(examMarks?.marks, 1)}
                        </Text>
                        <Text
                          style={[
                            headerTextTw,
                            tw('text-center bg-[#b3b3b3]  border-l w-full py-1'),
                          ]}
                        >
                          {isExamReleased && examMarks?.weight}
                        </Text>
                        {/* TOT */}
                        <Text
                          style={[
                            headerTextTw,
                            tw(
                              `text-center border-l w-full py-1 ${!allReleased && 'bg-[#edebeb]'}`,
                            ),
                          ]}
                        >
                          {allAvailable && allReleased
                            ? toFixed(catMarks?.marks + examMarks?.marks, 1)
                            : ''}
                        </Text>
                        <Text
                          style={[
                            headerTextTw,
                            tw('text-center bg-[#b3b3b3]  border-l w-full py-1'),
                          ]}
                        >
                          {allAvailable && allReleased ? catMarks.weight + examMarks.weight : ''}
                        </Text>
                      </View>
                    );
                  })}
                  {/* year(total) */}
                  <View style={tw(`flex flex-row ${getW(3.5)} border-l border-black`)}>
                    <Text
                      style={[
                        headerTextTw,
                        tw(
                          `text-center w-full py-1 ${isTotalInRed ? 'text-red-600' : 'text-black'}`,
                        ),
                      ]}
                    >
                      {isYearReleased && totalCourseMarks?.marks?.toFixed(1)}
                    </Text>
                    <Text
                      style={[headerTextTw, tw('text-center bg-[#b3b3b3]  border-l w-full py-1')]}
                    >
                      {isYearReleased && totalCourseMarks?.weight}
                    </Text>
                    <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}>
                      {isYearReleased && courseYearPercentage}
                    </Text>
                  </View>
                  {/* second sitting marks */}
                  <View style={tw(`flex flex-row ${getW(2.5)} border-l border-black`)}>
                    {info.reportCard.SECOND_SITTING?.[course]?.length > 0 ? (
                      <>
                        <Text
                          style={[
                            headerTextTw,
                            tw(
                              `text-center w-full py-1 ${isTotalInRed ? 'text-red-600' : 'text-black'}`,
                            ),
                          ]}
                        >
                          {isYearReleased &&
                            info.reportCard.SECOND_SITTING[course][0]?.marks?.toFixed(1)}{' '}
                        </Text>
                        <Text
                          style={[
                            headerTextTw,
                            tw('text-center bg-[#b3b3b3]  border-l w-full py-1'),
                          ]}
                        >
                          {isYearReleased &&
                            info.reportCard.SECOND_SITTING?.[course]?.[0]?.weight?.toFixed(1)}{' '}
                        </Text>
                        <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}>
                          {isYearReleased &&
                            (
                              (
                                info.reportCard.SECOND_SITTING?.[course]?.[0]?.marks /
                                info.reportCard.SECOND_SITTING?.[course]?.[0]?.weight
                              )?.toFixed(1) * 100
                            ).toFixed(1)}
                        </Text>
                        {/* <Text
                          style={[
                            headerTextTw,
                            tw(
                              `text-center w-2/3 py-1 ${
                                !isYearReleased
                                  ? 'bg-[#edebeb]'
                                  : isTotalInRed
                                    ? 'text-red-600'
                                    : 'text-black'
                              }`,
                            ),
                          ]}
                        >
                          {isYearReleased &&
                            info.reportCard.SECOND_SITTING[course][0]?.marks?.toFixed(1)}
                        </Text>
                        <Text
                          style={[
                            headerTextTw,
                            tw(
                              `text-center w-1/3 border-l py-1 ${
                                !isYearReleased
                                  ? 'bg-[#edebeb]'
                                  : isTotalInRed
                                    ? 'text-red-600'
                                    : 'text-black'
                              }`,
                            ),
                          ]}
                        >
                          {isYearReleased &&
                            info.reportCard.SECOND_SITTING?.[course]?.[0]?.weight?.toFixed(1)}
                        </Text> */}
                      </>
                    ) : (
                      <>
                        <Text
                          style={[
                            headerTextTw,
                            tw(
                              `text-center w-full py-1 ${isTotalInRed ? 'text-red-600' : 'text-black'}`,
                            ),
                          ]}
                        >
                          -
                        </Text>
                        <Text
                          style={[
                            headerTextTw,
                            tw('text-center bg-[#b3b3b3]  border-l w-full py-1'),
                          ]}
                        >
                          -
                        </Text>
                        <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}>
                          -{' '}
                        </Text>
                      </>
                    )}
                  </View>
                  {/* Grade */}
                  <View style={tw(`flex flex-row ${getW(1.5)} border-l border-black`)}>
                    <Text style={[headerTextTw, tw('text-center w-full py-1')]}>
                      {isYearReleased && getFinalCourseGrade(info.reportCard, course)}
                    </Text>
                  </View>
                </View>
              );
            })}
            {/* total */}
            <View style={tw('flex-row w-full border-black border-t')}>
              <Text style={[headerTextTw, tw(`text-left ${getW(6)} p-1`)]}>Total</Text>
              {/* terms */}
              {[1, 2, 3].map((term, ti) => {
                const termMarks = info.reportCard[ETerms[ti]];
                const totalMarks = termMarks ? getTotalTermMarks(termMarks) : null;
                const termInfo = terms?.find((t) => t.name === ETerms[ti]);
                const isExamReleased = termInfo?.termMarksStatus === 'EXAM' || shouldShowAll;
                const isCatReleased =
                  termInfo?.termMarksStatus === 'CAT' || isExamReleased || shouldShowAll;
                const allReleased = isCatReleased && isExamReleased && totalMarks;
                return (
                  <View key={term} style={tw(`flex flex-row ${getW(6)} border-l border-black`)}>
                    {/* CAT */}
                    <Text style={[headerTextTw, tw('text-center w-full py-1')]}>
                      {isCatReleased && totalMarks?.CAT?.marks?.toFixed(1)}
                    </Text>
                    <Text
                      style={[headerTextTw, tw('text-center bg-[#b3b3b3]  border-l w-full py-1')]}
                    >
                      {isCatReleased && totalMarks?.CAT?.weight}
                    </Text>
                    {/* EXAM */}
                    <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}>
                      {isExamReleased && totalMarks?.EXAM?.marks?.toFixed(1)}
                    </Text>
                    <Text
                      style={[headerTextTw, tw('text-center bg-[#b3b3b3]  border-l w-full py-1')]}
                    >
                      {isExamReleased && totalMarks?.EXAM?.weight}
                    </Text>
                    {/* TOT */}
                    <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}>
                      {allReleased && totalMarks?.TOT?.marks?.toFixed(1)}
                    </Text>
                    <Text
                      style={[headerTextTw, tw('text-center bg-[#b3b3b3]  border-l w-full py-1')]}
                    >
                      {allReleased && totalMarks?.TOT?.weight}
                    </Text>
                  </View>
                );
              })}
              {/* year(total) */}
              <View style={tw(`flex flex-row ${getW(3.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center w-full py-1')]}>
                  {isYearReleased && yearTotals.marks?.toFixed(1)}
                </Text>
                <Text style={[headerTextTw, tw('text-center bg-[#b3b3b3]  border-l w-full py-1')]}>
                  {isYearReleased && yearTotals.weight}
                </Text>
                <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}></Text>
              </View>
              {/* Second Sitting */}
              <View style={tw(`flex flex-row ${getW(2.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center w-full py-1')]}></Text>
                <Text
                  style={[headerTextTw, tw('text-center bg-[#b3b3b3]  border-l w-full py-1')]}
                ></Text>
                <Text style={[headerTextTw, tw('text-center border-l w-full py-1')]}></Text>
              </View>
              <View style={tw(`flex flex-row ${getW(1.5)} border-l py-2.5 border-black`)}></View>
            </View>
            {/* percentage */}
            <View style={tw('flex-row w-full border-black border-t')}>
              <Text style={[headerTextTw, tw(`text-left ${getW(6)} p-1`)]}>Percentage</Text>
              {/* terms */}
              {[1, 2, 3].map((term, ti) => {
                const termMarks = info.reportCard[ETerms[ti]];
                const percentage = termMarks ? getTermPercentage(termMarks) : null;
                const termInfo = terms?.find((t) => t.name === ETerms[ti]);
                const isExamReleased = termInfo?.termMarksStatus === 'EXAM' || shouldShowAll;
                const isCatReleased =
                  termInfo?.termMarksStatus === 'CAT' || isExamReleased || shouldShowAll;
                const allReleased = isCatReleased && isExamReleased && percentage;
                return (
                  <Text
                    key={term}
                    style={[
                      headerTextTw,
                      tw(
                        `flex flex-row ${getW(
                          6,
                        )} justify-end text-right border-l border-black py-1`,
                      ),
                    ]}
                  >
                    {allReleased ? `${percentage}%` : ''}
                  </Text>
                );
              })}
              {/* year(total) */}
              <View style={tw(`flex flex-row ${getW(3.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center w-2/3 py-1 flex-row justify-end')]}>
                  {isYearReleased && `${yearPercentage}%`}
                </Text>
                <Text style={[headerTextTw, tw('text-center border-l w-1/3 py-1')]}></Text>
              </View>
              {/* Second Sitting */}
              <View style={tw(`flex flex-row ${getW(2.5)} border-l border-black`)}>
                <Text style={[headerTextTw, tw('text-center w-2/3 py-1 flex-row justify-end')]}>
                  {/* Second sitting percentage would go here */}
                </Text>
                <Text style={[headerTextTw, tw('text-center border-l w-1/3 py-1')]}></Text>
              </View>
              <Text style={tw(`flex flex-row ${getW(1.5)} border-l py-1 border-black`)}></Text>
            </View>
            {/* signature */}
            <View style={tw('flex-row w-full border-black border-y')}>
              <Text style={[headerTextTw, tw(`text-left ${getW(6)} px-1 py-2.5`)]}>
                Signature of Class Advisor
              </Text>
              <View style={tw(`flex flex-row ${getW(6)} py-2.5 border-l border-black`)}></View>
              <View style={tw(`flex flex-row ${getW(6)} py-2.5 border-l border-black`)}></View>
              <View style={tw(`flex flex-row ${getW(6)} py-2.5 border-l border-black`)}></View>
              <View style={tw(`flex flex-row ${getW(3.5)} py-2.5 border-l border-black`)}></View>
              <View style={tw(`flex flex-row ${getW(2.5)} py-2.5 border-l border-black`)}></View>
              <Text style={tw(`flex flex-row ${getW(1.5)} py-2.5 border-l border-black`)}></Text>
            </View>
          </View>
          {/* key */}
          {/* grades scale */}
          <View style={tw('flex-row w-full justify-between mt-4')}>
            <View style={tw('flex-row w-3/4 border-black border border-l-0')}>
              <View style={tw('flex flex-col w-1/4 text-center')}>
                <Text style={[headerTextTw, tw('text-center p-2.5')]}>GRADE SCALE</Text>
                <Text style={[headerTextTw, tw('text-center p-2.5 border-t')]}>SCORE RANGE</Text>
              </View>
              {grades.map((grade) => (
                <View key={grade.grade} style={tw('flex flex-col w-1/6 border-l text-center')}>
                  <Text style={[headerTextTw, tw('text-center p-2.5')]}>{grade.grade}</Text>
                  <Text
                    style={[headerTextTw, tw('text-center p-2.5 border-t')]}
                  >{`${grade.max}-${grade.min}`}</Text>
                </View>
              ))}
            </View>
            {/* cat + exam explanation */}
            <View style={tw('flex-row w-[30%] ml-2 border-black border border-r-0')}>
              <View style={tw('flex flex-col w-1/4 text-center')}>
                <Text style={[headerTextTw, tw('text-center py-2.5')]}>CAT</Text>
                <Text style={[headerTextTw, tw('text-center py-2.5 border-t')]}>EXAM</Text>
              </View>
              <View style={tw('flex flex-col w-3/4 border-l text-center')}>
                <Text style={[headerTextTw, tw('text-center py-2.5')]}>
                  {'Continuous Assessment Test'}
                </Text>
                <Text
                  style={[headerTextTw, tw('text-center py-2.5 border-t')]}
                >{`End Term Exam`}</Text>
              </View>
            </View>
          </View>
          {/* footer + remarks + signature */}
          <View style={tw('flex-col w-full justify-between mt-4 p-3')}>
            <Text style={[headerTextTw, tw('underline')]}>Decision of the deliberation</Text>
            <View style={tw('flex-row w-full gap-x-8 justify-between')}>
              {/* first sitting */}
              <View style={tw('flex flex-col w-1/3')}>
                <Text style={[headerTextTw, tw('underline mt-5')]}>1. FIRST SITTING</Text>
                <View style={tw('flex flex-col gap-y-1 mt-4')}>
                  <View style={tw('flex flex-row items-center w-full justify-between pr-11')}>
                    <Text style={[headerTextTw, tw('text-left')]}>Promoted </Text>
                    <View style={tw('px-3 py-1.5 border-2 relative')}>
                      {isYearReleased &&
                        getSittingStatus(Number(yearPercentage)) === 'PROMOTED' && <CheckIcon />}
                    </View>
                  </View>
                  <View style={tw('flex flex-row items-center w-full justify-between pr-11')}>
                    <Text style={[headerTextTw, tw('text-left')]}>Proposed to Second Sitting </Text>
                    <View style={tw('px-3 py-1.5 border-2 relative')}>
                      {isYearReleased && getSittingStatus(Number(yearPercentage)) === 'SITTING' && (
                        <CheckIcon />
                      )}
                    </View>
                  </View>
                  <View style={tw('flex flex-row items-center w-full justify-between pr-11')}>
                    <Text style={[headerTextTw, tw('text-left')]}>Proposed to Repeat</Text>
                    <View style={tw('px-3 py-1.5 border-2 relative')}>
                      {isYearReleased &&
                        getSittingStatus(Number(yearPercentage)) === 'REPEATING' && <CheckIcon />}
                    </View>
                  </View>
                </View>
              </View>
              {/* 2nd sitting */}
              <View style={tw('flex flex-col w-1/3')}>
                <Text style={[headerTextTw, tw('underline mt-5')]}>2. SECOND SITTING</Text>
                <View style={tw('flex flex-col gap-y-1 mt-4')}>
                  <View style={tw('flex flex-row items-center w-full justify-between pr-11')}>
                    <Text style={[headerTextTw, tw('text-left')]}>Promoted </Text>
                    <View style={tw('px-3 py-1.5 border-2 relative')}>
                      {isYearReleased &&
                        getSittingStatus(Number(yearPercentage)) === 'SECOND_SITTING_PROMOTED' && (
                          <CheckIcon />
                        )}
                    </View>
                  </View>
                  <View style={tw('flex flex-row items-center w-full justify-between pr-11')}>
                    <Text style={[headerTextTw, tw('text-left')]}>Proposed to Repeat</Text>
                    <View style={tw('px-3 py-1.5 border-2 relative')}>
                      {isYearReleased &&
                        getSittingStatus(Number(yearPercentage)) === 'SECOND_SITTING_REPEAT' && (
                          <CheckIcon />
                        )}
                    </View>
                  </View>
                  <View style={tw('flex flex-row items-center w-full justify-between pr-11')}>
                    <Text style={[headerTextTw, tw('text-left')]}>Excluded</Text>
                    <View style={tw('px-3 py-1.5 border-2 relative')}>
                      {isYearReleased &&
                        getSittingStatus(Number(yearPercentage)) === 'SECOND_SITTING_EXCLUDED' && (
                          <CheckIcon />
                        )}
                    </View>
                  </View>
                </View>
              </View>
              <View style={tw('flex flex-col w-1/3 pt-24 gap-y-2')}>
                <Text style={[headerTextTw]}>
                  Done at Rubavu
                  {/* {new Date(studentClassTerm?.term?.endDate).toLocaleDateString()} */}
                </Text>
                <Text style={[headerTextTw]}>The Principal</Text>
                <Text style={[headerTextTw]}>Signature and Stamp</Text>
              </View>
              u
            </View>
          </View>
          {/* QrCode */}
          {qrCodeImageUrl && (
            <View style={tw('flex-col-reverse w-full items-end mt-4 absolute right-2 bottom-2 ')}>
              <Text style={[headerTextTw, tw('text-right')]}>
                Scan QR Code for verification & more details
              </Text>
              <Image style={{ width: 100, height: 100 }} src={qrCodeImageUrl} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export const ReportCardImage = ({
  children,
  reportCardInfo,
  image,
}: {
  children?: any;
  reportCardInfo: any;
  image: any;
}) => {
  return (
    <Document
      keywords="report card, student, school, education, academic, grade, result, transcript, marksheet, marklist, mark list, mark sheet, report"
      subject="Report Card"
      title={`${reportCardInfo?.studentInfo?.firstName} ${reportCardInfo?.studentInfo?.lastName} Report Card`}
    >
      <Page size={{ width: 800, height: 1020 }} style={{ backgroundColor: '#ffffff' }}>
        <Image source={image} style={{ width: '100%', height: '100%' }} />
        {children}
      </Page>
    </Document>
  );
};
// export default ReportCard;
