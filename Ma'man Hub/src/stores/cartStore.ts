import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";

export interface CartItem {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  level: string;
}

interface CartStore {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  isSyncing: boolean;

  // Reads
  isInCart: (id: string) => boolean;
  getSubtotal: () => number;
  getTotal: () => number;

  // Mutations (optimistic + backend)
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Backend sync
  syncFromBackend: () => Promise<void>;   // full sync — call on login / cart page visit
  syncCount: () => Promise<void>;         // lightweight — call on navbar / other pages

  // Coupon
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,
      isSyncing: false,

      // ── Reads ───────────────────────────────────────────────────────────────
      isInCart: (id) => get().items.some((i) => i.id === id),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price, 0),

      getTotal: () => {
        const sub = get().items.reduce((sum, i) => sum + i.price, 0);
        return sub - sub * get().discount;
      },

      // ── Add item (optimistic) ───────────────────────────────────────────────
      addItem: async (item) => {
        if (get().isInCart(item.id)) return;
        set((s) => ({ items: [...s.items, item] }));
        try {
          await api.post("/Cart", { courseId: item.id });
        } catch {
          set((s) => ({ items: s.items.filter((i) => i.id !== item.id) }));
        }
      },

      // ── Remove item (optimistic) ────────────────────────────────────────────
      removeItem: async (id) => {
        const snapshot = get().items;
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
        try {
          await api.delete(`/Cart/${id}`);
        } catch {
          set(() => ({ items: snapshot }));
        }
      },

      // ── Clear cart ──────────────────────────────────────────────────────────
      clearCart: async () => {
        const snapshot = get().items;
        set({ items: [], couponCode: null, discount: 0 });
        try {
          await api.delete("/Cart");
        } catch {
          set(() => ({ items: snapshot }));
        }
      },

      // ── Full sync — fetches all cart items with details ─────────────────────
      // Call on: login, visiting /cart page
      syncFromBackend: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        set({ isSyncing: true });
        try {
          const res = await api.get<{ data: any; success: boolean }>("/Cart");
          if (!res.data.success) return;

          const raw = res.data.data;
          const rawItems: any[] = Array.isArray(raw) ? raw : raw?.items ?? [];

          const mapped: CartItem[] = rawItems.map((i: any) => ({
            id:            i.courseId        ?? i.id           ?? "",
            title:         i.courseTitle     ?? i.title        ?? "",
            instructor:    i.instructorName  ?? i.instructor   ?? "",
            price:         i.price           ?? 0,
            originalPrice: i.originalPrice   ?? i.price        ?? 0,
            thumbnail:     i.courseThumbnail ?? i.thumbnailUrl ?? i.thumbnail ?? "",
            level:         i.ageGroup        ?? i.level        ?? "",
          }));

          set({ items: mapped });
        } catch {
          // Silently fail — local persisted state remains
        } finally {
          set({ isSyncing: false });
        }
      },

      // ── Lightweight sync — only checks count via GET /Cart/count ───────────
      // Call on: navbar mount, home page, courses page
      // Only triggers a full sync if the server count differs from local count
      syncCount: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
          const res = await api.get<{
            data: { count: number; total: number };
            success: boolean;
          }>("/Cart/count");
          if (!res.data.success) return;

          const serverCount = res.data.data.count;
          const localCount  = get().items.length;

          // Only do a full sync if counts differ (e.g. added from another device)
          if (serverCount !== localCount) {
            await get().syncFromBackend();
          }
        } catch {
          // Silently fail
        }
      },

      // ── Coupons ─────────────────────────────────────────────────────────────
      applyCoupon: (code) => {
        const valid: Record<string, number> = {
          SAVE10:  0.1,
          SAVE20:  0.2,
          WELCOME: 0.15,
        };
        const upper = code.trim().toUpperCase();
        if (valid[upper] !== undefined) {
          set({ couponCode: upper, discount: valid[upper] });
          return true;
        }
        return false;
      },

      removeCoupon: () => set({ couponCode: null, discount: 0 }),
    }),
    {
      name: "cart-storage",
      partialize: (s) => ({
        items:      s.items,
        couponCode: s.couponCode,
        discount:   s.discount,
      }),
    }
  )
);