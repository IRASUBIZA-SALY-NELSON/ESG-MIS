'use client';
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Sidebar from '@/components/Sidebar';
import { rightAccountantRoutes } from '@/utils/routes/right-routes';
import accountantRoutes from '@/utils/routes/accountant-routes';
import React from 'react';

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100svh] flex flex-col w-full print:h-auto">
      <div className="print:hidden">
        <Navbar routes={accountantRoutes} rightRoutes={rightAccountantRoutes} />
      </div>
      <div className="flex flex-row h-[88vh] mb-1 px-2 gap-3 overflow-hidden print:h-auto print:overflow-visible">
        <div className="print:hidden contents">
          <Sidebar routes={accountantRoutes} />
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
