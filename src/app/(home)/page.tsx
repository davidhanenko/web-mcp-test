import { Suspense } from "react";
import { CatalogExplorer } from "./components/CatalogExplorer";
import { CATEGORIES, type Category } from "@/lib/types";

function parseCategory(value: string | string[] | undefined): Category | "" {
  return typeof value === "string" &&
    (CATEGORIES as readonly string[]).includes(value)
    ? (value as Category)
    : "";
}

async function FilteredExplorer({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const initialCategory = parseCategory((await searchParams).category);
  // Re-key so navigating between /?category=x and / resets the filters.
  return (
    <CatalogExplorer key={initialCategory} initialCategory={initialCategory} />
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  // The unfiltered catalog is the prerendered fallback, so the static shell
  // already contains the full grid and `/` swaps in identical markup.
  return (
    <Suspense fallback={<CatalogExplorer />}>
      <FilteredExplorer searchParams={searchParams} />
    </Suspense>
  );
}
