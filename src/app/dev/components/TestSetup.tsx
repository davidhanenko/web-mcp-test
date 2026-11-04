"use client";

import { ChipRadioGroup } from "@/app/components/ChipRadioGroup";
import { useCart } from "@/stores/cart";
import {
  saveToolsMode,
  TOOLS_MODES,
  useToolsMode,
  type ToolsMode,
} from "@/webmcp/tools-mode";

const buttonClass =
  "h-11 rounded-full border border-ink bg-white px-5 font-semibold text-ink hover:bg-ink hover:text-white";

function chooseToolsMode(mode: ToolsMode) {
  saveToolsMode(mode);
  // Reloading re-registers the tools cleanly.
  window.location.reload();
}

function emptyCart() {
  useCart.getState().clearCart();
}

function loadTaskBCart() {
  const { clearCart, addToCart } = useCart.getState();
  clearCart();
  addToCart("ridge-hiker-boots", "M", "black", 1);
  addToCart("sun-trail-shirt", "M", "sand", 1);
}

export function TestSetup() {
  const toolsMode = useToolsMode();

  return (
    <div className="mt-8 flex flex-col gap-10">
      <section>
        {toolsMode ? (
          <ChipRadioGroup
            legend="WebMCP tools"
            name="tools-mode"
            options={TOOLS_MODES.map((mode) => ({ value: mode, label: mode }))}
            value={toolsMode}
            onChange={chooseToolsMode}
            showCheck
          />
        ) : (
          // Same height as the chips, so nothing shifts once the mode is read.
          <div className="h-[4.75rem]" />
        )}
      </section>

      <section>
        <h2 className="label-caps mb-3">Cart</h2>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className={buttonClass} onClick={emptyCart}>
            Empty cart
          </button>
          <button type="button" className={buttonClass} onClick={loadTaskBCart}>
            Load task B cart
          </button>
        </div>
      </section>
    </div>
  );
}
