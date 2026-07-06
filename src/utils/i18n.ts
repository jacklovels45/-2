// 国际化配置 - 集中管理所有硬编码中文文本

export const I18N = {
  app: {
    name: "禾鲜超市",
    subtitle: "进销存管理系统",
  },

  roles: {
    manager: "店长",
    purchaser: "采购员",
    cashier: "收银员",
    keeper: "库管员",
  } as Record<string, string>,

  status: {
    draft: "草稿",
    pending: "待审核",
    approved: "已审核",
    received: "已入库",
    cancelled: "已取消",
    active: "在售",
    inactive: "停售",
    counting: "盘点中",
    completed: "已完成",
  } as Record<string, string>,

  payment: {
    cash: "现金",
    wechat: "微信",
    alipay: "支付宝",
    card: "银行卡",
  } as Record<string, string>,

  movement: {
    in: "入库",
    out: "出库",
    adjust: "调整",
    purchase: "采购入库",
    sale: "销售出库",
    return: "退货",
    check: "盘点调整",
  } as Record<string, string>,

  weekDays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],

  greeting: "欢迎回来",
  online: "在线",
  resetData: "重置全部数据？",
  confirm: "确定",
  cancel: "取消",
  save: "保存",
  delete: "删除",
  confirmDelete: "确认删除",
  print: "打印",
  export: "导出",
  search: "搜索",
  filter: "筛选",
  all: "全部",
  view: "查看",
  edit: "编辑",
  back: "返回",
  add: "新增",
  submit: "提交审核",
  saveDraft: "保存草稿",
  confirmReceive: "确认入库",
  confirmPay: "确认收款",
  paySuccess: "收款成功",
  continueShopping: "继续收银",
  viewOrder: "查看单据",
  emptyCart: "购物车空空如也",
  emptyCartHint: "从左侧选择商品开始结账",
  noData: "暂无数据",
  outOfStock: "缺货",
  lowStock: "低库存",
  productCount: "款",
  pieceCount: "件",
  totalAmount: "合计金额",
  paidAmount: "实收",
  change: "找零",
  discount: "优惠/折扣",
  thankYou: "谢谢惠顾，欢迎下次光临",
};

export const DEFAULT_EMOJI = "📦";
export const DEFAULT_AVATAR = "👤";

export function getEmoji(emoji: string | undefined | null): string {
  return emoji && emoji.trim().length > 0 ? emoji : DEFAULT_EMOJI;
}