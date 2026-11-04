import type { ProductColor } from "@/lib/types";

/** Black or white, whichever reads better on `hex`. */
function readableTextColor(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#1F2326" : "#FFFFFF";
}

/**
 * One tag filled with the item's color, with the color name as text. It sits over
 * the bottom-left corner of the product image and stands in for the item's color,
 * since the images are placeholders.
 */
export function ColorTag({ color }: { color: ProductColor }) {
  return (
    <span
      style={{
        backgroundColor: color.hex,
        color: readableTextColor(color.hex),
      }}
      className="absolute bottom-3 left-3 inline-block rounded px-2.5 py-1 text-xs font-bold tracking-[0.08em] uppercase ring-1 ring-white/70"
    >
      {color.name}
    </span>
  );
}
