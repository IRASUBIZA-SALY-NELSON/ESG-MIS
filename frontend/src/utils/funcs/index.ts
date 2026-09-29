import axios from 'axios';
import { SideBarRoute } from '../routes';
import adminRoutes from '../routes/admin-routes';
import pmroutes from '../routes/pm-routes';
import studentRoutes from '../routes/student-routes';
import { AuthApi, backend } from '../constants';
import dsRoutes from '../routes/ds-routes';
import { notifications } from '@mantine/notifications';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import staffRoutes from '../routes/staff-routes';
import parentRoutes from '../routes/parent-routes';
import librarianRoutes from '../routes/librarian-routes';
import dosRoutes from '../routes/dos-routes';
import accountantRoutes from '../routes/accountant-routes';
import { ERole, Role } from '@/types/base.type';
import { MARK_TYPE } from '@/types/marks.type';
import { CaseCategory } from '@/types/case-category.type';

export function getRolePath(role: Role): string {
  switch (role) {
    case 'STUDENT':
      return '/student';
    case 'DS':
      return '/ds';
    case 'ADMIN':
      return '/admin';
    case 'PM':
      return '/pm';
    case 'DOS':
      return '/dos';
    case 'ACCOUNTANT':
      return '/accountant';
    case 'TEACHER':
      return '/staff';
    case 'PARENT':
      return '/parent';
    case 'LIBRARIAN':
      return '/librarian';
    default:
      return '/auth/login';
  }
}

export function getRoleRoutes(role: Role): SideBarRoute[] {
  switch (role) {
    case 'STUDENT':
      return flattenRoutes(studentRoutes);
    case 'DS':
      return flattenRoutes(dsRoutes);
    case 'ADMIN':
      return flattenRoutes(adminRoutes);
    case 'PM':
      return flattenRoutes(pmroutes);
    case 'DOS':
      return flattenRoutes(dosRoutes);
    case 'ACCOUNTANT':
      return flattenRoutes(accountantRoutes);
    case 'TEACHER':
      return flattenRoutes(staffRoutes);
    case 'PARENT':
      return flattenRoutes(parentRoutes);
    case 'LIBRARIAN':
      return flattenRoutes(librarianRoutes);
    default:
      return [];
  }
}
export function flattenRoutes(routes: SideBarRoute[]): SideBarRoute[] {
  const flatten = routes.flatMap((route) => {
    if (route.hasSubRoutes) {
      return [route, ...route.routes!];
    }
    return route;
  });
  return flatten.filter((route) => !route.hasSubRoutes || route.path !== '');
}
export async function getAppeals() {
  const teachers = await AuthApi.get(`/academicAppeals/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the appeals.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });

  return teachers;
}

export async function getDsAppeals() {
  const teachers = await AuthApi.get(`/ds-appeals/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the appeals sent to you.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });

  return teachers;
}

export async function getTeacherAppeals(term: string) {
  const appeals = await AuthApi.get(`/academicAppeals/all/{for-loggedIn-teacher}`, {
    params: {
      limit: 100,
      page: 0,
      termId: term,
    },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the appeals sent to you.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });

  return appeals;
}

export async function getStudentMarks(academic: string, term: string) {
  const marks = await AuthApi.get(`academicMarks/all/by-loggedIn-student`, {
    params: { academicYearId: academic, termId: term, limit: 100, page: 0 },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting your marks.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });
  return marks;
}

export async function getStudentMarksById(id: string) {
  const marks = await AuthApi.get(`/academicMarks/all/by-studentId`, {
    params: { studentId: id },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting your marks.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });
  return marks;
}

export async function getStudentDeductionsById(id: string) {
  const marks = await AuthApi.get(`/deductions/student/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting your marks.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });
  return marks;
}

export async function getStudentDeductions(academic: string, term: string, student: string) {
  const marks = await AuthApi.get(`/deductions/academic-year/term/student`, {
    params: { 'academic-year': academic, term: term, student },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting your deductions .',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });
  return marks;
}

export async function getAllNews() {
  const marks = await AuthApi.get(`/news/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting news .',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });
  return marks;
}

export async function getCourses(id: string) {
  const teachers = await AuthApi.get(`/courses/all/teacher/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the appeals.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
      return err;
    });

  return teachers;
}

export function getCoursesForLoggedIn() {
  const years = AuthApi.get(`/courses/all/by-loggedIn-student`)
    .then((res) => {
      if (res.data) {
        return res.data;
      } else {
        return [];
      }
    })
    .catch((err) => {});
  return years;
}

export function getAcademicYears() {
  const years = AuthApi.get('/academic-years/all')
    .then((res) => {
      if (res.data) {
        return res.data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the years.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });

  return years;
}

export function getTermsInYear(year: string) {
  const years = AuthApi.get(`/terms/all/academic-year/${year}`)
    .then((res) => {
      if (res.data) {
        return res.data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the terms.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });
  return years;
}

export function getClassesInProm(prom: string) {
  const years = AuthApi.get(`/classes/all/current-year`, { params: { page: 0, limit: 100 } })
    .then((res) => {
      if (res.data) {
        return res.data.data.filter((classe: any) => classe.className.includes(prom));
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the class.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });

  return years;
}

export function getAllCandidates() {
  const years = AuthApi.get(`/candidates/all`)
    .then((res) => {
      if (res.data) {
        return res.data.data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the candidates.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });

  return years;
}

export function getCandidatePostions(id: string) {
  const positions = AuthApi.get(`/positions/all_positions_by_candidate/${id}`)
    .then((res) => {
      if (res.data) {
        return res.data.data;
      } else {
        return [];
      }
    })
    .catch((err) => {});

  return positions;
}

export function getAllPositions() {
  const positions = AuthApi.get(`/positions/all`)
    .then((res) => {
      if (res.data) {
        return res.data.data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the positions.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });

  return positions;
}

export function getAllVotingSessions() {
  const positions = AuthApi.get(`/voting_sessions/all`)
    .then((res) => {
      if (res.data) {
        return res.data.data;
      } else {
        return [];
      }
    })
    .catch((err) => {});

  return positions;
}

export function submitVotes(
  votes: {
    candidateId: string;
    positionId: string;
    voterId: string;
    votingSessionId: string;
  }[],
) {
  const positions = AuthApi.post(`/votes/create/list`, votes)
    .then((res) => {
      notifications.show({
        title: 'Vote Submitted Successfully!',
        message: 'Thank you for participating in the voting process.',
        color: 'green',
        autoClose: 60000,
      });
      if (res.data) {
        return res.data.data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while voting.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });

  return positions;
}

export function getClassesInPromByTeacher(prom: string) {
  const years = AuthApi.get(`/classes/all/by-loggedIn-teacher`)
    .then((res) => {
      if (res.data) {
        return res.data.data.filter((classe: any) => classe.className.includes(prom));
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting the class.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });

  return years;
}

export function getStudentsClassYear(year: string, classId: string) {
  const years = AuthApi.get(
    // `/students/all/by-class-and-discipline-term?termId=${year}&classId=${classId}&limit=100&page=0`,
    `/student-class-term/class/term?termId=${year}&classId=${classId}`,
  )
    .then((res) => {
      if (res.data) {
        return res?.data?.data ?? res.data?.content ?? res.data ?? [];
      } else {
        return [];
      }
    })
    .catch((err) => {
      notifications.show({
        title: 'Oops! Something went wrong while getting students  in the class.',
        message:
          'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
        color: 'red',
        autoClose: 60000,
      });
    });

  return years;
}

// export function getStudentAppeals(year: string, classId: string) {

//   const years = AuthApi.get(
//     `/students/all/by-class-and-academic-year?termId=${year}&classId=${classId}&limit=100&page=0`,
//   )
//     .then((res) => {

//       if (res.data) {
//         return res.data;
//       } else {
//         return [];
//       }
//     })
//     .catch((err) => {

//       notifications.show({
//         title: 'Failed to fetch Students in the class',
//         message:           'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
//         color: 'red',
//         autoClose: 60000,
//       });
//     });

//   return years;
// }

export const fetchDeductions = async (activeYear: string, activeTerm: string) => {
  if (activeTerm !== undefined || activeYear !== undefined) {
    const me: any = await localStorage.getItem('rcaappuser');
    AuthApi.get(`/deductions/academic-year/term/student`, {
      params: {
        'academic-year': activeYear,
        term: activeTerm,
        student: JSON.parse(me).userTypesDTOList[0].user_id,
      },
    })
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        notifications.show({
          title: 'Failed to get Deductions',
          message: 'Sorry failed to get your deductions',
          color: 'red',
          autoClose: 60000,
        });
        return [];
      });
  } else {
    notifications.show({
      title: 'Failed to get Deductions',
      message: 'Sorry failed to get your deductions',
      color: 'red',
      autoClose: 60000,
    });
    return [];
  }
};

export async function getStudentAppeals(status: 'academic' | 'discipline') {
  try {
    const endpoint =
      status === 'academic'
        ? '/academicAppeals/all/{loggedIn-student}/paginated?limit=100&page=0'
        : `/ds-appeals/mine?limit=100&page=0`;

    const response = await AuthApi.get(endpoint);

    const content = response.data?.data?.content ?? response.data?.content;
    return content ?? [];
  } catch (error: any) {
    notifications.show({
      title: `Oops! Something went wrong while getting your ${
        status === 'academic' ? 'academic' : 'discipline'
      } appeals`,
      message:
        'We apologize for the inconvenience. Please try again later. If the issue persists, contact support for assistance.',
      color: 'red',
      autoClose: 60000,
    });

    return [];
  }
}

export async function getAllTeachers() {
  const teachers = await AuthApi.get(`/teachers/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });

  return teachers;
}

export async function getAllStudents() {
  const students = await AuthApi.get(`/students/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });

  return students;
}

export const createCaseCategory = async (data: CaseCategory) => {
  try {
    const response = await AuthApi.post('/case-categories/create', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create case category');
  }
};

export const updateCaseCategory = async (id: string, data: CaseCategory) => {
  try {
    const response = await AuthApi.put(`/case-categories/update/${id}`, {
      marks: data.marks,
      description: data.description,
      name: data.name,
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to update case category');
  }
};

export const deleteCaseCategory = async (id: string) => {
  try {
    const response = await AuthApi.delete(`/case-categories/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete case category');
  }
};

export async function getAllStaff() {
  const staff = await AuthApi.get(`/staff-members/all?limit=100&page=0`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });

  return staff;
}
export const exportToExcel = async (
  fileName: string,
  excelData: any,
  fileExtension: string,
  fileType: any,
) => {
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

export async function getCourseWeight(courseId: any) {
  try {
    const { data } = await AuthApi.get(`/courses/id/${courseId}`);
    return data?.data?.courseWeight;
  } catch (err) {
    console.error(err);
  }
}
export const handleFilter = (data: any, weight: any, markType: MARK_TYPE) => {
  return data?.map(({ firstName, lastName, email, gender }: any) => ({
    firstName,
    lastName,
    gender,
    'Student Email': email,
    Marks: '',
    Weight: weight,
    'Mark type': markType ?? '',
    comment: '',
  }));
};
