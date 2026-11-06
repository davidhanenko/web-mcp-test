"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { SuccessMark } from "@/app/components/SuccessMark";

export function CenteredMessage({
  title,
  body,
  mark = false,
  children,
}: {
  title: string;
  body: ReactNode;
  mark?: boolean;
  children?: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center">
      {mark ? <SuccessMark /> : null}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display mt-8 text-4xl outline-none sm:text-5xl"
      >
        {title}
      </h1>
      <p className="mt-6 text-lg leading-8 text-slate-700">{body}</p>
      {children}
      <Link
        href="/"
        className="mt-8 inline-flex h-14 items-center rounded-md bg-accent px-11 text-lg font-bold text-ink hover:bg-accent-hover"
      >
        Back to shop
      </Link>
    </div>
  );
}
