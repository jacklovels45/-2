import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowDown, ArrowUp, RefreshCw, ArrowLeftRight } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { formatMoney, formatDate, relativeTime, isSameDay, daysAgo } from "@/utils/format";
import type { MovementType, MovementRefType } from "@/types";

const TYPE_LABEL: Record<MovementType, { label: string; variant: "success" | "danger" | "info" }> = {
  in: { label: "入库", variant: "success" },
  out: { label: "出库", variant: "danger" },
  adjust: { label: "调整", variant: "info" },
};

const REF_LABEL: Record<MovementRefType, string> = {
  purchase: "采购入库",
  sale: "销售出库",
  return: "退货",
  check: "盘点调整",
};

export default function InventoryMovements() {
  const movements = useStore((s) => s.movements);
  const products = useStore((s) => s.products);

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MovementType>("all");
  const [dateRange, setDateRange] = useState<"today" | "7days" | "30days" | "all">("7days");

  const filtered = useMemo(() => {
    const today = new Date();
    return movements.filter((m) => {
      if (keyword && !m.productName.includes(keyword)) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (dateRange === "today" && !isSameDay(m.createdAt, today)) return false;
      if (dateRange === "7days" && new Date(m.createdAt) < daysAgo(7)) return false;
      if (dateRange === "30days" && new Date(m.createdAt) < daysAgo(30)) return false;
      return true;
    });
  }, [movements, keyword, typeFilter, dateRange]);

  const inCount = filtered.filter((m) => m.type === "in").reduce((s, m) => s + m.quantity, 0);
  const outCount = filtered.filter((m) => m.type === "out").reduce((s, m) => s + m.quantity, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="出入库流水"
        description={`共 ${movements.length} 条流水记录`}
        actions={
          <Link to="/inventory" className="btn-secondary">
            <ArrowLeftRight size={15} /> 实时库存
          </Link>
        }
      />

      {/* 概览 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="surface-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-50 text-forest-600 flex items-center justify-center">
            <ArrowDown size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-500">入库总数</p>
            <p className="display text-xl font-bold text-forest-700 tabular">{inCount}</p>
          </div>
        </div>
        <div className="surface-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-signal-rose flex items-center justify-center">
            <ArrowUp size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-500">出库总数</p>
            <p className="display text-xl font-bold text-signal-rose tabular">{outCount}</p>
          </div>
        </div>
        <div className="surface-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-signal-teal flex items-center justify-center">
            <RefreshCw size={18} />
          </div>
          <div>
            <p className="text-xs text-ink-500">流水条数</p>
            <p className="display text-xl font-bold text-ink-800 tabular">{filtered.length}</p>
          </div>
        </div>
      </div>

      <div className="surface-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-100 border border-ink-100 flex-1 min-w-[200px]">
            <Search size={15} className="text-ink-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索商品名称"
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | MovementType)}
            className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm focus:outline-none focus:border-forest-500"
          >
            <option value="all">全部类型</option>
            <option value="in">入库</option>
            <option value="out">出库</option>
            <option value="adjust">调整</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "today" | "7days" | "30days" | "all")}
            className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm focus:outline-none focus:border-forest-500"
          >
            <option value="today">今日</option>
            <option value="7days">近7天</option>
            <option value="30days">近30天</option>
            <option value="all">全部</option>
          </select>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <Empty icon={<ArrowLeftRight size={28} />} title="暂无流水记录" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">时间</th>
                  <th className="px-4 py-3 text-left font-semibold">商品</th>
                  <th className="px-4 py-3 text-center font-semibold">类型</th>
                  <th className="px-4 py-3 text-right font-semibold">数量</th>
                  <th className="px-4 py-3 text-right font-semibold">变动前</th>
                  <th className="px-4 py-3 text-right font-semibold">变动后</th>
                  <th className="px-4 py-3 text-left font-semibold">来源</th>
                  <th className="px-4 py-3 text-left font-semibold">操作员</th>
                  <th className="px-4 py-3 text-left font-semibold">备注</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.slice(0, 100).map((m) => {
                  const type = TYPE_LABEL[m.type];
                  const product = products.find((p) => p.id === m.productId);
                  return (
                    <tr key={m.id} className="table-row-hover">
                      <td className="px-4 py-3 text-xs text-ink-500" title={formatDate(m.createdAt, true)}>
                        {relativeTime(m.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{product?.emoji || "📦"}</span>
                          <span className="text-ink-700 truncate">{m.productName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={type.variant}>{type.label}</Badge>
                      </td>
                      <td className={`px-4 py-3 text-right tabular font-semibold ${
                        m.type === "in" ? "text-forest-700" : m.type === "out" ? "text-signal-rose" : "text-signal-teal"
                      }`}>
                        {m.type === "in" ? "+" : m.type === "out" ? "-" : "±"}{m.quantity}
                      </td>
                      <td className="px-4 py-3 text-right tabular text-ink-500">{m.beforeStock}</td>
                      <td className="px-4 py-3 text-right tabular font-medium text-ink-800">{m.afterStock}</td>
                      <td className="px-4 py-3 text-xs text-ink-500">
                        <span className="badge bg-cream-100 text-ink-600">{REF_LABEL[m.refType]}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-500">{m.operator}</td>
                      <td className="px-4 py-3 text-xs text-ink-400">{m.note || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <div className="text-center py-3 text-xs text-ink-400 bg-cream-50">
                仅显示前 100 条
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
