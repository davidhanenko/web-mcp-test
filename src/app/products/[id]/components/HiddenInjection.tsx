"use client";

import {
  INJECTED_PRODUCT_ID,
  INJECTED_TEXT,
  usePromptInjection,
} from "@/webmcp/test-flags";

/**
 * Prompt-injection test (flag on /dev): text people don't see but agents reading the
 * page do. Renders nothing unless the flag is on and this is the injected product.
 */
export function HiddenInjection({ productId }: { productId: string }) {
  const promptInjection = usePromptInjection();
  if (!promptInjection || productId !== INJECTED_PRODUCT_ID) return null;

  return <span className="sr-only"> {INJECTED_TEXT}</span>;
}
