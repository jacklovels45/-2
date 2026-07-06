import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  ShoppingBag,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Boxes,
  Trophy,
  Coins,
  PackageX,
  Truck,
  ScanLine,
  Receipt,
  Sparkles,
} from "lucide-react";
import { useDashboardStats, CATEGORY_COLORS } from "@/hooks/useDashboardStats";
import { LineChart, DonutChart, Sparkline } from "@/components/charts/Charts";
import { Badge, StatPill } from "@/components/ui/Badge";
import { formatMoney, formatMoneyCompact, relativeTime } from "@/utils/format";

export default function Dashboard() {
  const stats = useDashboardStats();
  const [trendRange, setTrendRange] = useState<7 | 30>(7);

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][today.getDay()];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl2 bg-forest-900 text-cream-100 grain">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950" />
        {/* 装饰图形 */}
        <svg className="absolute right-0 top-0 opacity-[0.12]" width="380" height="280" viewBox="0 0 380 280" fill="none">
          <circle cx="320" cy="60" r="120" stroke="#D4A24C" strokeWidth="1" />
          <circle cx="320" cy="60" r="80" stroke="#D4A24C" strokeWidth="1" />
          <circle cx="320" cy="60" r="40" stroke="#D4A24C" strokeWidth="1" />
          <path d="M0 200 Q 100 140, 200 180 T 380 160" stroke="#D4A24C" strokeWidth="1.2" fill="none" />
          <path d="M0 230 Q 100 170, 200 210 T 380 190" stroke="#D4A24C" strokeWidth="0.8" fill="none" opacity="0.6" />
        </svg>
        <div className="relative px-6 py-7 sm:px-8 sm:py-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium tracking-widest uppercase mb-2">
              <Sparkles size={14} /> {weekDay} · {dateStr}
            </div>
            <h1 className="display text-3xl sm:text-4xl font-semibold text-cream-100 leading-tight">
              欢迎回来，<span className="text-amber-300">陈店长</span>
            </h1>
            <p className="mt-2 text-cream-100/70 text-sm max-w-md">
              今日已成交 <span className="tabular text-amber-300 font-semibold">{stats.todayOrders}</span> 单，
              营业额 <span className="tabular text-amber-300 font-semibold">¥{formatMoney(stats.todayRevenue, 0)}</span>。
              {stats.lowStockItems.length > 0 && (
                <>有 <span className="text-signal-orange font-semibold">{stats.lowStockItems.length}</span> 款商品需要补货。</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/pos" className="btn-gold">
              <ScanLine size={16} /> 收银开单
            </Link>
            <Link to="/purchases/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-cream-100/30 text-cream-100 font-medium text-sm hover:bg-cream-100/10 transition-colors">
              <Truck size={16} /> 新建采购
            </Link>
          </div>
        </div>
      </section>

      {/* KPI 卡片 */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="今日营业额"
          value={`¥${formatMoney(stats.todayRevenue, 0)}`}
          delta={stats.revenueDelta}
          icon={<Wallet size={18} />}
          accent="amber"
          spark={stats.last7Spark}
        />
        <KpiCard
          label="今日订单数"
          value={stats.todayOrders.toString()}
          delta={stats.ordersDelta}
          icon={<ShoppingBag size={18} />}
          accent="forest"
        />
        <KpiCard
          label="客单价"
          value={`¥${formatMoney(stats.avgBasket, 0)}`}
          delta={stats.basketDelta}
          icon={<Receipt size={18} />}
          accent="teal"
        />
        <KpiCard
          label="今日毛利"
          value={`¥${formatMoney(stats.todayProfit, 0)}`}
          icon={<Coins size={18} />}
          accent="violet"
          suffix={`毛利率 ${stats.todayRevenue > 0 ? ((stats.todayProfit / stats.todayRevenue) * 100).toFixed(1) : 0}%`}
        />
      </section>

      {/* 趋势图 + 品类分布 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="display text-base font-semibold text-forest-800">销售趋势</h3>
              <p className="text-xs text-ink-400 mt-0.5">营业额按日聚合</p>
            </div>
            <div className="flex bg-cream-100 rounded-lg p-0.5">
              {([7, 30] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    trendRange === r ? "bg-white text-forest-800 shadow-sm" : "text-ink-500"
                  }`}
                >
                  {r}天
                </button>
              ))}
            </div>
          </div>
          <LineChart
            data={trendRange === 7 ? stats.last7Days : stats.last30Days}
            height={260}
            color="#0F3D2E"
            formatValue={(v) => `¥${formatMoneyCompact(v)}`}
          />
        </div>

        <div className="surface-card p-5">
          <h3 className="display text-base font-semibold text-forest-800 mb-1">品类销售分布</h3>
          <p className="text-xs text-ink-400 mb-4">近30天营业额占比</p>
          {stats.categorySales.length > 0 ? (
            <DonutChart
              data={stats.categorySales}
              size={160}
              formatValue={(v) => `¥${formatMoneyCompact(v)}`}
            />
          ) : (
            <div className="text-center text-ink-300 text-sm py-10">暂无数据</div>
          )}
        </div>
      </section>

      {/* 库存 & 预警 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="display text-base font-semibold text-forest-800">库存概览</h3>
            <Link to="/inventory" className="text-xs text-forest-600 hover:underline">查看明细</Link>
          </div>
          <div className="space-y-3">
            <MiniStat label="在售 SKU" value={stats.activeSkuCount} total={stats.totalSkuCount} icon={<Package size={14} />} color="forest" />
            <MiniStat label="库存总值" value={`¥${formatMoneyCompact(stats.totalStockValue)}`} icon={<Boxes size={14} />} color="amber" />
            <MiniStat label="低库存预警" value={stats.lowStockItems.length} icon={<AlertTriangle size={14} />} color="orange" />
          </div>
          <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[11px] text-ink-400">今日入库</p>
              <p className="display text-xl font-semibold text-forest-700 tabular mt-1">{stats.todayInCount}</p>
            </div>
            <div>
              <p className="text-[11px] text-ink-400">今日出库</p>
              <p className="display text-xl font-semibold text-signal-orange tabular mt-1">{stats.todayOutCount}</p>
            </div>
          </div>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="display text-base font-semibold text-forest-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-signal-orange" /> 库存预警
            </h3>
            <Link to="/inventory/warnings" className="text-xs text-forest-600 hover:underline">全部 →</Link>
          </div>
          {stats.lowStockItems.length === 0 ? (
            <div className="text-center text-ink-400 text-sm py-8">库存充足，暂无预警 🎉</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stats.lowStockItems.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-100 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-md bg-cream-100 flex items-center justify-center text-lg shrink-0">
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-400">{p.spec}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs tabular text-signal-rose font-semibold">{p.stock} {p.unit}</p>
                    <p className="text-[10px] text-ink-400">安全库存 {p.safetyStock}</p>
                  </div>
                  <Badge variant={p.stock === 0 ? "danger" : "warning"}>
                    {p.stock === 0 ? "缺货" : "低库存"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 热销 & 滞销 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display text-base font-semibold text-forest-800 flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> 热销 Top 10
            </h3>
            <span className="text-xs text-ink-400">按销量 · 近30天</span>
          </div>
          <div className="space-y-1.5">
            {stats.topByQty.slice(0, 8).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-1.5 group">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < 3 ? "bg-amber-400 text-forest-900" : "bg-cream-100 text-ink-500"
                }`}>
                  {i + 1}
                </span>
                <span className="text-base">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-800 truncate">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular font-semibold text-forest-700">{p.qty} 件</p>
                  <p className="text-[10px] tabular text-ink-400">¥{formatMoney(p.revenue, 0)}</p>
                </div>
                <div className="w-20 hidden sm:block">
                  <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(p.qty / stats.topByQty[0].qty) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display text-base font-semibold text-forest-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-signal-teal" /> 毛利 Top 10
            </h3>
            <span className="text-xs text-ink-400">近30天累计</span>
          </div>
          <div className="space-y-1.5">
            {stats.topByProfit.slice(0, 8).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-1.5">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < 3 ? "bg-signal-teal text-white" : "bg-cream-100 text-ink-500"
                }`}>
                  {i + 1}
                </span>
                <span className="text-base">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-800 truncate">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular font-semibold text-signal-teal">¥{formatMoney(p.profit, 0)}</p>
                  <p className="text-[10px] tabular text-ink-400">{p.qty} 件</p>
                </div>
                <div className="w-20 hidden sm:block">
                  <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-signal-teal rounded-full"
                      style={{ width: `${(p.profit / stats.topByProfit[0].profit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 滞销提醒 */}
      {stats.slowMoving.length > 0 && (
        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display text-base font-semibold text-forest-800 flex items-center gap-2">
              <PackageX size={16} className="text-signal-rose" /> 滞销商品
            </h3>
            <span className="text-xs text-ink-400">近30天无销售 · 共 {stats.slowMoving.length} 款</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.slowMoving.slice(0, 12).map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs transition-colors"
              >
                <span>{p.emoji}</span> {p.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: React.ReactNode;
  accent: "amber" | "forest" | "teal" | "violet";
  spark?: number[];
  suffix?: string;
}

function KpiCard({ label, value, delta, icon, accent, spark, suffix }: KpiCardProps) {
  const accentMap = {
    amber: { bar: "bg-amber-400", icon: "bg-amber-50 text-amber-600", spark: "#D4A24C" },
    forest: { bar: "bg-forest-700", icon: "bg-forest-50 text-forest-600", spark: "#0F3D2E" },
    teal: { bar: "bg-signal-teal", icon: "bg-teal-50 text-signal-teal", spark: "#5BA8A0" },
    violet: { bar: "bg-signal-violet", icon: "bg-violet-50 text-signal-violet", spark: "#7E6BA8" },
  }[accent];

  return (
    <div className="surface-card surface-card-hover p-5 relative overflow-hidden">
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${accentMap.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-500 font-medium">{label}</p>
          <p className="display text-2xl font-semibold text-ink-800 mt-2 tabular">{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap.icon}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        {delta !== undefined ? (
          <StatPill value={delta} />
        ) : (
          <span className="text-[11px] text-ink-400">{suffix}</span>
        )}
        {spark && spark.length > 0 && (
          <Sparkline data={spark} color={accentMap.spark} width={64} height={22} />
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  total,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  total?: number;
  icon: React.ReactNode;
  color: "forest" | "amber" | "orange";
}) {
  const colorMap = {
    forest: "text-forest-600 bg-forest-50",
    amber: "text-amber-600 bg-amber-50",
    orange: "text-signal-orange bg-orange-50",
  }[color];
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colorMap}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-ink-500">{label}</p>
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold text-ink-800 tabular">{value}</span>
        {total !== undefined && <span className="text-xs text-ink-400"> / {total}</span>}
      </div>
    </div>
  );
}

export { CATEGORY_COLORS };
