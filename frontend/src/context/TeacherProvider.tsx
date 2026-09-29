'use client';
import useGet from '@/hooks/useGet';
import { TeacherClassCourse } from '@/types/teacher.type';
import React from 'react';
import { useUserContext } from './Usercontext';

interface TeacherProviderProps {
  children: React.ReactNode;
}

interface TeacherContextProps {
  courses?: TeacherClassCourse[] | null;
  loading?: boolean;
  get: () => void;
  error: any;
}

const TeacherContext = React.createContext<TeacherContextProps>({
  courses: null,
  loading: false,
  get: () => {},
  error: null,
});

export const useTeacherContext = () => React.useContext(TeacherContext);

const TeacherProvider: React.FC<TeacherProviderProps> = ({ children }) => {
  const teacherId = useUserContext().profile?.id;
  const {
    data: courses,
    loading,
    error,
    get,
  } = useGet<TeacherClassCourse[]>(`/teacher-class-course/teacher/courses/logged-in-teacher`, {
    defaultData: {},
  });

  return (
    <TeacherContext.Provider value={{ courses, loading, get, error }}>
      {children}
    </TeacherContext.Provider>
  );
};

export default TeacherProvider;
