import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Download, Package, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatMoney } from "@/utils/format";

export default function Products() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const deleteProduct = useStore((s) => s.deleteProduct);

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "low">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (keyword && !p.name.includes(keyword) && !p.barcode.includes(keyword)) return false;
      if (categoryId !== "all" && p.categoryId !== categoryId) return false;
      if (statusFilter === "active" && p.status !== "active") return false;
      if (statusFilter === "inactive" && p.status !== "inactive") return false;
      if (statusFilter === "low" && p.stock > p.safetyStock) return false;
      return true;
    });
  }, [products, keyword, categoryId, statusFilter]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || "未分类";
  const categoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon || "📦";

  const totalValue = filtered.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const lowCount = filtered.filter((p) => p.stock <= p.safetyStock).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="商品档案"
        description={`共 ${products.length} 款商品 · 当前筛选 ${filtered.length} 款`}
        actions={
          <>
            <button className="btn-secondary">
              <Download size={15} /> 导出
            </button>
            <Link to="/products/new" className="btn-primary">
              <Plus size={15} /> 新增商品
            </Link>
          </>
        }
      />

      {/* 筛选器 */}
      <div className="surface-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-100 border border-ink-100 flex-1 min-w-[200px]">
            <Search size={15} className="text-ink-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索商品名称或条码"
              className="bg-transparent outline-none flex-1 text-sm text-ink-800 placeholder:text-ink-300"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-ink-400" />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm text-ink-700 focus:outline-none focus:border-forest-500"
            >
              <option value="all">全部分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive" | "low")}
              className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm text-ink-700 focus:outline-none focus:border-forest-500"
            >
              <option value="all">全部状态</option>
              <option value="active">在售</option>
              <option value="inactive">停售</option>
              <option value="low">低库存</option>
            </select>
          </div>
        </div>
        {/* 概览条 */}
        <div className="mt-3 pt-3 border-t border-ink-100 flex flex-wrap gap-6 text-xs">
          <span className="text-ink-500">库存总值 <span className="tabular text-forest-700 font-semibold ml-1">¥{formatMoney(totalValue, 0)}</span></span>
          <span className="text-ink-500">低库存 <span className="tabular text-signal-orange font-semibold ml-1">{lowCount} 款</span></span>
          <span className="text-ink-500">在售率 <span className="tabular text-forest-700 font-semibold ml-1">{((filtered.filter(p => p.status === "active").length / (filtered.length || 1)) * 100).toFixed(0)}%</span></span>
        </div>
      </div>

      {/* 表格 */}
      <div className="surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <Empty
            icon={<Package size={28} />}
            title="未找到商品"
            description="尝试调整筛选条件或新增商品"
            action={<Link to="/products/new" className="btn-primary"><Plus size={15} /> 新增商品</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">商品</th>
                  <th className="px-4 py-3 text-left font-semibold">条码</th>
                  <th className="px-4 py-3 text-left font-semibold">分类</th>
                  <th className="px-4 py-3 text-right font-semibold">进价</th>
                  <th className="px-4 py-3 text-right font-semibold">售价</th>
                  <th className="px-4 py-3 text-right font-semibold">库存</th>
                  <th className="px-4 py-3 text-center font-semibold">状态</th>
                  <th className="px-4 py-3 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((p) => {
                  const isLow = p.stock <= p.safetyStock;
                  const margin = ((p.salePrice - p.costPrice) / p.salePrice) * 100;
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-cream-100 flex items-center justify-center text-xl shrink-0">
                            {p.emoji}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink-800 truncate">{p.name}</p>
                            <p className="text-xs text-ink-400">{p.spec} · {p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs tabular text-ink-500">{p.barcode}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-ink-600">{categoryIcon(p.categoryId)} {categoryName(p.categoryId)}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular text-ink-600">¥{formatMoney(p.costPrice)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="tabular font-semibold text-forest-700">¥{formatMoney(p.salePrice)}</span>
                        <span className="text-[10px] text-ink-400 ml-1">({margin.toFixed(0)}%)</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`tabular font-medium ${isLow ? "text-signal-rose" : "text-ink-700"}`}>
                          {p.stock}
                        </span>
                        <span className="text-xs text-ink-400 ml-0.5">{p.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.status === "inactive" ? (
                          <Badge variant="neutral">停售</Badge>
                        ) : isLow ? (
                          <Badge variant="warning"><AlertTriangle size={11} /> 低库存</Badge>
                        ) : (
                          <Badge variant="success">在售</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/products/${p.id}`}
                            className="p-1.5 rounded-md text-ink-500 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                            title="编辑"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(p.id)}
                            className="p-1.5 rounded-md text-ink-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 删除确认 */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="确认删除商品"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-ghost">取消</button>
            <button
              onClick={() => {
                if (deleteTarget) deleteProduct(deleteTarget);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
            >
              确认删除
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-700">删除后无法恢复，相关历史单据将保留但商品信息会标记为已删除。是否继续？</p>
      </Modal>
    </div>
  );
}
