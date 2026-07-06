import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ShoppingCart, Eye } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { formatMoney, formatDate, relativeTime } from "@/utils/format";
import type { OrderStatus } from "@/types";

const STATUS_MAP: Record<OrderStatus, { label: string; variant: "neutral" | "warning" | "info" | "success" | "danger" }> = {
  draft: { label: "草稿", variant: "neutral" },
  pending: { label: "待审核", variant: "warning" },
  approved: { label: "已审核", variant: "info" },
  received: { label: "已入库", variant: "success" },
  cancelled: { label: "已取消", variant: "danger" },
};

export default function Purchases() {
  const purchases = useStore((s) => s.purchases);
  const suppliers = useStore((s) => s.suppliers);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name || "未知供应商";

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      if (keyword && !p.orderNo.includes(keyword) && !supplierName(p.supplierId).includes(keyword)) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [purchases, keyword, statusFilter, suppliers]);

  const totalAmount = filtered.reduce((s, p) => s + p.totalAmount, 0);
  const receivedCount = filtered.filter((p) => p.status === "received").length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="采购订单"
        description={`共 ${purchases.length} 张采购单 · 累计采购 ¥${formatMoney(purchases.reduce((s, p) => s + p.totalAmount, 0), 0)}`}
        actions={
          <Link to="/purchases/new" className="btn-primary">
            <Plus size={15} /> 新建采购单
          </Link>
        }
      />

      <div className="surface-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-100 border border-ink-100 flex-1 min-w-[200px]">
            <Search size={15} className="text-ink-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索单号或供应商"
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
            className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm focus:outline-none focus:border-forest-500"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待审核</option>
            <option value="approved">已审核</option>
            <option value="received">已入库</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        <div className="mt-3 pt-3 border-t border-ink-100 flex flex-wrap gap-6 text-xs">
          <span className="text-ink-500">筛选结果 <span className="tabular text-forest-700 font-semibold ml-1">{filtered.length}</span> 单</span>
          <span className="text-ink-500">采购金额 <span className="tabular text-amber-600 font-semibold ml-1">¥{formatMoney(totalAmount, 0)}</span></span>
          <span className="text-ink-500">已入库 <span className="tabular text-forest-700 font-semibold ml-1">{receivedCount}</span> 单</span>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <Empty
            icon={<ShoppingCart size={28} />}
            title="未找到采购单"
            description="尝试调整筛选条件或新建采购单"
            action={<Link to="/purchases/new" className="btn-primary"><Plus size={15} /> 新建采购单</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">单号</th>
                  <th className="px-4 py-3 text-left font-semibold">供应商</th>
                  <th className="px-4 py-3 text-left font-semibold">商品数</th>
                  <th className="px-4 py-3 text-right font-semibold">采购金额</th>
                  <th className="px-4 py-3 text-left font-semibold">操作员</th>
                  <th className="px-4 py-3 text-left font-semibold">创建时间</th>
                  <th className="px-4 py-3 text-center font-semibold">状态</th>
                  <th className="px-4 py-3 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((p) => {
                  const status = STATUS_MAP[p.status];
                  const itemCount = p.items.reduce((s, it) => s + it.quantity, 0);
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <span className="tabular text-forest-700 font-medium">{p.orderNo}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{supplierName(p.supplierId)}</td>
                      <td className="px-4 py-3 text-ink-600 tabular">{itemCount} 件 / {p.items.length} 款</td>
                      <td className="px-4 py-3 text-right tabular font-semibold text-amber-600">¥{formatMoney(p.totalAmount, 0)}</td>
                      <td className="px-4 py-3 text-ink-500 text-xs">{p.operator}</td>
                      <td className="px-4 py-3 text-xs text-ink-500" title={formatDate(p.createdAt, true)}>
                        {relativeTime(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/purchases/${p.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-forest-700 hover:bg-forest-50 text-xs font-medium"
                        >
                          <Eye size={13} /> 详情
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
