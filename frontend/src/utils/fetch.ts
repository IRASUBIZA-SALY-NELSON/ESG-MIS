import { getCookie } from 'cookies-next';
import jwtDecode from 'jwt-decode';
import { getFile } from './constants';

export const getResError = (error?: any, defaultMs: string = 'Something Went Wrong') => {
  if (!error) return defaultMs;
  const isNetError = error?.message?.includes('Network Error');
  if (isNetError) return 'Network Error';
  return error?.response?.data?.message ?? error?.message ?? defaultMs;
};
// recursive function to get shuffle
export const shuffleArray = <T = any>(array: T[]) => {
  const arr = [...array];
  const shuffled = [];
  while (arr.length) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    shuffled.push(arr.splice(randomIndex, 1)[0]);
  }
  return shuffled;
};

export const getTokenData = (token?: string) => {
  const token_ = token ?? getCookie('token');

  if (!token_) return null;
  try {
    const data = jwtDecode(token_);
    return data as any;
  } catch (error) {
    return null;
  }
};

export const getStudentImageBlob = async (fileName: string) => {
  const img = await fetch(getFile(fileName)!, {
    headers: {
      Authorization: getCookie('mis_token') as string,
    },
  });
  return await img.blob();
};
