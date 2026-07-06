import type { User, Supplier, Product, Category, PurchaseOrder, SaleOrder, InventoryMovement, StockCheck } from "@/types";

// 共享的数据类型和工具函数

export interface SharedSlice {
  users: User[];
  suppliers: Supplier[];
  currentUser: User;
  initialized: boolean;
  setCurrentUser: (user: User) => void;
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  reseed: () => void;
}

let seqCounter = 100000;

export function genNo(prefix: string): string {
  seqCounter += 1;
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}${ymd}${String(seqCounter).slice(-4)}`;
}

export type FullState = SharedSlice & {
  products: Product[];
  categories: Category[];
  purchases: PurchaseOrder[];
  sales: SaleOrder[];
  movements: InventoryMovement[];
  stockChecks: StockCheck[];
};