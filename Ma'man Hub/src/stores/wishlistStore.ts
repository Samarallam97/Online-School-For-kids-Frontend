import { create } from "zustand";
import api from "@/services/api";

interface WishlistStore {
  count: number;
  setCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
  syncCount: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set) => ({
  count: 0,

  setCount: (count) => set({ count: Math.max(0, count) }),

  increment: () => set((s) => ({ count: s.count + 1 })),

  decrement: () => set((s) => ({ count: Math.max(0, s.count - 1) })),

  syncCount: async () => {
    try {
      const res = await api.get<{ data: { count: number }; success: boolean }>(
        "/Course/favourite/count"
      );
      set({ count: res.data.data.count ?? 0 });
    } catch {
      // Silently fail — count stays as-is
    }
  },
}));