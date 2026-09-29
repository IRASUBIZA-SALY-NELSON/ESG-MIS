import {
  AppealsIcon,
  DashboardIcon,
  DocumentsIcon,
  FolderIcon,
  PastDocumentsIcon,
  PerformanceIcon,
} from '@/components/core/icons';
import { FaBook, FaBookReader, FaFileAlt, FaUserFriends } from 'react-icons/fa';
import { GiNotebook, GiVote } from 'react-icons/gi';
import { SideBarRoute } from '.';
import { MdSchedule } from 'react-icons/md';

const studentRoutes: SideBarRoute[] = [
  {
    name: 'Dashboard',
    path: '/student',
    icon: DashboardIcon,
  },
  {
    name: 'Academics',
    path: '',
    icon: FaBookReader,
    hasSubRoutes: true,
    routes: [
      {
        name: 'Report-Cards',
        path: '/student/report-cards',
        icon: FolderIcon,
      },
      {
        name: 'Courses',
        path: '/student/courses',
        icon: GiNotebook,
        iconSize: 23,
      },
      // {
      //   name: 'Timetable',
      //   path: '/student/timetable',
      //   icon: TimetableIcon,
      // },
      {
        name: 'Performance',
        path: '/student/performance',
        icon: PerformanceIcon,
      },
      {
        name: 'Appeals',
        path: '/student/appeals',
        icon: AppealsIcon,
      },
      {
        name: 'Timetable',
        path: '/student/timetable',
        icon: MdSchedule,
      },
    ],
  },
  // {
  //   name: 'Projects',
  //   path: '/student/projects',
  //   icon: PlantIcon,
  // },
  // {
  //   name: 'Opportunities',
  //   path: '/student/opportunities',
  //   icon: OpportunityIcon,
  // },
  {
    name: 'Course Notes',
    path: '/student/notes',
    icon: FaFileAlt,
  },
  {
    name: 'Discipline Cases',
    path: '/student/deductions',
    icon: PerformanceIcon,
  },
  {
    name: 'My Library',
    path: '/student/library',
    icon: FaBook,
  },
  // {
  //   name: 'Docs / Resources',
  //   path: '',
  //   icon: DocumentsIcon,
  //   hasSubRoutes: true,
  //   routes: [
  //     // {
  //     //   name: 'Notes',
  //     //   path: '/student/docs/notes',
  //     //   icon: GiNotebook,
  //     // },
  //     {
  //       name: 'Past Papers',
  //       path: '/student/docs/past-papers',
  //       icon: PastDocumentsIcon,
  //     },
  //   ],
  // },
  // {
  //   name: 'Elections',
  //   path: '/elections',
  //   icon: GiVote,
  //   hasSubRoutes: true,
  //   routes: [
  //     {
  //       name: 'Candidates',
  //       path: '/elections',
  //       icon: GiVote,
  //     },
  //     {
  //       name: 'Vote',
  //       path: '/elections/vote',
  //       icon: FaUserFriends,
  //     },
  //     {
  //       name: 'Results',
  //       path: '/elections/results',
  //       icon: GiVote,
  //     },
  //   ],
  // },
];

export default studentRoutes;
