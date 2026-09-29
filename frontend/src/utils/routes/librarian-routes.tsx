import { DashboardIcon, ProfileIcon } from '@/components/core/icons';
import { FaBook, FaExchangeAlt, FaUsers } from 'react-icons/fa';
import { MdAlarm, MdHistory, MdOutlineAssessment, MdSettings } from 'react-icons/md';
import { SideBarRoute } from '.';

const librarianRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/librarian',
    icon: DashboardIcon,
  },
  {
    name: 'Circulation Desk',
    path: '/librarian/circulation',
    icon: FaExchangeAlt,
  },
  {
    name: 'Books Catalog',
    path: '/librarian/books',
    icon: FaBook,
  },
  {
    name: 'Loans History',
    path: '/librarian/loans',
    icon: MdHistory,
    iconSize: 22,
  },
  {
    name: 'Overdue & Reminders',
    path: '/librarian/reminders',
    icon: MdAlarm,
    iconSize: 22,
  },
  {
    name: 'Borrowers',
    path: '/librarian/borrowers',
    icon: FaUsers,
  },
  {
    name: 'Lost-book bills',
    path: '/librarian/bills',
    icon: MdOutlineAssessment,
    iconSize: 22,
  },
  {
    name: 'Reports & Analytics',
    path: '/librarian/reports',
    icon: MdOutlineAssessment,
    iconSize: 22,
  },
  {
    name: 'Library Rules',
    path: '/librarian/settings',
    icon: MdSettings,
    iconSize: 22,
  },
  {
    name: 'Profile',
    path: '/librarian/profile',
    icon: ProfileIcon,
  },
];

export default librarianRoutes;
