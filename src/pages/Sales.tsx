import { useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Receipt, Printer } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { formatMoney, formatDate, relativeTime, isSameDay, daysAgo } from "@/utils/format";
import { I18N } from "@/utils/i18n";
import type { PaymentMethod } from "@/types";

const Sales = memo(function Sales() {
  const sales = useStore((s) => s.sales);

  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<"today" | "7days" | "30days" | "all">("7days");
  const [payFilter, setPayFilter] = useState<"all" | PaymentMethod>("all");

  const filtered = useMemo(() => {
    const today = new Date();
    return sales.filter((s) => {
      if (keyword && !s.orderNo.includes(keyword) && !s.cashierName.includes(keyword)) return false;
      if (payFilter !== "all" && s.paymentMethod !== payFilter) return false;
      if (dateRange === "today" && !isSameDay(s.createdAt, today)) return false;
      if (dateRange === "7days" && new Date(s.createdAt) < daysAgo(7)) return false;
      if (dateRange === "30days" && new Date(s.createdAt) < daysAgo(30)) return false;
      return true;
    });
  }, [sales, keyword, payFilter, dateRange]);

  const totalRevenue = filtered.reduce((s, o) => s + o.paid, 0);
  const totalDiscount = filtered.reduce((s, o) => s + o.discount, 0);
  const avgBasket = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="销售单据"
        description={`共 ${sales.length} 张销售单`}
      />

      <div className="surface-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-100 border border-ink-100 flex-1 min-w-[200px]">
            <Search size={15} className="text-ink-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索单号或收银员"
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
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
          <select
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value as "all" | PaymentMethod)}
            className="px-3 py-2 rounded-lg bg-white border border-ink-200 text-sm focus:outline-none focus:border-forest-500"
          >
            <option value="all">全部支付</option>
            <option value="cash">现金</option>
            <option value="wechat">微信</option>
            <option value="alipay">支付宝</option>
            <option value="card">银行卡</option>
          </select>
        </div>
        <div className="mt-3 pt-3 border-t border-ink-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-ink-400">单据数</p>
            <p className="display text-lg font-semibold text-ink-800 tabular mt-0.5">{filtered.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-400">营业额</p>
            <p className="display text-lg font-semibold text-forest-700 tabular mt-0.5">¥{formatMoney(totalRevenue, 0)}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-400">优惠总额</p>
            <p className="display text-lg font-semibold text-signal-orange tabular mt-0.5">¥{formatMoney(totalDiscount, 0)}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-400">客单价</p>
            <p className="display text-lg font-semibold text-amber-600 tabular mt-0.5">¥{formatMoney(avgBasket, 0)}</p>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <Empty
            icon={<Receipt size={28} />}
            title="未找到销售单"
            description="尝试调整筛选条件"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50 text-ink-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">单号</th>
                  <th className="px-4 py-3 text-left font-semibold">收银员</th>
                  <th className="px-4 py-3 text-left font-semibold">商品数</th>
                  <th className="px-4 py-3 text-right font-semibold">原价</th>
                  <th className="px-4 py-3 text-right font-semibold">优惠</th>
                  <th className="px-4 py-3 text-right font-semibold">实收</th>
                  <th className="px-4 py-3 text-center font-semibold">支付</th>
                  <th className="px-4 py-3 text-left font-semibold">时间</th>
                  <th className="px-4 py-3 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.slice(0, 100).map((s) => (
                  <tr key={s.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <span className="tabular text-forest-700 font-medium">{s.orderNo}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{s.cashierName}</td>
                    <td className="px-4 py-3 text-ink-500 tabular">{s.items.reduce((sum, it) => sum + it.quantity, 0)} 件</td>
                    <td className="px-4 py-3 text-right tabular text-ink-600">¥{formatMoney(s.totalAmount, 0)}</td>
                    <td className="px-4 py-3 text-right tabular text-signal-orange">-{formatMoney(s.discount, 0)}</td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-forest-700">¥{formatMoney(s.paid, 0)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="info">{I18N.payment[s.paymentMethod]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500" title={formatDate(s.createdAt, true)}>
                      {relativeTime(s.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/sales/${s.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-forest-700 hover:bg-forest-50 text-xs font-medium"
                      >
                        <Eye size={13} /> 查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <div className="text-center py-3 text-xs text-ink-400 bg-cream-50">
                仅显示前 100 条，请使用筛选条件精确查询
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default Sales;
