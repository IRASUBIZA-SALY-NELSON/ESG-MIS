import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash'; // Import the debounce function from lodash
import { AuthApi } from '@/utils/constants';

type SearchOpts = {
  /**
   * Fetch data on mount
   * @default true
   */
  onMount?: boolean;
  /**
   * Default data
   */
  defaultData?: any;
  /**
   * Throttle time in milliseconds
   * @default 300
   */
  throttleTime?: number;
  /**
   * Custom search function
   */
  input?: string;
  customSearch?: (
    searchInput: string,
    handlers: {
      setData: React.SetStateAction<any>;
      setLoading: React.SetStateAction<any>;
      setError: React.SetStateAction<any>;
    },
  ) => Promise<any>;
  setTableData?: React.Dispatch<React.SetStateAction<any>>;
  searchKey?: string;
  get?: () => Promise<any>;
};

export default function useSearch<T = any>(url: string, options?: SearchOpts) {
  const {
    onMount = false,
    defaultData,
    throttleTime = 300,
    customSearch,
    setTableData,
    searchKey,
    get,
  } = options ?? {};
  const [input, setInput] = useState<string>('');
  const [data, setData] = useState<T | null>(defaultData ?? null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = debounce(async (searchInput: string) => {
    if (!searchInput) {
      get?.();
      return;
    }
    if (searchInput.length < 3) return;
    setLoading(true);
    setError(null);
    try {
      // Perform your API call here using the provided URL and searchInput
      // Replace the following line with your actual API call
      const response = await AuthApi.get(`${url}?limit=100&page=0`, {
        params: { [searchKey ?? 'search']: searchInput },
      });
      const searchData = await response.data;
      const data =
        searchData?.data?.content ?? searchData?.content ?? searchData?.data ?? searchData ?? null;

      setData(data);
      if (setTableData) setTableData(data);
    } catch (error: any) {
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  }, throttleTime);

  useEffect(() => {
    if (onMount) search(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMount]);

  useEffect(() => {
    if (customSearch) customSearch(input, { setData, setLoading, setError });
    else search(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return { data, loading, error, setInput, input };
}
