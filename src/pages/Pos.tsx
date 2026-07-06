import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Banknote,
  Smartphone,
  CreditCard,
  Wallet,
  Check,
  X,
  ScanLine,
} from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { formatMoney } from "@/utils/format";
import type { PaymentMethod, SaleItem } from "@/types";
import { cn } from "@/utils/cn";

interface CartItem extends SaleItem {
  stock: number;
  emoji: string;
}

export default function Pos() {
  const navigate = useNavigate();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const createSale = useStore((s) => s.createSale);

  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wechat");
  const [paidAmount, setPaidAmount] = useState(0);
  const [lastOrderNo, setLastOrderNo] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== "active") return false;
      if (activeCat !== "all" && p.categoryId !== activeCat) return false;
      if (keyword && !p.name.includes(keyword) && !p.barcode.includes(keyword)) return false;
      return true;
    });
  }, [products, activeCat, keyword]);

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (product.stock <= 0) {
      alert("该商品库存不足");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((it) => it.productId === productId);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("已达库存上限");
          return prev;
        }
        return prev.map((it) =>
          it.productId === productId
            ? {
                ...it,
                quantity: it.quantity + 1,
                amount: +((it.quantity + 1) * it.salePrice).toFixed(2),
              }
            : it
        );
      }
      return [
        ...prev,
        {
          productId,
          name: product.name,
          quantity: 1,
          salePrice: product.salePrice,
          amount: +product.salePrice.toFixed(2),
          stock: product.stock,
          emoji: product.emoji,
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.productId !== productId) return it;
          const nextQty = it.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > it.stock) {
            alert("已达库存上限");
            return it;
          }
          return { ...it, quantity: nextQty, amount: +(nextQty * it.salePrice).toFixed(2) };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const totalAmount = cart.reduce((s, it) => s + it.amount, 0);
  const finalAmount = Math.max(0, totalAmount - discount);
  const change = Math.max(0, paidAmount - finalAmount);

  const openPay = () => {
    if (cart.length === 0) {
      alert("购物车为空");
      return;
    }
    setPaidAmount(finalAmount);
    setPayOpen(true);
  };

  const handleConfirmPay = () => {
    if (paymentMethod === "cash" && paidAmount < finalAmount) {
      alert("实收金额不足");
      return;
    }
    const id = createSale(cart, discount, paymentMethod, paymentMethod === "cash" ? paidAmount : finalAmount);
    setLastOrderNo(id);
    setPayOpen(false);
    setCart([]);
    setDiscount(0);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="收银开单"
        description="扫描或点击商品加入购物车"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 左侧：商品网格 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="surface-card p-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-100 border border-ink-100 mb-3">
              <ScanLine size={16} className="text-forest-600" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="扫码或搜索商品名称/条码"
                className="bg-transparent outline-none flex-1 text-sm"
                autoFocus
              />
              {keyword && (
                <button onClick={() => setKeyword("")} className="text-ink-400 hover:text-ink-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
                全部
              </CatChip>
              {categories.map((c) => (
                <CatChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
                  {c.icon} {c.name}
                </CatChip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.slice(0, 60).map((p) => {
              const isLow = p.stock <= p.safetyStock;
              const isOut = p.stock <= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p.id)}
                  disabled={isOut}
                  className={cn(
                    "surface-card surface-card-hover p-3 text-left transition-all relative overflow-hidden",
                    isOut && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="aspect-square rounded-lg bg-cream-100 flex items-center justify-center text-4xl mb-2">
                    {p.emoji}
                  </div>
                  <p className="text-sm font-medium text-ink-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-400 truncate">{p.spec}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="tabular text-forest-700 font-semibold">¥{formatMoney(p.salePrice)}</span>
                    <span className={cn(
                      "text-[10px] tabular",
                      isOut ? "text-signal-rose" : isLow ? "text-signal-orange" : "text-ink-400"
                    )}>
                      {p.stock}
                    </span>
                  </div>
                  {isOut && (
                    <div className="absolute inset-0 bg-cream-200/60 flex items-center justify-center">
                      <span className="text-xs text-rose-700 font-bold">缺货</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="surface-card text-center py-12 text-ink-400 text-sm">
              未找到匹配的商品
            </div>
          )}
        </div>

        {/* 右侧：购物车 */}
        <div className="lg:col-span-2">
          <div className="surface-card sticky top-20 flex flex-col max-h-[calc(100vh-120px)]">
            <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
              <h3 className="display text-sm font-semibold text-forest-800 flex items-center gap-2">
                <ShoppingCart size={16} /> 购物车
                {cart.length > 0 && (
                  <span className="badge bg-forest-100 text-forest-700">{cart.length}</span>
                )}
              </h3>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs text-ink-400 hover:text-rose-600">
                  清空
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-ink-400">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">购物车空空如也</p>
                  <p className="text-xs mt-1">从左侧选择商品开始结账</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((it) => (
                    <div key={it.productId} className="flex items-center gap-2 p-2 rounded-lg bg-cream-50 border border-ink-100 animate-scale-in">
                      <span className="text-xl">{it.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">{it.name}</p>
                        <p className="text-[11px] text-ink-400 tabular">¥{formatMoney(it.salePrice)} × {it.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(it.productId, -1)}
                          className="w-6 h-6 rounded bg-white border border-ink-200 text-ink-500 hover:bg-cream-100 flex items-center justify-center"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm tabular font-medium">{it.quantity}</span>
                        <button
                          onClick={() => updateQty(it.productId, 1)}
                          className="w-6 h-6 rounded bg-white border border-ink-200 text-ink-500 hover:bg-cream-100 flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="w-16 text-right tabular text-sm font-semibold text-forest-700">¥{formatMoney(it.amount, 0)}</span>
                      <button
                        onClick={() => removeItem(it.productId)}
                        className="p-1 text-ink-300 hover:text-rose-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 结账栏 */}
            {cart.length > 0 && (
              <div className="border-t border-ink-100 p-4 space-y-3 bg-cream-50/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">商品总额</span>
                  <span className="tabular text-ink-800 font-medium">¥{formatMoney(totalAmount, 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">优惠/折扣</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, +e.target.value))}
                    className="w-24 px-2 py-1 text-right rounded border border-ink-200 text-sm tabular focus:outline-none focus:border-forest-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-ink-100">
                  <span className="text-sm text-ink-600 font-medium">应收</span>
                  <span className="display text-2xl font-bold text-amber-600 tabular">¥{formatMoney(finalAmount, 0)}</span>
                </div>
                <button
                  onClick={openPay}
                  className="w-full py-3 rounded-lg bg-forest-800 text-cream-100 font-semibold flex items-center justify-center gap-2 hover:bg-forest-700 hover:shadow-cardHover transition-all active:scale-[0.98]"
                >
                  <Wallet size={18} /> 结算
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 支付 Modal */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="确认支付"
        size="md"
        footer={
          <>
            <button onClick={() => setPayOpen(false)} className="btn-ghost">取消</button>
            <button onClick={handleConfirmPay} className="btn-primary">
              <Check size={15} /> 确认收款
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="text-center py-4 bg-gradient-to-br from-forest-50 to-cream-100 rounded-xl2">
            <p className="text-xs text-ink-500">应收金额</p>
            <p className="display text-4xl font-bold text-forest-800 tabular mt-1">¥{formatMoney(finalAmount, 0)}</p>
            <p className="text-xs text-ink-400 mt-1">共 {cart.length} 款 · {cart.reduce((s, it) => s + it.quantity, 0)} 件</p>
          </div>

          <div>
            <p className="text-xs text-ink-500 font-medium mb-2">支付方式</p>
            <div className="grid grid-cols-4 gap-2">
              <PayMethodBtn active={paymentMethod === "wechat"} onClick={() => setPaymentMethod("wechat")} icon={<Smartphone size={18} />} label="微信" />
              <PayMethodBtn active={paymentMethod === "alipay"} onClick={() => setPaymentMethod("alipay")} icon={<Smartphone size={18} />} label="支付宝" />
              <PayMethodBtn active={paymentMethod === "card"} onClick={() => setPaymentMethod("card")} icon={<CreditCard size={18} />} label="银行卡" />
              <PayMethodBtn active={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")} icon={<Banknote size={18} />} label="现金" />
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div>
              <p className="text-xs text-ink-500 font-medium mb-2">实收金额</p>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(+e.target.value)}
                className="input-field text-2xl tabular text-center font-bold"
              />
              <div className="flex gap-2 mt-2">
                {[finalAmount, Math.ceil(finalAmount / 10) * 10, Math.ceil(finalAmount / 100) * 100, 200].map((amt, i) => (
                  <button
                    key={i}
                    onClick={() => setPaidAmount(amt)}
                    className="flex-1 py-1.5 rounded-md bg-cream-100 text-xs text-ink-600 hover:bg-cream-200 tabular"
                  >
                    ¥{amt}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-ink-500">找零</span>
                <span className="tabular font-semibold text-forest-700">¥{formatMoney(change, 0)}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 支付成功 */}
      <Modal
        open={lastOrderNo !== null}
        onClose={() => {
          const id = lastOrderNo;
          setLastOrderNo(null);
          if (id) navigate(`/sales/${id}`);
        }}
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setLastOrderNo(null); }}
              className="btn-ghost"
            >
              继续收银
            </button>
            <button
              onClick={() => {
                const id = lastOrderNo;
                setLastOrderNo(null);
                if (id) navigate(`/sales/${id}`);
              }}
              className="btn-primary"
            >
              查看单据
            </button>
          </>
        }
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-3">
            <Check size={32} className="text-forest-600" strokeWidth={2.5} />
          </div>
          <h3 className="display text-xl font-semibold text-forest-800">收款成功</h3>
          <p className="text-sm text-ink-500 mt-1">订单已生成，库存已扣减</p>
        </div>
      </Modal>
    </div>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        active
          ? "bg-forest-800 text-cream-100 shadow-sm"
          : "bg-cream-100 text-ink-600 hover:bg-cream-200"
      )}
    >
      {children}
    </button>
  );
}

function PayMethodBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition-all",
        active
          ? "border-forest-600 bg-forest-50 text-forest-700"
          : "border-ink-100 text-ink-500 hover:border-ink-200"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
