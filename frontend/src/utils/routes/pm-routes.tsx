import { DashboardIcon, ParentsStudentsIcon, ProfileIcon } from '@/components/core/icons';
import { GiNotebook, GiVote } from 'react-icons/gi';
import { SideBarRoute } from '.';
import { AiOutlineApartment } from 'react-icons/ai';
import { BsFillCalendar2RangeFill } from 'react-icons/bs';
import { FaBookReader, FaLockOpen, FaUserFriends } from 'react-icons/fa';
import { MdFileUploadOff, MdSchedule } from 'react-icons/md';
import { CustomizeIcon, FolderIcon, NewsIcon, PlantIcon } from '@/components/core/icons';
import { FaUnlockAlt } from 'react-icons/fa';
const pmroutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/pm',
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
        path: '/pm/academic-year',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Terms',
        path: '/pm/terms',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Report-Cards',
        path: '/pm/report-cards',
        icon: FolderIcon,
      },
      {
        name: 'Performance',
        path: '/pm/performance',
        icon: MdSchedule,
      },
      {
        name: 'Courses',
        path: '/pm/courses',
        icon: GiNotebook,
        iconSize: 23,
      },
      {
        name: 'Not Uploaded',
        path: '/pm/not_uploaded',
        icon: MdFileUploadOff,
        iconSize: 23,
      },
      {
        name: 'Unlock Edit Marks',
        path: '/pm/unlock',
        icon: FaLockOpen,
        iconSize: 23,
      },
    ],
  },
  {
    name: 'Appeals',
    path: '/pm/appeals',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Students',
    path: '/pm/students',
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
        path: '/pm/parents',
        icon: FaUserFriends,
      },
      {
        name: 'Parent Messages',
        path: '/pm/parent-messages',
        icon: NewsIcon,
      },
    ],
  },
  {
    name: 'Staff',
    path: '',
    icon: ParentsStudentsIcon,
    iconSize: 23,
    hasSubRoutes: true,
    routes: [
      {
        name: 'Teachers',
        path: '/pm/workers/teachers',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Discipline',
        path: '/pm/workers/discipline',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Accountant',
        path: '/pm/workers/accountants',
        icon: FolderIcon,
      },
      {
        name: 'Others',
        path: '/pm/workers/others',
        icon: GiNotebook,
        iconSize: 23,
      },
    ],
  },
  // {
  //   name: 'Elections',
  //   path: '/pm/elections',
  //   icon: GiVote,
  //   hasSubRoutes: true,
  //   routes: [
  //     {
  //       name: 'Positions',
  //       path: '/pm/elections/positions',
  //       icon: GiVote,
  //     },
  //     {
  //       name: 'Candidates',
  //       path: '/pm/elections/candidates',
  //       icon: FaUserFriends,
  //     },
  //     {
  //       name: 'Sessions',
  //       path: '/pm/elections/sessions',
  //       icon: GiVote,
  //     },
  //   ],
  // },
];

export default pmroutes;
