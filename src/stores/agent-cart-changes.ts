"use client";

import { create } from "zustand";

/** Counts cart changes made by WebMCP tools, so checkout can tell the customer when the agent changed the cart. */
type AgentCartChangesState = {
  count: number;
  /** The count when checkout last opened. Changes made before that are already on screen. */
  countAtCheckoutOpen: number;
  recordChange: () => void;
  markCheckoutOpened: () => void;
};

export const useAgentCartChanges = create<AgentCartChangesState>((set) => ({
  count: 0,
  countAtCheckoutOpen: 0,
  recordChange: () => set((state) => ({ count: state.count + 1 })),
  markCheckoutOpened: () => set((state) => ({ countAtCheckoutOpen: state.count })),
}));
