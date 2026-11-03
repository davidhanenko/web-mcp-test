import { CheckIcon } from "@/app/components/icons";

/** Orange circle with a check, used on the order-placed and message-sent screens. */
export function SuccessMark() {
  return (
    <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent text-ink">
      <CheckIcon width={30} height={30} strokeWidth={3} />
    </span>
  );
}
