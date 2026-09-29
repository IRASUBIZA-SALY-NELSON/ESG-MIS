'use client';
import { Button, Modal } from '@mantine/core';
import React, { useState } from 'react';

interface ConfirmOptions {
  title: React.ReactNode;
  message: React.ReactNode;
  confirmLabel?: string;
  color?: string;
  onConfirm: () => Promise<unknown> | unknown;
}

/** Returns an `ask` function and the dialog element to render once in the page. */
export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);

  const element = (
    <Modal
      opened={!!opts}
      onClose={() => !busy && setOpts(null)}
      title={<b className="text-primary">{opts?.title}</b>}
      centered
    >
      <div className="text-sm text-gray-600">{opts?.message}</div>
      <div className="flex flex-row justify-end gap-2 mt-4">
        <Button variant="default" onClick={() => setOpts(null)} disabled={busy}>
          Cancel
        </Button>
        <Button
          color={opts?.color ?? 'red'}
          loading={busy}
          onClick={async () => {
            if (!opts) return;
            setBusy(true);
            try {
              await opts.onConfirm();
            } finally {
              setBusy(false);
              setOpts(null);
            }
          }}
        >
          {opts?.confirmLabel ?? 'Confirm'}
        </Button>
      </div>
    </Modal>
  );

  return { ask: setOpts as (o: ConfirmOptions) => void, element };
}
