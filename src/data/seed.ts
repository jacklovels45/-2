import type {
  Category,
  InventoryMovement,
  Product,
  PurchaseOrder,
  SaleOrder,
  StockCheck,
  Supplier,
  User,
} from "@/types";
import { createRng, floatIn, intIn, nextId, pick, resetIdCounter } from "@/utils/rng";

// === 基础种子数据 ===

export const seedUsers: User[] = [
  { id: "U_001", name: "陈店长", role: "manager", avatar: "陈" },
  { id: "U_002", name: "李采购", role: "purchaser", avatar: "李" },
  { id: "U_003", name: "王收银", role: "cashier", avatar: "王" },
  { id: "U_004", name: "赵库管", role: "keeper", avatar: "赵" },
  { id: "U_005", name: "孙收银", role: "cashier", avatar: "孙" },
];

export const seedCategories: Category[] = [
  { id: "C_01", name: "生鲜蔬果", parentId: null, icon: "🥬", sort: 1 },
  { id: "C_02", name: "米面粮油", parentId: null, icon: "🌾", sort: 2 },
  { id: "C_03", name: "零食饼干", parentId: null, icon: "🍪", sort: 3 },
  { id: "C_04", name: "酒水饮料", parentId: null, icon: "🥤", sort: 4 },
  { id: "C_05", name: "日用百货", parentId: null, icon: "🧴", sort: 5 },
  { id: "C_06", name: "乳品冷饮", parentId: null, icon: "🥛", sort: 6 },
];

interface ProductSeed {
  name: string;
  spec: string;
  unit: string;
  cost: [number, number];
  sale: [number, number];
  safety: number;
  shelfLife?: number;
  emoji: string;
}

const productSeeds: Record<string, ProductSeed[]> = {
  C_01: [
    { name: "红富士苹果", spec: "精选 1kg", unit: "袋", cost: [4.5, 5.2], sale: [7.9, 9.9], safety: 30, shelfLife: 14, emoji: "🍎" },
    { name: "海南香蕉", spec: "新鲜 500g", unit: "把", cost: [2.0, 2.6], sale: [4.5, 5.9], safety: 25, shelfLife: 7, emoji: "🍌" },
    { name: "山东大白菜", spec: "应季 1颗", unit: "颗", cost: [1.0, 1.4], sale: [2.2, 2.9], safety: 40, shelfLife: 10, emoji: "🥬" },
    { name: "番茄", spec: "沙瓤 500g", unit: "盒", cost: [2.5, 3.2], sale: [4.9, 6.5], safety: 30, shelfLife: 7, emoji: "🍅" },
    { name: "土豆", spec: "黄心 1kg", unit: "袋", cost: [1.8, 2.3], sale: [3.9, 4.9], safety: 35, shelfLife: 30, emoji: "🥔" },
    { name: "散养鸡蛋", spec: "30枚装", unit: "盒", cost: [16, 19], sale: [25, 29], safety: 20, shelfLife: 21, emoji: "🥚" },
  ],
  C_02: [
    { name: "五常大米", spec: "10kg 真空装", unit: "袋", cost: [55, 62], sale: [89, 99], safety: 15, emoji: "🌾" },
    { name: "金龙鱼调和油", spec: "5L 桶装", unit: "桶", cost: [48, 53], sale: [69, 79], safety: 12, emoji: "🛢️" },
    { name: "高筋面粉", spec: "2.5kg 袋装", unit: "袋", cost: [9, 11], sale: [15, 18], safety: 20, emoji: "🌾" },
    { name: "挂面", spec: "500g 龙须面", unit: "把", cost: [2.5, 3.5], sale: [4.9, 6.5], safety: 30, emoji: "🍜" },
    { name: "东北小米", spec: "1kg 袋装", unit: "袋", cost: [7, 9], sale: [12, 15], safety: 18, emoji: "🌾" },
  ],
  C_03: [
    { name: "奥利奥饼干", spec: "原味 116g", unit: "包", cost: [4.5, 5.5], sale: [7.9, 9.9], safety: 40, shelfLife: 270, emoji: "🍪" },
    { name: "乐事薯片", spec: "黄瓜味 75g", unit: "袋", cost: [3.5, 4.2], sale: [6.5, 7.9], safety: 40, shelfLife: 240, emoji: "🥔" },
    { name: "德芙巧克力", spec: "丝滑牛奶 84g", unit: "盒", cost: [9, 11], sale: [15, 18], safety: 25, shelfLife: 360, emoji: "🍫" },
    { name: "旺旺雪饼", spec: "原味 84g", unit: "包", cost: [4.0, 5.0], sale: [7.5, 9.0], safety: 30, shelfLife: 240, emoji: "🍘" },
    { name: "三只松鼠坚果", spec: "每日坚果 750g", unit: "箱", cost: [55, 65], sale: [89, 109], safety: 12, shelfLife: 240, emoji: "🥜" },
    { name: "卫龙辣条", spec: "大面筋 106g", unit: "包", cost: [2.0, 2.5], sale: [3.9, 4.9], safety: 50, shelfLife: 180, emoji: "🌶️" },
  ],
  C_04: [
    { name: "可口可乐", spec: "330ml 罐装", unit: "罐", cost: [1.5, 1.8], sale: [2.8, 3.5], safety: 100, shelfLife: 365, emoji: "🥤" },
    { name: "农夫山泉", spec: "550ml 瓶装", unit: "瓶", cost: [0.8, 1.0], sale: [1.8, 2.2], safety: 200, shelfLife: 730, emoji: "💧" },
    { name: "康师傅冰红茶", spec: "500ml 瓶装", unit: "瓶", cost: [2.0, 2.4], sale: [3.5, 4.0], safety: 80, shelfLife: 365, emoji: "🧃" },
    { name: "青岛啤酒", spec: "500ml 罐装", unit: "罐", cost: [3.5, 4.0], sale: [5.5, 6.5], safety: 60, shelfLife: 365, emoji: "🍺" },
    { name: "红星二锅头", spec: "56度 500ml", unit: "瓶", cost: [12, 14], sale: [19, 23], safety: 30, shelfLife: 9999, emoji: "🍶" },
    { name: "张裕干红", spec: "750ml 红酒", unit: "瓶", cost: [38, 45], sale: [68, 88], safety: 15, shelfLife: 9999, emoji: "🍷" },
  ],
  C_05: [
    { name: "心相印抽纸", spec: "3层 120抽 10包", unit: "提", cost: [12, 14], sale: [19, 23], safety: 30, emoji: "🧻" },
    { name: "佳洁士牙膏", spec: "盐白 180g", unit: "支", cost: [9, 11], sale: [15, 18], safety: 25, emoji: "🪥" },
    { name: "舒肤佳香皂", spec: "纯白 125g", unit: "块", cost: [4.0, 5.0], sale: [7.5, 9.0], safety: 30, emoji: "🧼" },
    { name: "立白洗洁精", spec: "1kg 柠檬", unit: "瓶", cost: [8, 10], sale: [13, 16], safety: 20, emoji: "🧴" },
    { name: "飘柔洗发水", spec: "丝质柔顺 400ml", unit: "瓶", cost: [18, 22], sale: [29, 35], safety: 15, emoji: "🧴" },
  ],
  C_06: [
    { name: "蒙牛纯牛奶", spec: "250ml×16 盒装", unit: "箱", cost: [38, 42], sale: [55, 65], safety: 20, shelfLife: 180, emoji: "🥛" },
    { name: "伊利酸奶", spec: "原味 200g×6", unit: "组", cost: [12, 14], sale: [19, 23], safety: 25, shelfLife: 21, emoji: "🥛" },
    { name: "和路雪冰淇淋", spec: "可爱多 5支", unit: "盒", cost: [15, 18], sale: [25, 29], safety: 15, shelfLife: 365, emoji: "🍦" },
    { name: "安佳黄油", spec: "无盐 250g", unit: "块", cost: [22, 26], sale: [35, 42], safety: 12, shelfLife: 365, emoji: "🧈" },
    { name: "光明奶酪片", spec: "原味 100g", unit: "包", cost: [9, 11], sale: [15, 18], safety: 15, shelfLife: 180, emoji: "🧀" },
  ],
};

const supplierSeeds = [
  { name: "丰禾农产品合作社", contact: "张经理", phone: "138-0001-1234", address: "山东省寿光市蔬菜基地", rating: 5 },
  { name: "金谷粮油批发", contact: "刘经理", phone: "139-0002-2345", address: "河北省石家庄粮油市场", rating: 4 },
  { name: "甜味零食总汇", contact: "孙经理", phone: "137-0003-3456", address: "广东省广州市白云区", rating: 4 },
  { name: "清泉饮品经销", contact: "周经理", phone: "136-0004-4567", address: "浙江省杭州市西湖区", rating: 5 },
  { name: "佳酿酒业直供", contact: "吴经理", phone: "135-0005-5678", address: "四川省成都市锦江区", rating: 4 },
  { name: "洁净日化用品", contact: "郑经理", phone: "134-0006-6789", address: "上海市浦东新区", rating: 5 },
  { name: "鲜优乳品供应", contact: "王经理", phone: "133-0007-7890", address: "内蒙古呼和浩特赛罕区", rating: 4 },
  { name: "环球食品贸易", contact: "李经理", phone: "132-0008-8901", address: "北京市朝阳区国贸", rating: 5 },
];

// === 种子数据生成器 ===

export function generateSeedData() {
  resetIdCounter();
  const rng = createRng(20250705);

  // 供应商
  const suppliers: Supplier[] = supplierSeeds.map((s, idx) => ({
    id: nextId("S"),
    name: s.name,
    contact: s.contact,
    phone: s.phone,
    address: s.address,
    creditLimit: intIn(rng, 50000, 200000),
    status: "active",
    rating: s.rating,
  }));

  // 商品
  const products: Product[] = [];
  const categoryToSupplier: Record<string, string> = {
    C_01: suppliers[0].id,
    C_02: suppliers[1].id,
    C_03: suppliers[2].id,
    C_04: suppliers[3].id,
    C_05: suppliers[5].id,
    C_06: suppliers[6].id,
  };

  Object.entries(productSeeds).forEach(([categoryId, items]) => {
    items.forEach((ps) => {
      const costPrice = +floatIn(rng, ps.cost[0], ps.cost[1]).toFixed(2);
      const salePrice = +floatIn(rng, ps.sale[0], ps.sale[1]).toFixed(2);
      const stock = intIn(rng, 5, 80);
      products.push({
        id: nextId("P"),
        barcode: `69${intIn(rng, 1000000, 9999999)}${intIn(rng, 10, 99)}`,
        name: ps.name,
        categoryId,
        spec: ps.spec,
        unit: ps.unit,
        costPrice,
        salePrice,
        stock,
        safetyStock: ps.safety,
        shelfLife: ps.shelfLife,
        status: "active",
        emoji: ps.emoji,
        createdAt: new Date(Date.now() - intIn(rng, 30, 365) * 86400000).toISOString(),
      });
    });
  });

  // 历史销售单 - 近 30 天约 220 单
  const sales: SaleOrder[] = [];
  const movements: InventoryMovement[] = [];
  const cashiers = seedUsers.filter((u) => u.role === "cashier");
  const now = Date.now();
  const activeProducts = products.filter((p) => p.status === "active");

  for (let dayAgo = 29; dayAgo >= 0; dayAgo--) {
    const dayStart = new Date(now - dayAgo * 86400000);
    dayStart.setHours(8, 0, 0, 0);
    const orderCount = intIn(rng, 5, 10);
    for (let i = 0; i < orderCount; i++) {
      const hour = intIn(rng, 8, 21);
      const min = intIn(rng, 0, 59);
      const createdAt = new Date(dayStart);
      createdAt.setHours(hour, min, 0, 0);
      const itemCount = intIn(rng, 1, 5);
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const p = pick(rng, activeProducts);
        const qty = intIn(rng, 1, 4);
        items.push({
          productId: p.id,
          name: p.name,
          quantity: qty,
          salePrice: p.salePrice,
          amount: +(p.salePrice * qty).toFixed(2),
        });
      }
      const totalAmount = +items.reduce((s, it) => s + it.amount, 0).toFixed(2);
      const discount = rng() > 0.8 ? +(totalAmount * 0.1).toFixed(2) : 0;
      const cashier = pick(rng, cashiers);
      const payMethod = pick(rng, ["cash", "wechat", "alipay", "card"] as const);
      const saleId = nextId("SO");
      sales.push({
        id: saleId,
        orderNo: `SO${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(createdAt.getDate()).padStart(2, "0")}${String(sales.length + 1).padStart(4, "0")}`,
        cashierId: cashier.id,
        cashierName: cashier.name,
        items,
        totalAmount,
        discount,
        paid: totalAmount - discount,
        paymentMethod: payMethod,
        createdAt: createdAt.toISOString(),
      });

      // 同步生成库存出库流水
      items.forEach((it) => {
        const product = products.find((p) => p.id === it.productId);
        if (!product) return;
        const beforeStock = product.stock;
        const afterStock = Math.max(0, beforeStock - it.quantity);
        product.stock = afterStock;
        movements.push({
          id: nextId("M"),
          productId: it.productId,
          productName: product.name,
          type: "out",
          quantity: it.quantity,
          beforeStock,
          afterStock,
          refType: "sale",
          refId: saleId,
          operator: cashier.name,
          createdAt: createdAt.toISOString(),
        });
      });
    }
  }

  // 历史采购单 - 近 30 天约 18 单（补充库存）
  const purchases: PurchaseOrder[] = [];
  const purchaser = seedUsers.find((u) => u.role === "purchaser")!;
  const keeper = seedUsers.find((u) => u.role === "keeper")!;

  for (let i = 0; i < 18; i++) {
    const dayAgo = intIn(rng, 1, 30);
    const createdAt = new Date(now - dayAgo * 86400000);
    createdAt.setHours(intIn(rng, 9, 17), intIn(rng, 0, 59), 0, 0);
    // 选择一个供应商，采购它的几个商品
    const supplier = pick(rng, suppliers);
    const supplierProducts = products.filter((p) =>
      Object.values(categoryToSupplier).includes(supplier.id) &&
      p.status === "active"
    );
    if (supplierProducts.length === 0) continue;
    const itemCount = Math.min(intIn(rng, 2, 4), supplierProducts.length);
    const shuffled = [...supplierProducts].sort(() => rng() - 0.5);
    const items = [];
    for (let j = 0; j < itemCount; j++) {
      const p = shuffled[j];
      const qty = intIn(rng, 20, 100);
      items.push({
        productId: p.id,
        quantity: qty,
        receivedQuantity: qty,
        costPrice: p.costPrice,
        amount: +(p.costPrice * qty).toFixed(2),
      });
    }
    const totalAmount = +items.reduce((s, it) => s + it.amount, 0).toFixed(2);
    const purchaseId = nextId("PO");
    const isReceived = rng() > 0.2;
    purchases.push({
      id: purchaseId,
      orderNo: `PO${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(createdAt.getDate()).padStart(2, "0")}${String(i + 1).padStart(4, "0")}`,
      supplierId: supplier.id,
      items,
      totalAmount,
      status: isReceived ? "received" : pick(rng, ["pending", "approved"] as const),
      createdAt: createdAt.toISOString(),
      receivedAt: isReceived ? new Date(createdAt.getTime() + 86400000).toISOString() : undefined,
      operator: purchaser.name,
      note: "常规补货",
    });

    // 入库流水（仅已收货）
    if (isReceived) {
      const receivedAt = new Date(createdAt.getTime() + 86400000);
      items.forEach((it) => {
        const product = products.find((p) => p.id === it.productId);
        if (!product) return;
        const beforeStock = product.stock;
        const afterStock = beforeStock + it.receivedQuantity;
        product.stock = afterStock;
        movements.push({
          id: nextId("M"),
          productId: it.productId,
          productName: product.name,
          type: "in",
          quantity: it.receivedQuantity,
          beforeStock,
          afterStock,
          refType: "purchase",
          refId: purchaseId,
          operator: keeper.name,
          createdAt: receivedAt.toISOString(),
          note: "采购入库",
        });
      });
    }
  }

  // 库存盘点单 - 近 7 天 2 单
  const stockChecks: StockCheck[] = [];
  for (let i = 0; i < 2; i++) {
    const dayAgo = i === 0 ? 1 : 5;
    const createdAt = new Date(now - dayAgo * 86400000);
    createdAt.setHours(14, 0, 0, 0);
    const checkItems = activeProducts.slice(0, 8).map((p) => {
      const realQty = Math.max(0, p.stock + intIn(rng, -3, 3));
      return {
        productId: p.id,
        productName: p.name,
        bookQty: p.stock,
        realQty,
        diff: realQty - p.stock,
      };
    });
    stockChecks.push({
      id: nextId("SC"),
      checkNo: `SC${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(createdAt.getDate()).padStart(2, "0")}${String(i + 1).padStart(2, "0")}`,
      scope: "all",
      items: checkItems,
      status: "completed",
      createdAt: createdAt.toISOString(),
      completedAt: new Date(createdAt.getTime() + 3600000).toISOString(),
      operator: keeper.name,
    });
  }

  // 按时间倒序排序
  sales.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  purchases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  movements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    users: seedUsers,
    categories: seedCategories,
    suppliers,
    products,
    purchases,
    sales,
    movements,
    stockChecks,
  };
}
