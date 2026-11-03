"use client";

import { create } from "zustand";

type CartUiState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useCartUi = create<CartUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
