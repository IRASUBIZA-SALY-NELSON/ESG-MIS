import { IReportCard } from '@/types/marks.type';
import { IAcademicYear } from '@/types/other.type';
import { getFile, rcaLogo } from '@/utils/constants';
import { toFixed } from '@/utils/funcs/func2';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { grades } from './data';
import {
  getGrade,
  getOrderedCourses,
  getTotalYearMarksByCourse,
  getYearTotalMarks,
  getFinalCourseGrade,
  getFinalCoursePercentage,
} from './utils';

const NAVY = '#1e2d5a';
const NAVY_L = '#2d3f7a';
const BORDER = '#c8ccd8';
const HEAD_BG = '#e8eaf0';
const YEAR_BG = '#dce0ee';
const ROW_ALT = '#f7f8fc';
const RED = '#c0392b';
const WHITE = '#ffffff';

const COL = {
  course: '46%',
  mark: '12%',
  total: '12%',
  pct: '12%',
  grade: '18%',
} as const;

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    paddingHorizontal: '1cm',
    paddingVertical: '1cm',
  },
  container: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: BORDER,
  },

  topBar: {
    backgroundColor: WHITE,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  divider: {
    borderBottomWidth: 2,
    borderBottomColor: NAVY_L,
  },

  body: {
    paddingHorizontal: '1cm',
    paddingTop: 10,
    paddingBottom: 12,
  },
});

const T = {
  white: { color: WHITE, fontWeight: 'bold', fontSize: 8 } as const,
  whiteS: { color: WHITE, fontWeight: 'bold', fontSize: 7 } as const,
  whiteLg: { color: WHITE, fontWeight: 'bold', fontSize: 11 } as const,
  navy: { color: NAVY, fontWeight: 'bold', fontSize: 8 } as const,
  navySm: { color: NAVY, fontWeight: 'bold', fontSize: 7 } as const,
  navyLg: { color: NAVY, fontWeight: 'bold', fontSize: 10 } as const,
  dark: { color: '#222', fontWeight: 'bold', fontSize: 7 } as const,
  mid: { color: '#333', fontSize: 7 } as const,
  small: { color: '#444', fontSize: 6 } as const,
  red: { color: RED, fontSize: 7 } as const,
};

export interface YearSection {
  label: string;
  academicYear: IAcademicYear;
  reportCard: IReportCard | null;
}

interface Props {
  yearSections: YearSection[];
  studentName: string;
  studentProfilePic?: string | null;
}

const YearTable = ({ section }: { section: YearSection }) => {
  const { label, academicYear, reportCard } = section;

  const yearRange = academicYear.name
    ? academicYear.name
    : `${academicYear.startYear}-${academicYear.endYear}`;
  const heading = `${label} - ${yearRange}`;

  if (!reportCard || !reportCard.courses || reportCard.courses.length === 0) {
    return (
      <View style={{ marginTop: 10, borderWidth: 1, borderColor: BORDER }}>
        <View
          style={{
            backgroundColor: YEAR_BG,
            borderBottomWidth: 1,
            borderBottomColor: BORDER,
            padding: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[T.navy, { fontSize: 9 }]}>{heading}</Text>
        </View>
        <View style={{ padding: 8 }}>
          <Text style={[T.mid, { textAlign: 'center' }]}>
            No academic records found for {label}.
          </Text>
        </View>
      </View>
    );
  }

  const courses = getOrderedCourses(reportCard);
  const yearTotals = getYearTotalMarks(reportCard.reportCard);
  const yearPct =
    yearTotals.weight > 0 ? ((yearTotals.marks / yearTotals.weight) * 100).toFixed(2) : '0.00';
  const yearGrade = getGrade(Number(yearPct));

  return (
    <View style={{ marginTop: 10, borderWidth: 1, borderColor: BORDER }}>
      <View
        style={{
          backgroundColor: YEAR_BG,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
          padding: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={[T.navy, { fontSize: 9 }]}>{heading}</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
          backgroundColor: HEAD_BG,
        }}
      >
        <View
          style={{
            width: COL.course,
            paddingVertical: 4,
            paddingHorizontal: 5,
            borderRightWidth: 1,
            borderRightColor: BORDER,
          }}
        >
          <Text style={[T.navy]}>COURSE / SUBJECT</Text>
        </View>
        <View
          style={{
            width: COL.mark,
            paddingVertical: 4,
            paddingHorizontal: 3,
            borderRightWidth: 1,
            borderRightColor: BORDER,
          }}
        >
          <Text style={[T.navy, { textAlign: 'center' }]}>MARK</Text>
        </View>
        <View
          style={{
            width: COL.total,
            paddingVertical: 4,
            paddingHorizontal: 3,
            borderRightWidth: 1,
            borderRightColor: BORDER,
          }}
        >
          <Text style={[T.navy, { textAlign: 'center' }]}>TOTAL</Text>
        </View>
        <View
          style={{
            width: COL.pct,
            paddingVertical: 4,
            paddingHorizontal: 3,
            borderRightWidth: 1,
            borderRightColor: BORDER,
          }}
        >
          <Text style={[T.navy, { textAlign: 'center' }]}>%</Text>
        </View>
        <View style={{ width: COL.grade, paddingVertical: 4, paddingHorizontal: 3 }}>
          <Text style={[T.navy, { textAlign: 'center' }]}>GRADE</Text>
        </View>
      </View>

      {/* Data rows */}
      {courses.map((course, idx) => {
        const totals = getTotalYearMarksByCourse(reportCard.reportCard, course);
        const finalPct = getFinalCoursePercentage(reportCard.reportCard, course);
        const grade = getFinalCourseGrade(reportCard.reportCard, course);
        const hasData = totals.weight > 0;
        const isFail = hasData && Number(finalPct) < 50;
        const pctTxt = hasData ? `${Number(finalPct).toFixed(1)}%` : '—';
        const rowBg = idx % 2 === 0 ? WHITE : ROW_ALT;
        const valStyle = isFail ? T.red : T.mid;

        return (
          <View
            key={course}
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: BORDER,
              backgroundColor: rowBg,
            }}
          >
            <View
              style={{
                width: COL.course,
                paddingVertical: 4,
                paddingHorizontal: 5,
                borderRightWidth: 1,
                borderRightColor: BORDER,
              }}
            >
              <Text style={[T.mid]}>{course}</Text>
            </View>
            <View
              style={{
                width: COL.mark,
                paddingVertical: 4,
                paddingHorizontal: 3,
                borderRightWidth: 1,
                borderRightColor: BORDER,
              }}
            >
              <Text style={[valStyle, { textAlign: 'center' }]}>
                {hasData ? String(toFixed(totals.marks, 1)) : '—'}
              </Text>
            </View>
            <View
              style={{
                width: COL.total,
                paddingVertical: 4,
                paddingHorizontal: 3,
                borderRightWidth: 1,
                borderRightColor: BORDER,
              }}
            >
              <Text style={[T.mid, { textAlign: 'center' }]}>
                {hasData ? String(totals.weight) : '—'}
              </Text>
            </View>
            <View
              style={{
                width: COL.pct,
                paddingVertical: 4,
                paddingHorizontal: 3,
                borderRightWidth: 1,
                borderRightColor: BORDER,
              }}
            >
              <Text style={[valStyle, { textAlign: 'center' }]}>{pctTxt}</Text>
            </View>
            <View style={{ width: COL.grade, paddingVertical: 4, paddingHorizontal: 3 }}>
              <Text style={[valStyle, { textAlign: 'center', fontWeight: 'bold' }]}>
                {hasData ? grade : '—'}
              </Text>
            </View>
          </View>
        );
      })}

      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: BORDER,
          backgroundColor: NAVY,
        }}
      >
        <View
          style={{
            width: COL.course,
            paddingVertical: 4,
            paddingHorizontal: 5,
            borderRightWidth: 1,
            borderRightColor: NAVY_L,
          }}
        >
          <Text style={[T.white]}>TOTAL</Text>
        </View>
        <View
          style={{
            width: COL.mark,
            paddingVertical: 4,
            paddingHorizontal: 3,
            borderRightWidth: 1,
            borderRightColor: NAVY_L,
          }}
        >
          <Text style={[T.white, { textAlign: 'center' }]}>
            {String(toFixed(yearTotals.marks, 1))}
          </Text>
        </View>
        <View
          style={{
            width: COL.total,
            paddingVertical: 4,
            paddingHorizontal: 3,
            borderRightWidth: 1,
            borderRightColor: NAVY_L,
          }}
        >
          <Text style={[T.white, { textAlign: 'center' }]}>{yearTotals.weight}</Text>
        </View>
        <View
          style={{
            width: COL.pct,
            paddingVertical: 4,
            paddingHorizontal: 3,
            borderRightWidth: 1,
            borderRightColor: NAVY_L,
          }}
        >
          <Text style={[T.white, { textAlign: 'center' }]}>{yearPct}%</Text>
        </View>
        <View style={{ width: COL.grade, paddingVertical: 4, paddingHorizontal: 3 }}>
          <Text style={[T.white, { textAlign: 'center', fontWeight: 'bold' }]}>{yearGrade}</Text>
        </View>
      </View>
    </View>
  );
};

const Transcript = ({ yearSections, studentName, studentProfilePic }: Props) => {
  return (
    <Document
      author="Ecole des Sciences de Gisenyi"
      keywords="transcript, student, school, education, academic, grade, result"
      subject="Academic Transcript"
      title={`${studentName} — Academic Transcript`}
    >
      <Page size={{ width: 800, height: 'auto' as any }} style={styles.page}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
              <Text style={[T.dark]}>REPUBLIC OF RWANDA</Text>
              <Text style={[T.dark]}>MINISTRY OF EDUCATION</Text>
              <Text style={[T.dark, { fontSize: 9 }]}>ECOLE DES SCIENCES DE GISENYI</Text>

              <Image style={{ width: 32, height: 32, marginTop: 4 }} src={rcaLogo} />
              <Text style={[T.mid, { marginTop: 4 }]}>Tel: (+250) 788 548 000</Text>
              <Text style={[T.mid]}>Email: papiasni@gmail.com</Text>
            </View>

            <View style={{ flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <View
                style={{
                  width: 90,
                  height: 105,
                  borderWidth: 1,
                  borderColor: BORDER,
                  overflow: 'hidden',
                  backgroundColor: '#f0f0f0',
                }}
              >
                {studentProfilePic ? (
                  <Image
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    src={getFile(studentProfilePic) as string}
                  />
                ) : null}
              </View>
              <Text
                style={{
                  color: NAVY,
                  fontWeight: 'bold',
                  fontSize: 11,
                  textAlign: 'center',
                  textDecoration: 'underline',
                  letterSpacing: 1,
                  marginTop: 4,
                }}
              >
                ACADEMIC TRANSCRIPT
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'column',
                flex: 1,
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
              }}
            >
              <Text style={[T.mid]}>Candidate:</Text>
              <Text style={[T.dark, { fontSize: 9, marginTop: 3 }]}>{studentName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.body}>
            {yearSections.map((section) => (
              <YearTable key={section.label} section={section} />
            ))}

            <View style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: BORDER }}>
                {/* Label cell */}
                <View
                  style={{
                    width: '22%',
                    backgroundColor: HEAD_BG,
                    padding: 6,
                    borderRightWidth: 1,
                    borderRightColor: BORDER,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[T.navy, { textAlign: 'center' }]}>GRADE SCALE</Text>
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: BORDER,
                      marginTop: 4,
                      paddingTop: 4,
                    }}
                  >
                    <Text style={[T.navy, { textAlign: 'center' }]}>SCORE RANGE</Text>
                  </View>
                </View>
                {grades.map((g) => (
                  <View
                    key={g.grade}
                    style={{ flex: 1, borderRightWidth: 1, borderRightColor: BORDER }}
                  >
                    <View
                      style={{
                        backgroundColor: HEAD_BG,
                        borderBottomWidth: 1,
                        borderBottomColor: BORDER,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={[T.navy, { textAlign: 'center' }]}>{g.grade}</Text>
                    </View>
                    <View style={{ paddingVertical: 4 }}>
                      <Text style={[T.small, { textAlign: 'center' }]}>{`${g.max}–${g.min}`}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <View style={{ flexDirection: 'column', width: '36%' }}>
                <Text style={[T.dark]}>Done at Rubavu</Text>
                <Text style={[T.dark, { marginTop: 10 }]}>Principal</Text>
                <View
                  style={{ marginTop: 48, borderTopWidth: 1, borderTopColor: NAVY, paddingTop: 3 }}
                >
                  <Text style={[T.small, { textAlign: 'center' }]}>Signature</Text>
                </View>
                <View
                  style={{
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: NAVY,
                    height: 60,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderStyle: 'dashed',
                  }}
                >
                  <Text style={[T.small, { textAlign: 'center', color: NAVY }]}>
                    Official Stamp
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Transcript;
