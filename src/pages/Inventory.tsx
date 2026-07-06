import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Boxes, AlertTriangle, ArrowDownUp, Plus, Minus } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatMoney } from "@/utils/format";

export default function Inventory() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const adjustStock = useStore((s) => s.adjustStock);

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out" | "overstock">("all");
  const [adjustTarget, setAdjustTarget] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (keyword && !p.name.includes(keyword) && !p.barcode.includes(keyword)) return false;
      if (categoryId !== "all" && p.categoryId !== categoryId) return false;
      if (stockFilter === "low" && (p.stock > p.safetyStock || p.stock === 0)) return false;
      if (stockFilter === "out" && p.stock > 0) return false;
      if (stockFilter === "overstock" && p.stock < p.safetyStock * 3) return false;
      return true;
    });
  }, [products, keyword, categoryId, stockFilter]);

  const totalValue = filtered.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const totalSaleValue = filtered.reduce((s, p) => s + p.stock * p.salePrice, 0);
  const lowCount = products.filter((p) => p.stock <= p.safetyStock && p.stock > 0).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || "未分类";
  const categoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon || "📦";

  const openAdjust = (productId: string) => {
    setAdjustTarget(productId);
    setAdjustQty(0);
    setAdjustNote("");
  };

  const handleAdjust = () => {
    if (adjustTarget && adjustQty !== 0) {
      adjustStock(adjustTarget, adjustQty, adjustNote || "手工调整");
      setAdjustTarget(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="实时库存"
        description={`共 ${products.length} 款商品 · 库存总值 ¥${formatMoney(products.reduce((s, p) => s + p.stock * p.costPrice, 0), 0)}`}
        actions={
          <Link to="/inventory/movements" className="btn-secondary">
            <ArrowDownUp size={15} /> 查看流水
          </Link>
        }
      />

      {/* 概览卡 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <OverviewCard label="库存总值(进价)" value={`¥${formatMoney(totalValue, 0)}`} icon={<Boxes size={16} />} color="forest" />
        <OverviewCard label="库存总值(售价)" value={`¥${formatMoney(totalSaleValue, 0)}`} icon={<Boxes size={16} />} color="amber" />
        <OverviewCard label="低库存商品" value={`${lowCount} 款`} icon={<AlertTriangle size={16} />} color="orange" link="/inventory/warnings" />
        <OverviewCard label="缺货商品" value={`${outCount} 款`} icon={<AlertTriangle size={16} />} color="rose" link="/inventory/warnings" />
      </div>

      <div className="surface-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-100 border border-ink-100 flex-1 min-w-[200px]">
            <Search size={15} className="text-ink-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索商品"
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm focus:outline-none focus:border-forest-500"
          >
            <option value="all">全部分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as "all" | "low" | "out" | "overstock")}
            className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm focus:outline-none focus:border-forest-500"
          >
            <option value="all">全部库存</option>
            <option value="low">低库存</option>
            <option value="out">缺货</option>
            <option value="overstock">积压库存</option>
          </select>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <Empty icon={<Boxes size={28} />} title="未找到商品" description="尝试调整筛选条件" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">商品</th>
                  <th className="px-4 py-3 text-left font-semibold">分类</th>
                  <th className="px-4 py-3 text-right font-semibold">当前库存</th>
                  <th className="px-4 py-3 text-right font-semibold">安全库存</th>
                  <th className="px-4 py-3 text-right font-semibold">库存状态</th>
                  <th className="px-4 py-3 text-right font-semibold">库存占比</th>
                  <th className="px-4 py-3 text-right font-semibold">库存价值</th>
                  <th className="px-4 py-3 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((p) => {
                  const isOut = p.stock === 0;
                  const isLow = p.stock <= p.safetyStock && p.stock > 0;
                  const ratio = p.safetyStock > 0 ? (p.stock / (p.safetyStock * 2)) * 100 : 100;
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{p.emoji}</span>
                          <div>
                            <p className="font-medium text-ink-800">{p.name}</p>
                            <p className="text-[11px] text-ink-400">{p.spec}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-500">{categoryIcon(p.categoryId)} {categoryName(p.categoryId)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`tabular font-semibold ${isOut ? "text-signal-rose" : isLow ? "text-signal-orange" : "text-ink-800"}`}>
                          {p.stock}
                        </span>
                        <span className="text-xs text-ink-400 ml-0.5">{p.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular text-ink-500">{p.safetyStock}</td>
                      <td className="px-4 py-3 text-right">
                        {isOut ? (
                          <Badge variant="danger">缺货</Badge>
                        ) : isLow ? (
                          <Badge variant="warning">低库存</Badge>
                        ) : ratio > 150 ? (
                          <Badge variant="info">积压</Badge>
                        ) : (
                          <Badge variant="success">充足</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24 ml-auto h-1.5 bg-cream-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOut ? "bg-signal-rose" : isLow ? "bg-signal-orange" : "bg-forest-500"}`}
                            style={{ width: `${Math.min(100, ratio)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular text-ink-600">¥{formatMoney(p.stock * p.costPrice, 0)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openAdjust(p.id)}
                          className="text-xs text-forest-700 hover:bg-forest-50 px-2 py-1 rounded-md font-medium"
                        >
                          调整
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={adjustTarget !== null}
        onClose={() => setAdjustTarget(null)}
        title="库存调整"
        size="sm"
        footer={
          <>
            <button onClick={() => setAdjustTarget(null)} className="btn-ghost">取消</button>
            <button onClick={handleAdjust} className="btn-primary">确认调整</button>
          </>
        }
      >
        {adjustTarget && (() => {
          const p = products.find((pp) => pp.id === adjustTarget);
          if (!p) return null;
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cream-50">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <p className="font-medium text-ink-800">{p.name}</p>
                  <p className="text-xs text-ink-400">当前库存 <span className="tabular font-semibold">{p.stock}</span> {p.unit}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-500 font-medium block mb-1.5">调整数量 (正数入库 / 负数出库)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdjustQty((q) => q - 1)}
                    className="w-9 h-9 rounded-lg bg-cream-100 text-ink-600 hover:bg-cream-200 flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(+e.target.value)}
                    className="input-field text-center text-lg tabular font-semibold"
                  />
                  <button
                    onClick={() => setAdjustQty((q) => q + 1)}
                    className="w-9 h-9 rounded-lg bg-cream-100 text-ink-600 hover:bg-cream-200 flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-500 font-medium block mb-1.5">调整后库存</label>
                <p className="display text-2xl font-bold text-forest-700 tabular">
                  {Math.max(0, p.stock + adjustQty)} {p.unit}
                </p>
              </div>
              <div>
                <label className="text-xs text-ink-500 font-medium block mb-1.5">备注</label>
                <input
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="input-field"
                  placeholder="例如：报损 / 调拨 / 盘盈"
                />
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  icon,
  color,
  link,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "forest" | "amber" | "orange" | "rose";
  link?: string;
}) {
  const colorMap = {
    forest: "from-forest-50 to-cream-50 text-forest-700",
    amber: "from-amber-50 to-cream-50 text-amber-700",
    orange: "from-orange-50 to-cream-50 text-signal-orange",
    rose: "from-rose-50 to-cream-50 text-signal-rose",
  }[color];
  const inner = (
    <div className={`surface-card surface-card-hover p-4 bg-gradient-to-br ${colorMap}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-500 font-medium">{label}</p>
        <span className="opacity-60">{icon}</span>
      </div>
      <p className="display text-xl font-bold mt-2 tabular">{value}</p>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}
