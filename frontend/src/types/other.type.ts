import { IModel } from './base.type';
import { Student } from './student.types';

export interface IAcademicYear extends IModel {
  disciplineMarksPassMark: number;
  endYear: number | string;
  name: string;
  startYear: number;
  status: 'ACTIVE' | 'FINISHED';
}

export interface ITerm extends IModel {
  academicYear: IAcademicYear;
  courses: any[];
  endDate: string | Date;
  name: string;
  startDate: string | Date;
  academicYearId?: string;
  termMarksStatus: TERM_MARKS_STATUS;
}

export enum TERM_MARKS_STATUS {
  CAT = 'CAT',
  EXAM = 'EXAM',
  NONE = 'NONE',
}

export interface IPosition extends IModel {
  name: string;
}

export interface ICandidate extends IModel {
  student: Student;
}

export interface ISession extends IModel {
  endDate: string;
  startDate: string;
  title: string;
  resultStatus: string;
}

export interface IVote extends IModel {
  candidate: ICandidate;
  voter: Student;
  position: IPosition;
}
