import {
  CustomizeIcon,
  DashboardIcon,
  DocumentsIcon,
  FolderIcon,
  NewsIcon,
  ParentsStudentsIcon,
  PastDocumentsIcon,
  PlantIcon,
  ProfileIcon,
} from '@/components/core/icons';
import { GiNotebook } from 'react-icons/gi';
import { SideBarRoute } from '.';
import { AiOutlineApartment } from 'react-icons/ai';
import { BsFillCalendar2RangeFill } from 'react-icons/bs';
import { FaBook, FaBookReader, FaFileAlt } from 'react-icons/fa';
import { YearOneIcon, YearThreeIcon, YearTwoIcon } from '@/components/core/icons/icons1';
import { MdSchedule } from 'react-icons/md';

const staffRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/staff',
    icon: DashboardIcon,
    roleAcessible: ['Accountant', 'Discpline', 'Teacher', 'PM'],
  },
  {
    name: 'Academics',
    path: '',
    icon: FaBookReader,
    hasSubRoutes: true,
    routes: [
      {
        name: 'Appeals',
        path: '/staff/appeals',
        icon: FolderIcon,
      },
      {
        name: 'Courses/Marking',
        path: '/staff/courses',
        icon: GiNotebook,
        iconSize: 23,
      },
      {
        name: 'Report-Cards',
        path: '/staff/report-cards',
        icon: FolderIcon,
      },
      {
        name: 'Timetable',
        path: '/staff/timetable',
        icon: MdSchedule,
      },
    ],
    roleAcessible: ['Teacher'],
  },
  // {
  //   name: 'Students',
  //   path: '/staff/students',
  //   icon: BsFillCalendar2RangeFill,
  // },
  {
    name: 'Course Notes',
    path: '/staff/notes',
    icon: FaFileAlt,
    roleAcessible: ['Teacher'],
  },
  {
    name: 'Students',
    path: '/staff/students',
    icon: FaBookReader,
  },
  {
    name: 'My Library',
    path: '/staff/library',
    icon: FaBook,
  },
  {
    name: 'Docs / Resources',
    path: '',
    icon: DocumentsIcon,
    hasSubRoutes: true,
    routes: [
      // {
      //   name: 'Notes',
      //   path: '/staff/docs/notes',
      //   icon: YearOneIcon,
      // },
      {
        name: 'Past Papers',
        path: '/staff/docs/past-papers',
        icon: PastDocumentsIcon,
      },
    ],
  },
  // {
  //   name: 'Profile',
  //   path: '/staff/profile',
  //   icon: ProfileIcon,
  // },
];

export default staffRoutes;
