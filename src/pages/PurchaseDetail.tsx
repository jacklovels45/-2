import { useState, useCallback, memo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Truck, X, Save, RotateCcw } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatMoney, formatDate } from "@/utils/format";
import { I18N, getEmoji } from "@/utils/i18n";
import type { OrderStatus } from "@/types";

const STATUS_MAP: Record<OrderStatus, { label: string; variant: "neutral" | "warning" | "info" | "success" | "danger" }> = {
  draft: { label: I18N.status.draft, variant: "neutral" },
  pending: { label: I18N.status.pending, variant: "warning" },
  approved: { label: I18N.status.approved, variant: "info" },
  received: { label: I18N.status.received, variant: "success" },
  cancelled: { label: I18N.status.cancelled, variant: "danger" },
};

const PurchaseDetail = memo(function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const purchases = useStore((s) => s.purchases);
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const movements = useStore((s) => s.movements);
  const updatePurchaseStatus = useStore((s) => s.updatePurchaseStatus);
  const receivePurchase = useStore((s) => s.receivePurchase);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});

  const purchase = purchases.find((p) => p.id === id);

  if (!purchase) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">采购单不存在</p>
        <Link to="/purchases" className="btn-primary mt-4 inline-flex">返回列表</Link>
      </div>
    );
  }

  const supplier = suppliers.find((s) => s.id === purchase.supplierId);
  const status = STATUS_MAP[purchase.status];
  const relatedMovements = movements.filter((m) => m.refId === purchase.id);

  const openReceive = () => {
    const init: Record<string, number> = {};
    purchase.items.forEach((it) => {
      init[it.productId] = it.quantity;
    });
    setReceivedQtys(init);
    setReceiveOpen(true);
  };

  const handleReceive = () => {
    receivePurchase(purchase.id, receivedQtys);
    setReceiveOpen(false);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`采购单 ${purchase.orderNo}`}
        actions={
          <>
            <button onClick={() => navigate(-1)} className="btn-ghost">
              <ArrowLeft size={15} /> 返回
            </button>
            {purchase.status === "pending" && (
              <>
                <button
                  onClick={() => updatePurchaseStatus(purchase.id, "cancelled")}
                  className="btn-ghost text-rose-600 hover:bg-rose-50"
                >
                  <X size={15} /> 取消
                </button>
                <button
                  onClick={() => updatePurchaseStatus(purchase.id, "approved")}
                  className="btn-secondary"
                >
                  <Check size={15} /> 审核通过
                </button>
              </>
            )}
            {purchase.status === "approved" && (
              <button onClick={openReceive} className="btn-primary">
                <Truck size={15} /> 确认入库
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 主区：商品明细 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card overflow-hidden">
            <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
              <h3 className="display text-sm font-semibold text-forest-800">商品明细</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">商品</th>
                    <th className="px-4 py-3 text-right font-semibold">采购价</th>
                    <th className="px-4 py-3 text-right font-semibold">订货数</th>
                    {purchase.status === "received" && (
                      <th className="px-4 py-3 text-right font-semibold">实收数</th>
                    )}
                    <th className="px-4 py-3 text-right font-semibold">金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {purchase.items.map((it) => {
                    const product = products.find((p) => p.id === it.productId);
                    return (
                      <tr key={it.productId} className="table-row-hover">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getEmoji(product?.emoji)}</span>
                            <div>
                              <p className="font-medium text-ink-800">{product?.name || "已删除"}</p>
                              <p className="text-[11px] text-ink-400">{product?.spec}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular text-ink-600">¥{formatMoney(it.costPrice)}</td>
                        <td className="px-4 py-3 text-right tabular font-medium text-ink-700">{it.quantity}</td>
                        {purchase.status === "received" && (
                          <td className="px-4 py-3 text-right tabular font-semibold text-forest-700">{it.receivedQuantity}</td>
                        )}
                        <td className="px-4 py-3 text-right tabular font-semibold text-amber-600">¥{formatMoney(it.amount, 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-cream-50 border-t-2 border-ink-100">
                    <td colSpan={purchase.status === "received" ? 4 : 3} className="px-4 py-3 text-right text-ink-500 font-medium">合计</td>
                    <td className="px-4 py-3 text-right display text-lg font-bold text-amber-600 tabular">¥{formatMoney(purchase.totalAmount, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 入库流水 */}
          {relatedMovements.length > 0 && (
            <div className="surface-card p-5">
              <h3 className="display text-sm font-semibold text-forest-800 mb-3">入库流水</h3>
              <div className="space-y-2">
                {relatedMovements.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 text-sm py-1.5">
                    <span className="text-base">{getEmoji(products.find((p) => p.id === m.productId)?.emoji)}</span>
                    <span className="flex-1 text-ink-700">{m.productName}</span>
                    <span className="text-xs text-ink-400">{formatDate(m.createdAt, true)}</span>
                    <Badge variant="success">+{m.quantity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 侧栏：单据信息 */}
        <div className="space-y-4">
          <div className="surface-card p-5">
            <h3 className="display text-sm font-semibold text-forest-800 mb-3">单据信息</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">单号</dt>
                <dd className="tabular text-ink-800 font-medium">{purchase.orderNo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">状态</dt>
                <dd><Badge variant={status.variant}>{status.label}</Badge></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">供应商</dt>
                <dd className="text-ink-800 font-medium">{supplier?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">操作员</dt>
                <dd className="text-ink-700">{purchase.operator}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">创建时间</dt>
                <dd className="text-ink-700 text-xs">{formatDate(purchase.createdAt, true)}</dd>
              </div>
              {purchase.receivedAt && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">入库时间</dt>
                  <dd className="text-forest-700 text-xs">{formatDate(purchase.receivedAt, true)}</dd>
                </div>
              )}
            </dl>
          </div>

          {supplier && (
            <div className="surface-card p-5">
              <h3 className="display text-sm font-semibold text-forest-800 mb-3">供应商信息</h3>
              <div className="space-y-1.5 text-xs text-ink-600">
                <p>联系人：{supplier.contact}</p>
                <p>电话：<span className="tabular">{supplier.phone}</span></p>
                <p>地址：{supplier.address}</p>
              </div>
              <Link to="/suppliers" className="text-xs text-forest-600 hover:underline mt-2 inline-block">查看全部供应商 →</Link>
            </div>
          )}

          {purchase.note && (
            <div className="surface-card p-5">
              <h3 className="display text-sm font-semibold text-forest-800 mb-2">备注</h3>
              <p className="text-sm text-ink-600">{purchase.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* 入库确认 Modal */}
      <Modal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        title="确认入库实收数量"
        size="lg"
        footer={
          <>
            <button onClick={() => setReceiveOpen(false)} className="btn-ghost">取消</button>
            <button onClick={handleReceive} className="btn-primary">
              <Save size={15} /> 确认入库
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-500">逐项确认实收数量，入库后库存将自动增加。</p>
          <div className="space-y-2">
            {purchase.items.map((it) => {
              const product = products.find((p) => p.id === it.productId);
              return (
                <div key={it.productId} className="flex items-center gap-3 p-3 rounded-lg bg-cream-50 border border-ink-100">
                  <span className="text-lg">{getEmoji(product?.emoji)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{product?.name}</p>
                    <p className="text-[11px] text-ink-400">订货 {it.quantity} 件 · 单价 ¥{formatMoney(it.costPrice)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setReceivedQtys((q) => ({ ...q, [it.productId]: (q[it.productId] || 0) - 1 }))}
                      className="w-6 h-6 rounded bg-white border border-ink-200 text-ink-500 hover:bg-cream-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={receivedQtys[it.productId] ?? 0}
                      onChange={(e) => setReceivedQtys((q) => ({ ...q, [it.productId]: +e.target.value }))}
                      className="w-16 px-2 py-1 text-center rounded border border-ink-200 text-sm tabular focus:outline-none focus:border-forest-500"
                    />
                    <button
                      onClick={() => setReceivedQtys((q) => ({ ...q, [it.productId]: (q[it.productId] || 0) + 1 }))}
                      className="w-6 h-6 rounded bg-white border border-ink-200 text-ink-500 hover:bg-cream-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => setReceivedQtys((q) => ({ ...q, [it.productId]: it.quantity }))}
                    className="text-[11px] px-2 py-1 rounded bg-forest-50 text-forest-700 hover:bg-forest-100"
                    title="按订货数量填充"
                  >
                    <RotateCcw size={11} className="inline" /> 全收
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default PurchaseDetail;
