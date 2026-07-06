import { useMemo, useState } from "react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { LineChart, BarChart, DonutChart } from "@/components/charts/Charts";
import { Badge } from "@/components/ui/Badge";
import { formatMoney, formatMoneyCompact, isSameDay, daysAgo } from "@/utils/format";
import { CATEGORY_COLORS } from "@/hooks/useDashboardStats";

export default function ReportsProfit() {
  const sales = useStore((s) => s.sales);
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const [range, setRange] = useState<7 | 14 | 30>(14);

  const stats = useMemo(() => {
    const startDate = daysAgo(range - 1);
    const rangedSales = sales.filter((s) => new Date(s.createdAt) >= startDate);

    // 按日利润
    const dailyProfit = Array.from({ length: range }, (_, i) => {
      const d = daysAgo(range - 1 - i);
      const daySales = sales.filter((s) => isSameDay(s.createdAt, d));
      const profit = daySales.reduce((sum, o) => {
        return sum + o.items.reduce((s, it) => {
          const p = products.find((pp) => pp.id === it.productId);
          return s + (it.salePrice - (p?.costPrice || 0)) * it.quantity;
        }, 0);
      }, 0);
      const revenue = daySales.reduce((s, o) => s + o.paid, 0);
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        revenue: +revenue.toFixed(2),
        profit: +profit.toFixed(2),
        margin: revenue > 0 ? +((profit / revenue) * 100).toFixed(2) : 0,
      };
    });

    const totalRevenue = rangedSales.reduce((s, o) => s + o.paid, 0);
    const totalProfit = rangedSales.reduce((sum, o) => {
      return sum + o.items.reduce((s, it) => {
        const p = products.find((pp) => pp.id === it.productId);
        return s + (it.salePrice - (p?.costPrice || 0)) * it.quantity;
      }, 0);
    }, 0);
    const totalCost = totalRevenue - totalProfit;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // 品类利润分布
    const categoryProfit = categories.map((c) => {
      const cProducts = products.filter((p) => p.categoryId === c.id);
      const cProductIds = new Set(cProducts.map((p) => p.id));
      let profit = 0;
      rangedSales.forEach((s) => {
        s.items.forEach((it) => {
          if (cProductIds.has(it.productId)) {
            const p = products.find((pp) => pp.id === it.productId);
            profit += (it.salePrice - (p?.costPrice || 0)) * it.quantity;
          }
        });
      });
      return { label: c.name, value: +profit.toFixed(2), color: CATEGORY_COLORS[c.id] };
    }).filter((c) => c.value > 0);

    // 单品利润排行
    const productProfitMap = new Map<string, { profit: number; revenue: number; qty: number }>();
    rangedSales.forEach((s) => {
      s.items.forEach((it) => {
        const p = products.find((pp) => pp.id === it.productId);
        const profit = (it.salePrice - (p?.costPrice || 0)) * it.quantity;
        const cur = productProfitMap.get(it.productId) || { profit: 0, revenue: 0, qty: 0 };
        cur.profit += profit;
        cur.revenue += it.amount;
        cur.qty += it.quantity;
        productProfitMap.set(it.productId, cur);
      });
    });
    const topProfitProducts = Array.from(productProfitMap.entries())
      .map(([pid, v]) => {
        const p = products.find((pp) => pp.id === pid);
        return {
          id: pid,
          name: p?.name || "已删除",
          emoji: p?.emoji || "📦",
          categoryId: p?.categoryId || "",
          ...v,
          margin: v.revenue > 0 ? (v.profit / v.revenue) * 100 : 0,
        };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    return { dailyProfit, totalRevenue, totalProfit, totalCost, margin, categoryProfit, topProfitProducts };
  }, [sales, products, categories, range]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="利润分析"
        description="毛利趋势与品类贡献"
        actions={
          <div className="flex bg-cream-100 rounded-lg p-0.5">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  range === r ? "bg-white text-forest-800 shadow-sm" : "text-ink-500"
                }`}
              >
                {r}天
              </button>
            ))}
          </div>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <ProfitStat label="营业收入" value={`¥${formatMoney(stats.totalRevenue, 0)}`} color="forest" />
        <ProfitStat label="销售成本" value={`¥${formatMoney(stats.totalCost, 0)}`} color="rose" />
        <ProfitStat label="毛利" value={`¥${formatMoney(stats.totalProfit, 0)}`} color="amber" />
        <div className="surface-card p-4">
          <p className="text-xs text-ink-500 font-medium">毛利率</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="display text-2xl font-bold text-signal-teal tabular">{stats.margin.toFixed(1)}%</p>
            <Badge variant={stats.margin >= 25 ? "success" : stats.margin >= 15 ? "warning" : "danger"}>
              {stats.margin >= 25 ? "优秀" : stats.margin >= 15 ? "正常" : "偏低"}
            </Badge>
          </div>
        </div>
      </div>

      {/* 利润趋势 */}
      <div className="surface-card p-5 mb-4">
        <h3 className="display text-base font-semibold text-forest-800 mb-1">每日毛利趋势</h3>
        <p className="text-xs text-ink-400 mb-4">近 {range} 天</p>
        <LineChart
          data={stats.dailyProfit.map((d) => ({ label: d.label, value: d.profit }))}
          height={260}
          color="#D4A24C"
          formatValue={(v) => `¥${formatMoneyCompact(v)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="surface-card p-5">
          <h3 className="display text-base font-semibold text-forest-800 mb-1">毛利率走势</h3>
          <p className="text-xs text-ink-400 mb-4">每日毛利率</p>
          <BarChart
            data={stats.dailyProfit.map((d) => ({ label: d.label, value: d.margin, color: "#5BA8A0" }))}
            height={220}
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        </div>

        <div className="surface-card p-5">
          <h3 className="display text-base font-semibold text-forest-800 mb-1">品类毛利分布</h3>
          <p className="text-xs text-ink-400 mb-4">近 {range} 天</p>
          <DonutChart data={stats.categoryProfit} size={150} formatValue={(v) => `¥${formatMoneyCompact(v)}`} />
        </div>

        <div className="surface-card p-5">
          <h3 className="display text-base font-semibold text-forest-800 mb-1">毛利贡献 Top</h3>
          <p className="text-xs text-ink-400 mb-3">单品排行</p>
          <div className="space-y-1.5">
            {stats.topProfitProducts.slice(0, 6).map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                  i < 3 ? "bg-amber-400 text-forest-900" : "bg-cream-100 text-ink-500"
                }`}>{i + 1}</span>
                <span>{p.emoji}</span>
                <span className="flex-1 truncate text-ink-700">{p.name}</span>
                <span className="tabular text-amber-600 font-semibold">¥{formatMoney(p.profit, 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 完整排行 */}
      <div className="surface-card overflow-hidden mt-4">
        <div className="px-5 py-3 border-b border-ink-100">
          <h3 className="display text-sm font-semibold text-forest-800">单品利润明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">商品</th>
                <th className="px-4 py-3 text-right font-semibold">销量</th>
                <th className="px-4 py-3 text-right font-semibold">营业额</th>
                <th className="px-4 py-3 text-right font-semibold">毛利</th>
                <th className="px-4 py-3 text-right font-semibold">毛利率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {stats.topProfitProducts.map((p) => (
                <tr key={p.id} className="table-row-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.emoji}</span>
                      <span className="font-medium text-ink-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-ink-600">{p.qty}</td>
                  <td className="px-4 py-3 text-right tabular text-ink-600">¥{formatMoney(p.revenue, 0)}</td>
                  <td className="px-4 py-3 text-right tabular font-semibold text-amber-600">¥{formatMoney(p.profit, 0)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={p.margin >= 30 ? "success" : p.margin >= 15 ? "warning" : "danger"}>
                      {p.margin.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfitStat({ label, value, color }: { label: string; value: string; color: "forest" | "amber" | "rose" }) {
  const colorMap = {
    forest: "text-forest-700",
    amber: "text-amber-600",
    rose: "text-signal-rose",
  }[color];
  return (
    <div className="surface-card p-4">
      <p className="text-xs text-ink-500 font-medium">{label}</p>
      <p className={`display text-2xl font-bold tabular mt-1 ${colorMap}`}>{value}</p>
    </div>
  );
}
