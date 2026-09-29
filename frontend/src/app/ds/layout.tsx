'use client';
// import { Inter } from 'next/font/google'
// import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Sidebar from '@/components/Sidebar';
import dsRoutes from '@/utils/routes/ds-routes';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // moved the redirect logic into middleware.ts
  return (
    <div className="h-screen overflow-hidden w-full flex flex-col justify-between">
      <Navbar routes={dsRoutes} rightRoutes={[]} />
      <div className="flex flex-row h-full  mb-1  px-2 gap-3 overflow-hidden">
        <Sidebar routes={dsRoutes} />
        <div className="w-full md:w-[75vw] lg:w-[80vw] h-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
      <Footer role={'ds'} />
    </div>
  );
}
