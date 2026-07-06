import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSlice } from "./slices/productSlice";
import type { DataSlice } from "./slices/dataSlice";
import type { PurchaseSlice } from "./slices/purchaseSlice";
import type { SalesSlice } from "./slices/salesSlice";
import type { InventorySlice } from "./slices/inventorySlice";
import { createProductSlice } from "./slices/productSlice";
import { createDataSlice } from "./slices/dataSlice";
import { createPurchaseSlice } from "./slices/purchaseSlice";
import { createSalesSlice } from "./slices/salesSlice";
import { createInventorySlice } from "./slices/inventorySlice";

export type AppState =
  DataSlice & ProductSlice & PurchaseSlice & SalesSlice & InventorySlice;

export const useStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createDataSlice(...a),
      ...createProductSlice(...a),
      ...createPurchaseSlice(...a),
      ...createSalesSlice(...a),
      ...createInventorySlice(...a),
    }),
    {
      name: "hexian-pos-store",
      version: 3,
      partialize: (state) => {
        const { reseed, initialized, ...rest } = state;
        void reseed;
        void initialized;
        return rest;
      },
    }
  )
);

// 类型安全的 selector hooks
export const useProductStore = <T>(selector: (s: ProductSlice & DataSlice) => T): T =>
  useStore(selector);

export const usePurchaseStore = <T>(selector: (s: PurchaseSlice & DataSlice) => T): T =>
  useStore(selector);

export const useSalesStore = <T>(selector: (s: SalesSlice & DataSlice) => T): T =>
  useStore(selector);

export const useInventoryStore = <T>(selector: (s: InventorySlice & DataSlice) => T): T =>
  useStore(selector);

export const useDataStore = <T>(selector: (s: DataSlice) => T): T =>
  useStore(selector);