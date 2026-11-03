import { SupportForm } from "./components/SupportForm";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-4xl sm:text-5xl">Support</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
        Questions about an order, sizing or returns? Send us a message. This is
        a demo, so nothing is actually sent.
      </p>
      <SupportForm />
    </div>
  );
}
