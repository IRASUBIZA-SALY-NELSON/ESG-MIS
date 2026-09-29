import {
  CustomizeIcon,
  DashboardIcon,
  FolderIcon,
  NewsIcon,
  ParentsStudentsIcon,
  PlantIcon,
  ProfileIcon,
} from '@/components/core/icons';
import { GiNotebook, GiVote } from 'react-icons/gi';
import { SideBarRoute } from '.';
import { AiOutlineApartment } from 'react-icons/ai';
import { BsClockHistory, BsFillCalendar2RangeFill } from 'react-icons/bs';
import { FaBookReader, FaUserFriends } from 'react-icons/fa';
import { YearOneIcon, YearThreeIcon, YearTwoIcon } from '@/components/core/icons/icons1';

const dsRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/ds',
    icon: DashboardIcon,
    roleAcessible: ['Accountant', 'Discpline', 'Teacher', 'PM'],
  },
  {
    name: 'Marks',
    path: '/ds/marks',
    icon: FaBookReader,
  },
  {
    name: 'Students',
    path: '/ds/students',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'ESG Alumnus',
    path: '/ds/alumnus',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Appeals',
    path: '/ds/appeals',
    icon: ParentsStudentsIcon,
  },
  {
    name: 'Cases',
    path: '/ds/deductions',
    icon: FaBookReader,
  },
  {
    name: 'DS Report',
    path: '/ds/report',
    icon: FolderIcon,
  },
];

export default dsRoutes;
