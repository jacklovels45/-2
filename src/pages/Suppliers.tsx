import { useState } from "react";
import { Plus, Phone, MapPin, Star, Pencil, Trash2, Truck } from "lucide-react";
import { useStore } from "@/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, Empty } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatMoney } from "@/utils/format";
import type { Supplier } from "@/types";

const EMPTY_FORM = {
  name: "",
  contact: "",
  phone: "",
  address: "",
  creditLimit: 100000,
  rating: 4,
};

export default function Suppliers() {
  const suppliers = useStore((s) => s.suppliers);
  const purchases = useStore((s) => s.purchases);
  const addSupplier = useStore((s) => s.addSupplier);
  const updateSupplier = useStore((s) => s.updateSupplier);
  const deleteSupplier = useStore((s) => s.deleteSupplier);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name,
      contact: s.contact,
      phone: s.phone,
      address: s.address,
      creditLimit: s.creditLimit,
      rating: s.rating,
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("请输入供应商名称");
      return;
    }
    if (editing) {
      updateSupplier(editing.id, form);
    } else {
      addSupplier({ ...form, status: "active" });
    }
    setFormOpen(false);
  };

  const supplierStats = (id: string) => {
    const list = purchases.filter((p) => p.supplierId === id);
    const total = list.reduce((s, p) => s + p.totalAmount, 0);
    const completed = list.filter((p) => p.status === "received").length;
    return { count: list.length, total, completed };
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="供应商档案"
        description={`共 ${suppliers.length} 家合作供应商`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> 新增供应商
          </button>
        }
      />

      {suppliers.length === 0 ? (
        <div className="surface-card">
          <Empty
            icon={<Truck size={28} />}
            title="还没有供应商"
            description="新增第一家供应商开始采购管理"
            action={<button onClick={openCreate} className="btn-primary"><Plus size={15} /> 新增供应商</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => {
            const stats = supplierStats(s.id);
            return (
              <div key={s.id} className="surface-card surface-card-hover p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl2 bg-gradient-to-br from-forest-700 to-forest-900 flex items-center justify-center text-amber-300 font-bold text-lg shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="display font-semibold text-forest-800 leading-tight">{s.name}</h3>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={i < s.rating ? "text-amber-400 fill-amber-400" : "text-ink-200"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant={s.status === "active" ? "success" : "neutral"}>
                    {s.status === "active" ? "合作中" : "已停用"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-ink-600">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-ink-400" />
                    <span className="tabular">{s.phone}</span>
                    <span className="text-ink-300">·</span>
                    <span>{s.contact}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-ink-400 mt-0.5 shrink-0" />
                    <span>{s.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-ink-400">采购单</p>
                    <p className="display text-base font-semibold text-ink-800 tabular">{stats.count}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-400">已入库</p>
                    <p className="display text-base font-semibold text-forest-700 tabular">{stats.completed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-400">采购总额</p>
                    <p className="display text-base font-semibold text-amber-600 tabular">¥{formatMoney(stats.total, 0)}</p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-md text-ink-500 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s.id)}
                    className="p-1.5 rounded-md text-ink-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "编辑供应商" : "新增供应商"}
        footer={
          <>
            <button onClick={() => setFormOpen(false)} className="btn-ghost">取消</button>
            <button onClick={handleSubmit} className="btn-primary">保存</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-ink-500 font-medium block mb-1.5">供应商名称 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="如：丰禾农产品合作社"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-500 font-medium block mb-1.5">联系人</label>
              <input
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                className="input-field"
                placeholder="张经理"
              />
            </div>
            <div>
              <label className="text-xs text-ink-500 font-medium block mb-1.5">电话</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="input-field tabular"
                placeholder="138-0000-0000"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-500 font-medium block mb-1.5">地址</label>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="input-field"
              placeholder="详细地址"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-500 font-medium block mb-1.5">信用额度 (¥)</label>
              <input
                type="number"
                value={form.creditLimit}
                onChange={(e) => setForm((f) => ({ ...f, creditLimit: +e.target.value }))}
                className="input-field tabular"
              />
            </div>
            <div>
              <label className="text-xs text-ink-500 font-medium block mb-1.5">评分</label>
              <div className="flex items-center gap-1 h-[38px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setForm((f) => ({ ...f, rating: i + 1 }))} className="p-0.5">
                    <Star
                      size={22}
                      className={i < form.rating ? "text-amber-400 fill-amber-400" : "text-ink-200"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="确认删除供应商"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-ghost">取消</button>
            <button
              onClick={() => {
                if (deleteTarget) deleteSupplier(deleteTarget);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
            >
              确认删除
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-700">删除后历史采购单据仍保留，但供应商信息将不可恢复。是否继续？</p>
      </Modal>
    </div>
  );
}
