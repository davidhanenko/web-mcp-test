import type { Metadata } from "next";
import { TestSetup } from "./components/TestSetup";

export const metadata: Metadata = {
  title: "Test setup",
  robots: { index: false, follow: false },
};

export default function DevPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-4xl sm:text-5xl">Test setup</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
        Switch WebMCP tools on or off, turn on the prompt-injection probe, and
        reset the cart. These settings stay in this browser only.
      </p>
      <TestSetup />
    </div>
  );
}
