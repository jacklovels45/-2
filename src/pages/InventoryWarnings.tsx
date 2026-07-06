import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ShoppingCart, Truck, TrendingDown } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { formatMoney } from "@/utils/format";
import { getEmoji } from "@/utils/i18n";

const InventoryWarnings = memo(function InventoryWarnings() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const sales = useStore((s) => s.sales);
  const [filter, setFilter] = useState<"all" | "out" | "low" | "slow">("all");

  const outItems = products.filter((p) => p.stock === 0 && p.status === "active");
  const lowItems = products.filter((p) => p.stock > 0 && p.stock <= p.safetyStock && p.status === "active");

  // 滞销：30天销量小于安全库存的1/3
  const salesQtyMap = new Map<string, number>();
  sales.forEach((s) => {
    s.items.forEach((it) => {
      salesQtyMap.set(it.productId, (salesQtyMap.get(it.productId) || 0) + it.quantity);
    });
  });
  const slowItems = products.filter((p) => {
    if (p.status !== "active") return false;
    const sold = salesQtyMap.get(p.id) || 0;
    return sold < p.safetyStock / 3;
  });

  const filteredItems = (() => {
    if (filter === "out") return outItems;
    if (filter === "low") return lowItems;
    if (filter === "slow") return slowItems;
    return [...outItems, ...lowItems, ...slowItems];
  })();

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || "未分类";

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="库存预警"
        description="实时监控低库存、缺货与滞销商品"
      />

      {/* 预警统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => setFilter(filter === "out" ? "all" : "out")}
          className={`surface-card p-4 text-left transition-all ${filter === "out" ? "ring-2 ring-signal-rose" : "hover:shadow-cardHover"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-500">缺货商品</p>
              <p className="display text-3xl font-bold text-signal-rose tabular mt-1">{outItems.length}</p>
              <p className="text-[11px] text-ink-400 mt-1">需立即补货</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-signal-rose">
              <TrendingDown size={20} />
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === "low" ? "all" : "low")}
          className={`surface-card p-4 text-left transition-all ${filter === "low" ? "ring-2 ring-signal-orange" : "hover:shadow-cardHover"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-500">低库存商品</p>
              <p className="display text-3xl font-bold text-signal-orange tabular mt-1">{lowItems.length}</p>
              <p className="text-[11px] text-ink-400 mt-1">库存即将不足</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-signal-orange">
              <AlertTriangle size={20} />
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter(filter === "slow" ? "all" : "slow")}
          className={`surface-card p-4 text-left transition-all ${filter === "slow" ? "ring-2 ring-signal-violet" : "hover:shadow-cardHover"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-500">滞销商品</p>
              <p className="display text-3xl font-bold text-signal-violet tabular mt-1">{slowItems.length}</p>
              <p className="text-[11px] text-ink-400 mt-1">近30天销量偏低</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-signal-violet">
              <TrendingDown size={20} />
            </div>
          </div>
        </button>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
          <h3 className="display text-sm font-semibold text-forest-800">
            预警清单 {filter !== "all" && <span className="text-ink-400 text-xs ml-1">· 已筛选</span>}
          </h3>
          <div className="flex gap-1.5">
            {(["all", "out", "low", "slow"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filter === f ? "bg-forest-800 text-cream-100" : "bg-cream-100 text-ink-500 hover:bg-cream-200"
                }`}
              >
                {{ all: "全部", out: "缺货", low: "低库存", slow: "滞销" }[f]}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <Empty
            icon={<AlertTriangle size={28} />}
            title="暂无预警"
            description="所有商品库存状态良好 🎉"
          />
        ) : (
          <div className="divide-y divide-ink-100">
            {filteredItems.map((p) => {
              const isOut = p.stock === 0;
              const isLow = p.stock > 0 && p.stock <= p.safetyStock;
              const sold = salesQtyMap.get(p.id) || 0;
              const isSlow = sold < p.safetyStock / 3;
              const suggestQty = Math.max(p.safetyStock * 2 - p.stock, p.safetyStock);
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3 table-row-hover">
                  <div className="w-10 h-10 rounded-md bg-cream-100 flex items-center justify-center text-xl shrink-0">
                    {getEmoji(p.emoji)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink-800 truncate">{p.name}</p>
                      <Badge variant={isOut ? "danger" : isLow ? "warning" : "neutral"}>
                        {isOut ? "缺货" : isLow ? "低库存" : "滞销"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-ink-400 mt-0.5">
                      {categoryName(p.categoryId)} · {p.spec} · 30天销量 {sold}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`tabular font-semibold ${isOut ? "text-signal-rose" : isLow ? "text-signal-orange" : "text-ink-700"}`}>
                      {p.stock} / {p.safetyStock}
                    </p>
                    <p className="text-[10px] text-ink-400">当前 / 安全</p>
                  </div>
                  <div className="text-right pl-3 border-l border-ink-100">
                    <p className="text-xs text-ink-500">建议补货</p>
                    <p className="tabular text-forest-700 font-semibold">{suggestQty}</p>
                  </div>
                  <Link
                    to="/purchases/new"
                    className="btn-gold text-xs px-3 py-1.5"
                  >
                    <Truck size={13} /> 补货
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default InventoryWarnings;
