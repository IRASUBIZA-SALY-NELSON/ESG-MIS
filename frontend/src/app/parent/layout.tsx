'use client';
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Sidebar from '@/components/Sidebar';
import { rightParentRoutes } from '@/utils/routes/right-routes';
import parentRoutes from '@/utils/routes/parent-routes';
import React from 'react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100svh] flex flex-col w-full print:h-auto">
      <div className="print:hidden">
        <Navbar routes={parentRoutes} rightRoutes={rightParentRoutes} />
      </div>
      <div className="flex flex-row h-[88vh] mb-1 px-2 gap-3 overflow-hidden print:h-auto print:overflow-visible">
        <div className="print:hidden contents">
          <Sidebar routes={parentRoutes} />
        </div>
        <div className="w-full md:w-[75vw] lg:w-[80vw] flex flex-col overflow-y-auto overflow-x-hidden print:w-full print:overflow-visible">
          {children}
        </div>
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
