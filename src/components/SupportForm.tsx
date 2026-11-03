"use client";

import { useState } from "react";

const TOPICS = [
  "Order question",
  "Sizing",
  "Returns",
  "Something else",
] as const;

export function SupportForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="rounded-sm border border-[#1c2e24]/10 bg-white p-4">
        Thanks — we received your message. (Nothing was sent; this is a demo.)
      </p>
    );
  }

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="h-10 w-full rounded-sm border border-[#1c2e24]/20 bg-white px-3"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="h-10 w-full rounded-sm border border-[#1c2e24]/20 bg-white px-3"
        />
      </div>
      <div>
        <label htmlFor="topic" className="mb-1 block text-sm">
          Topic
        </label>
        <select
          id="topic"
          name="topic"
          required
          className="h-10 w-full rounded-sm border border-[#1c2e24]/20 bg-white px-2"
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-sm border border-[#1c2e24]/20 bg-white px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="h-11 rounded-sm bg-[#1c2e24] px-5 text-[#f7f1e6]"
      >
        Send message
      </button>
    </form>
  );
}
