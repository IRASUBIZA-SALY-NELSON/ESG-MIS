'use client';
import {
  CustomizeIcon,
  DashboardIcon,
  FolderIcon,
  NewsIcon,
  ParentsStudentsIcon,
  PlantIcon,
} from '@/components/core/icons';
import { AiOutlineApartment } from 'react-icons/ai';
import { BsFillCalendar2RangeFill } from 'react-icons/bs';
import { FaBookReader, FaUserFriends } from 'react-icons/fa';
import { GiNotebook, GiVote } from 'react-icons/gi';
import { SideBarRoute } from '.';
import { MdFileUploadOff, MdOutlineHistory, MdSchedule } from 'react-icons/md';

const adminRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: DashboardIcon,
  },
  {
    name: 'Academics',
    path: '',
    icon: FaBookReader,
    hasSubRoutes: true,
    routes: [
      {
        name: 'Academic Year',
        path: '/admin/academic-year',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Terms',
        path: '/admin/terms',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Report-Cards',
        path: '/admin/report-cards',
        icon: FolderIcon,
      },
      {
        name: 'Courses',
        path: '/admin/courses',
        icon: GiNotebook,
        iconSize: 23,
      },
      {
        name: 'Timetable',
        path: '/admin/timetable',
        icon: MdSchedule,
      },
    ],
  },
  {
    name: 'Classes',
    path: '/admin/classes',
    icon: AiOutlineApartment,
    iconSize: 23,
  },
  {
    name: 'Students',
    path: '/admin/students',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Parents',
    path: '',
    icon: FaUserFriends,
    hasSubRoutes: true,
    routes: [
      {
        name: 'Parent Accounts',
        path: '/admin/parents',
        icon: FaUserFriends,
      },
      {
        name: 'Parent Messages',
        path: '/admin/parent-messages',
        icon: NewsIcon,
      },
    ],
  },
  {
    name: 'ESG Alumnus',
    path: '/admin/alumnus',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Staff',
    path: '',
    icon: ParentsStudentsIcon,
    hasSubRoutes: true,
    routes: [
      {
        name: 'All staff',
        path: '/admin/workers',
        icon: ParentsStudentsIcon,
      },
      {
        name: 'Teachers',
        path: '/admin/workers/teachers',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Discipline',
        path: '/admin/workers/discipline',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Accountant',
        path: '/admin/workers/accountants',
        icon: FolderIcon,
      },
      {
        name: 'Others',
        path: '/admin/workers/others',
        icon: GiNotebook,
        iconSize: 23,
      },
    ],
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: FaUserFriends,
  },
  {
    name: 'Audit log',
    path: '/admin/audit',
    icon: MdOutlineHistory,
    iconSize: 23,
  },
  // {
  //   name: 'Roles',
  //   path: '/admin/roles',
  //   icon: FaUserFriends,
  // },
  // {
  //   name: 'Electives',
  //   path: '/admin/elections',
  //   icon: GiVote,
  //   hasSubRoutes: true,
  //   routes: [
  //     {
  //       name: 'Positions',
  //       path: '/admin/elections/positions',
  //       icon: GiVote,
  //     },
  //     {
  //       name: 'Candidates',
  //       path: '/admin/elections/candidates',
  //       icon: FaUserFriends,
  //     },
  //     {
  //       name: 'Sessions',
  //       path: '/admin/elections/sessions',
  //       icon: GiVote,
  //     },
  //   ],
  // },
  // {
  //   name: 'Customizations',
  //   path: '/admin/customizations',
  //   icon: CustomizeIcon,
  // },
];

export default adminRoutes;
