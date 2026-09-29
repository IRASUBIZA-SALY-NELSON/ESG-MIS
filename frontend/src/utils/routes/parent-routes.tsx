import { DashboardIcon, NewsIcon, ProfileIcon } from '@/components/core/icons';
import { SideBarRoute } from '.';

const parentRoutes: SideBarRoute[] = [
  {
    name: 'My Children',
    path: '/parent',
    icon: DashboardIcon,
  },
  {
    name: 'Messages to School',
    path: '/parent/concerns',
    icon: NewsIcon,
  },
  {
    name: 'Profile',
    path: '/parent/profile',
    icon: ProfileIcon,
  },
];

export default parentRoutes;
