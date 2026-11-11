import { useSyncExternalStore } from "react";

// Set on /dev for tests; real visitors get "adapted".
export type ToolsMode = "off" | "adapted";
export const TOOLS_MODES: ToolsMode[] = ["off", "adapted"];

export const TOOLS_MODE_STORAGE_KEY = "northline-tools-mode";
const DEFAULT_TOOLS_MODE: ToolsMode = "adapted";

// Missing or unknown reads as "adapted".
export function readToolsMode(): ToolsMode {
  const saved = localStorage.getItem(TOOLS_MODE_STORAGE_KEY);
  return TOOLS_MODES.find((mode) => mode === saved) ?? DEFAULT_TOOLS_MODE;
}

export function saveToolsMode(mode: ToolsMode): void {
  localStorage.setItem(TOOLS_MODE_STORAGE_KEY, mode);
}

// No subscription: switching the mode on /dev reloads the page.
function subscribe() {
  return () => {};
}

// null on the server and during hydration.
export function useToolsMode(): ToolsMode | null {
  return useSyncExternalStore(subscribe, readToolsMode, () => null);
}
