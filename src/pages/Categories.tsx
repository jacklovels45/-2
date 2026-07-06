import { memo } from "react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Leaf } from "lucide-react";
import { getEmoji } from "@/utils/i18n";

const Categories = memo(function Categories() {
  const categories = useStore((s) => s.categories);
  const products = useStore((s) => s.products);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="商品分类"
        description="管理商品的多级分类，便于检索与统计"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => {
          const productCount = products.filter((p) => p.categoryId === c.id).length;
          const stockValue = products
            .filter((p) => p.categoryId === c.id)
            .reduce((s, p) => s + p.stock * p.costPrice, 0);
          const lowCount = products.filter((p) => p.categoryId === c.id && p.stock <= p.safetyStock).length;

          return (
            <div key={c.id} className="surface-card surface-card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl2 bg-cream-100 flex items-center justify-center text-2xl">
                  {getEmoji(c.icon)}
                </div>
                {lowCount > 0 && (
                  <Badge variant="warning">{lowCount} 款低库存</Badge>
                )}
              </div>
              <h3 className="display text-lg font-semibold text-forest-800 mt-3">{c.name}</h3>
              <p className="text-xs text-ink-400 mt-1">排序 #{c.sort}</p>
              <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-ink-400">商品数</p>
                  <p className="display text-xl font-semibold text-ink-800 tabular mt-0.5">{productCount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-400">库存总值</p>
                  <p className="display text-xl font-semibold text-forest-700 tabular mt-0.5">¥{(stockValue / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </div>
          );
        })}
        <button className="surface-card p-5 border-dashed border-2 border-ink-200 hover:border-forest-400 hover:bg-forest-50/40 transition-colors flex flex-col items-center justify-center min-h-[180px] text-ink-400 hover:text-forest-600">
          <Leaf size={28} className="mb-2" />
          <span className="text-sm font-medium">新增分类</span>
          <span className="text-xs text-ink-300 mt-1">即将上线</span>
        </button>
      </div>
    </div>
  );
});

export default Categories;
