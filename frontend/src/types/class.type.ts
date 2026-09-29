import { IModel } from './base.type';
import { ICourse } from './course.type';
import { Teacher } from './teacher.type';

export interface IClass extends IModel {
  className: string;
  studentsNumber: number;
  studentsRemaining: number;
  classTeacher: Teacher;
  classMonitor: any;
  classMonitress: any;
  courses: ICourse[];
  coursesList: ICourse[];
}
