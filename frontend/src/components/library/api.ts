'use client';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { notifications } from '@mantine/notifications';
import useSWR, { mutate as globalMutate } from 'swr';

const fetcher = async (url: string) => {
  const res = await AuthApi.get(url);
  return res.data?.data;
};

/** SWR-backed GET against /library that unwraps the ApiResponse envelope. Pass null to skip. */
export function useLibrary<T>(url: string | null) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return {
    data,
    loading: isLoading,
    error: error ? getResError(error, 'Could not load library data') : null,
    refresh: mutate,
  };
}

/** Re-fetch every cached /library request so all tables and counters stay in sync after a change. */
export const refreshLibrary = () =>
  globalMutate((key) => typeof key === 'string' && key.startsWith('/library'));

type Method = 'post' | 'put' | 'delete';

/** Runs a mutating request, shows a toast, refreshes library caches. Returns data or undefined on failure. */
export async function libraryAction<T = any>(
  method: Method,
  url: string,
  body?: any,
  opts: { success?: string; failure?: string; silent?: boolean } = {},
): Promise<T | undefined> {
  try {
    const res =
      method === 'delete' ? await AuthApi.delete(url) : await AuthApi[method](url, body ?? {});
    if (!opts.silent) {
      notifications.show({
        title: 'Success',
        message: opts.success ?? res.data?.message ?? 'Done',
        color: 'teal',
      });
    }
    refreshLibrary();
    return (res.data?.data ?? true) as T;
  } catch (error) {
    notifications.show({
      title: opts.failure ?? 'Action failed',
      message: getResError(error),
      color: 'red',
    });
    return undefined;
  }
}
