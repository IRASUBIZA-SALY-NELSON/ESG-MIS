import { DashboardIcon, ProfileIcon } from '@/components/core/icons';
import { SideBarRoute } from '.';

const accountantRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/accountant',
    icon: DashboardIcon,
  },
  {
    name: 'Profile',
    path: '/accountant/profile',
    icon: ProfileIcon,
  },
];

export default accountantRoutes;
