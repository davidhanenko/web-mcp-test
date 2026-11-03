"use client";

import { useEffect } from "react";
import { useToast } from "@/lib/toast";

export function ToastRegion() {
  const message = useToast((s) => s.message);
  const clear = useToast((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => clear(), 3200);
    return () => window.clearTimeout(id);
  }, [message, clear]);

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 min-h-16 w-80 max-w-[calc(100%-2rem)]"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {message ? (
        <p className="rounded-sm border border-[#d7c4a3]/40 bg-[#1f3d32] px-4 py-3 text-sm text-[#f7f1e6] shadow-lg">
          {message}
        </p>
      ) : null}
    </div>
  );
}
