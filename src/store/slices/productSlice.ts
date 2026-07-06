import type { StateCreator } from "zustand";
import type { Product, Category } from "@/types";
import type { SharedSlice } from "./sharedSlice";

export interface ProductSlice {
  products: Product[];
  categories: Category[];
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: Omit<Category, "id" | "sort">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const createProductSlice: StateCreator<ProductSlice & SharedSlice, [], [], ProductSlice> = (set) => ({
  products: [],
  categories: [],

  addProduct: (p) => {
    try {
      set((s) => ({
        products: [
          { ...p, id: `P_${Date.now()}`, createdAt: new Date().toISOString() },
          ...s.products,
        ],
      }));
    } catch (e) {
      console.error("[ProductSlice] addProduct failed:", e);
    }
  },

  updateProduct: (id, patch) => {
    try {
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    } catch (e) {
      console.error("[ProductSlice] updateProduct failed:", e);
    }
  },

  deleteProduct: (id) => {
    try {
      set((s) => ({
        products: s.products.filter((p) => p.id !== id),
      }));
    } catch (e) {
      console.error("[ProductSlice] deleteProduct failed:", e);
    }
  },

  addCategory: (c) => {
    try {
      set((s) => ({
        categories: [
          ...s.categories,
          { ...c, id: `C_${Date.now()}`, sort: s.categories.length + 1 },
        ],
      }));
    } catch (e) {
      console.error("[ProductSlice] addCategory failed:", e);
    }
  },

  updateCategory: (id, patch) => {
    try {
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    } catch (e) {
      console.error("[ProductSlice] updateCategory failed:", e);
    }
  },

  deleteCategory: (id) => {
    try {
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
      }));
    } catch (e) {
      console.error("[ProductSlice] deleteCategory failed:", e);
    }
  },
});