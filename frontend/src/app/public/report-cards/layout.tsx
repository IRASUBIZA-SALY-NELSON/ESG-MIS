import RcaLogo from '@/components/core/icons/logo';
import { Button } from '@mantine/core';
import Link from 'next/link';
import React from 'react';
import { BsArrowUpRight } from 'react-icons/bs';

const ReportCardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-[96vh] w-full items-center">
      <div className="flex bg-[#F5FAF7] shadow-sm items-center w-full p-4 justify-between">
        <RcaLogo />
        <Link href="https://esg.ac.rw" target="_blank">
          <Button className="rounded-lg bg-primary text-white">
            Visit Website
            <BsArrowUpRight className="inline-block ml-2" />
          </Button>
        </Link>
      </div>
      {children}
    </div>
  );
};

export default ReportCardLayout;
