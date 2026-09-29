import { IModel } from './base.type';
import { IClass } from './class.type';
import { AssignedCourse, ICourse } from './course.type';
import { ITerm } from './other.type';
import { IUser } from './user.type';

export interface Teacher extends IUser {
  address: any;
  classes: any;
  currentClazz: IClass;
  courses: AssignedCourse[];
  workingDays: string[];
}

export interface TeacherClassCourse extends IModel {
  teacher: Teacher;
  myClazz: IClass | null;
  course: ICourse;
  term: ITerm;
}
