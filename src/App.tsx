import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// 路由懒加载 - 代码分割，减小首屏体积
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Products = lazy(() => import("@/pages/Products"));
const ProductEdit = lazy(() => import("@/pages/ProductEdit"));
const Categories = lazy(() => import("@/pages/Categories"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const Purchases = lazy(() => import("@/pages/Purchases"));
const PurchaseEdit = lazy(() => import("@/pages/PurchaseEdit"));
const PurchaseDetail = lazy(() => import("@/pages/PurchaseDetail"));
const Pos = lazy(() => import("@/pages/Pos"));
const Sales = lazy(() => import("@/pages/Sales"));
const SaleDetail = lazy(() => import("@/pages/SaleDetail"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const InventoryWarnings = lazy(() => import("@/pages/InventoryWarnings"));
const InventoryMovements = lazy(() => import("@/pages/InventoryMovements"));
const ReportsSales = lazy(() => import("@/pages/ReportsSales"));
const ReportsProfit = lazy(() => import("@/pages/ReportsProfit"));
const ReportsRanking = lazy(() => import("@/pages/ReportsRanking"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
        <span className="text-sm text-ink-400">加载中...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductEdit />} />
              <Route path="/products/:id" element={<ProductEdit />} />

              <Route path="/categories" element={<Categories />} />
              <Route path="/suppliers" element={<Suppliers />} />

              <Route path="/purchases" element={<Purchases />} />
              <Route path="/purchases/new" element={<PurchaseEdit />} />
              <Route path="/purchases/:id" element={<PurchaseDetail />} />

              <Route path="/pos" element={<Pos />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/sales/:id" element={<SaleDetail />} />

              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/warnings" element={<InventoryWarnings />} />
              <Route path="/inventory/movements" element={<InventoryMovements />} />

              <Route path="/reports/sales" element={<ReportsSales />} />
              <Route path="/reports/profit" element={<ReportsProfit />} />
              <Route path="/reports/ranking" element={<ReportsRanking />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </BrowserRouter>
  );
}
