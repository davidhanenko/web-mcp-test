"use client";

import { useEffect, useRef, useState } from "react";
import { getSizeChart } from "@/lib/size-chart";
import type { Category } from "@/lib/types";

export function SizeChartButton({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const chart = getSizeChart(category);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium underline underline-offset-2 hover:text-muted"
      >
        Size chart
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
            className="w-full max-w-md rounded-lg bg-white p-8 text-left shadow-xl"
          >
            <h2 id="size-chart-title" className="font-display text-3xl">
              {chart.title}
            </h2>
            <p className="mt-2 text-sm text-muted">Measurements in inches.</p>
            <table className="mt-5 w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  {chart.columns.map((column) => (
                    <th key={column} className="label-caps py-2 pr-4 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-line/70">
                    {row.map((cell, index) => (
                      <td
                        key={index}
                        className={`py-2.5 pr-4 ${index === 0 ? "font-bold" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 h-12 w-full rounded-md border border-line bg-white text-base font-semibold hover:bg-panel"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
