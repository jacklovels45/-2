import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Search } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatMoney } from "@/utils/format";
import type { PurchaseItem } from "@/types";

export default function PurchaseEdit() {
  const navigate = useNavigate();
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const currentUser = useStore((s) => s.currentUser);
  const addPurchase = useStore((s) => s.addPurchase);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [note, setNote] = useState("常规补货");
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.status === "active" &&
      (searchKeyword === "" || p.name.includes(searchKeyword) || p.barcode.includes(searchKeyword))
  );

  const addItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (items.some((it) => it.productId === productId)) return;
    setItems((prev) => [
      ...prev,
      {
        productId,
        quantity: 20,
        receivedQuantity: 0,
        costPrice: product.costPrice,
        amount: +(product.costPrice * 20).toFixed(2),
      },
    ]);
  };

  const updateItem = (productId: string, patch: Partial<PurchaseItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.productId !== productId) return it;
        const next = { ...it, ...patch };
        next.amount = +(next.costPrice * next.quantity).toFixed(2);
        return next;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const totalAmount = items.reduce((s, it) => s + it.amount, 0);
  const totalQty = items.reduce((s, it) => s + it.quantity, 0);

  const handleSubmit = (status: "draft" | "pending") => {
    if (!supplierId) {
      alert("请选择供应商");
      return;
    }
    if (items.length === 0) {
      alert("请至少添加一项商品");
      return;
    }
    const id = addPurchase({
      supplierId,
      items,
      totalAmount: +totalAmount.toFixed(2),
      status,
      operator: currentUser.name,
      note,
    });
    navigate(`/purchases/${id}`);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="新建采购订单"
        actions={
          <>
            <button onClick={() => navigate(-1)} className="btn-ghost">
              <ArrowLeft size={15} /> 返回
            </button>
            <button onClick={() => handleSubmit("draft")} className="btn-secondary">
              保存草稿
            </button>
            <button onClick={() => handleSubmit("pending")} className="btn-primary">
              <Save size={15} /> 提交审核
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧：商品选择 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card p-5">
            <h4 className="display text-sm font-semibold text-forest-800 mb-3">商品明细</h4>
            {items.length === 0 ? (
              <div className="text-center text-ink-400 text-sm py-8 border-2 border-dashed border-ink-200 rounded-lg">
                从右侧商品列表选择要采购的商品
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-ink-500 text-xs uppercase tracking-wider border-b border-ink-100">
                      <th className="px-2 py-2 text-left font-semibold">商品</th>
                      <th className="px-2 py-2 text-right font-semibold">采购价</th>
                      <th className="px-2 py-2 text-right font-semibold">数量</th>
                      <th className="px-2 py-2 text-right font-semibold">金额</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {items.map((it) => {
                      const product = products.find((p) => p.id === it.productId);
                      if (!product) return null;
                      return (
                        <tr key={it.productId}>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{product.emoji}</span>
                              <div>
                                <p className="font-medium text-ink-800 text-sm">{product.name}</p>
                                <p className="text-[11px] text-ink-400">{product.spec} · 当前库存 {product.stock}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={it.costPrice}
                              onChange={(e) => updateItem(it.productId, { costPrice: +e.target.value })}
                              className="w-20 px-2 py-1 text-right rounded border border-ink-200 text-sm tabular focus:outline-none focus:border-forest-500"
                            />
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <input
                              type="number"
                              value={it.quantity}
                              onChange={(e) => updateItem(it.productId, { quantity: +e.target.value })}
                              className="w-20 px-2 py-1 text-right rounded border border-ink-200 text-sm tabular focus:outline-none focus:border-forest-500"
                            />
                          </td>
                          <td className="px-2 py-2.5 text-right tabular font-semibold text-amber-600">
                            ¥{formatMoney(it.amount, 0)}
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <button
                              onClick={() => removeItem(it.productId)}
                              className="p-1 rounded text-ink-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 size={14} />
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

          <div className="surface-card p-5">
            <label className="text-xs text-ink-500 font-medium block mb-1.5">采购备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field min-h-[80px] resize-y"
              placeholder="例如：常规补货 / 紧急补货 / 节前备货"
            />
          </div>
        </div>

        {/* 右侧：供应商 + 商品选择 */}
        <div className="space-y-4">
          <div className="surface-card p-5">
            <h4 className="display text-sm font-semibold text-forest-800 mb-3">选择供应商</h4>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="input-field mb-3"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {supplierId && (
              <div className="text-xs text-ink-500 space-y-1">
                {(() => {
                  const s = suppliers.find((x) => x.id === supplierId);
                  if (!s) return null;
                  return (
                    <>
                      <p>联系人：{s.contact}</p>
                      <p>电话：<span className="tabular">{s.phone}</span></p>
                      <p>信用额度：<span className="tabular">¥{formatMoney(s.creditLimit, 0)}</span></p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="surface-card p-5">
            <h4 className="display text-sm font-semibold text-forest-800 mb-3">添加商品</h4>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-cream-100 border border-ink-100 mb-2">
              <Search size={14} className="text-ink-400" />
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索商品"
                className="bg-transparent outline-none flex-1 text-sm"
              />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1 -mx-1">
              {filteredProducts.slice(0, 30).map((p) => {
                const added = items.some((it) => it.productId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addItem(p.id)}
                    disabled={added}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed text-left transition-colors"
                  >
                    <span className="text-base">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-700 truncate">{p.name}</p>
                      <p className="text-[10px] text-ink-400">进价 ¥{formatMoney(p.costPrice)} · 库存 {p.stock}</p>
                    </div>
                    {added ? (
                      <span className="text-[10px] text-forest-600 font-medium">已添加</span>
                    ) : (
                      <Plus size={14} className="text-ink-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 吸底汇总 */}
      <div className="sticky bottom-0 mt-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-t border-ink-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink-500">共 <span className="tabular text-ink-800 font-semibold">{items.length}</span> 款商品</span>
          <span className="text-ink-500">采购 <span className="tabular text-ink-800 font-semibold">{totalQty}</span> 件</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-ink-400">合计金额</p>
            <p className="display text-xl font-bold text-amber-600 tabular">¥{formatMoney(totalAmount, 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
