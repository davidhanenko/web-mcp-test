"use client";

import {
  INJECTED_PRODUCT_ID,
  INJECTED_TEXT,
  usePromptInjection,
} from "@/webmcp/test-flags";

// Prompt-injection test (flag on /dev): text agents read but people don't see.
export function HiddenInjection({ productId }: { productId: string }) {
  const promptInjection = usePromptInjection();
  if (!promptInjection || productId !== INJECTED_PRODUCT_ID) return null;

  return <span className="sr-only"> {INJECTED_TEXT}</span>;
}
