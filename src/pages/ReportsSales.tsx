import { useMemo, useState, memo } from "react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { LineChart, BarChart } from "@/components/charts/Charts";
import { formatMoney, formatMoneyCompact, isSameDay, daysAgo } from "@/utils/format";
import { CATEGORY_COLORS } from "@/hooks/useDashboardStats";

const ReportsSales = memo(function ReportsSales() {
  const sales = useStore((s) => s.sales);
  const categories = useStore((s) => s.categories);
  const [range, setRange] = useState<7 | 14 | 30>(14);

  const stats = useMemo(() => {
    const startDate = daysAgo(range - 1);
    const rangedSales = sales.filter((s) => new Date(s.createdAt) >= startDate);

    // 按日聚合
    const dailyData = Array.from({ length: range }, (_, i) => {
      const d = daysAgo(range - 1 - i);
      const daySales = sales.filter((s) => isSameDay(s.createdAt, d));
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: +daySales.reduce((sum, o) => sum + o.paid, 0).toFixed(2),
        orders: daySales.length,
      };
    });

    const totalRevenue = rangedSales.reduce((s, o) => s + o.paid, 0);
    const totalOrders = rangedSales.length;
    const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscount = rangedSales.reduce((s, o) => s + o.discount, 0);

    // 时段销售 (按小时)
    const hourly = Array.from({ length: 14 }, (_, i) => {
      const hour = i + 8; // 8点-21点
      const hourSales = rangedSales.filter((s) => new Date(s.createdAt).getHours() === hour);
      return {
        label: `${hour}:00`,
        value: +hourSales.reduce((sum, o) => sum + o.paid, 0).toFixed(2),
      };
    });

    // 品类销售
    const categoryData = categories.map((c) => {
      let value = 0;
      rangedSales.forEach((s) => {
        s.items.forEach((it) => {
          // 这里要找商品的分类，需要从 products 找
          value += it.amount;
        });
      });
      return { label: c.name, value, color: CATEGORY_COLORS[c.id] };
    });

    return { dailyData, totalRevenue, totalOrders, avgBasket, totalDiscount, hourly };
  }, [sales, range, categories]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="销售报表"
        description="按时间维度分析销售表现"
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
        <Stat label="营业额" value={`¥${formatMoney(stats.totalRevenue, 0)}`} color="forest" />
        <Stat label="订单数" value={stats.totalOrders.toString()} color="amber" />
        <Stat label="客单价" value={`¥${formatMoney(stats.avgBasket, 0)}`} color="teal" />
        <Stat label="优惠总额" value={`¥${formatMoney(stats.totalDiscount, 0)}`} color="rose" />
      </div>

      {/* 趋势 */}
      <div className="surface-card p-5 mb-4">
        <h3 className="display text-base font-semibold text-forest-800 mb-1">每日销售趋势</h3>
        <p className="text-xs text-ink-400 mb-4">近 {range} 天营业额</p>
        <LineChart
          data={stats.dailyData}
          height={280}
          color="#0F3D2E"
          formatValue={(v) => `¥${formatMoneyCompact(v)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <h3 className="display text-base font-semibold text-forest-800 mb-1">时段销售分布</h3>
          <p className="text-xs text-ink-400 mb-4">8:00 - 21:00 营业额</p>
          <BarChart data={stats.hourly} height={240} formatValue={(v) => `¥${formatMoneyCompact(v)}`} />
        </div>

        <div className="surface-card p-5">
          <h3 className="display text-base font-semibold text-forest-800 mb-1">每日订单数</h3>
          <p className="text-xs text-ink-400 mb-4">近 {range} 天</p>
          <BarChart
            data={stats.dailyData.map((d) => ({ label: d.label, value: d.orders, color: "#D4A24C" }))}
            height={240}
            formatValue={(v) => `${Math.round(v)}单`}
          />
        </div>
      </div>
    </div>
  );
});

export default ReportsSales;

function Stat({ label, value, color }: { label: string; value: string; color: "forest" | "amber" | "teal" | "rose" }) {
  const colorMap = {
    forest: "text-forest-700",
    amber: "text-amber-600",
    teal: "text-signal-teal",
    rose: "text-signal-rose",
  }[color];
  return (
    <div className="surface-card p-4">
      <p className="text-xs text-ink-500 font-medium">{label}</p>
      <p className={`display text-2xl font-bold tabular mt-1 ${colorMap}`}>{value}</p>
    </div>
  );
}
