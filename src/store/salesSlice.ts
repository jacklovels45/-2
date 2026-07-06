import type { StateCreator } from "zustand";
import type { SaleItem, SaleOrder, InventoryMovement, Product } from "@/types";
import type { SharedSlice } from "./sharedSlice";
import { genNo } from "./sharedSlice";

export interface SalesSlice {
  sales: SaleOrder[];
  createSale: (items: SaleItem[], discount: number, paymentMethod: SaleOrder["paymentMethod"], paid: number) => string;
}

export const createSalesSlice: StateCreator<SalesSlice & SharedSlice & { products: Product[]; movements: InventoryMovement[] }, [], [], SalesSlice> = (set, get) => ({
  sales: [],

  createSale: (items, discount, paymentMethod, paid) => {
    try {
      const state = get();

      // Reject the sale outright if any item requests more than is in stock,
      // rather than silently clamping stock to 0 and recording a sale that
      // doesn't match what was actually taken off the shelf.
      for (const it of items) {
        const product = state.products.find((p) => p.id === it.productId);
        if (!product || it.quantity > product.stock) {
          console.error(
            `[SalesSlice] createSale rejected: insufficient stock for ${it.productId}`
          );
          return "";
        }
      }

      const id = `SO_${Date.now()}`;
      const orderNo = genNo("SO");
      const totalAmount = +items.reduce((s, it) => s + it.amount, 0).toFixed(2);
      const newSale: SaleOrder = {
        id,
        orderNo,
        cashierId: state.currentUser.id,
        cashierName: state.currentUser.name,
        items,
        totalAmount,
        discount,
        // paid is a valid amount even when 0 (e.g. store credit / unpaid),
        // so only fall back when it's genuinely not provided.
        paid: paid != null ? paid : totalAmount - discount,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };

      const productUpdates: Record<string, number> = {};
      const newMovements: InventoryMovement[] = [];
      items.forEach((it) => {
        const product = state.products.find((p) => p.id === it.productId);
        if (!product) return;
        const before = product.stock;
        const after = Math.max(0, before - it.quantity);
        productUpdates[it.productId] = after;
        newMovements.push({
          id: `M_${Date.now()}_${it.productId}`,
          productId: it.productId,
          productName: product.name,
          type: "out",
          quantity: it.quantity,
          beforeStock: before,
          afterStock: after,
          refType: "sale",
          refId: id,
          operator: state.currentUser.name,
          createdAt: new Date().toISOString(),
        });
      });

      set((s) => ({
        sales: [newSale, ...s.sales],
        products: s.products.map((p) =>
          productUpdates[p.id] !== undefined ? { ...p, stock: productUpdates[p.id] } : p
        ),
        movements: [...newMovements, ...s.movements],
      }));

      return id;
    } catch (e) {
      console.error("[SalesSlice] createSale failed:", e);
      return "";
    }
  },
});