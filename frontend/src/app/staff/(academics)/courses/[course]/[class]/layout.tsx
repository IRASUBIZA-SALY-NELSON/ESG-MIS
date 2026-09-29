import React from 'react';

type Props = {
  children: React.ReactNode;
};

interface Params {
  course: string;
  class: string;
}

export async function generateMetadata({ params }: { params: Params }) {
  return {
    title: `${decodeURIComponent(params.course)} Students Marks - ${decodeURIComponent(
      params.class,
    )}`,
  };
}

const CourseStudents = ({ children }: Props) => {
  return children;
};

export default CourseStudents;
