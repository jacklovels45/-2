import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  InventoryMovement,
  Product,
  PurchaseOrder,
  SaleItem,
  SaleOrder,
  StockCheck,
  Supplier,
  User,
} from "@/types";
import { generateSeedData } from "@/data/seed";

interface AppState {
  users: User[];
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  purchases: PurchaseOrder[];
  sales: SaleOrder[];
  movements: InventoryMovement[];
  stockChecks: StockCheck[];
  currentUser: User;
  initialized: boolean;

  // 初始化
  reseed: () => void;

  // 商品
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // 分类
  addCategory: (c: Omit<Category, "id" | "sort">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // 供应商
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // 采购
  addPurchase: (p: Omit<PurchaseOrder, "id" | "orderNo" | "createdAt">) => string;
  updatePurchaseStatus: (id: string, status: PurchaseOrder["status"]) => void;
  receivePurchase: (id: string, receivedQuantities: Record<string, number>) => void;

  // 销售
  createSale: (items: SaleItem[], discount: number, paymentMethod: SaleOrder["paymentMethod"], paid: number) => string;

  // 库存
  adjustStock: (productId: string, delta: number, note: string) => void;
  addStockCheck: (scope: StockCheck["scope"], target?: string) => void;
  completeStockCheck: (id: string, realQtys: Record<string, number>) => void;

  // 切换用户
  setCurrentUser: (user: User) => void;
}

let seqCounter = 100000;
function genNo(prefix: string) {
  seqCounter += 1;
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}${ymd}${String(seqCounter).slice(-4)}`;
}

const seed = generateSeedData();

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seed,
      currentUser: seed.users[0],
      initialized: true,

      reseed: () => {
        const fresh = generateSeedData();
        set({ ...fresh, currentUser: fresh.users[0], initialized: true });
      },

      addProduct: (p) =>
        set((s) => ({
          products: [
            { ...p, id: `P_${Date.now()}`, createdAt: new Date().toISOString() },
            ...s.products,
          ],
        })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        })),

      addCategory: (c) =>
        set((s) => ({
          categories: [
            ...s.categories,
            { ...c, id: `C_${Date.now()}`, sort: s.categories.length + 1 },
          ],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      addSupplier: (sup) =>
        set((s) => ({
          suppliers: [...s.suppliers, { ...sup, id: `S_${Date.now()}` }],
        })),

      updateSupplier: (id, patch) =>
        set((s) => ({
          suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, ...patch } : sup)),
        })),

      deleteSupplier: (id) =>
        set((s) => ({
          suppliers: s.suppliers.filter((sup) => sup.id !== id),
        })),

      addPurchase: (p) => {
        const id = `PO_${Date.now()}`;
        const orderNo = genNo("PO");
        const newPurchase: PurchaseOrder = {
          ...p,
          id,
          orderNo,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ purchases: [newPurchase, ...s.purchases] }));
        return id;
      },

      updatePurchaseStatus: (id, status) =>
        set((s) => ({
          purchases: s.purchases.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),

      receivePurchase: (id, receivedQuantities) => {
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
      },

      createSale: (items, discount, paymentMethod, paid) => {
        const state = get();
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
          paid: paid || totalAmount - discount,
          paymentMethod,
          createdAt: new Date().toISOString(),
        };

        // 库存扣减
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
      },

      adjustStock: (productId, delta, note) => {
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
      },

      addStockCheck: (scope, target) => {
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
      },

      completeStockCheck: (id, realQtys) => {
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
      },

      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: "hexian-pos-store",
      version: 2,
    }
  )
);
