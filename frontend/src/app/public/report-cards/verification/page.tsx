import ViewReportCard from '@/components/academics/ViewReportCard';
import { PageProps } from '@/types/base.type';
import { Student } from '@/types/student.types';
import { baseUrl } from '@/utils/constants';
import axios from 'axios';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

export const revalidate = 60;

const getStudent = async (token: string, studentId: string) => {
  try {
    const res = await axios.get(`${baseUrl}/api/parents/destructure-token/${token}`);

    const students: Student[] = res.data.data;
    const student = students.find((s) => s.id === studentId);
    return student;
  } catch (error) {
    return null;
  }
};

export async function generateMetadata({ searchParams }: PageProps) {
  const token = searchParams?.token;
  const academicYearId = searchParams?.academicYearId;
  const studentId = searchParams?.studentId;

  if (!token || !academicYearId || !studentId) return notFound();
  const student = await getStudent(token, studentId);
  if (!student) return notFound();
  return {
    title: `${student?.firstName}  ${student?.firstName}'s Report Card`,
    description: `Verify ${student?.firstName}  ${student?.firstName}'s Report Card`,
  } as Metadata;
}

const getReportCardTkn = async (academicYearId: string, studentId: string, token: string) => {
  try {
    const res = await axios.get(`${baseUrl}/api/v1/academicMarks/report-card/by-parent`, {
      params: {
        token,
        academicYearId,
        studentId,
      },
    });
    return res.data.data;
  } catch (error) {
    return null;
  }
};

const VerifyReportPage = async ({ searchParams }: PageProps) => {
  const token = searchParams?.token;
  const academicYearId = searchParams?.academicYearId;
  const studentId = searchParams?.studentId;
  if (!token || !academicYearId || !studentId) {
    return notFound();
  }

  const student = await getStudent(token, studentId);

  if (!student) return notFound();

  const reportCard = await getReportCardTkn(academicYearId, studentId, token);

  return (
    <div className=" w-full overflow-auto max-w-[800px]">
      <ViewReportCard
        student={student}
        // academicYearId={academicYearId}
        customUrl={`/academicMarks/report-card/by-parent?token=${token}`}
        reportCard={reportCard}
        useAuth={false}
        viewAll={true}
        defaultAcademicYearId={academicYearId}
        reportCardToken={token}
      />
    </div>
  );
};

export default VerifyReportPage;
