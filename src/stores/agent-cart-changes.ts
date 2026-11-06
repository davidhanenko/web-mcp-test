"use client";

import { create } from "zustand";

/** Counts cart changes made by WebMCP tools, so checkout can tell the customer when the agent changed the cart. */
type AgentCartChangesState = {
  count: number;
  recordChange: () => void;
};

export const useAgentCartChanges = create<AgentCartChangesState>((set) => ({
  count: 0,
  recordChange: () => set((state) => ({ count: state.count + 1 })),
}));
