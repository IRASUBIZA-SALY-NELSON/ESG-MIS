'use client';
import dosRoutes from '@/utils/routes/dos-routes';
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Sidebar from '@/components/Sidebar';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100vh] flex flex-col overflow-hidden w-full">
      <Navbar routes={dosRoutes} rightRoutes={[]} />
      <div className="flex flex-row h-full my-1 px-3 gap-3 overflow-hidden">
        <Sidebar routes={dosRoutes} />
        <div className="w-full md:w-[75vw]  flex flex-col overflow-y-auto lg:w-[80vw]">
          {children}
        </div>
      </div>
      <Footer role={'dos'} />
    </div>
  );
}
