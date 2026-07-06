import type { StateCreator } from "zustand";
import type { PurchaseOrder, InventoryMovement } from "@/types";
import type { Product } from "@/types";
import type { SharedSlice, genNo } from "./sharedSlice";
import { genNo as genNoFn } from "./sharedSlice";

export interface PurchaseSlice {
  purchases: PurchaseOrder[];
  addPurchase: (p: Omit<PurchaseOrder, "id" | "orderNo" | "createdAt">) => string;
  updatePurchaseStatus: (id: string, status: PurchaseOrder["status"]) => void;
  receivePurchase: (id: string, receivedQuantities: Record<string, number>) => void;
}

export const createPurchaseSlice: StateCreator<PurchaseSlice & SharedSlice & { products: Product[]; movements: InventoryMovement[] }, [], [], PurchaseSlice> = (set, get) => ({
  purchases: [],

  addPurchase: (p) => {
    try {
      const id = `PO_${Date.now()}`;
      const orderNo = genNoFn("PO");
      const newPurchase: PurchaseOrder = {
        ...p,
        id,
        orderNo,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({ purchases: [newPurchase, ...s.purchases] }));
      return id;
    } catch (e) {
      console.error("[PurchaseSlice] addPurchase failed:", e);
      return "";
    }
  },

  updatePurchaseStatus: (id, status) => {
    try {
      set((s) => ({
        purchases: s.purchases.map((p) =>
          p.id === id ? { ...p, status } : p
        ),
      }));
    } catch (e) {
      console.error("[PurchaseSlice] updatePurchaseStatus failed:", e);
    }
  },

  receivePurchase: (id, receivedQuantities) => {
    try {
      const state = get();
      const purchase = state.purchases.find((p) => p.id === id);
      if (!purchase) return;
      const operator = state.currentUser.name;
      const newMovements: InventoryMovement[] = [];
      const productUpdates: Record<string, number> = {};
      const updatedItems = purchase.items.map((it) => {
        const realQty = receivedQuantities[it.productId] ?? it.receivedQuantity;
        if (realQty <= 0) return { ...it, receivedQuantity: 0 };
        const product = state.products.find((p) => p.id === it.productId);
        if (!product) return it;
        const before = product.stock;
        const after = before + realQty;
        productUpdates[it.productId] = after;
        newMovements.push({
          id: `M_${Date.now()}_${it.productId}`,
          productId: it.productId,
          productName: product.name,
          type: "in",
          quantity: realQty,
          beforeStock: before,
          afterStock: after,
          refType: "purchase",
          refId: id,
          operator,
          createdAt: new Date().toISOString(),
          note: "采购入库",
        });
        return { ...it, receivedQuantity: realQty };
      });

      set((s) => ({
        purchases: s.purchases.map((p) =>
          p.id === id
            ? { ...p, items: updatedItems, status: "received", receivedAt: new Date().toISOString() }
            : p
        ),
        products: s.products.map((p) =>
          productUpdates[p.id] !== undefined ? { ...p, stock: productUpdates[p.id] } : p
        ),
        movements: [...newMovements, ...s.movements],
      }));
    } catch (e) {
      console.error("[PurchaseSlice] receivePurchase failed:", e);
    }
  },
});