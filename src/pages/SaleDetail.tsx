import { memo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Check } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { formatMoney, formatDate } from "@/utils/format";
import { I18N, getEmoji } from "@/utils/i18n";
import type { PaymentMethod } from "@/types";

const SaleDetail = memo(function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sales = useStore((s) => s.sales);
  const products = useStore((s) => s.products);

  const sale = sales.find((s) => s.id === id);

  if (!sale) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">销售单不存在</p>
        <Link to="/sales" className="btn-primary mt-4 inline-flex">返回列表</Link>
      </div>
    );
  }

  const profit = sale.items.reduce((sum, it) => {
    const p = products.find((pp) => pp.id === it.productId);
    return sum + (it.salePrice - (p?.costPrice || 0)) * it.quantity;
  }, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`销售单 ${sale.orderNo}`}
        actions={
          <>
            <button onClick={() => navigate(-1)} className="btn-ghost">
              <ArrowLeft size={15} /> 返回
            </button>
            <button onClick={() => window.print()} className="btn-secondary">
              <Printer size={15} /> 打印
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 主区：商品明细 + 收据 */}
        <div className="lg:col-span-2">
          <div className="surface-card overflow-hidden">
            <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between bg-gradient-to-r from-forest-50 to-cream-50">
              <h3 className="display text-sm font-semibold text-forest-800">销售单据</h3>
              <Badge variant="success"><Check size={11} /> 已完成</Badge>
            </div>
            <div className="p-5">
              {/* 收据样式 */}
              <div className="bg-cream-50 rounded-xl2 p-5 font-mono text-sm">
                <div className="text-center pb-3 border-b border-dashed border-ink-200">
                  <h4 className="display text-lg font-bold text-forest-800">禾鲜超市</h4>
                  <p className="text-[11px] text-ink-500 mt-0.5">营业额Receipt</p>
                  <p className="text-[11px] text-ink-500">{formatDate(sale.createdAt, true)}</p>
                </div>
                <div className="py-3 border-b border-dashed border-ink-200 space-y-1 text-xs text-ink-600">
                  <div className="flex justify-between">
                    <span>单号</span>
                    <span className="tabular">{sale.orderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>收银员</span>
                    <span>{sale.cashierName}</span>
                  </div>
                </div>
                <table className="w-full text-xs my-3">
                  <thead>
                    <tr className="text-ink-500 border-b border-dashed border-ink-200">
                      <th className="text-left py-1.5 font-medium">商品</th>
                      <th className="text-center py-1.5 font-medium">数量</th>
                      <th className="text-right py-1.5 font-medium">单价</th>
                      <th className="text-right py-1.5 font-medium">金额</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dashed divide-ink-100">
                    {sale.items.map((it) => (
                      <tr key={it.productId}>
                        <td className="py-1.5 text-ink-800">
                          <div className="flex items-center gap-1.5">
                            <span>{getEmoji(products.find((p) => p.id === it.productId)?.emoji)}</span>
                            <span className="truncate">{it.name}</span>
                          </div>
                        </td>
                        <td className="py-1.5 text-center tabular">×{it.quantity}</td>
                        <td className="py-1.5 text-right tabular">{formatMoney(it.salePrice)}</td>
                        <td className="py-1.5 text-right tabular font-medium">{formatMoney(it.amount, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="space-y-1 pt-2 border-t border-dashed border-ink-200 text-xs">
                  <div className="flex justify-between text-ink-600">
                    <span>商品总额</span>
                    <span className="tabular">¥{formatMoney(sale.totalAmount, 0)}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-signal-orange">
                      <span>优惠</span>
                      <span className="tabular">-¥{formatMoney(sale.discount, 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base text-forest-800 font-bold pt-1 border-t border-dashed border-ink-200">
                    <span>实收</span>
                    <span className="tabular">¥{formatMoney(sale.paid, 0)}</span>
                  </div>
                  <div className="flex justify-between text-ink-500 text-[11px] pt-1">
                    <span>支付方式</span>
                    <span>{I18N.payment[sale.paymentMethod]}</span>
                  </div>
                </div>
                <div className="text-center pt-3 mt-2 border-t border-dashed border-ink-200 text-[11px] text-ink-400">
                  <p>谢谢惠顾，欢迎下次光临 🌿</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 侧栏：单据信息 */}
        <div className="space-y-4">
          <div className="surface-card p-5">
            <h3 className="display text-sm font-semibold text-forest-800 mb-3">单据信息</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">单号</dt>
                <dd className="tabular text-ink-800 font-medium">{sale.orderNo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">收银员</dt>
                <dd className="text-ink-700">{sale.cashierName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">商品数</dt>
                <dd className="tabular text-ink-700">{sale.items.length} 款 · {sale.items.reduce((s, it) => s + it.quantity, 0)} 件</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">支付方式</dt>
                <dd><Badge variant="info">{I18N.payment[sale.paymentMethod]}</Badge></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">销售时间</dt>
                <dd className="text-ink-700 text-xs">{formatDate(sale.createdAt, true)}</dd>
              </div>
            </dl>
          </div>

          <div className="surface-card p-5 bg-gradient-to-br from-forest-50 to-cream-50">
            <h3 className="display text-sm font-semibold text-forest-800 mb-3">本单利润</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">营业收入</span>
                <span className="tabular text-ink-800 font-medium">¥{formatMoney(sale.paid, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">销售成本</span>
                <span className="tabular text-ink-600">¥{formatMoney(sale.paid - profit, 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-ink-200">
                <span className="text-sm text-ink-600 font-medium">毛利</span>
                <span className="display text-xl font-bold text-forest-700 tabular">¥{formatMoney(profit, 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-400">毛利率</span>
                <span className="tabular text-forest-600 font-medium">
                  {sale.paid > 0 ? ((profit / sale.paid) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SaleDetail;
