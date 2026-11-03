"use client";

import { useEffect, useRef, useState } from "react";
import { SuccessMark } from "@/app/components/SuccessMark";

const TOPICS = ["Order help", "Sizing", "Returns", "Something else"] as const;

const field =
  "w-full rounded-md border border-line bg-white px-4 text-lg text-ink";

export function SupportForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mt-10 rounded-lg bg-panel p-6 sm:p-10">
      {submitted ? (
        <SentMessage onReset={() => setSubmitted(false)} />
      ) : (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="label-caps mb-2 block">
                Name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                className={`${field} h-14`}
              />
            </div>
            <div>
              <label htmlFor="email" className="label-caps mb-2 block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`${field} h-14`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="topic" className="label-caps mb-2 block">
              Topic
            </label>
            <select
              id="topic"
              name="topic"
              required
              className={`${field} h-14`}
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="message" className="label-caps mb-2 block">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={7}
              className={`${field} py-3`}
            />
          </div>
          <button
            type="submit"
            className="h-14 rounded-md bg-accent px-11 text-lg font-bold text-ink hover:bg-accent-hover"
          >
            Send message
          </button>
        </form>
      )}
    </div>
  );
}

function SentMessage({ onReset }: { onReset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <SuccessMark />
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display mt-6 text-3xl outline-none"
      >
        Message sent
      </h2>
      <p className="mt-4 max-w-md text-lg text-slate-700">
        Thanks, we got it. This is a demo, so nothing was actually sent.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 font-semibold underline underline-offset-2"
      >
        Send another
      </button>
    </div>
  );
}
