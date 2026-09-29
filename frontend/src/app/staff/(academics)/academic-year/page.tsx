import { ApiResponse } from '@/types/base.type';
import { IAcademicYear } from '@/types/other.type';
import { AuthApi, fetcher } from '@/utils/constants';
import { Metadata } from 'next';
import React from 'react';
import AcademicYear from './_indexPage';

export const revalidate = 15; // seconds

export const metadata: Metadata = {
  title: 'Academic Year',
  description: 'View and manage academic years',
};

const getAcademicYears = async () => {
  try {
    const res = await fetcher('/academic-years/all');

    if (res?.status === 500) throw new Error('Server error');
    return res.data;
  } catch (error) {
    return [];
  }
};

const AcademicYearPage = async () => {
  const academicYears = await getAcademicYears();
  return <AcademicYear academicYears={academicYears} />;
};

export default AcademicYearPage;
