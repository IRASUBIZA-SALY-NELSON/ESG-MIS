'use client';
import Navbar from '@/components/NavBar/StudentNavbar';
import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
export default function ElectionLayout({ children }: { children: React.ReactNode }) {
  const navigate = useRouter();
  const [loading, setLoading] = useState(true);
  const role = getCookie('role');
  const checkRole = () => {
    if (role?.toUpperCase() === 'STUDENT') {
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (!checkRole()) {
      navigate.push(`/${role?.toLowerCase()}`);
    }
  }, []);
  return (
    <div className="w-full flex flex-col pt-[1vh]">
      <Navbar />
      {children}
    </div>
  );
}
