import {
  getAcademicYears,
  getStudentAppeals,
  getStudentDeductionsById,
  getStudentMarks,
  getTermsInYear,
} from '@/utils/funcs';
import { FileCMDIcon, FolderCMDIcons } from '../core/icons/icons1';
import { AuthApi } from '@/utils/constants';

export const extractNames = (directory: any, currentPath: string[]): string[] => {
  let names: string[] = [];
  let currentDirectory = directories;
  for (const path of currentPath) {
    if (path !== '') {
      currentDirectory = currentDirectory?.contents.find((item: any) => item.name === path) as any;
    }
  }
  currentDirectory.contents.forEach((item: any) => {
    if (item.type === 'directory') {
      names.push(item.name);
      if (currentPath.includes(item.name)) {
        names = names.concat(extractNames(item, currentPath));
      }
    } else if (item.type === 'file') {
      names.push(item.name);
    }
  });
  return names;
};

export const getAutocompleteSuggestions = (
  currentInput: string,
  currentPath: string[],
): string[] => {
  const allNames = extractNames(directories, currentPath);
  const suggestions = allNames.filter((name) => name.startsWith(currentInput));
  return suggestions;
};

export const rot19 = (text: string): string => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    let offset = char.toLowerCase().charCodeAt(0) + 19;
    if (offset > 122) offset -= 26;
    return String.fromCharCode(offset);
  });
};
export const rot19Decrypt = (text: string): string => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    let offset = char.toLowerCase().charCodeAt(0) - 19;
    if (offset < 97) offset += 26;
    return String.fromCharCode(offset);
  });
};

export const directories = {
  name: 'root',
  type: 'directory',
  logo: FolderCMDIcons,
  contents: [
    {
      name: 'academics',
      type: 'directory',
      logo: FolderCMDIcons,
      contents: [
        {
          name: 'performance',
          type: 'file',
          actions: [
            {
              name: 'desc',
              columns: [
                {
                  name: 'Id',
                  get: (data: any) => {
                    return rot19(data.id.replaceAll('-', '.').split('').reverse().join(''));
                  },
                },
                {
                  name: 'Lesson',
                  get: (data: any) => {
                    return data.course.courseName;
                  },
                },
                {
                  name: 'Marks',
                  get: (data: any) => {
                    return data.marks;
                  },
                },
                {
                  name: 'Weight',
                  get: (data: any) => {
                    return data.weight;
                  },
                },
                {
                  name: 'Status',
                  get: (data: any) => {
                    return data.marksStatus ? data.marksStatus : '-';
                  },
                },
                {
                  name: 'Comment',
                  get: (data: any) => {
                    return data.comment ? data.comment : '-';
                  },
                },
              ],
              action: async () => {
                const academicYearsResponse = await getAcademicYears();
                const academicYearId =
                  academicYearsResponse.data[academicYearsResponse.data.length - 1]?.id;
                const termsInYearResponse = await getTermsInYear(academicYearId);
                const termId = termsInYearResponse.data[termsInYearResponse.data.length - 1].id;
                const studentMarksResponse = await getStudentMarks(academicYearId, termId);
                const marks = studentMarksResponse.data;
                return marks;
              },
            },
          ],
          logo: FileCMDIcon,
        },
      ],
    },
    {
      name: 'discpline',
      type: 'file',
      actions: [
        {
          name: 'desc',
          columns: [
            {
              name: 'Id',
              get: (data: any) => {
                return rot19(data.id.replaceAll('-', '.').split('').reverse().join(''));
              },
            },
            {
              name: 'Reason',
              get: (data: any) => {
                return data.reason ? data.reason : '-';
              },
            },
            {
              name: 'Marks',
              get: (data: any) => {
                return data.marks;
              },
            },
            {
              name: 'By',
              get: (data: any) => {
                return data.staffMember.firstName
                  ? data.staffMember.firstName + ' ' + data.staffMember.lastName
                  : '-';
              },
            },
          ],
          action: async () => {
            const me: any = await localStorage.getItem('rcaappuser');
            const academicYearsResponse = await getAcademicYears();
            const academicYearId =
              academicYearsResponse.data[academicYearsResponse.data.length - 1]?.id;
            const termsInYearResponse = await getTermsInYear(academicYearId);
            const termId = termsInYearResponse.data[termsInYearResponse.data.length - 1].id;
            const marks = await AuthApi.get(`/deductions/academic-year/term/student`, {
              params: {
                'academic-year': academicYearId,
                term: termId,
                student: JSON.parse(me).userTypesDTOList[0].user_id,
              },
            });
            if (marks.data.data) {
              return marks.data.data;
            } else {
              return [];
            }
          },
        },
      ],
      logo: FileCMDIcon,
    },
    {
      name: 'appeals',
      type: 'directory',
      logo: FolderCMDIcons,
      contents: [
        {
          name: 'academics',
          type: 'file',
          actions: [
            {
              name: 'desc',
              columns: [
                {
                  name: 'Lesson',
                  get: (data: any) => {
                    return data.course.courseName;
                  },
                },
                {
                  name: 'Description',
                  get: (data: any) => {
                    return data.description;
                  },
                },
                {
                  name: 'Status',
                  get: (data: any) => {
                    return data.status;
                  },
                },
              ],
              action: async () => {
                const appeals = await getStudentAppeals('academic');
                return appeals;
              },
            },
          ],
          logo: FileCMDIcon,
        },
        {
          name: 'discpline',
          type: 'file',
          actions: [
            {
              name: 'desc',
              columns: [
                {
                  name: 'Lesson',
                  get: 'course.courseName',
                },
                {
                  name: 'Marks',
                  get: 'marks',
                },
                {
                  name: 'Weight',
                  get: 'weight',
                },
                { name: 'Status', get: 'marksStatus' },
                { name: 'Comment', get: 'comment' },
              ],
              action: async () => {
                const appeals = await getStudentAppeals('discipline');
                return appeals;
              },
            },
          ],
          logo: FileCMDIcon,
        },
      ],
    },
  ],
};
