/** A small color dot. Decorative: always show the color's name as text next to it. */
export function ColorSwatch({
  hex,
  size = 12,
}: {
  hex: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full border border-black/20"
      style={{ backgroundColor: hex, width: size, height: size }}
    />
  );
}
