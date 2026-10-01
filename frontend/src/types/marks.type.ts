import { IModel } from './base.type';
import { IClass } from './class.type';
import { ICourse } from './course.type';
import { IAcademicYear, ITerm } from './other.type';
import { Parent, Student } from './student.types';
import { UserProfile } from './user.type';

export interface IMark extends IModel {
  student: Student;
  comment: string;
  courseId: string;
  markType: MARK_TYPE;
  marks: number;
  studentId: string;
  termId: string;
  weight: number;
  passMark: number;
  course?: ICourse;
  term: ITerm;
  marksStatus: 'PASS' | 'FAIL';
  lockStatus: string;
}

export enum MARK_TYPE {
  EXAM = 'EXAM',
  CAT = 'CAT',
  SECOND_SITTING = 'SECOND_SITTING',
}

export enum ETerm {
  FIRST_TERM = 'FIRST_TERM',
  SECOND_TERM = 'SECOND_TERM',
  THIRD_TERM = 'THIRD_TERM',
}

export interface IReportCard {
  studentInfo: Student;
  academicYearInfo: IAcademicYear;
  academicLevel?: string;
  reportCard: IReportCardItem;
  parents: Parent[];
  courses: ICourse[];
}

export type IReportCardItem = {
  [K in ETerm]?: IReportCardItemTerm;
} & { [key: string]: any };
export type IReportCardItemTerm = {
  [key: string]: IMark[];
};

export interface DsReport {
  firstTermMarks: number;
  secondTermMarks: number;
  thirdTermMarks: number;
}

export interface DsStudentReport {
  student: Student;
  totalMarks: number;
  disciplineMarksReductions: DisciplineMarksReduction[];
}

export interface DsCasesReport {
  casesCategories: CasesCategory;
  percentage: number;
  disciplineMarksReductions: DisciplineMarksReduction[];
}

export interface DisciplineMarksReduction {
  createdAt: string;
  updatedAt: string;
  id: string;
  marks: number;
  reason: string;
  student: Student;
  visibility: string;
  staffMember: UserProfile;
  casesCategories?: CasesCategory;
  term: ITerm;
  academicYear: IAcademicYear;
  lockStatus?: string;
  myClazz: IClass;
  action?: string;
  deductionStatus?: string;
}

export interface CasesCategory {
  id: string;
  name: string;
  description: string;
  marks: number;
}

/** Payload for the official report-card PDF (students, staff, parents). */
export interface ReportCardDocument {
  reportCard: IReportCard;
  terms: ITerm[];
  dsMarks: DsReport;
  studentClassTermData: unknown;
}
