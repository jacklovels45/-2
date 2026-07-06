import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  Boxes,
  BarChart3,
  Leaf,
  ChevronRight,
  Users,
} from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/utils/cn";

const navGroups = [
  {
    title: "经营总览",
    items: [{ to: "/dashboard", label: "经营驾驶舱", icon: LayoutDashboard }],
  },
  {
    title: "商品与采购",
    items: [
      { to: "/products", label: "商品档案", icon: Package },
      { to: "/categories", label: "商品分类", icon: Leaf },
      { to: "/suppliers", label: "供应商档案", icon: Truck },
      { to: "/purchases", label: "采购订单", icon: ShoppingCart },
    ],
  },
  {
    title: "销售与库存",
    items: [
      { to: "/pos", label: "收银开单", icon: ShoppingCart, hot: true },
      { to: "/sales", label: "销售单据", icon: BarChart3 },
      { to: "/inventory", label: "实时库存", icon: Boxes },
      { to: "/inventory/warnings", label: "库存预警", icon: Boxes },
      { to: "/inventory/movements", label: "出入库流水", icon: BarChart3 },
    ],
  },
  {
    title: "经营分析",
    items: [
      { to: "/reports/sales", label: "销售报表", icon: BarChart3 },
      { to: "/reports/profit", label: "利润分析", icon: BarChart3 },
      { to: "/reports/ranking", label: "商品排行", icon: BarChart3 },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const currentUser = useStore((s) => s.currentUser);
  const products = useStore((s) => s.products);
  const lowStockCount = products.filter((p) => p.stock <= p.safetyStock).length;

  return (
    <aside className="w-64 shrink-0 h-full bg-forest-900 text-cream-100 flex flex-col grain">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center shadow-gold">
            <Leaf size={20} className="text-forest-900" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="display text-lg font-bold text-cream-100 leading-tight">禾鲜超市</h1>
            <p className="text-[10px] text-cream-100/50 tracking-widest uppercase">进销存管理系统</p>
          </div>
        </div>
      </div>

      {/* 装饰金线 */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* 导航 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-cream-100/40 font-semibold">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
                const showBadge = item.to === "/inventory/warnings" && lowStockCount > 0;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all relative",
                      isActive
                        ? "bg-forest-700/80 text-cream-50 shadow-inset"
                        : "text-cream-100/70 hover:bg-forest-800/60 hover:text-cream-100"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-amber-400" />
                    )}
                    <Icon
                      size={17}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      className={isActive ? "text-amber-300" : ""}
                    />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {showBadge && (
                      <span className="tabular text-[10px] px-1.5 py-0.5 rounded-full bg-signal-orange text-white font-bold">
                        {lowStockCount}
                      </span>
                    )}
                    {"hot" in item && item.hot && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider">
                        Hot
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 用户卡 */}
      <div className="m-3 p-3 rounded-xl bg-forest-800/60 border border-forest-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-forest-900 flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-cream-100 font-medium truncate">{currentUser.name}</p>
            <p className="text-[10px] text-cream-100/50">
              {roleLabel(currentUser.role)} · 在线
            </p>
          </div>
          <ChevronRight size={14} className="text-cream-100/40" />
        </div>
      </div>
    </aside>
  );
}

function roleLabel(role: string) {
  return { manager: "店长", purchaser: "采购员", cashier: "收银员", keeper: "库管员" }[role] || role;
}

export { Users };
