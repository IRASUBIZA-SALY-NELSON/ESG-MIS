import ReportSidebar from '@/components/Sidebar/ReportsSidebar';
import React from 'react';

const ReportLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full gap-y-2 flex-col flex ">
      <ReportSidebar />
      {children}
    </div>
  );
};

export default ReportLayout;
