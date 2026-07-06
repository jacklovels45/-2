import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import ProductEdit from "@/pages/ProductEdit";
import Categories from "@/pages/Categories";
import Suppliers from "@/pages/Suppliers";
import Purchases from "@/pages/Purchases";
import PurchaseEdit from "@/pages/PurchaseEdit";
import PurchaseDetail from "@/pages/PurchaseDetail";
import Pos from "@/pages/Pos";
import Sales from "@/pages/Sales";
import SaleDetail from "@/pages/SaleDetail";
import Inventory from "@/pages/Inventory";
import InventoryWarnings from "@/pages/InventoryWarnings";
import InventoryMovements from "@/pages/InventoryMovements";
import ReportsSales from "@/pages/ReportsSales";
import ReportsProfit from "@/pages/ReportsProfit";
import ReportsRanking from "@/pages/ReportsRanking";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
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
      </AppShell>
    </BrowserRouter>
  );
}
