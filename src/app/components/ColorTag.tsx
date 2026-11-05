import type { ProductColor } from '@/lib/types';

/** Black or white, whichever reads better on `hex`. */
function readableTextColor(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150
    ? '#1F2326'
    : '#FFFFFF';
}

export function ColorTag({
  color,
}: {
  color: ProductColor;
}) {
  return (
    <span
      style={{
        backgroundColor: color.hex,
        color: readableTextColor(color.hex),
      }}
      className='absolute bottom-4 right-4 inline-block rounded-sm w-12 h-12'
    ></span>
  );
}
