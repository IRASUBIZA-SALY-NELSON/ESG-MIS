import { IClass } from '@/types/class.type';
import { ICourse } from '@/types/course.type';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { TeacherClassCourse } from '@/types/teacher.type';
import QrCode from 'qrcode';

interface Opts {
  studentId: string;
  academicYearId: string;
  token: string;
}

export const genReportCardQrCode = async (params: Opts) => {
  if (!params.token || !params.academicYearId || !params.studentId) return null;
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/public/report-cards/verification?token=${params.token}&academicYearId=${params.academicYearId}&studentId=${params.studentId}`;

  const qrCode = await QrCode.toDataURL(url, { errorCorrectionLevel: 'L' });
  return qrCode;
};

export interface GroupedAcadCourse {
  academicYear: IAcademicYear;
  terms: GroupedTermCourse[];
}

export interface GroupedTermCourse {
  term: ITerm;
  courses: GroupedCourse[];
}

export interface GroupedCourse {
  course: ICourse;
  classes: IClass[];
}

/**
 * Function to group courses by term
 * @param data - TeacherClassCourse[]
 * @returns grouped courses by term - GroupedTermCourse[]
 */
export const groupCoursesByAcadYear = (data: TeacherClassCourse[] | null | undefined) => {
  if (!data) return [];
  if (!Array.isArray(data)) {
    return [];
  }
  const hierarchy = [] as unknown as GroupedAcadCourse[];
  data.forEach((entry) => {
    const academicYear = entry.term.academicYear.name;
    const termName = entry.term.name.replace('_', ' ');
    const courseName = entry.course.courseName;
    const className = entry?.myClazz?.className;

    if (!hierarchy.some((acad) => acad.academicYear.name === academicYear)) {
      // hierarchy[academicYear] = {};
      hierarchy.push({
        academicYear: entry.term.academicYear,
        terms: [],
      });
    }

    const acadIndex = hierarchy.findIndex((acad) => acad.academicYear.name === academicYear);
    const acad = hierarchy[acadIndex];
    if (!acad.terms.some((term) => term.term.name.replace('_', ' ') === termName)) {
      acad.terms.push({
        term: entry.term,
        courses: [],
      });
    }

    const termIndex = acad.terms.findIndex((term) => term.term.name.replace('_', ' ') === termName);
    const term = acad.terms[termIndex];
    if (!term.courses.some((course) => course.course.courseName === courseName)) {
      term.courses.push({
        course: entry.course,
        classes: [],
      });
    }

    const courseIndex = term.courses.findIndex((course) => course.course.courseName === courseName);
    const course = term.courses[courseIndex];
    if (entry.myClazz && !course.classes.some((cls) => cls?.className === className)) {
      course.classes.push(entry.myClazz);
    }
  });

  return hierarchy;
};
