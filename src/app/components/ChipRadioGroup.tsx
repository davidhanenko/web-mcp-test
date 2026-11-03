import type { ReactNode } from "react";
import { CheckIcon } from "@/app/components/icons";

export type ChipOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
  /** Extra text for screen readers, e.g. "(sold out)". */
  srSuffix?: string;
};

type Props<T extends string> = {
  legend: string;
  name: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Shown on the right of the legend row, outside the accessible name. */
  aside?: ReactNode;
  /** Show a check mark inside the selected chip. */
  showCheck?: boolean;
  size?: "md" | "lg";
};

export function ChipRadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  aside,
  showCheck = false,
  size = "md",
}: Props<T>) {
  const chipSize =
    size === "lg" ? "h-12 min-w-16 px-5 text-base" : "h-11 min-w-12 px-4 text-[0.95rem]";

  return (
    <fieldset className="relative">
      <legend className="label-caps mb-3">{legend}</legend>
      {aside ? (
        <div className="absolute top-0 right-0 text-sm text-muted">{aside}</div>
      ) : null}
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${chipSize} ${
                option.disabled
                  ? "cursor-not-allowed border-dashed border-line bg-panel text-slate-400 line-through"
                  : selected
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {showCheck && selected ? <CheckIcon width={14} height={14} /> : null}
              {option.label}
              {option.srSuffix ? <span className="sr-only"> {option.srSuffix}</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
