'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

const PREFIX = 'esg-form-draft:';

export type DraftBag = {
  fields?: Record<string, unknown>;
  extras?: Record<string, unknown>;
  savedAt?: number;
};

export function loadDraft(key: string): DraftBag | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as DraftBag) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}

function sanitize(obj?: Record<string, unknown>) {
  if (!obj) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (/password|token|secret|otp|resetCode/i.test(key)) continue;
    if (typeof File !== 'undefined' && value instanceof File) continue;
    if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    } else {
      try {
        JSON.parse(JSON.stringify(value));
        out[key] = value;
      } catch {
        /* skip FileList and circular values */
      }
    }
  }
  return out;
}

function isBlank(obj: Record<string, unknown>) {
  return Object.values(obj).every(
    (value) =>
      value == null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0),
  );
}

type Extras = {
  values: Record<string, unknown>;
  restore: (values: Record<string, unknown>) => void;
};

export function rwandaLocationExtras(
  values: {
    selectedProvince: string;
    selectedDistrict: string;
    selectedSector: string;
    selectedCell: string;
    selectedVillage: string;
  },
  set: {
    selectedProvince: (v: string) => void;
    selectedDistrict: (v: string) => void;
    selectedSector: (v: string) => void;
    selectedCell: (v: string) => void;
    selectedVillage: (v: string) => void;
  },
): Extras {
  return {
    values,
    restore: (extra) => {
      if (typeof extra.selectedProvince === 'string') set.selectedProvince(extra.selectedProvince);
      if (typeof extra.selectedDistrict === 'string') set.selectedDistrict(extra.selectedDistrict);
      if (typeof extra.selectedSector === 'string') set.selectedSector(extra.selectedSector);
      if (typeof extra.selectedCell === 'string') set.selectedCell(extra.selectedCell);
      if (typeof extra.selectedVillage === 'string') set.selectedVillage(extra.selectedVillage);
    },
  };
}

/**
 * Keeps a form on this page after you leave and come back.
 * Pass extra useState fields (province, class, line items) via `extras`.
 * Call `clear()` after a successful submit.
 */
export function useFormDraft<T extends FieldValues>(
  form: UseFormReturn<T>,
  extras?: Extras | null,
  opts?: { key?: string },
) {
  const path = usePathname() || '';
  const key = opts?.key ?? path;
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    const draft = loadDraft(key);
    if (draft?.fields && Object.keys(draft.fields).length > 0) {
      form.reset({ ...(form.getValues() as object), ...draft.fields } as T);
    }
    if (draft?.extras) extras?.restore(draft.extras);
    if (draft?.savedAt) setSavedAt(draft.savedAt);
    ready.current = true;
    // restore once per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const watched = form.watch();
  useEffect(() => {
    if (!ready.current) return;
    const timer = window.setTimeout(() => {
      const fields = sanitize(form.getValues() as Record<string, unknown>);
      const extra = sanitize(extras?.values);
      if (isBlank(fields) && isBlank(extra)) return;
      const bag: DraftBag = { fields, extras: extra, savedAt: Date.now() };
      localStorage.setItem(PREFIX + key, JSON.stringify(bag));
      setSavedAt(bag.savedAt ?? null);
    }, 400);
    return () => window.clearTimeout(timer);
    // extras.values is the snapshot the page passes each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched, extras?.values, key]);

  const clear = () => {
    clearDraft(key);
    setSavedAt(null);
  };

  return { savedAt, clear };
}

/** Same persistence for pages that keep fields in useState instead of react-hook-form. */
export function useStateDraft<T extends Record<string, unknown>>(
  key: string,
  values: T,
  restore: (values: Partial<T>) => void,
) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    const draft = loadDraft(key);
    if (draft?.extras) restore(draft.extras as Partial<T>);
    if (draft?.savedAt) setSavedAt(draft.savedAt);
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready.current) return;
    const timer = window.setTimeout(() => {
      const extra = sanitize(values);
      if (isBlank(extra)) return;
      const bag: DraftBag = { extras: extra, savedAt: Date.now() };
      localStorage.setItem(PREFIX + key, JSON.stringify(bag));
      setSavedAt(bag.savedAt ?? null);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [values, key]);

  const clear = () => {
    clearDraft(key);
    setSavedAt(null);
  };

  return { savedAt, clear };
}
