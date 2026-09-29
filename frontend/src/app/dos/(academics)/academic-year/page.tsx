'use client';
import React, { useEffect, useState } from 'react';
import AcademicYear from './_indexPage';
import { getAcademicYears } from '@/utils/funcs';

const AcademicYearPage = () => {
  const [academicYear, setAcademicYear] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAcademicYears()
      .then((res) => {
        setAcademicYear(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  return <AcademicYear academicYears={academicYear} loading={loading} />;
};

export default AcademicYearPage;
