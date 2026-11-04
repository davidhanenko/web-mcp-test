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
      <TestSetup />
    </div>
  );
}
