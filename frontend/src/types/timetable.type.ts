import { ICourse } from './course.type';
import { ITerm } from './other.type';

export interface ITimeTable {
  schedule: string;
  termName: string;
  timeSlotList: {
    id: string;
    dayOfWeek: string;
    startTime: number[];
    endTime: number[];
  }[];
  lessonList: {
    id: string;
    planningId: string;
    subject: string;
    course: ICourse[];
    teacher: string;
    className: string;
    timeSlot: {
      id: string;
      dayOfWeek: string;
      startTime: number[];
      endTime: number[];
    };
  }[];
  score: string;
  id: string;
  term: ITerm[];
}
