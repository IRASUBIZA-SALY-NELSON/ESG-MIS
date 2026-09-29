'use client';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { notifications } from '@mantine/notifications';
import * as FileSaver from 'file-saver';
import useSWR, { mutate as globalMutate } from 'swr';

const fetcher = async (url: string) => {
  const res = await AuthApi.get(url);
  return res.data?.data;
};

/** SWR GET against /notes that unwraps the ApiResponse envelope. Pass null to skip. */
export function useNotes<T>(url: string | null, opts: { refreshInterval?: number } = {}) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: opts.refreshInterval,
  });
  return {
    data,
    loading: isLoading,
    error: error ? getResError(error, 'Could not load notes') : null,
    refresh: mutate,
  };
}

export const refreshNotes = () =>
  globalMutate((key) => typeof key === 'string' && key.startsWith('/notes'));

type Method = 'post' | 'put' | 'delete';

/** Mutating request with a toast and cache refresh. Returns data, or undefined on failure. */
export async function notesAction<T = any>(
  method: Method,
  url: string,
  body?: any,
  opts: { success?: string; silent?: boolean; failure?: string } = {},
): Promise<T | undefined> {
  try {
    const res =
      method === 'delete' ? await AuthApi.delete(url) : await AuthApi[method](url, body ?? {});
    if (!opts.silent) {
      notifications.show({
        title: 'Done',
        message: opts.success ?? res.data?.message ?? 'Saved',
        color: 'teal',
      });
    }
    refreshNotes();
    return (res.data?.data ?? true) as T;
  } catch (error) {
    notifications.show({
      title: opts.failure ?? 'Something went wrong',
      message: await errorMessage(error),
      color: 'red',
    });
    return undefined;
  }
}

/** Reads the API's message even when the response body was requested as a Blob. */
export async function errorMessage(error: any): Promise<string> {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) return parsed.message;
    } catch {
      // not JSON
    }
  }
  return getResError(error);
}

/** Multipart create: `meta` JSON plus an optional file, with upload progress (0–100). */
export async function uploadNote(
  meta: Record<string, any>,
  file: File | null,
  onProgress?: (pct: number) => void,
) {
  const form = new FormData();
  form.append('meta', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
  if (file) form.append('file', file);
  const res = await AuthApi.post('/notes/teaching', form, {
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
  return res.data;
}

export async function replaceNoteFile(id: string, file: File, onProgress?: (pct: number) => void) {
  const form = new FormData();
  form.append('file', file);
  const res = await AuthApi.post(`/notes/teaching/${id}/file`, form, {
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
  return res.data;
}

export async function fetchNoteBlob(id: string, preview: boolean): Promise<Blob> {
  const res = await AuthApi.get(`/notes/${id}/file`, {
    params: preview ? { preview: true } : {},
    responseType: 'blob',
  });
  return res.data as Blob;
}

/** Downloads the original file; for students this is also what the teacher sees as a download. */
export async function downloadNote(id: string, fileName?: string) {
  try {
    const res = await AuthApi.get(`/notes/${id}/file`, {
      params: { download: true },
      responseType: 'blob',
    });
    FileSaver.saveAs(res.data as Blob, fileName ?? 'note');
    refreshNotes();
    return true;
  } catch (error) {
    notifications.show({
      title: 'Download failed',
      message: await errorMessage(error),
      color: 'red',
    });
    return false;
  }
}

export const studentNoteLink = (id: string) =>
  typeof window === 'undefined'
    ? `/student/notes?open=${id}`
    : `${window.location.origin}/student/notes?open=${id}`;

export async function copyText(text: string, what = 'Link') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    notifications.show({ title: `${what} copied`, message: text, color: 'teal' });
  } catch {
    notifications.show({ title: 'Could not copy', message: text, color: 'orange' });
  }
}
