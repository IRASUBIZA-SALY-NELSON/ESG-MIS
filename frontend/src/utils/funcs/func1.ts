import { ICourse } from '@/types/course.type';
import { ITerm } from '@/types/other.type';
import data from './test.json';

export interface IGroupCoursesByTerm {
  key: string;
  courses: ICourse[];
}

/**
 * @param data_
 * @returns groupedCourses like this: { FIRST_TERM: [ { ... }, { ... } ], SECOND_TERM: [ { ... }, { ... } ] }
 */
export function groupCoursesByTerm(data_: ICourse[]) {
  const groupedCourses: { [key: string]: ICourse[] } = {};
  data_.forEach((course) => {
    course.termsList.forEach((term: ITerm) => {
      const termKey = `${term.name.replace('_', ' ')}_${term.academicYear.id}`; // Use term name and academic year id as the key
      if (!groupedCourses[termKey]) {
        groupedCourses[termKey] = [];
      }
      groupedCourses[termKey].push(course);
    });
  });
  return Object.keys(groupedCourses)
    .sort((a, b) => {
      if (
        groupedCourses[a][0]?.termsList[0]?.academicYear?.startYear >
        groupedCourses[b][0]?.termsList[0]?.academicYear?.startYear
      ) {
        return -1;
      } else if (
        groupedCourses[a][0]?.termsList[0]?.academicYear?.startYear <
        groupedCourses[b][0]?.termsList[0]?.academicYear?.startYear
      ) {
        return 1;
      }
      return 0;
    })
    .map((key) => {
      return {
        key,
        courses: groupedCourses[key],
      };
    });
}

/**
 * @param data_
 * @returns groupedCourses like this: { FIRST_TERM: [ { ... }, { ... } ], SECOND_TERM: [ { ... }, { ... } ] }
 */
export function groupCoursesByTermName(data_: ICourse[]) {
  // keep in mind that term name is not unique and can be repeated if they are in different academic years so check for the academic year id
  const groupedCourses: { [key: string]: ICourse[] } = {};
  data_.forEach((course) => {
    course.termsList.forEach((term: ITerm) => {
      if (!groupedCourses[term.name.replace('_', ' ')]) {
        groupedCourses[term.name.replace('_', ' ')] = [];
      }
      groupedCourses[term.name.replace('_', ' ')].push(course);
    });
  });
  return groupedCourses;
}

export const parseIntoObject = (str: string) => {
  // Replace = with :
  const jsonString = str.replace(/=/g, ':');
  // Wrap keys and values with double-quotes
  const validJsonString = jsonString
    .replace(/([a-zA-Z0-9_-]+):/g, '"$1":')
    .replace(/:([^,}\]]+)/g, ':"$1"');
  // Parse the JSON-like string into a JavaScript object
  const parsedObject = JSON.parse(validJsonString);

  return parsedObject as { AcademicYearId: string; AcademicYearName: string };
};

export const parseIntoObjectTerm = (str: string) => {
  // Replace = with :
  const jsonString = str.replace(/=/g, ':');
  // Wrap keys and values with double-quotes
  const validJsonString = jsonString
    .replace(/([a-zA-Z0-9_-]+):/g, '"$1":')
    .replace(/:([^,}\]]+)/g, ':"$1"');
  // Parse the JSON-like string into a JavaScript object
  const parsedObject = JSON.parse(validJsonString);

  return parsedObject as { termId: string; termName: string };
};

export const uniqueArray = <T>(arr: T[]) => {
  const set = new Set(arr.map((item) => JSON.stringify(item)));
  const uniqueArr = Array.from(set).map((item) => JSON.parse(item));

  return uniqueArr as T[];
};

/**
 *
 * @param str
 * @returns for example: "FIRST_TERM" => "First Term"
 */
export const enumToCamelCase = (str: string | null | undefined) => {
  if (!str) return '';
  return str
    ?.split('_')
    .map((word) => {
      return word?.charAt(0) + word?.slice(1)?.toLowerCase();
    })
    .join(' ');
};
