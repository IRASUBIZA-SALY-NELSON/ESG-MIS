export interface Project {
  FMessages: number;
  publisher: string;
  id: number;
  name: string;
  description: string;
  status: string;
  image: string;
  createdAt: Date;
  updatedAt: any;
}

export interface Course {
  courseId: string;
  courseName: string;
  teacherName: string;
  hoursPerWeek: string;
}
export interface AppealedCourseProps {
  courseId: string;
  courseName: string;
  teacherName: string;
  catMark: string | number;
  examMark: string | number;
}
export interface AppealProps {
  appealId: string;
  courseName: string;
  category: string;
  marksObtained: string;
  status: string;
}

export interface AppealedLessonProps {
  courseId: string;
  courseName: string;
  teacherName: string;
  catMark: string | number;
  examMark: string | number;
}
