import { MinusIcon, PlusIcon } from "@/app/components/icons";

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  /** Product name, appended to the accessible names when there are several steppers on screen. */
  itemName?: string;
  /** Id of a visible label element that names the group. */
  labelledBy?: string;
  size?: "md" | "lg";
};

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  itemName,
  labelledBy,
  size = "md",
}: Props) {
  const suffix = itemName ? ` of ${itemName}` : "";
  const box = size === "lg" ? "h-14 w-40" : "h-12 w-32";
  return (
    <div
      role="group"
      {...(labelledBy
        ? { "aria-labelledby": labelledBy }
        : { "aria-label": `Quantity${suffix}` })}
      className={`inline-flex items-center justify-between rounded-md border border-line bg-white ${box}`}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity${suffix}`}
        className="inline-flex h-full w-11 items-center justify-center rounded-l-md text-ink hover:bg-panel disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        <MinusIcon />
      </button>
      <output aria-live="polite" className="min-w-6 text-center font-bold tabular-nums">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity${suffix}`}
        className="inline-flex h-full w-11 items-center justify-center rounded-r-md text-ink hover:bg-panel disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
