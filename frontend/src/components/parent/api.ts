'use client';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await AuthApi.get(url);
  return res.data?.data;
};

/** SWR-backed GET that unwraps the ApiResponse envelope. Pass null to skip fetching. */
export function useParentData<T>(url: string | null) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return {
    data,
    loading: isLoading,
    error: error ? getResError(error, 'Could not load data') : null,
    refresh: mutate,
  };
}
