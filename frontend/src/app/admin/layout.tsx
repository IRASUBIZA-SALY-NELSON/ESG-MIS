import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Sidebar from '@/components/Sidebar';
import adminRoutes from '@/utils/routes/admin-routes';
import { rightAdminRoutes } from '@/utils/routes/right-routes';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100vh] flex flex-col overflow-hidden w-full">
      <Navbar routes={adminRoutes} rightRoutes={rightAdminRoutes} />
      <div className="flex flex-row h-full my-1 px-3 gap-3 overflow-hidden ">
        <Sidebar routes={adminRoutes} />
        <div className="w-full md:w-[75vw] h-[88vh] flex flex-col overflow-y-auto lg:w-[80vw] pb-20 ">
          {children}
        </div>
      </div>
      <Footer role={'admin'} />
    </div>
  );
}
