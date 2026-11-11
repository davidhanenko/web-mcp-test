import type { Category } from "@/lib/types";

// Static size tables shown on the product page. Inches. Page-only: tools don't read them.

export type SizeChart = {
  title: string;
  columns: string[];
  rows: string[][];
};

const APPAREL: SizeChart = {
  title: "Apparel sizes",
  columns: ["Size", "Chest", "Waist"],
  rows: [
    ["XS", "32–34", "26–28"],
    ["S", "35–37", "29–31"],
    ["M", "38–40", "32–34"],
    ["L", "41–43", "35–37"],
    ["XL", "44–46", "38–40"],
  ],
};

const BOOTS: SizeChart = {
  title: "Boot sizes",
  columns: ["US size", "Foot length"],
  rows: [
    ["8", "9.6"],
    ["9", "9.9"],
    ["10", "10.2"],
    ["11", "10.6"],
    ["12", "10.9"],
  ],
};

const SOCKS: SizeChart = {
  title: "Sock sizes",
  columns: ["Size", "Shoe size (US)"],
  rows: [
    ["XS", "3–5"],
    ["S", "5–7"],
    ["M", "7–9"],
    ["L", "9–11"],
    ["XL", "11–13"],
  ],
};

export function getSizeChart(category: Category): SizeChart {
  if (category === "boots") return BOOTS;
  if (category === "socks") return SOCKS;
  return APPAREL;
}
