import { ApiResponse, IPaginatedQuery, IPagination } from '@/types/base.type';
import { AuthApi, api } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

type Opts = {
  /**
   * Fetch data on mount
   * @default true
   */
  onMount?: boolean;
  /**
   * Default data
   */
  defaultData?: any;
  paginated?: boolean;
  pagination?: {
    url?: string;
    limit?: number;
    page?: number;
  };
  query?: {
    [key: string]: any;
  };
  toast?: {
    title?: string;
    message?: string;
    color?: string;
    autoClose?: number;
  };
  toastOnError?: boolean;
  useAuth?: boolean;
  useBase?: boolean;
  swr?: boolean;
};

export default function useGet<T = any>(url?: string, options?: Opts) {
  const {
    onMount = true,
    defaultData,
    pagination,
    paginated,
    query,
    toastOnError = true,
    useAuth = true,
    swr,
  } = options ?? {};
  const [data, setData] = useState<T | null>(defaultData ?? null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginateOpts, setPaginateOpts] = useState<IPaginatedQuery & { totalPages: number }>({
    limit: pagination?.limit ?? 10,
    page: pagination?.page ?? 0,
    totalPages: 1,
  });
  const {
    data: swrData,
    mutate,
    isLoading,
    error: swrError,
  } = useSWR(
    url,
    () => {
      if (!onMount || !swr) return;
      if (pagination?.url || paginated) {
        return getPaginated();
      } else {
        return get();
      }
    },
    { revalidateOnFocus: onMount, revalidateOnMount: onMount },
  );

  const fetchApi = useAuth ? AuthApi : api;
  const isStudentSearchMissingAcademicYear = () =>
    url?.startsWith('/students/student/search') && !query?.academicYearId;

  async function get() {
    setLoading(true);
    setError(null);
    if (!url || isStudentSearchMissingAcademicYear()) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetchApi.get<ApiResponse<T>>(url, { params: query });
      // first assumption is crazy but works (some unconsistency shit from backend)
      const data =
        (response.data.data as any)?.body?.data ?? response.data?.data ?? response.data?.content;
      setData(data);
      return data;
    } catch (error: any) {
      const err = getResError(error);
      if (toastOnError)
        notifications.show({
          title: 'Failed to get data',
          message: err,
          color: 'red',
          autoClose: 3000,
        });
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  }

  const getPaginated = async () => {
    setLoading(true);
    setError(null);
    if (!url || isStudentSearchMissingAcademicYear()) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetchApi.get(pagination?.url ?? url, {
        params: { ...paginateOpts, ...query },
      });
      const data: IPagination = response.data?.data ?? response.data;
      setData((data?.content as any) ?? defaultData);
      setPaginateOpts((prev) => ({ ...prev, totalPages: data?.totalPages ?? 0 }));
      return response.data;
    } catch (error: any) {
      const err = getResError(error);

      setError(err.toString());
      if (options?.toastOnError)
        notifications.show({
          title: 'Failed to get data',
          message: err,
          color: 'red',
          autoClose: 3000,
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pagination?.url || paginated || swr) return;
    if (onMount) get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ((pagination?.url || paginated) && !swr) getPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginateOpts.page, paginateOpts.limit]);

  // useEffect(() => {
  //   mutate();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [onMount, paginateOpts.page, paginateOpts.limit]);

  return {
    data: swr ? (swrData as T) : data,
    mutate,
    loading: swr ? isLoading : loading,
    error: swr ? swrError : error,
    get,
    setData,
    paginateOpts,
    setPaginateOpts,
    getPaginated,
  };
}
