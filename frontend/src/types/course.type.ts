import { IModel } from './base.type';
import { IClass } from './class.type';
import { IAcademicYear, ITerm } from './other.type';

export interface ICourse extends IModel {
  classList: IClass[];
  classes: IClass[];
  courseName: string;
  courseCredits: string;
  courseWeight: string;
  terms: any[];
  termsList: ITerm[];
  academicYear: IAcademicYear;
  passMark: number;
}

export interface AssignedCourse extends IModel {
  course: ICourse;
  class: IClass;
  academicYear: IAcademicYear;
  term: ITerm;
}

export interface TeacherCourses {
  [key: string]: {
    [key: string]: ICourse[];
  };
}
