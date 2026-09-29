import { ETerm, IReportCard, IReportCardItem, IReportCardItemTerm } from '@/types/marks.type';

export const ETerms: ETerm[] = [ETerm.FIRST_TERM, ETerm.SECOND_TERM, ETerm.THIRD_TERM];

// return object of total marks {CAT: {marks, weight}, EXAM: {marks, weight}} by term
export const getTotalTermMarks = (studentMarks: IReportCardItemTerm) => {
  const totalMarks = {
    CAT: { marks: 0, weight: 0 },
    EXAM: { marks: 0, weight: 0 },
    TOT: { marks: 0, weight: 0 },
  };
  Object.keys(studentMarks).forEach((course) => {
    const courseMarks = studentMarks[course];
    const catMarks = courseMarks?.find((mark) => mark.markType === 'CAT');
    const examMarks = courseMarks?.find((mark) => mark.markType === 'EXAM');
    if (catMarks) {
      totalMarks.CAT.marks += catMarks.marks;
      totalMarks.CAT.weight += catMarks.weight;
      totalMarks.TOT.marks += catMarks.marks;
      totalMarks.TOT.weight += catMarks.weight;
    }
    if (examMarks) {
      totalMarks.EXAM.marks += examMarks.marks;
      totalMarks.EXAM.weight += examMarks.weight;
      totalMarks.TOT.marks += examMarks.marks;
      totalMarks.TOT.weight += examMarks.weight;
    }
  });
  return totalMarks;
};

export const getCourseTermMarks = (studentMarks: IReportCardItemTerm, course: string) => {
  const courseMarks = studentMarks[course];
  const catMarks = courseMarks?.find((mark) => mark.markType === 'CAT');
  const examMarks = courseMarks?.find((mark) => mark.markType === 'EXAM');
  return { catMarks, examMarks };
};

export const getTermPercentage = (studentMarks: IReportCardItemTerm) => {
  const totalMarks = getTotalTermMarks(studentMarks);
  const totalMarksSum = totalMarks.CAT.marks + totalMarks.EXAM.marks;
  const totalWeight = totalMarks.CAT.weight + totalMarks.EXAM.weight;
  return ((totalMarksSum / totalWeight) * 100).toFixed(2);
};

export const getTotalYearMarksByCourse = (studentMarks: IReportCardItem, course: string) => {
  const totalMarks = { weight: 0, marks: 0 };
  Object.keys(studentMarks).forEach((term, i) => {
    const termObj = studentMarks[ETerms[i]];
    if (!termObj) {
      return;
    }
    const totalTermMarks = getCourseTermMarks(termObj, course);

    totalMarks.weight +=
      (totalTermMarks.catMarks?.weight ?? 0) + (totalTermMarks.examMarks?.weight ?? 0);
    totalMarks.marks +=
      (totalTermMarks.catMarks?.marks ?? 0) + (totalTermMarks.examMarks?.marks ?? 0);
  });

  return totalMarks;
};

export const getYearPercentageByCourse = (studentMarks: IReportCardItem, course: string) => {
  const totalMarks = getTotalYearMarksByCourse(studentMarks, course);
  return ((totalMarks.marks / totalMarks.weight) * 100).toFixed(2);
};

// get totals for all terms
export const getYearTotalMarks = (studentMarks: IReportCardItem) => {
  const totalMarks = { weight: 0, marks: 0 };
  Object.keys(studentMarks).forEach((term, i) => {
    const termArg = studentMarks[ETerms[i]];
    if (!termArg) return;
    const termTotalMarks = getTotalTermMarks(termArg);
    totalMarks.weight += termTotalMarks.CAT.weight + termTotalMarks.EXAM.weight;
    totalMarks.marks += termTotalMarks.CAT.marks + termTotalMarks.EXAM.marks;
  });
  return totalMarks;
};

export const getYearPercentage = (studentMarks: IReportCardItem) => {
  const totalMarks = getYearTotalMarks(studentMarks);
  return ((totalMarks.marks / totalMarks.weight) * 100).toFixed(2);
};

export const getGrade = (percentage: number) => {
  switch (true) {
    case percentage >= 70:
      return 'A';
    case percentage >= 65 && percentage < 70:
      return 'B';
    case percentage >= 60 && percentage < 65:
      return 'C';
    case percentage >= 55 && percentage < 60:
      return 'D';
    case percentage >= 50 && percentage < 55:
      return 'E';
    case percentage < 50:
      return 'F';
    default:
      return 'F';
  }
};

export const getSittingStatus = (
  percentage: number,
):
  | 'PROMOTED'
  | 'SITTING'
  | 'REPEATING'
  | 'SECOND_SITTING_PROMOTED'
  | 'SECOND_SITTING_REPEAT'
  | 'SECOND_SITTING_EXCLUDED'
  | '' => {
  switch (true) {
    case percentage >= 60:
      return 'PROMOTED';
    case percentage >= 50 && percentage < 60:
      return 'SITTING';
    case percentage < 50:
      return 'REPEATING';
    default:
      return '';
  }
};

export const getOrderedCourses = (info: IReportCard) => {
  // const courses = Object.keys(info?.reportCard?.FIRST_TERM ?? {});
  const courses = info.courses.map((course) => course.courseName);
  const ordered = courses?.sort((a, b) => {
    // const courseA = info.courses.find((course) => course.courseName === a);
    // const courseB = info.courses.find((course) => course.courseName === b);
    /* For better ui design just use 1st term */
    const courseA = info?.reportCard?.FIRST_TERM?.[a]?.[0]?.course;
    const courseB = info?.reportCard?.FIRST_TERM?.[b]?.[0]?.course;
    return Number(courseB?.courseWeight ?? 0) - Number(courseA?.courseWeight ?? 0);
  });
  return info ? ordered : [];
};

// Get final percentage for a course, using second sitting marks if available
export const getFinalCoursePercentage = (studentMarks: IReportCardItem, course: string) => {
  // Check if second sitting marks exist for this course
  const secondSittingMarks = studentMarks.SECOND_SITTING?.[course];

  if (secondSittingMarks && secondSittingMarks.length > 0) {
    // Use second sitting marks to calculate percentage
    const marks = secondSittingMarks[0].marks;
    const weight = secondSittingMarks[0].weight;
    return ((marks / weight) * 100).toFixed(1);
  }

  // Otherwise, use regular year percentage
  return getYearPercentageByCourse(studentMarks, course);
};

// Get final grade for a course, using second sitting marks if available
export const getFinalCourseGrade = (studentMarks: IReportCardItem, course: string) => {
  const percentage = getFinalCoursePercentage(studentMarks, course);
  return getGrade(Number(percentage));
};
