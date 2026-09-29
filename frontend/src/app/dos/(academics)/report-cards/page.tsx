import PMAdminReportCards from '@/components/pageComps/PMAdminReportCards';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Report Cards',
  description: 'Report Cards for students',
};

function ReportsCardsPage() {
  return <PMAdminReportCards canRelease />;
}

export default ReportsCardsPage;
