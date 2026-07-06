import type { StateCreator } from "zustand";
import type { User, Supplier, Product, Category, PurchaseOrder, SaleOrder, InventoryMovement, StockCheck } from "@/types";
import { generateSeedData } from "@/data/seed";

export interface DataSlice {
  users: User[];
  suppliers: Supplier[];
  currentUser: User;
  initialized: boolean;
  reseed: () => void;
  setCurrentUser: (user: User) => void;
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
}

interface FullState {
  users: User[];
  suppliers: Supplier[];
  currentUser: User;
  initialized: boolean;
  products: Product[];
  categories: Category[];
  purchases: PurchaseOrder[];
  sales: SaleOrder[];
  movements: InventoryMovement[];
  stockChecks: StockCheck[];
}

const seed = generateSeedData();

export const createDataSlice: StateCreator<FullState, [], [], DataSlice> = (set) => ({
  users: seed.users,
  suppliers: seed.suppliers,
  currentUser: seed.users[0],
  initialized: true,

  reseed: () => {
    try {
      const fresh = generateSeedData();
      set({
        ...fresh,
        currentUser: fresh.users[0],
        initialized: true,
      });
    } catch (e) {
      console.error("[DataSlice] reseed failed:", e);
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  addSupplier: (sup) => {
    try {
      set((s) => ({
        suppliers: [...s.suppliers, { ...sup, id: `S_${Date.now()}` }],
      }));
    } catch (e) {
      console.error("[DataSlice] addSupplier failed:", e);
    }
  },

  updateSupplier: (id, patch) => {
    try {
      set((s) => ({
        suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, ...patch } : sup)),
      }));
    } catch (e) {
      console.error("[DataSlice] updateSupplier failed:", e);
    }
  },

  deleteSupplier: (id) => {
    try {
      set((s) => ({
        suppliers: s.suppliers.filter((sup) => sup.id !== id),
      }));
    } catch (e) {
      console.error("[DataSlice] deleteSupplier failed:", e);
    }
  },
});