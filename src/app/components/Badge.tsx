import type { ReactNode } from "react";

export function Badge({
  tone,
  children,
}: {
  tone: "dark" | "light" | "white";
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded px-2.5 py-1 text-xs font-bold tracking-[0.08em] uppercase ${
        tone === "dark"
          ? "bg-ink text-white"
          : tone === "white"
            ? "bg-white text-ink"
            : "bg-panel text-ink"
      }`}
    >
      {children}
    </span>
  );
}
