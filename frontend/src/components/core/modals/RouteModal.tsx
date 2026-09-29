'use client';
import React, { useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RouteModal({ children }: { children: React.ReactNode }) {
  const overlay = useRef();
  const wrapper = useRef();
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlay, wrapper],
  );

  const onKeyDown = useCallback(
    (e: any) => {
      if (e.key === 'Escape') onDismiss();
    },
    [onDismiss],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onKeyDown]);

  return (
    <div
      ref={overlay as any}
      className="fixed z-50 left-0 right-0 top-0 bottom-0 mx-auto bg-black/60"
      onClick={onClick}
    >
      <div
        ref={wrapper as any}
        className="absolute top-1/2 left-1/2 overflow-y-auto flex items-center flex-col h-screen -translate-x-1/2 -translate-y-1/2 w-full p-6"
      >
        {children}
      </div>
    </div>
  );
}
