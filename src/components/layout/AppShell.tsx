import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, Bell, RefreshCw, X } from "lucide-react";
import { useStore } from "@/store";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  title: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <div
            className="flex-1 bg-forest-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const location = useLocation();
  const reseed = useStore((s) => s.reseed);
  const products = useStore((s) => s.products);
  const [confirmingReseed, setConfirmingReseed] = useState(false);

  // 路由 → 标题/面包屑
  const { title, breadcrumb } = pathMeta(location.pathname);

  const lowStockCount = products.filter((p) => p.stock <= p.safetyStock).length;

  return (
    <header className="sticky top-0 z-30 bg-cream-200/85 backdrop-blur-md border-b border-ink-100/60">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3 max-w-[1440px] mx-auto">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100"
        >
          <Menu size={20} />
        </button>

        {/* 标题与面包屑 */}
        <div className="flex-1 min-w-0">
          <h2 className="display text-lg font-semibold text-forest-800 truncate">{title}</h2>
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-ink-400">
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {b.to ? (
                    <Link to={b.to} className="hover:text-forest-600">{b.label}</Link>
                  ) : (
                    <span>{b.label}</span>
                  )}
                  {i < breadcrumb.length - 1 && <span className="text-ink-300">/</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 搜索（装饰） */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-ink-100 text-ink-400 text-sm w-56">
          <Search size={15} />
          <input
            className="bg-transparent outline-none flex-1 text-ink-700 placeholder:text-ink-300"
            placeholder="搜索商品 / 单据…"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-cream-100 border border-ink-100 text-ink-400">⌘K</kbd>
        </div>

        {/* 预警铃 */}
        <Link
          to="/inventory/warnings"
          className="relative p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors"
          title="库存预警"
        >
          <Bell size={18} />
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-signal-orange text-white text-[9px] font-bold flex items-center justify-center">
              {lowStockCount > 9 ? "9+" : lowStockCount}
            </span>
          )}
        </Link>

        {/* 重置数据 */}
        {confirmingReseed ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200">
            <span className="text-xs text-rose-700">重置全部数据？</span>
            <button
              onClick={() => { reseed(); setConfirmingReseed(false); }}
              className="text-xs px-2 py-0.5 rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
            >
              确定
            </button>
            <button onClick={() => setConfirmingReseed(false)} className="text-rose-500">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingReseed(true)}
            className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors"
            title="重置演示数据"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
    </header>
  );
}

function pathMeta(path: string): { title: string; breadcrumb: { label: string; to?: string }[] } {
  if (path === "/dashboard") return { title: "经营驾驶舱", breadcrumb: [{ label: "首页" }, { label: "驾驶舱" }] };
  if (path.startsWith("/products/new")) return { title: "新增商品", breadcrumb: [{ label: "商品管理", to: "/products" }, { label: "新增" }] };
  if (path.match(/^\/products\/[^/]+$/)) return { title: "商品详情", breadcrumb: [{ label: "商品管理", to: "/products" }, { label: "详情" }] };
  if (path.startsWith("/products")) return { title: "商品档案", breadcrumb: [{ label: "商品管理" }] };
  if (path.startsWith("/categories")) return { title: "商品分类", breadcrumb: [{ label: "商品管理" }] };
  if (path.startsWith("/suppliers")) return { title: "供应商档案", breadcrumb: [{ label: "采购管理" }] };
  if (path.startsWith("/purchases/new")) return { title: "新建采购订单", breadcrumb: [{ label: "采购管理", to: "/purchases" }, { label: "新建" }] };
  if (path.match(/^\/purchases\/[^/]+$/)) return { title: "采购订单详情", breadcrumb: [{ label: "采购管理", to: "/purchases" }, { label: "详情" }] };
  if (path.startsWith("/purchases")) return { title: "采购订单", breadcrumb: [{ label: "采购管理" }] };
  if (path.startsWith("/pos")) return { title: "收银开单", breadcrumb: [{ label: "销售管理" }, { label: "POS" }] };
  if (path.match(/^\/sales\/[^/]+$/)) return { title: "销售单详情", breadcrumb: [{ label: "销售管理", to: "/sales" }, { label: "详情" }] };
  if (path.startsWith("/sales")) return { title: "销售单据", breadcrumb: [{ label: "销售管理" }] };
  if (path.startsWith("/inventory/check")) return { title: "库存盘点", breadcrumb: [{ label: "库存管理", to: "/inventory" }, { label: "盘点" }] };
  if (path.startsWith("/inventory/warnings")) return { title: "库存预警", breadcrumb: [{ label: "库存管理", to: "/inventory" }, { label: "预警" }] };
  if (path.startsWith("/inventory/movements")) return { title: "出入库流水", breadcrumb: [{ label: "库存管理", to: "/inventory" }, { label: "流水" }] };
  if (path.startsWith("/inventory")) return { title: "实时库存", breadcrumb: [{ label: "库存管理" }] };
  if (path.startsWith("/reports/sales")) return { title: "销售报表", breadcrumb: [{ label: "经营分析" }, { label: "销售" }] };
  if (path.startsWith("/reports/profit")) return { title: "利润分析", breadcrumb: [{ label: "经营分析" }, { label: "利润" }] };
  if (path.startsWith("/reports/ranking")) return { title: "商品排行", breadcrumb: [{ label: "经营分析" }, { label: "排行" }] };
  return { title: "禾鲜超市", breadcrumb: [] };
}
