'use client';

import { useEffect } from 'react';
import { useToast } from '@/stores/toast';

export function ToastRegion() {
  const message = useToast(s => s.message);
  const clear = useToast(s => s.clear);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => clear(), 4000);
    return () => window.clearTimeout(id);
  }, [message, clear]);

  return (
    <div
      className='pointer-events-none fixed left-4 bottom-4 z-50 min-h-16 w-80 max-w-[calc(100%-2rem)]'
      aria-live='polite'
      aria-relevant='additions text'
    >
      {message ? (
        <p className='rounded-md bg-ink px-4 py-3 text-sm text-white shadow-lg'>
          {message}
        </p>
      ) : null}
    </div>
  );
}
