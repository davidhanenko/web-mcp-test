import { CatalogExplorer } from "@/components/CatalogExplorer";

export default function Home() {
  return (
    <div>
      <header className="mb-10 max-w-2xl">
        <p className="text-sm tracking-[0.2em] uppercase">Northline Supply</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">
          Gear for wet weather and long miles
        </h1>
        <p className="mt-3 text-[#1c2e24]/75">
          A made-up outdoor shop. No payments, no accounts, just a catalog you
          can search, filter, and check out.
        </p>
      </header>
      <CatalogExplorer />
    </div>
  );
}
