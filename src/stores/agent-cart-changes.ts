"use client";

import { create } from "zustand";

// Lets checkout tell the customer that the agent changed the cart.
type AgentCartChangesState = {
  count: number;
  // Changes made before checkout opened are already on screen.
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
