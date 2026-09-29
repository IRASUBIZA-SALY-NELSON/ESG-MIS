import TeacherProvider from '@/context/TeacherProvider';
import { Metadata } from 'next';
import React, { FC } from 'react';

interface Props {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: 'Teacher Course - ESG',
  description: 'View your courses , classes, students as well as inserting marks here',
};

const TeacherCourseLayout: FC<Props> = ({ children }) => {
  return <TeacherProvider>{children}</TeacherProvider>;
};

export default TeacherCourseLayout;
