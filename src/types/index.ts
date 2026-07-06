// 全局类型定义

export type ProductStatus = "active" | "inactive";
export type OrderStatus =
  | "draft"
  | "pending"
  | "approved"
  | "received"
  | "cancelled";
export type PaymentMethod = "cash" | "wechat" | "alipay" | "card";
export type MovementType = "in" | "out" | "adjust";
export type MovementRefType = "purchase" | "sale" | "return" | "check";

// 商品分类
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  sort: number;
}

// 商品
export interface Product {
  id: string;
  barcode: string;
  name: string;
  categoryId: string;
  spec: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  safetyStock: number;
  shelfLife?: number;
  status: ProductStatus;
  emoji: string;
  createdAt: string;
}

// 供应商
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  creditLimit: number;
  status: "active" | "inactive";
  rating: number;
}

// 采购明细
export interface PurchaseItem {
  productId: string;
  quantity: number;
  receivedQuantity: number;
  costPrice: number;
  amount: number;
}

// 采购订单
export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  receivedAt?: string;
  operator: string;
  note?: string;
}

// 销售明细
export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  salePrice: number;
  amount: number;
}

// 销售订单
export interface SaleOrder {
  id: string;
  orderNo: string;
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  paid: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  note?: string;
}

// 库存流水
export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  refType: MovementRefType;
  refId: string;
  operator: string;
  createdAt: string;
  note?: string;
}

// 库存盘点单
export interface StockCheck {
  id: string;
  checkNo: string;
  scope: "all" | "category" | "single";
  target?: string;
  items: {
    productId: string;
    productName: string;
    bookQty: number;
    realQty: number;
    diff: number;
  }[];
  status: "draft" | "counting" | "completed";
  createdAt: string;
  completedAt?: string;
  operator: string;
}

// 用户
export interface User {
  id: string;
  name: string;
  role: "manager" | "purchaser" | "cashier" | "keeper";
  avatar: string;
}
