import StaffReportCards from '@/components/pageComps/StaffReportCards';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Report Cards',
  description: 'Report Cards for students',
};

function ReportsCardsPage() {
  return <StaffReportCards />;
}

export default ReportsCardsPage;
