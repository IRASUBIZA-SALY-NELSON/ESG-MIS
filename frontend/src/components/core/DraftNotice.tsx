'use client';
import { Button } from '@mantine/core';
import dayjs from 'dayjs';

/** Shown when a previously typed form was restored after leaving the page. */
export default function DraftNotice({
  savedAt,
  onDiscard,
}: {
  savedAt: number | null;
  onDiscard: () => void;
}) {
  if (!savedAt) return null;
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-2 rounded-md border border-accent/40 bg-accent-light/40 px-3 py-2 text-sm mb-3">
      <p>
        Draft restored from {dayjs(savedAt).format('DD MMM YYYY, HH:mm')}. Leave and come back —
        your typing stays here until you save or discard it.
      </p>
      <Button size="xs" variant="light" color="gray" onClick={onDiscard}>
        Discard draft
      </Button>
    </div>
  );
}
