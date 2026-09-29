import { IAcademicYear, ITerm } from '@/types/other.type';

/**
 * function that takes a key string like 'name' or 'name.first' and returns a function that takes an object and returns the value of the key in the object
 * @param key - the key to get the value of
 * @param obj - the object to get the value from
 */
export const getObjValue = (key: string | number, obj: any) => {
  const keys = key.toString().split('.');
  let result = obj;
  for (const key of keys) {
    if (result && Object.prototype.hasOwnProperty.call(result, key)) {
      result = result[key];
    } else {
      return undefined;
    }
  }
  return result as string;
};

// 3 = Year 1, 2 = Year 2, 1 = Year 3
/**
 * Gets the class from the years to study
 * @param years
 * @returns
 */
export const getClassFromYears = (years: number) => {
  const year = 4 - years;
  return `Year ${year}`;
};

export const getCurrentTerm = (terms: ITerm[], byIndex?: boolean) => {
  if (byIndex) return terms[terms.length - 1];
  return terms?.sort(
    (a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime(),
  )[0];
};

export const getCurrentYear = (years: IAcademicYear[], byIndex?: boolean) => {
  if (byIndex) return years[years.length - 1];
  return years?.find((year) => year.status === 'ACTIVE');
};

/**
 * Works like native toFixed but here if the number is 0.00 it will return 0 or 5.00 will return 5
 * @param num Number to fix
 * @param fixed Number of decimal places default is 2
 * @returns Fixed number
 */
export const toFixed = (num: number | null | undefined, fixed: number = 2) => {
  if (num === 0) return 0;
  if (!num) return '';
  const re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
  return num?.toString().match(re)?.[0];
};
