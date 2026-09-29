'use client';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import {
  DashboardIcon,
  FolderIcon,
  OpportunityIcon,
  PerformanceIcon,
  PlantIcon,
  ProfileIcon,
  AppealsIcon,
  TimetableIcon,
} from '../core/icons';

const StudentSidebar: React.FC = () => {
  const [activeLink, setActiveLink] = useState('Dashboard');
  const path = usePathname();

  const isActiveLink = (linkPath: string) => {
    return path === linkPath;
  };
  return (
    <div className="hidden md:block bg-[#D9D9D975] border-2 border-[#43434305] p-1 rounded-md h-full  w-fit md:w-[22vw] lg:w-[18vw] text-[#00000075] text-sm">
      <p className="font-semibold my-2 mx-3 hidden md:block transition-all duration-200">Menu</p>
      <div className="font-medium">
        <Link
          href={'/student'}
          className={
            isActiveLink('/student')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2 font-bold'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2'
          }
        >
          <DashboardIcon />
          <p className="hidden md:block transition-all duration-200">{'Dashboard'}</p>
        </Link>
        <Link
          href={'/student/report-cards'}
          className={
            isActiveLink('/student/report-cards')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f]  hover:bg-primary/20 hover:text-primary my-2'
          }
        >
          <FolderIcon />
          <p className="hidden md:block transition-all duration-200">{'Report-Cards'}</p>
        </Link>
        <Link
          href={'/student/innovations'}
          className={
            isActiveLink('/student/innovations')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2'
          }
        >
          <PlantIcon />
          <p className="hidden md:block transition-all duration-200">{'Projects'}</p>
        </Link>
        <Link
          href={'/student/opportunities'}
          className={
            isActiveLink('/student/opportunities')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2'
          }
        >
          <OpportunityIcon />
          <p className="hidden md:block transition-all duration-200">{'Opportunities'}</p>
        </Link>
        <Link
          href={'/student/courses'}
          className={
            isActiveLink('/student/courses')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2'
          }
        >
          <OpportunityIcon />
          <p className="hidden md:block transition-all duration-200">{'Courses'}</p>
        </Link>
        <Link
          href={'/student/timetable'}
          className={
            isActiveLink('/student/timetable')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2'
          }
        >
          <TimetableIcon />
          <p className="hidden md:block transition-all duration-200">{'Timetable'}</p>
        </Link>
        <Link
          href={'/student/performance'}
          className={
            isActiveLink('/student/performance')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2'
          }
        >
          <PerformanceIcon />
          <p className="hidden md:block transition-all duration-200">{'Performance'}</p>
        </Link>
        <Link
          href={'/student/appeals'}
          className={
            isActiveLink('/student/appeals')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2 hover:fill-[]'
          }
        >
          <AppealsIcon />
          <p className="hidden md:block transition-all duration-200">{'Appeals'}</p>
        </Link>
        <Link
          href={'/student/profile'}
          className={
            isActiveLink('/student/profile')
              ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
              : 'flex flex-row gap-5 items-center p-3 rounded-lg text-[#3f3f3f] hover:bg-primary/20 hover:text-primary my-2 hover:fill-[]'
          }
        >
          <ProfileIcon />
          <p className="hidden md:block transition-all duration-200">{'Profile'}</p>
        </Link>
      </div>
    </div>
  );
};

export default StudentSidebar;
