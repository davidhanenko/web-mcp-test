import { SupportForm } from "@/components/SupportForm";

export default function SupportPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl">Support</h1>
      <p className="mb-8 max-w-lg text-[#1c2e24]/75">
        Ask about sizing, orders, or returns. The form stays in the browser —
        nothing is emailed or stored.
      </p>
      <SupportForm />
    </div>
  );
}
