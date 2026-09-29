import { DashboardIcon, ParentsStudentsIcon, ProfileIcon } from '@/components/core/icons';
import { GiNotebook, GiVote } from 'react-icons/gi';
import { SideBarRoute } from '.';
import { AiOutlineApartment } from 'react-icons/ai';
import { BsFillCalendar2RangeFill } from 'react-icons/bs';
import { FaBookReader, FaLockOpen, FaUserFriends } from 'react-icons/fa';
import { MdFileUploadOff, MdSchedule } from 'react-icons/md';
import { CustomizeIcon, FolderIcon, NewsIcon, PlantIcon } from '@/components/core/icons';
import { FaUnlockAlt } from 'react-icons/fa';
const dosRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/dos',
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
        path: '/dos/academic-year',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Terms',
        path: '/dos/terms',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Report-Cards',
        path: '/dos/report-cards',
        icon: FolderIcon,
      },
      {
        name: 'Performance',
        path: '/dos/performance',
        icon: MdSchedule,
      },
      {
        name: 'Courses',
        path: '/dos/courses',
        icon: GiNotebook,
        iconSize: 23,
      },
      {
        name: 'Not Uploaded',
        path: '/dos/not_uploaded',
        icon: MdFileUploadOff,
        iconSize: 23,
      },
      {
        name: 'Unlock Edit Marks',
        path: '/dos/unlock',
        icon: FaLockOpen,
        iconSize: 23,
      },
    ],
  },
  {
    name: 'Appeals',
    path: '/dos/appeals',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Students',
    path: '/dos/students',
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
        path: '/dos/parents',
        icon: FaUserFriends,
      },
      {
        name: 'Parent Messages',
        path: '/dos/parent-messages',
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
        path: '/dos/workers/teachers',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Discipline',
        path: '/dos/workers/discipline',
        icon: BsFillCalendar2RangeFill,
      },
      {
        name: 'Accountant',
        path: '/dos/workers/accountants',
        icon: FolderIcon,
      },
      {
        name: 'Others',
        path: '/dos/workers/others',
        icon: GiNotebook,
        iconSize: 23,
      },
    ],
  },
  // {
  //   name: 'Elections',
  //   path: '/dos/elections',
  //   icon: GiVote,
  //   hasSubRoutes: true,
  //   routes: [
  //     {
  //       name: 'Positions',
  //       path: '/dos/elections/positions',
  //       icon: GiVote,
  //     },
  //     {
  //       name: 'Candidates',
  //       path: '/dos/elections/candidates',
  //       icon: FaUserFriends,
  //     },
  //     {
  //       name: 'Sessions',
  //       path: '/dos/elections/sessions',
  //       icon: GiVote,
  //     },
  //   ],
  // },
];

export default dosRoutes;
