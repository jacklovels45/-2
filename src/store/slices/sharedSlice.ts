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

const SEQ_STORAGE_KEY = "hexian-pos-seq-counter";

function loadSeqCounter(): number {
  if (typeof window === "undefined") return 100000;
  const stored = window.localStorage.getItem(SEQ_STORAGE_KEY);
  const parsed = stored ? parseInt(stored, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : 100000;
}

let seqCounter = loadSeqCounter();

export function genNo(prefix: string): string {
  seqCounter += 1;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SEQ_STORAGE_KEY, String(seqCounter));
  }
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