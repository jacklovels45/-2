import { useMemo } from "react";
import { useStore } from "@/store";
import { daysAgo, isSameDay } from "@/utils/format";

export function useDashboardStats() {
  const sales = useStore((s) => s.sales);
  const products = useStore((s) => s.products);
  const purchases = useStore((s) => s.purchases);
  const movements = useStore((s) => s.movements);
  const categories = useStore((s) => s.categories);

  return useMemo(() => {
    const today = new Date();
    const todaySales = sales.filter((s) => isSameDay(s.createdAt, today));
    const yesterday = daysAgo(1);
    const yesterdaySales = sales.filter((s) => isSameDay(s.createdAt, yesterday));

    const todayRevenue = todaySales.reduce((s, o) => s + o.paid, 0);
    const yesterdayRevenue = yesterdaySales.reduce((s, o) => s + o.paid, 0);
    const revenueDelta = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

    const todayOrders = todaySales.length;
    const yesterdayOrders = yesterdaySales.length;
    const ordersDelta = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

    const avgBasket = todayOrders > 0 ? todayRevenue / todayOrders : 0;
    const yesterdayAvgBasket = yesterdayOrders > 0 ? yesterdayRevenue / yesterdayOrders : 0;
    const basketDelta = yesterdayAvgBasket > 0 ? ((avgBasket - yesterdayAvgBasket) / yesterdayAvgBasket) * 100 : 0;

    const todayProfit = todaySales.reduce((sum, o) => {
      return sum + o.items.reduce((s, it) => {
        const p = products.find((pp) => pp.id === it.productId);
        return s + (it.salePrice - (p?.costPrice || 0)) * it.quantity;
      }, 0);
    }, 0);

    const lowStockItems = products.filter((p) => p.stock <= p.safetyStock);
    const totalStockValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0);
    const totalSkuCount = products.length;
    const activeSkuCount = products.filter((p) => p.status === "active").length;

    // 近7天销售趋势
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = daysAgo(6 - i);
      const daySales = sales.filter((s) => isSameDay(s.createdAt, d));
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: +daySales.reduce((sum, o) => sum + o.paid, 0).toFixed(2),
      };
    });

    // 近30天销售趋势
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = daysAgo(29 - i);
      const daySales = sales.filter((s) => isSameDay(s.createdAt, d));
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: +daySales.reduce((sum, o) => sum + o.paid, 0).toFixed(2),
      };
    });

    // 7天迷你趋势
    const last7Spark = last7Days.map((d) => d.value);

    // 热销Top10 (近30天)
    const productSalesMap = new Map<string, { qty: number; revenue: number; profit: number }>();
    sales.forEach((o) => {
      o.items.forEach((it) => {
        const cur = productSalesMap.get(it.productId) || { qty: 0, revenue: 0, profit: 0 };
        cur.qty += it.quantity;
        cur.revenue += it.amount;
        const p = products.find((pp) => pp.id === it.productId);
        cur.profit += (it.salePrice - (p?.costPrice || 0)) * it.quantity;
        productSalesMap.set(it.productId, cur);
      });
    });

    const topProducts = Array.from(productSalesMap.entries())
      .map(([pid, v]) => {
        const p = products.find((pp) => pp.id === pid);
        return {
          id: pid,
          name: p?.name || "已删除商品",
          emoji: p?.emoji || "📦",
          categoryId: p?.categoryId || "",
          ...v,
        };
      })
      .sort((a, b) => b.qty - a.qty);

    const topByQty = topProducts.slice(0, 10);
    const topByProfit = [...topProducts].sort((a, b) => b.profit - a.profit).slice(0, 10);

    // 滞销商品 (近30天无销售)
    const slowMoving = products.filter((p) => !productSalesMap.has(p.id) && p.status === "active");

    // 品类销售分布
    const categorySales = categories.map((c) => {
      const value = topProducts
        .filter((p) => p.categoryId === c.id)
        .reduce((s, p) => s + p.revenue, 0);
      return { label: c.name, value: +value.toFixed(2), color: CATEGORY_COLORS[c.id] || "#9CA097" };
    }).filter((c) => c.value > 0);

    // 今日库存流水统计
    const todayMovements = movements.filter((m) => isSameDay(m.createdAt, today));
    const todayInCount = todayMovements.filter((m) => m.type === "in").length;
    const todayOutCount = todayMovements.filter((m) => m.type === "out").length;

    return {
      todayRevenue,
      revenueDelta,
      todayOrders,
      ordersDelta,
      avgBasket,
      basketDelta,
      todayProfit,
      lowStockItems,
      totalStockValue,
      totalSkuCount,
      activeSkuCount,
      last7Days,
      last30Days,
      last7Spark,
      topByQty,
      topByProfit,
      slowMoving,
      categorySales,
      todayInCount,
      todayOutCount,
    };
  }, [sales, products, purchases, movements, categories]);
}

export const CATEGORY_COLORS: Record<string, string> = {
  C_01: "#5BA8A0",
  C_02: "#D4A24C",
  C_03: "#E07A3F",
  C_04: "#7E6BA8",
  C_05: "#4D8B61",
  C_06: "#C25B6E",
};
