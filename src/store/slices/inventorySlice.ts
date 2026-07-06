import type { StateCreator } from "zustand";
import type { InventoryMovement, StockCheck, Product } from "@/types";
import type { SharedSlice } from "./sharedSlice";
import { genNo } from "./sharedSlice";

export interface InventorySlice {
  movements: InventoryMovement[];
  stockChecks: StockCheck[];
  adjustStock: (productId: string, delta: number, note: string) => void;
  addStockCheck: (scope: StockCheck["scope"], target?: string) => void;
  completeStockCheck: (id: string, realQtys: Record<string, number>) => void;
}

export const createInventorySlice: StateCreator<InventorySlice & SharedSlice & { products: Product[] }, [], [], InventorySlice> = (set, get) => ({
  movements: [],
  stockChecks: [],

  adjustStock: (productId, delta, note) => {
    try {
      const state = get();
      const product = state.products.find((p) => p.id === productId);
      if (!product) return;
      const before = product.stock;
      const after = Math.max(0, before + delta);
      const movement: InventoryMovement = {
        id: `M_${Date.now()}`,
        productId,
        productName: product.name,
        type: delta >= 0 ? "in" : "out",
        quantity: Math.abs(delta),
        beforeStock: before,
        afterStock: after,
        refType: "check",
        refId: `ADJ_${Date.now()}`,
        operator: state.currentUser.name,
        createdAt: new Date().toISOString(),
        note,
      };
      set((s) => ({
        products: s.products.map((p) => (p.id === productId ? { ...p, stock: after } : p)),
        movements: [movement, ...s.movements],
      }));
    } catch (e) {
      console.error("[InventorySlice] adjustStock failed:", e);
    }
  },

  addStockCheck: (scope, target) => {
    try {
      const state = get();
      const checkNo = genNo("SC");
      const products = state.products.filter((p) =>
        scope === "all" ? true : scope === "category" ? p.categoryId === target : p.id === target
      );
      const newCheck: StockCheck = {
        id: `SC_${Date.now()}`,
        checkNo,
        scope,
        target,
        items: products.map((p) => ({
          productId: p.id,
          productName: p.name,
          bookQty: p.stock,
          realQty: p.stock,
          diff: 0,
        })),
        status: "counting",
        createdAt: new Date().toISOString(),
        operator: state.currentUser.name,
      };
      set((s) => ({ stockChecks: [newCheck, ...s.stockChecks] }));
    } catch (e) {
      console.error("[InventorySlice] addStockCheck failed:", e);
    }
  },

  completeStockCheck: (id, realQtys) => {
    try {
      const state = get();
      const check = state.stockChecks.find((c) => c.id === id);
      if (!check) return;
      const updatedItems = check.items.map((it) => {
        const realQty = realQtys[it.productId] ?? it.realQty;
        return { ...it, realQty, diff: realQty - it.bookQty };
      });
      const newMovements: InventoryMovement[] = [];
      const productUpdates: Record<string, number> = {};
      updatedItems.forEach((it) => {
        if (it.diff === 0) return;
        const product = state.products.find((p) => p.id === it.productId);
        if (!product) return;
        const before = product.stock;
        const after = it.realQty;
        productUpdates[it.productId] = after;
        newMovements.push({
          id: `M_${Date.now()}_${it.productId}`,
          productId: it.productId,
          productName: product.name,
          type: "adjust",
          quantity: Math.abs(it.diff),
          beforeStock: before,
          afterStock: after,
          refType: "check",
          refId: id,
          operator: state.currentUser.name,
          createdAt: new Date().toISOString(),
          note: `盘点调整 ${it.diff > 0 ? "盘盈" : "盘亏"}`,
        });
      });
      set((s) => ({
        stockChecks: s.stockChecks.map((c) =>
          c.id === id
            ? { ...c, items: updatedItems, status: "completed", completedAt: new Date().toISOString() }
            : c
        ),
        products: s.products.map((p) =>
          productUpdates[p.id] !== undefined ? { ...p, stock: productUpdates[p.id] } : p
        ),
        movements: [...newMovements, ...s.movements],
      }));
    } catch (e) {
      console.error("[InventorySlice] completeStockCheck failed:", e);
    }
  },
});