import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function LogoMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 24" width={36} height={22} aria-hidden focusable={false} {...props}>
      <path d="M0 24 L13 3 L21 15 L26 8 L40 24 Z" fill="currentColor" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} {...base} {...props}>
      <path d="M2 3h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
      <circle cx="9.5" cy="20" r="1.3" />
      <circle cx="17.5" cy="20" r="1.3" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} strokeWidth={2.5} {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
