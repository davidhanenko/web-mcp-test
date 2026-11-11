import type { ReactNode, SelectHTMLAttributes } from "react";

export function SelectField({
  id,
  label,
  children,
  ...props
}: {
  id: string;
  label: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-2 block">
        {label}
      </label>
      <select
        id={id}
        className="h-12 w-full rounded-md border border-line bg-white px-3"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
