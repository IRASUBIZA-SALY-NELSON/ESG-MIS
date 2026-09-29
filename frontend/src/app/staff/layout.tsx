'use client';
// import { Inter } from 'next/font/google'
// import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Sidebar from '@/components/Sidebar';
import staffRoutes from '@/utils/routes/staff-routes';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // moved the redirect logic into middleware.ts
  return (
    <div className="h-full overflow-hidden flex flex-col justify-between w-full">
      <Navbar routes={[]} rightRoutes={[]} />
      <div className="flex flex-row h-[88vh] mb-1 px-2 gap-3">
        <Sidebar routes={staffRoutes} />
        <div className="w-full md:w-[75vw] lg:w-[80vw] overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
      <Footer role={'staff'} />
    </div>
  );
}
