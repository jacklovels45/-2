import { useMemo, useState, memo } from "react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { BarChart } from "@/components/charts/Charts";
import { formatMoney, formatMoneyCompact, daysAgo } from "@/utils/format";
import { getEmoji } from "@/utils/i18n";
import { Trophy, TrendingUp, TrendingDown, Coins } from "lucide-react";

type RankType = "qty" | "revenue" | "profit" | "slow";

const ReportsRanking = memo(function ReportsRanking() {
  const sales = useStore((s) => s.sales);
  const products = useStore((s) => s.products);
  const [rankType, setRankType] = useState<RankType>("qty");
  const [range, setRange] = useState<7 | 14 | 30>(30);

  const ranking = useMemo(() => {
    const startDate = daysAgo(range - 1);
    const rangedSales = sales.filter((s) => new Date(s.createdAt) >= startDate);

    const map = new Map<string, { qty: number; revenue: number; profit: number }>();
    rangedSales.forEach((s) => {
      s.items.forEach((it) => {
        const p = products.find((pp) => pp.id === it.productId);
        const profit = (it.salePrice - (p?.costPrice || 0)) * it.quantity;
        const cur = map.get(it.productId) || { qty: 0, revenue: 0, profit: 0 };
        cur.qty += it.quantity;
        cur.revenue += it.amount;
        cur.profit += profit;
        map.set(it.productId, cur);
      });
    });

    const ranked = Array.from(map.entries())
      .map(([pid, v]) => {
        const p = products.find((pp) => pp.id === pid);
        return {
          id: pid,
          name: p?.name || "已删除",
          emoji: p?.emoji || "📦",
          categoryId: p?.categoryId || "",
          costPrice: p?.costPrice || 0,
          salePrice: p?.salePrice || 0,
          ...v,
          margin: v.revenue > 0 ? (v.profit / v.revenue) * 100 : 0,
        };
      });

    if (rankType === "qty") return ranked.sort((a, b) => b.qty - a.qty);
    if (rankType === "revenue") return ranked.sort((a, b) => b.revenue - a.revenue);
    if (rankType === "profit") return ranked.sort((a, b) => b.profit - a.profit);
    return ranked.sort((a, b) => a.qty - b.qty);
  }, [sales, products, rankType, range]);

  const slowItems = useMemo(() => {
    const startDate = daysAgo(range - 1);
    const rangedSales = sales.filter((s) => new Date(s.createdAt) >= startDate);
    const soldIds = new Set<string>();
    rangedSales.forEach((s) => s.items.forEach((it) => soldIds.add(it.productId)));
    return products.filter((p) => p.status === "active" && !soldIds.has(p.id));
  }, [sales, products, range]);

  const rankConfig = {
    qty: { label: "销量榜", icon: <Trophy size={16} />, color: "amber", valueKey: "qty" as const, valueLabel: "销量", format: (v: number) => `${v} 件` },
    revenue: { label: "销额榜", icon: <TrendingUp size={16} />, color: "forest", valueKey: "revenue" as const, valueLabel: "营业额", format: (v: number) => `¥${formatMoney(v, 0)}` },
    profit: { label: "毛利榜", icon: <Coins size={16} />, color: "teal", valueKey: "profit" as const, valueLabel: "毛利", format: (v: number) => `¥${formatMoney(v, 0)}` },
    slow: { label: "滞销榜", icon: <TrendingDown size={16} />, color: "rose", valueKey: "qty" as const, valueLabel: "销量", format: (v: number) => `${v} 件` },
  }[rankType];

  // 柱状图数据（前10）
  const chartData = ranking.slice(0, 10).map((p) => ({
    label: p.name.length > 5 ? p.name.slice(0, 4) + "…" : p.name,
    value: p[rankConfig.valueKey],
    color: rankType === "qty" ? "#D4A24C" : rankType === "revenue" ? "#0F3D2E" : rankType === "profit" ? "#5BA8A0" : "#C25B6E",
  }));

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="商品排行"
        description="多维度商品销售排行"
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

      {/* 类型切换 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {([
          { key: "qty", label: "销量榜", icon: <Trophy size={16} />, color: "amber" },
          { key: "revenue", label: "销额榜", icon: <TrendingUp size={16} />, color: "forest" },
          { key: "profit", label: "毛利榜", icon: <Coins size={16} />, color: "teal" },
          { key: "slow", label: "滞销榜", icon: <TrendingDown size={16} />, color: "rose" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setRankType(t.key as RankType)}
            className={`surface-card p-4 text-left transition-all flex items-center gap-3 ${
              rankType === t.key ? "ring-2 ring-forest-500" : "hover:shadow-cardHover"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              t.color === "amber" ? "bg-amber-50 text-amber-600" :
              t.color === "forest" ? "bg-forest-50 text-forest-600" :
              t.color === "teal" ? "bg-teal-50 text-signal-teal" :
              "bg-rose-50 text-signal-rose"
            }`}>
              {t.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800">{t.label}</p>
              <p className="text-[11px] text-ink-400">
                {t.key === "slow" ? `${slowItems.length} 款滞销` : `Top ${ranking.length}`}
              </p>
            </div>
          </button>
        ))}
      </div>

      {rankType === "slow" ? (
        <div className="surface-card p-5">
          <h3 className="display text-base font-semibold text-forest-800 mb-1">滞销商品清单</h3>
          <p className="text-xs text-ink-400 mb-4">近 {range} 天无销售记录，建议促销或调整进货策略</p>
          {slowItems.length === 0 ? (
            <Empty icon={<TrendingDown size={28} />} title="无滞销商品" description="所有商品均有销售 🎉" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {slowItems.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-cream-50 border border-ink-100">
                  <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-xl">
                    {getEmoji(p.emoji)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-400">库存 {p.stock} {p.unit} · 售价 ¥{formatMoney(p.salePrice)}</p>
                  </div>
                  <Badge variant="warning">滞销</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 柱状图 */}
          <div className="surface-card p-5 mb-4">
            <h3 className="display text-base font-semibold text-forest-800 mb-1">Top 10 {rankConfig.label}</h3>
            <p className="text-xs text-ink-400 mb-4">近 {range} 天</p>
            <BarChart data={chartData} height={260} formatValue={(v) => rankConfig.format(v)} />
          </div>

          {/* 完整排行 */}
          <div className="surface-card overflow-hidden">
            <div className="px-5 py-3 border-b border-ink-100">
              <h3 className="display text-sm font-semibold text-forest-800">完整排行 · {rankConfig.label}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">排名</th>
                    <th className="px-4 py-3 text-left font-semibold">商品</th>
                    <th className="px-4 py-3 text-right font-semibold">销量</th>
                    <th className="px-4 py-3 text-right font-semibold">营业额</th>
                    <th className="px-4 py-3 text-right font-semibold">毛利</th>
                    <th className="px-4 py-3 text-right font-semibold">毛利率</th>
                    <th className="px-4 py-3 text-left font-semibold">占比条</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {ranking.slice(0, 30).map((p, i) => {
                    const maxValue = ranking[0][rankConfig.valueKey];
                    const ratio = maxValue > 0 ? (p[rankConfig.valueKey] / maxValue) * 100 : 0;
                    return (
                      <tr key={p.id} className="table-row-hover">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${
                            i < 3 ? "bg-amber-400 text-forest-900" : "bg-cream-100 text-ink-500"
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getEmoji(p.emoji)}</span>
                            <span className="font-medium text-ink-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular text-ink-600">{p.qty}</td>
                        <td className="px-4 py-3 text-right tabular text-ink-600">¥{formatMoney(p.revenue, 0)}</td>
                        <td className="px-4 py-3 text-right tabular font-semibold text-amber-600">¥{formatMoney(p.profit, 0)}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={p.margin >= 30 ? "success" : p.margin >= 15 ? "warning" : "danger"}>
                            {p.margin.toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-32 h-1.5 bg-cream-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default ReportsRanking;
