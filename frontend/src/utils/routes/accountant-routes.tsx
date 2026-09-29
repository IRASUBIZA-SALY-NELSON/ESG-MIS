import { DashboardIcon, ProfileIcon } from '@/components/core/icons';
import { FaFileInvoiceDollar, FaMoneyCheckAlt, FaUserGraduate } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';
import { SideBarRoute } from '.';

const accountantRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/accountant',
    icon: DashboardIcon,
  },
  {
    name: 'Bills',
    path: '/accountant/bills',
    icon: FaFileInvoiceDollar,
  },
  {
    name: 'Payment proofs',
    path: '/accountant/proofs',
    icon: MdPendingActions,
    iconSize: 22,
  },
  {
    name: 'Payments',
    path: '/accountant/payments',
    icon: FaMoneyCheckAlt,
  },
  {
    name: 'Students',
    path: '/accountant/students',
    icon: FaUserGraduate,
  },
  {
    name: 'Profile',
    path: '/accountant/profile',
    icon: ProfileIcon,
  },
];

export default accountantRoutes;
