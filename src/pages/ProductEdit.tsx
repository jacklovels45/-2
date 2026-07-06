import { useState, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Barcode } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/utils/format";
import { getEmoji } from "@/utils/i18n";

const ProductEdit = memo(function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);

  const existing = isEdit ? products.find((p) => p.id === id) : undefined;

  const [form, setForm] = useState({
    name: existing?.name || "",
    barcode: existing?.barcode || generateBarcode(),
    categoryId: existing?.categoryId || categories[0]?.id || "",
    spec: existing?.spec || "",
    unit: existing?.unit || "件",
    costPrice: existing?.costPrice ?? 0,
    salePrice: existing?.salePrice ?? 0,
    stock: existing?.stock ?? 0,
    safetyStock: existing?.safetyStock ?? 10,
    shelfLife: existing?.shelfLife ?? 0,
    status: existing?.status || ("active" as "active" | "inactive"),
    emoji: existing?.emoji || "📦",
  });

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const margin = form.salePrice > 0 ? ((form.salePrice - form.costPrice) / form.salePrice) * 100 : 0;
  const profit = form.salePrice - form.costPrice;

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      alert("请输入商品名称");
      return;
    }
    if (isEdit && existing) {
      updateProduct(existing.id, {
        name: form.name,
        barcode: form.barcode,
        categoryId: form.categoryId,
        spec: form.spec,
        unit: form.unit,
        costPrice: +form.costPrice,
        salePrice: +form.salePrice,
        safetyStock: +form.safetyStock,
        shelfLife: +form.shelfLife || undefined,
        status: form.status,
        emoji: form.emoji,
      });
    } else {
      addProduct({
        barcode: form.barcode,
        name: form.name,
        categoryId: form.categoryId,
        spec: form.spec,
        unit: form.unit,
        costPrice: +form.costPrice,
        salePrice: +form.salePrice,
        stock: +form.stock,
        safetyStock: +form.safetyStock,
        shelfLife: +form.shelfLife || undefined,
        status: form.status,
        emoji: form.emoji,
      });
    }
    navigate("/products");
  }, [form, isEdit, existing, addProduct, updateProduct, navigate]);

  return (
    <div className="animate-fade-up max-w-3xl">
      <PageHeader
        title={isEdit ? "编辑商品" : "新增商品"}
        actions={
          <>
            <button onClick={() => navigate(-1)} className="btn-ghost">
              <ArrowLeft size={15} /> 返回
            </button>
            <button onClick={handleSave} className="btn-primary">
              <Save size={15} /> 保存
            </button>
          </>
        }
      />

      <div className="surface-card p-6 space-y-6">
        {/* 商品图标 */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl2 bg-cream-100 flex items-center justify-center text-3xl">
            {getEmoji(form.emoji)}
          </div>
          <div className="flex-1">
            <label className="text-xs text-ink-500 font-medium">商品图标 (emoji)</label>
            <input
              value={getEmoji(form.emoji)}
              onChange={(e) => set("emoji", e.target.value)}
              className="input-field mt-1"
              placeholder="输入 emoji 表情"
            />
          </div>
        </div>

        {/* 基本信息 */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-3">基本信息</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="商品名称" required>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="input-field"
                placeholder="如：红富士苹果"
              />
            </Field>
            <Field label="商品分类">
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="input-field"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="条码">
              <div className="flex gap-2">
                <input
                  value={form.barcode}
                  onChange={(e) => set("barcode", e.target.value)}
                  className="input-field flex-1 tabular"
                />
                <button
                  onClick={() => set("barcode", generateBarcode())}
                  className="px-3 rounded-lg bg-cream-100 text-ink-600 hover:bg-cream-200"
                  title="重新生成"
                >
                  <Barcode size={16} />
                </button>
              </div>
            </Field>
            <Field label="规格">
              <input
                value={form.spec}
                onChange={(e) => set("spec", e.target.value)}
                className="input-field"
                placeholder="如：精选 1kg"
              />
            </Field>
            <Field label="单位">
              <input
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="input-field"
                placeholder="如：袋 / 瓶 / 个"
              />
            </Field>
            <Field label="保质期 (天)">
              <input
                type="number"
                value={form.shelfLife}
                onChange={(e) => set("shelfLife", +e.target.value)}
                className="input-field tabular"
                placeholder="0 表示长期"
              />
            </Field>
          </div>
        </div>

        {/* 价格库存 */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-3">价格与库存</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="进价 (¥)">
              <input
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => set("costPrice", +e.target.value)}
                className="input-field tabular"
              />
            </Field>
            <Field label="售价 (¥)">
              <input
                type="number"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => set("salePrice", +e.target.value)}
                className="input-field tabular"
              />
            </Field>
            {!isEdit && (
              <Field label="初始库存">
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => set("stock", +e.target.value)}
                  className="input-field tabular"
                />
              </Field>
            )}
            <Field label="安全库存 (低于此值预警)">
              <input
                type="number"
                value={form.safetyStock}
                onChange={(e) => set("safetyStock", +e.target.value)}
                className="input-field tabular"
              />
            </Field>
            <Field label="状态">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as "active" | "inactive")}
                className="input-field"
              >
                <option value="active">在售</option>
                <option value="inactive">停售</option>
              </select>
            </Field>
          </div>

          {/* 利润预览 */}
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-forest-50 to-cream-100 border border-forest-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500 font-medium">毛利率</span>
              <div className="flex items-center gap-2">
                <Badge variant={margin >= 30 ? "success" : margin >= 15 ? "warning" : "danger"}>
                  {margin.toFixed(1)}%
                </Badge>
                <span className="text-sm tabular text-forest-700 font-semibold">
                  单件利润 ¥{formatMoney(profit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductEdit;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-ink-500 font-medium block mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function generateBarcode() {
  return "69" + Math.floor(Math.random() * 10000000).toString().padStart(7, "0") + Math.floor(Math.random() * 100).toString().padStart(2, "0");
}
