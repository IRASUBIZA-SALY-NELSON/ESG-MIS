'use client';
// import { Inter } from 'next/font/google'
// import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Sidebar from '@/components/Sidebar';
import { rightStudentRoutes } from '@/utils/routes/right-routes';
import studentRoutes from '@/utils/routes/student-routes';
import React, { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [accountTab, setAccountTab] = useState(false);
  return (
    <div
      onClick={() => {
        if (accountTab) setAccountTab(false);
      }}
      className="h-[100svh] flex flex-col w-full"
    >
      <Navbar routes={studentRoutes} rightRoutes={rightStudentRoutes} />
      <div className="flex flex-row h-[88vh]  mb-1 px-2 gap-3 overflow-hidden">
        <Sidebar routes={studentRoutes} />
        <div className="w-full md:w-[75vw] lg:w-[80vw] flex flex-col overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
      <Footer role={'student'} />
    </div>
  );
}
