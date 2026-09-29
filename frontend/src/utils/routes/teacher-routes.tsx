import { DashboardIcon, ParentsStudentsIcon, ProfileIcon } from '@/components/core/icons';
import { GiNotebook } from 'react-icons/gi';
import { SideBarRoute } from '.';
import { AiOutlineApartment } from 'react-icons/ai';
import { BsFillCalendar2RangeFill } from 'react-icons/bs';
import { FaBookReader } from 'react-icons/fa';

import { CustomizeIcon, FolderIcon, NewsIcon, PlantIcon } from '@/components/core/icons';

const teacherRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/staff',
    icon: DashboardIcon,
  },
  {
    name: 'Courses',
    path: '/staff/courses',
    icon: GiNotebook,
    iconSize: 23,
  },
  {
    name: 'Students',
    path: '/staff/students',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Appeals',
    path: '/staff/appeals',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Academic Year',
    path: '/pm/academic-year',
    icon: BsFillCalendar2RangeFill,
  },
  {
    name: 'Profile',
    path: '/pm/profile',
    icon: ProfileIcon,
  },
];

export default teacherRoutes;
