import { initFeedbackUI, showSpinner, hideSpinner, showToast } from './src/ui-feedback.js';
import { validateForm } from './src/validation.js';
import { generateCustomerCode, generateSupplierCode, createCustomer, createSupplier, findCustomerByCode, findSupplierByCode, filterCustomersByName } from './src/customer.js';
import { generateProductCode, createProduct, findProductByCode } from './src/product.js';
import { createUser, findUserById } from './src/user.js';
import { generateProjectCode, createProject, findProjectByCode, filterProjectsByName, filterProjectsByStatus } from './src/project.js';
import { generateQuotationCode, createQuotation, findQuotationByCode, addDetailLine, removeDetailLine, updateDetailLine, createRevision, approveQuotation, rejectQuotation, returnQuotationToDraft, requiresPresidentApproval, buildQuotationPrintHtml } from './src/quotation.js';
import { generateOrderCode, createOrderFromQuotation, addAttachment, removeAttachment, findOrderByCode, updateOrderStatus, markAsBillingTarget, applyPayment, validateOrderApprovalSubmit, submitOrderApproval, approveOrder, rejectOrder, returnOrderToDraft, completeContractProcedure } from './src/order.js';
import { generatePurchaseOrderCode, createPurchaseOrderFromOrder, createPurchaseOrder, calcTotalsFromDetails, findPurchaseOrderByCode, updatePurchaseOrderStatus, buildPurchaseOrderPrintHtml, submitPurchaseOrderApproval, approvePurchaseOrder } from './src/purchaseOrder.js';
import { generateDeliveryCode, createDelivery, acceptDelivery, rejectDelivery, isFullyDelivered } from './src/delivery.js';
import { generateInvoiceCode, createInvoice, findBillableOrders, createInvoiceFromOrder, getDefaultDueDate, confirmInvoice, markInvoiceAsSent, cancelInvoice, buildInvoicePrintHtml, submitInvoiceApproval, approveInvoice, rejectInvoice, returnInvoiceToDraft } from './src/invoice.js';
import { generateReceiptCode, createReceipt, calcRemainingBalance, isFullyPaid } from './src/receipt.js';
import { generatePaymentCode, createPaymentRequest, findPayablePurchaseOrders, submitPaymentApproval, approvePayment, rejectPayment, cancelPayment, registerPayment } from './src/payment.js';
import { getPendingApprovals, getApprovalDetailRoute, buildApprovalHistoryEntry, addApprovalHistoryEntry } from './src/approval.js';
import { getNotificationsForUser, checkOverdueApprovals, createInvoiceDueNotifications, createDeliveryDueNotifications } from './src/notification.js';
import { getDashboardMetrics } from './src/dashboard.js';
import { getSalesSummary, getSalesCostReport, getUncollectedInvoices, getUnpaidPayments, filterReportByYear, getReportTotals, getSalesCostByCustomer, getSalesCostByProject } from './src/report.js';
import { getFiscalYear, filterReportByFiscalYear, getAvailableFiscalYears } from './src/settings.js';
import { buildApprovalRoute, getRoutesByDocumentType, addRouteStep, removeRouteStep, updateRouteStep } from './src/approvalRoute.js';
import { validateApprovalConditionSettings, buildApprovalConditionSettings } from './src/approvalCondition.js';

const PAGE_SIZE = 5;

// ユーザ権限の一時定義（P2で権限APIが実装されたら削除予定）
const users = [
  {
    id: "admin",
    name: "中村 管理者",
    userType: "システム管理者",
    department: "管理部門",
    position: "部長",
    status: "有効",
    permissions: [
      "dashboard:view",
      "master:view",
      "master:edit",
      "project:view",
      "project:edit",
      "quotation:view",
      "quotation:edit",
      "sales-order:view",
      "sales-order:edit",
      "purchase-order:view",
      "purchase-order:edit",
      "delivery:view",
      "delivery:edit",
      "invoice:view",
      "invoice:edit",
      "receipt:view",
      "payment:view",
      "payment:edit",
      "approval:view",
      "approval:act",
      "report:view",
      "notification:view",
      "user-permission:edit",
      "settings:view",
      "settings:edit"
    ]
  },
  {
    id: "sales01",
    name: "佐藤 営業",
    userType: "一般ユーザ",
    department: "営業部門",
    position: "担当者",
    status: "有効",
    permissions: [
      "dashboard:view",
      "master:view",
      "project:view",
      "project:edit",
      "quotation:view",
      "quotation:edit",
      "sales-order:view",
      "sales-order:edit",
      "purchase-order:view",
      "purchase-order:edit",
      "delivery:view",
      "delivery:edit",
      "invoice:view",
      "approval:view",
      "notification:view"
    ]
  },
  {
    id: "finance01",
    name: "鈴木 経理",
    userType: "一般ユーザ",
    department: "経理部門",
    position: "課長",
    status: "有効",
    permissions: [
      "dashboard:view",
      "master:view",
      "invoice:view",
      "invoice:edit",
      "receipt:view",
      "receipt:edit",
      "payment:view",
      "payment:edit",
      "approval:view",
      "approval:act",
      "report:view",
      "notification:view"
    ]
  },
  {
    id: "viewer",
    name: "閲覧ユーザ",
    userType: "一般ユーザ",
    department: "営業部門",
    position: "担当者",
    status: "有効",
    permissions: [
      "dashboard:view",
      "invoice:view",
      "approval:view"
    ]
  },
  {
    id: "approver-readonly",
    name: "承認閲覧者",
    userType: "一般ユーザ",
    department: "営業部門",
    position: "担当者",
    status: "有効",
    permissions: [
      "dashboard:view",
      "approval:view"
    ]
  }
];

const screens = [
  {
    id: "dashboard",
    title: "ダッシュボード",
    tag: "S-02",
    description: "承認待ち、未請求、未収、未払、支払予定を所属部門と個別権限に応じて表示します。",
    permission: "dashboard:view"
  },
  {
    id: "project",
    title: "案件一覧・詳細",
    tag: "S-03",
    description: "案件の進捗と関連伝票を追跡します。",
    permission: "project:view"
  },
  {
    id: "quotation",
    title: "見積一覧・登録・詳細",
    tag: "S-04",
    description: "見積作成、改版、承認依頼の入口です。",
    permission: "quotation:view"
  },
  {
    id: "sales-order",
    title: "受注一覧・詳細",
    tag: "S-05",
    description: "見積から受注への引継ぎと契約関連の確認を行います。",
    permission: "sales-order:view"
  },
  {
    id: "purchase-order",
    title: "発注一覧・登録・詳細",
    tag: "S-06",
    description: "受注明細から発注起票し、仕入先別分割と承認へつなぎます。",
    permission: "purchase-order:view"
  },
  {
    id: "delivery",
    title: "納品・検収",
    tag: "S-07",
    description: "納品実績の一覧と検収処理を行います。",
    permission: "delivery:view"
  },
  {
    id: "invoice",
    title: "請求一覧・登録・詳細",
    tag: "S-08",
    description: "納品・検収後の請求作成と請求確定を扱います。",
    permission: "invoice:view"
  },
  {
    id: "receipt",
    title: "入金登録",
    tag: "S-09",
    description: "請求に対する入金と消込を管理します。",
    permission: "receipt:view"
  },
  {
    id: "payment",
    title: "支払依頼・支払登録",
    tag: "S-10",
    description: "支払依頼から支払実績登録までを扱います。",
    permission: "payment:view"
  },
  {
    id: "master",
    title: "マスタ管理",
    tag: "S-11",
    description: "顧客、仕入先、商品、ユーザ、部門、役職、権限を管理します。",
    permission: "master:view"
  },
  {
    id: "approval",
    title: "承認一覧",
    tag: "S-12",
    description: "承認待ち伝票を確認し、承認・差戻し・却下を行います。",
    permission: "approval:view"
  },
  {
    id: "report",
    title: "レポート",
    tag: "S-13",
    description: "売上、原価、粗利、未収、未払を集計表示します。",
    permission: "report:view"
  },
  {
    id: "notification",
    title: "通知一覧",
    tag: "S-14",
    description: "承認依頼や期限超過通知を一覧表示します。",
    permission: "notification:view"
  },
  {
    id: "settings",
    title: "システム設定",
    tag: "S-15",
    description: "会社情報と年度設定を管理します。",
    permission: "settings:view"
  }
];

const dashboardMetrics = [
  { label: "承認待ち", value: "06", note: "見積2件 / 発注2件 / 支払2件" },
  { label: "未請求", value: "12", note: "今週締め対象の受注を含む" },
  { label: "未収", value: "03", note: "回収遅延1件あり" },
  { label: "支払予定", value: "08", note: "今月末までの支払依頼" }
];

const projectRows = [
  ["PJ-24051 新規保守案件", "営業部門", "進行中", "2026-04-30"],
  ["PJ-24049 B社機器更新", "管理部門", "承認待ち", "2026-04-28"],
  ["PJ-24044 C社定例運用", "営業事務部門", "請求準備", "2026-05-02"]
];

const approvalItems = [
  {
    title: "見積承認 2件",
    copy: "営業部門から回付された見積申請。役職と個別権限に応じて承認候補を表示します。"
  },
  {
    title: "発注承認 2件",
    copy: "購買部門で起票された発注。発注書出力前に承認が必要です。"
  },
  {
    title: "支払承認 2件",
    copy: "経理部門で支払予定が登録済み。支払実績登録前の最終確認待ちです。"
  }
];

const customers = [
  {
    code: "CUS-001",
    name: "株式会社青葉システム",
    department: "営業部門",
    contact: "山田 一郎",
    closingDay: "末日",
    paymentSite: "翌月末",
    billingTo: "東京本社",
    status: "有効"
  },
  {
    code: "CUS-002",
    name: "東都ネットワーク株式会社",
    department: "営業事務部門",
    contact: "高橋 未来",
    closingDay: "20日",
    paymentSite: "翌月20日",
    billingTo: "大阪支店",
    status: "有効"
  },
  {
    code: "CUS-003",
    name: "みなと物流サービス株式会社",
    department: "購買部門",
    contact: "小林 伸",
    closingDay: "15日",
    paymentSite: "翌月末",
    billingTo: "名古屋営業所",
    status: "有効"
  },
  {
    code: "CUS-004",
    name: "北星メディカル機器株式会社",
    department: "営業部門",
    contact: "松本 玲子",
    closingDay: "末日",
    paymentSite: "翌々月5日",
    billingTo: "札幌支店",
    status: "停止"
  },
  {
    code: "CUS-005",
    name: "新都建設エンジニアリング株式会社",
    department: "管理部門",
    contact: "田口 大樹",
    closingDay: "25日",
    paymentSite: "翌月末",
    billingTo: "本店経理部",
    status: "有効"
  },
  {
    code: "CUS-006",
    name: "フェニックス販売株式会社",
    department: "経理部門",
    contact: "加藤 優子",
    closingDay: "末日",
    paymentSite: "翌月15日",
    billingTo: "福岡支社",
    status: "有効"
  },
  {
    code: "CUS-007",
    name: "丸山ソリューションズ株式会社",
    department: "営業部門",
    contact: "西村 健",
    closingDay: "10日",
    paymentSite: "翌月末",
    billingTo: "横浜オフィス",
    status: "有効"
  },
  {
    code: "CUS-008",
    name: "南海オートメーション株式会社",
    department: "購買部門",
    contact: "佐々木 光",
    closingDay: "20日",
    paymentSite: "翌月25日",
    billingTo: "神戸事業所",
    status: "有効"
  },
  {
    code: "CUS-009",
    name: "中央ソフトサプライ株式会社",
    department: "営業事務部門",
    contact: "斎藤 理沙",
    closingDay: "末日",
    paymentSite: "翌月末",
    billingTo: "本社請求課",
    status: "停止"
  }
];

const suppliers = [
  {
    code: "SUP-001",
    name: "株式会社日本テクノロジー",
    contact: "中村 誠",
    paymentSite: "翌月末",
    status: "有効"
  },
  {
    code: "SUP-002",
    name: "アジア部品サプライ株式会社",
    contact: "李 明",
    paymentSite: "翌月20日",
    status: "有効"
  },
  {
    code: "SUP-003",
    name: "東洋精密機器株式会社",
    contact: "田中 幸雄",
    paymentSite: "翌々月5日",
    status: "有効"
  },
  {
    code: "SUP-004",
    name: "グローバル電材株式会社",
    contact: "伊藤 直美",
    paymentSite: "翌月末",
    status: "停止"
  },
  {
    code: "SUP-005",
    name: "北海道産業資材株式会社",
    contact: "吉田 雄大",
    paymentSite: "翌月末",
    status: "有効"
  }
];

const products = [
  {
    code: "PRD-001",
    name: "サーバー保守サービス",
    unit: "月",
    unitPrice: "50000",
    tax: "課税",
    status: "有効"
  },
  {
    code: "PRD-002",
    name: "ネットワーク機器 導入支援",
    unit: "式",
    unitPrice: "200000",
    tax: "課税",
    status: "有効"
  },
  {
    code: "PRD-003",
    name: "ソフトウェアライセンス",
    unit: "年",
    unitPrice: "120000",
    tax: "課税",
    status: "有効"
  },
  {
    code: "PRD-004",
    name: "技術支援 スポット対応",
    unit: "時間",
    unitPrice: "15000",
    tax: "課税",
    status: "有効"
  },
  {
    code: "PRD-005",
    name: "消耗品セット",
    unit: "個",
    unitPrice: "3000",
    tax: "課税",
    status: "停止"
  }
];

const projects = [
  {
    code: "PJ-00001",
    name: "新規保守案件",
    customerId: "CUS-001",
    department: "営業部門",
    status: "進行中",
    startDate: "2026-04-01",
    dueDate: "2026-04-30",
    description: "青葉システム向け月次保守契約。4月より開始。"
  },
  {
    code: "PJ-00002",
    name: "B社機器更新",
    customerId: "CUS-002",
    department: "管理部門",
    status: "承認待ち",
    startDate: "2026-03-15",
    dueDate: "2026-04-28",
    description: "ネットワーク機器の更新提案。承認後に発注起票予定。"
  },
  {
    code: "PJ-00003",
    name: "C社定例運用",
    customerId: "CUS-003",
    department: "営業事務部門",
    status: "請求準備",
    startDate: "2026-01-01",
    dueDate: "2026-05-02",
    description: "定例運用サポート。5月分請求準備中。"
  },
  {
    code: "PJ-00004",
    name: "D社システム導入",
    customerId: "CUS-005",
    department: "営業部門",
    status: "商談中",
    startDate: "2026-05-01",
    dueDate: "2026-05-15",
    description: "新規導入提案。初回訪問完了、見積作成中。"
  },
  {
    code: "PJ-00005",
    name: "E社ライセンス更新",
    customerId: "CUS-007",
    department: "営業部門",
    status: "完了",
    startDate: "2026-02-01",
    dueDate: "2026-03-31",
    description: "ソフトウェアライセンス更新。入金確認済み。"
  }
];

const quotations = [
  {
    code: "QUO-00001",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 初回見積",
    issueDate: "2026-01-10",
    validityDate: "2026-02-10",
    version: 1,
    status: "承認済み",
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 12, unit: "月", unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 660000 }
    ],
    subtotal: 600000,
    taxAmount: 60000,
    total: 660000
  },
  {
    code: "QUO-00002",
    projectCode: "PJ-00002",
    customerId: "CUS-002",
    title: "B社機器更新 提案見積",
    issueDate: "2026-03-20",
    validityDate: "2026-04-20",
    version: 1,
    status: "下書き",
    notes: "機器選定中につき暫定金額",
    details: [
      { lineNo: 1, productCode: "PRD-002", productName: "ネットワーク機器 導入支援", quantity: 1, unit: "式", unitPrice: 200000, discount: 0, taxRate: 0.10, amount: 220000 }
    ],
    subtotal: 200000,
    taxAmount: 20000,
    total: 220000
  },
  {
    code: "QUO-00003",
    projectCode: "PJ-00003",
    customerId: "CUS-003",
    title: "C社定例運用 継続見積",
    issueDate: "2026-04-01",
    validityDate: "2026-04-30",
    version: 2,
    status: "承認依頼中",
    submittedBy: "sales01",
    notes: "前回から単価改定あり",
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 12, unit: "月", unitPrice: 55000, discount: 0, taxRate: 0.10, amount: 726000 }
    ],
    subtotal: 660000,
    taxAmount: 66000,
    total: 726000
  },
  {
    code: "QUO-00004",
    projectCode: "PJ-00004",
    customerId: "CUS-005",
    title: "D社システム導入 初回見積",
    issueDate: "2026-05-01",
    validityDate: "2026-05-31",
    version: 1,
    status: "下書き",
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-003", productName: "ソフトウェアライセンス", quantity: 3, unit: "年", unitPrice: 120000, discount: 10000, taxRate: 0.10, amount: 374000 }
    ],
    subtotal: 340000,
    taxAmount: 34000,
    total: 374000
  },
  {
    code: "QUO-00005",
    projectCode: "PJ-00005",
    customerId: "CUS-007",
    title: "E社ライセンス更新 見積",
    issueDate: "2026-02-01",
    validityDate: "2026-03-01",
    version: 1,
    status: "承認済み",
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-003", productName: "ソフトウェアライセンス", quantity: 1, unit: "年", unitPrice: 120000, discount: 0, taxRate: 0.10, amount: 132000 }
    ],
    subtotal: 120000,
    taxAmount: 12000,
    total: 132000
  },
  {
    code: "QUO-00006",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 第2四半期見積",
    issueDate: "2026-03-01",
    validityDate: "2026-03-31",
    version: 1,
    status: "承認済み",
    notes: "4月〜6月（3か月）",
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 3, unit: "月", unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 165000 }
    ],
    subtotal: 150000,
    taxAmount: 15000,
    total: 165000
  },
  {
    code: "QUO-00007",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 第3四半期見積",
    issueDate: "2026-06-01",
    validityDate: "2026-06-30",
    version: 1,
    status: "承認済み",
    notes: "7月〜9月（3か月）",
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 3, unit: "月", unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 165000 }
    ],
    subtotal: 150000,
    taxAmount: 15000,
    total: 165000
  }
];

const orders = [
  {
    code: "ORD-00001",
    quotationCode: "QUO-00001",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 初回見積",
    orderDate: "2026-01-20",
    deliveryDate: "2026-12-31",
    status: "受注済み",
    subtotal: 600000,
    taxAmount: 60000,
    total: 660000,
    notes: "",
    billingTarget: false,
    paidAmount: 0,
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 12, unit: "月", unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 528000 },
      { lineNo: 2, productCode: "PRD-002", productName: "ネットワーク機器保守", quantity: 12, unit: "月", unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 132000 }
    ]
  },
  {
    code: "ORD-00002",
    quotationCode: "QUO-00004",
    projectCode: "PJ-00004",
    customerId: "CUS-005",
    title: "セキュリティ診断サービス 提案",
    orderDate: "2026-03-01",
    deliveryDate: "2026-06-30",
    status: "受注済み",
    subtotal: 300000,
    taxAmount: 30000,
    total: 330000,
    notes: "",
    billingTarget: false,
    paidAmount: 0,
    details: [
      { lineNo: 1, productCode: "PRD-004", productName: "セキュリティ診断", quantity: 1, unit: "式", unitPrice: 300000, discount: 0, taxRate: 0.10, amount: 330000 }
    ]
  },
  {
    code: "ORD-00003",
    quotationCode: "QUO-00005",
    projectCode: "PJ-00005",
    customerId: "CUS-005",
    title: "ライセンス更新見積",
    orderDate: "2026-04-01",
    deliveryDate: "2026-03-31",
    status: "完了",
    subtotal: 120000,
    taxAmount: 12000,
    total: 132000,
    notes: "",
    billingTarget: true,
    paidAmount: 132000,
    details: [
      { lineNo: 1, productCode: "PRD-003", productName: "ソフトウェアライセンス", quantity: 1, unit: "年", unitPrice: 120000, discount: 0, taxRate: 0.10, amount: 132000 }
    ]
  },
  {
    code: "ORD-00004",
    quotationCode: "QUO-00006",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 第2四半期",
    orderDate: "2026-03-20",
    deliveryDate: "2026-06-30",
    status: "受注済み",
    subtotal: 150000,
    taxAmount: 15000,
    total: 165000,
    notes: "4月〜6月（3か月）",
    billingTarget: true,
    paidAmount: 0,
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 3, unit: "月", unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 132000 },
      { lineNo: 2, productCode: "PRD-002", productName: "ネットワーク機器保守", quantity: 3, unit: "月", unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 33000 }
    ]
  },
  {
    code: "ORD-00005",
    quotationCode: "QUO-00007",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 第3四半期",
    orderDate: "2026-06-01",
    deliveryDate: "2026-09-30",
    status: "受注済み",
    subtotal: 150000,
    taxAmount: 15000,
    total: 165000,
    notes: "7月〜9月（3か月）",
    billingTarget: false,
    paidAmount: 0,
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 3, unit: "月", unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 132000 },
      { lineNo: 2, productCode: "PRD-002", productName: "ネットワーク機器保守", quantity: 3, unit: "月", unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 33000 }
    ]
  },
  {
    code: "ORD-00006",
    quotationCode: "QUO-00001",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 承認申請中",
    orderDate: "2026-05-01",
    deliveryDate: "2026-12-31",
    status: "承認依頼中",
    subtotal: 600000,
    taxAmount: 60000,
    total: 660000,
    notes: "",
    billingTarget: false,
    paidAmount: 0,
    submittedBy: "user01",
    attachments: [{ name: "契約書.pdf", size: 102400, type: "application/pdf", uploadedAt: "2026-05-01" }],
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 12, unit: "月", unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 528000 },
      { lineNo: 2, productCode: "PRD-002", productName: "ネットワーク機器保守", quantity: 12, unit: "月", unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 132000 }
    ]
  }
];

const purchaseOrders = [
  {
    code: "POD-00001",
    orderCode: "ORD-00001",
    supplierId: "SUP-001",
    title: "サーバー保守サービス 発注",
    orderDate: "2026-01-25",
    deliveryDate: "2026-12-31",
    status: "下書き",
    subtotal: 480000,
    taxAmount: 48000,
    total: 528000,
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "サーバー保守サービス", quantity: 12, unit: "月", unitPrice: 40000, amount: 528000 }
    ]
  },
  {
    code: "POD-00002",
    orderCode: "ORD-00002",
    supplierId: "SUP-003",
    title: "セキュリティ診断 発注",
    orderDate: "2026-03-05",
    deliveryDate: "2026-06-30",
    status: "承認済・発注待ち",
    subtotal: 250000,
    taxAmount: 25000,
    total: 275000,
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-004", productName: "セキュリティ診断", quantity: 1, unit: "式", unitPrice: 250000, amount: 275000 }
    ]
  },
  {
    code: "POD-00003",
    orderCode: "ORD-00003",
    supplierId: "SUP-002",
    title: "ライセンス調達 発注",
    orderDate: "2026-04-05",
    deliveryDate: "2026-03-31",
    status: "納品済",
    subtotal: 100000,
    taxAmount: 10000,
    total: 110000,
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-003", productName: "ソフトウェアライセンス", quantity: 1, unit: "年", unitPrice: 100000, amount: 110000 }
    ]
  },
  {
    code: "POD-00004",
    orderCode: "ORD-00001",
    supplierId: "SUP-001",
    title: "インフラ構築支援 発注",
    orderDate: "2026-04-10",
    deliveryDate: "2026-04-30",
    status: "納品済",
    subtotal: 1000000,
    taxAmount: 100000,
    total: 1100000,
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "インフラ構築支援", quantity: 1, unit: "式", unitPrice: 1000000, amount: 1100000 }
    ]
  },
  {
    code: "POD-00005",
    orderCode: "ORD-00002",
    supplierId: "SUP-001",
    title: "保守サービス 発注",
    orderDate: "2026-04-20",
    deliveryDate: "2026-05-15",
    status: "納品済",
    subtotal: 1000000,
    taxAmount: 100000,
    total: 1100000,
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-001", productName: "保守サービス", quantity: 1, unit: "式", unitPrice: 1000000, amount: 1100000 }
    ]
  },
  {
    code: "POD-00006",
    orderCode: "ORD-00002",
    supplierId: "SUP-003",
    title: "ネットワーク機器 発注",
    orderDate: "2026-04-15",
    deliveryDate: "2026-06-30",
    status: "承認依頼中",
    submittedBy: "sales01",
    subtotal: 300000,
    taxAmount: 30000,
    total: 330000,
    notes: "",
    details: [
      { lineNo: 1, productCode: "PRD-002", productName: "ネットワーク機器 導入支援", quantity: 1, unit: "式", unitPrice: 300000, amount: 330000 }
    ]
  }
];

const deliveries = [
  {
    code: "DLV-00001",
    purchaseOrderCode: "POD-00003",
    deliveryDate: "2026-03-28",
    notes: "",
    status: "検収済",
    details: [
      { lineNo: 1, deliveredQuantity: 1 }
    ]
  }
];

const invoices = [
  {
    code: "INV-00001",
    orderCode: "ORD-00001",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "サーバー保守サービス 2026年1月分",
    invoiceDate: "2026-01-31",
    dueDate: "2026-02-28",
    status: "送付済",
    subtotal: 480000,
    taxAmount: 48000,
    total: 528000,
    notes: "",
    details: [
      { lineNo: 1, productName: "サーバー保守サービス", quantity: 1, unit: "月", unitPrice: 480000, taxRate: 0.10, amount: 528000 }
    ]
  },
  {
    code: "INV-00002",
    orderCode: "ORD-00002",
    projectCode: "PJ-00004",
    customerId: "CUS-005",
    title: "セキュリティ診断サービス 請求",
    invoiceDate: "2026-03-31",
    dueDate: "2026-04-30",
    status: "入金済",
    subtotal: 2000000,
    taxAmount: 200000,
    total: 2200000,
    notes: "",
    details: [
      { lineNo: 1, productName: "セキュリティ診断サービス", quantity: 1, unit: "式", unitPrice: 2000000, taxRate: 0.10, amount: 2200000 }
    ]
  },
  {
    code: "INV-00003",
    orderCode: "ORD-00002",
    projectCode: "PJ-00004",
    customerId: "CUS-005",
    title: "セキュリティ診断 追加作業 請求",
    invoiceDate: "2026-04-30",
    dueDate: "2026-05-31",
    status: "下書き",
    subtotal: 350000,
    taxAmount: 35000,
    total: 385000,
    notes: "",
    details: [
      { lineNo: 1, productName: "セキュリティ診断 追加作業", quantity: 1, unit: "式", unitPrice: 350000, taxRate: 0.10, amount: 385000 }
    ]
  },
  {
    code: "INV-00004",
    orderCode: "ORD-00004",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "サーバー保守サービス 2026年4月分",
    invoiceDate: "2026-04-30",
    dueDate: "2026-05-31",
    status: "送付済",
    subtotal: 50000,
    taxAmount: 5000,
    total: 55000,
    notes: "",
    details: [
      { lineNo: 1, productName: "サーバー保守サービス", quantity: 1, unit: "月", unitPrice: 50000, taxRate: 0.10, amount: 55000 }
    ]
  },
  {
    code: "INV-00005",
    orderCode: "ORD-00001",
    projectCode: "PJ-00001",
    customerId: "CUS-001",
    title: "新規保守案件 承認申請中",
    invoiceDate: "2026-05-01",
    dueDate: "2026-05-31",
    status: "承認依頼中",
    subtotal: 600000,
    taxAmount: 60000,
    total: 660000,
    notes: "",
    submittedBy: "user01",
    details: [
      { lineNo: 1, productName: "サーバー保守サービス", quantity: 12, unit: "月", unitPrice: 50000, taxRate: 0.10, amount: 660000 }
    ]
  }
];

const receipts = [
  {
    code: "RCP-00001",
    invoiceCode: "INV-00002",
    receiptDate: "2026-04-28",
    amount: 2200000,
    fee: 0,
    notes: ""
  }
];

const payments = [
  {
    code: "PMT-00001",
    purchaseOrderCode: "POD-00003",
    supplierId: "SUP-002",
    title: "ライセンス調達 支払依頼",
    paymentDate: "2026-04-30",
    amount: 110000,
    status: "支払済",
    paidDate: "2026-04-30",
    paidAmount: 110000,
    notes: ""
  },
  {
    code: "PMT-00002",
    purchaseOrderCode: "POD-00004",
    supplierId: "SUP-001",
    title: "インフラ構築支援 支払依頼",
    paymentDate: "2026-05-31",
    amount: 1100000,
    status: "承認済",
    notes: ""
  }
];

const notifications = [
  {
    id: "NTF-00001",
    type: "承認依頼",
    message: "見積 QUO-00003 の承認依頼が届いています",
    targetType: "quotation",
    targetCode: "QUO-00003",
    recipientId: "admin",
    createdAt: "2026-04-20",
    isRead: false
  },
  {
    id: "NTF-00002",
    type: "承認依頼",
    message: "発注 POD-00006 の承認依頼が届いています",
    targetType: "purchase-order",
    targetCode: "POD-00006",
    recipientId: "admin",
    createdAt: "2026-04-15",
    isRead: false
  },
  {
    id: "NTF-00003",
    type: "承認依頼",
    message: "支払依頼 PMT-00002 の承認依頼が届いています",
    targetType: "payment",
    targetCode: "PMT-00002",
    recipientId: "admin",
    createdAt: "2026-05-01",
    isRead: true
  }
];

const paymentTerms = [
  { code: "PT-01", name: "翌月末払い", days: 30, description: "請求月の翌月末日に支払" },
  { code: "PT-02", name: "翌月20日払い", days: 20, description: "請求月の翌月20日に支払" },
  { code: "PT-03", name: "翌々月5日払い", days: 35, description: "請求月の翌々月5日に支払" },
  { code: "PT-04", name: "当月末払い", days: 0, description: "請求月の末日に支払" }
];

const taxRates = [
  { code: "TAX-01", name: "標準税率", rate: "10%", taxType: "課税", appliedFrom: "2019-10-01" },
  { code: "TAX-02", name: "軽減税率", rate: "8%", taxType: "軽減税率", appliedFrom: "2019-10-01" },
  { code: "TAX-03", name: "非課税", rate: "0%", taxType: "非課税", appliedFrom: "-" }
];

const appRoot = document.getElementById("app");
const viewState = {
  projectView: "list",
  projectDetailCode: null,
  projectForm: {
    mode: "list",
    editCode: null,
    errors: {},
    data: {
      code: "",
      name: "",
      customerId: "",
      department: "",
      status: "商談中",
      startDate: "",
      dueDate: "",
      description: ""
    }
  },
  masterTab: "customer",
  tables: {
    projectList: {
      search: "",
      department: "all",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    customerMaster: {
      search: "",
      department: "all",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    supplierMaster: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    productMaster: {
      search: "",
      tax: "all",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    userMaster: {
      search: "",
      userType: "all",
      status: "all",
      sortKey: "id",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    paymentTermMaster: {
      search: "",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    taxRateMaster: {
      search: "",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    quotationList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    orderList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    purchaseOrderList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    invoiceList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    receiptList: {
      search: "",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    paymentList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    },
    deliveryList: {
      search: "",
      status: "all",
      sortKey: "deliveryDate",
      sortDir: "desc",
      page: 1,
      pageSize: 20
    },
    approvalList: {
      search: "",
      type: "all",
      sortKey: "submittedAt",
      sortDir: "desc",
      page: 1,
      pageSize: 20
    },
    notificationList: {
      search: "",
      type: "all",
      sortKey: "createdAt",
      sortDir: "desc",
      page: 1,
      pageSize: 20
    },
    salesSummary: {
      search: "",
      sortKey: "yearMonth",
      sortDir: "asc",
      page: 1,
      pageSize: 20
    }
  },
  reportFilter: {
    year: "all"
  },
  reportDrilldown: {
    customerId: null
  },
  approvalFrom: null,
  approvalAction: { mode: null, comment: '' },
  sidebarCollapsed: false,
  settings: {
    name: "株式会社サンプル商事",
    address: "〒100-0001 東京都千代田区千代田1-1",
    phone: "03-0000-0000",
    fiscalEndMonth: 12,
    presidentApprovalProfitRateThreshold: 20,
    presidentApprovalAmountThreshold: 10000000,
    approvalStaleDays: 3
  },
  settingsTab: "company",
  settingsErrors: {},
  approvalRoutes: [
    { documentType: 'quotation', stepNumber: 1, approverUserId: 'user-002' },
    { documentType: 'quotation', stepNumber: 2, approverUserId: 'user-003' },
    { documentType: 'order', stepNumber: 1, approverUserId: 'user-002' },
    { documentType: 'purchaseOrder', stepNumber: 1, approverUserId: 'user-002' },
    { documentType: 'invoice', stepNumber: 1, approverUserId: 'user-002' },
    { documentType: 'payment', stepNumber: 1, approverUserId: 'user-002' }
  ],
  approvalRouteForm: {
    documentType: 'quotation',
    newApproverUserId: ''
  },
  invoiceView: "list",
  invoiceDetailCode: null,
  receiptView: "list",
  receiptForm: { errors: {} },
  paymentView: "list",
  paymentDetailCode: null,
  paymentForm: { purchaseOrderCode: null, errors: {} },
  invoiceForm: {
    mode: "list",
    errors: {},
    data: {
      code: "",
      orderCode: "",
      customerId: "",
      title: "",
      invoiceDate: "",
      dueDate: ""
    }
  },
  customerForm: {
    mode: "list",
    editCode: null,
    errors: {},
    data: {
      code: "",
      name: "",
      department: "",
      contact: "",
      closingDay: "",
      paymentSite: "",
      billingTo: "",
      status: "有効"
    }
  },
  supplierForm: {
    mode: "list",
    editCode: null,
    errors: {},
    data: {
      code: "",
      name: "",
      contact: "",
      paymentSite: "",
      status: "有効"
    }
  },
  productForm: {
    mode: "list",
    editCode: null,
    errors: {},
    data: {
      code: "",
      name: "",
      unit: "",
      unitPrice: "",
      tax: "",
      status: "有効"
    }
  },
  userForm: {
    mode: "list",
    editId: null,
    errors: {},
    data: {
      id: "",
      password: "",
      name: "",
      userType: "",
      department: "",
      position: "",
      status: "有効"
    }
  },
  quotationView: "list",
  quotationDetailCode: null,
  quotationForm: {
    mode: "list",
    editCode: null,
    errors: {},
    data: {
      code: "",
      projectCode: "",
      customerId: "",
      title: "",
      issueDate: "",
      validityDate: "",
      version: 1,
      status: "下書き",
      notes: "",
      rejectReason: ""
    },
    details: []
  },
  orderView: "list",
  orderDetailCode: null,
  purchaseOrderSourceCode: null,
  purchaseOrderView: "list",
  purchaseOrderDetailCode: null,
  deliveryView: "list",
  deliveryFormPodCode: null,
  deliveryForm: {
    mode: "list",
    errors: {},
    data: {
      code: "",
      purchaseOrderCode: "",
      deliveryDate: "",
      notes: ""
    }
  },
  purchaseOrderForm: {
    mode: "list",
    isStandalone: false,
    errors: {},
    data: {
      code: "",
      orderCode: "",
      supplierId: "",
      title: "",
      orderDate: "",
      deliveryDate: "",
      total: 0,
      notes: "",
      contractMethod: ""
    },
    details: [],
    selectedLineNos: [],
    attachments: []
  },
  orderForm: {
    mode: "list",
    errors: {},
    data: {
      code: "",
      quotationCode: "",
      projectCode: "",
      customerId: "",
      title: "",
      orderDate: "",
      deliveryDate: "",
      total: 0,
      notes: ""
    },
    details: [],
    attachments: []
  }
};

// ── API共通ユーティリティ ──────────────────────────────────────────────────────

async function apiFetch(url, options) {
  showSpinner();
  try {
    var opts = Object.assign({ credentials: 'include' }, options);
    var res;
    try {
      res = await fetch(url, opts);
    } catch {
      var networkErr = new Error('サーバーに接続できません。接続を確認して再試行してください');
      networkErr.isNetworkError = true;
      throw networkErr;
    }
    if (!res.ok) {
      var body = await res.json().catch(function() { return {}; });
      var msg = (body && body.error && body.error.message) ? body.error.message : 'エラーが発生しました';
      var err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.json();
  } finally {
    hideSpinner();
  }
}

// アクション呼び出し用ラッパー: スピナー + トースト + ボタン無効化
async function withFeedback(url, options, { button, successMsg } = {}) {
  button?.setAttribute('disabled', 'true');
  showSpinner();
  try {
    const result = await apiFetch(url, options);
    if (successMsg) showToast(successMsg, 'success');
    return result;
  } catch (err) {
    showToast(err.message || 'エラーが発生しました', 'error');
    throw err;
  } finally {
    button?.removeAttribute('disabled');
    hideSpinner();
  }
}

// S-04: 見積データをAPIから取得してローカルキャッシュを更新
async function refreshQuotations() {
  try {
    var resp = await apiFetch('/api/quotations');
    quotations.length = 0;
    Array.prototype.push.apply(quotations, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('見積の取得に失敗しました:', err.message);
  }
}

// S-05: 受注データをAPIから取得してローカルキャッシュを更新
async function refreshOrders() {
  try {
    var resp = await apiFetch('/api/orders');
    orders.length = 0;
    Array.prototype.push.apply(orders, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('受注の取得に失敗しました:', err.message);
  }
}

// S-08: 請求データをAPIから取得してローカルキャッシュを更新
async function refreshInvoices() {
  try {
    var resp = await apiFetch('/api/invoices');
    invoices.length = 0;
    Array.prototype.push.apply(invoices, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('請求の取得に失敗しました:', err.message);
  }
}

// S-03: 案件データをAPIから取得してローカルキャッシュを更新
async function refreshProjects() {
  try {
    var resp = await apiFetch('/api/projects');
    projects.length = 0;
    Array.prototype.push.apply(projects, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('案件の取得に失敗しました:', err.message);
  }
}

// S-11: 顧客マスタデータをAPIから取得してローカルキャッシュを更新
async function refreshCustomers() {
  try {
    var resp = await apiFetch('/api/customers');
    customers.length = 0;
    Array.prototype.push.apply(customers, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('顧客マスタの取得に失敗しました:', err.message);
  }
}

// S-06: 発注データをAPIから取得してローカルキャッシュを更新
async function refreshPurchaseOrders() {
  try {
    var resp = await apiFetch('/api/purchase-orders');
    purchaseOrders.length = 0;
    Array.prototype.push.apply(purchaseOrders, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('発注の取得に失敗しました:', err.message);
  }
}

// S-15: 設定データをAPIから取得してviewState.settingsを更新
async function refreshSettings() {
  try {
    var data = await apiFetch('/api/settings');
    Object.assign(viewState.settings, data);
  } catch (err) {
    console.error('設定の取得に失敗しました:', err.message);
  }
}

// S-15: 承認ルートをAPIから取得してviewState.approvalRoutesを更新
async function refreshApprovalRoutes() {
  try {
    var data = await apiFetch('/api/approval-routes');
    viewState.approvalRoutes = data;
  } catch (err) {
    console.error('承認ルートの取得に失敗しました:', err.message);
  }
}

// S-07: 納品データをAPIから取得してローカルキャッシュを更新
async function refreshDeliveries() {
  try {
    var resp = await apiFetch('/api/deliveries');
    deliveries.length = 0;
    Array.prototype.push.apply(deliveries, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('納品の取得に失敗しました:', err.message);
  }
}

// S-09: 入金データをAPIから取得してローカルキャッシュを更新
async function refreshReceipts() {
  try {
    var resp = await apiFetch('/api/receipts');
    receipts.length = 0;
    Array.prototype.push.apply(receipts, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('入金の取得に失敗しました:', err.message);
  }
}

// S-10: 支払依頼データをAPIから取得してローカルキャッシュを更新
async function refreshPayments() {
  try {
    var resp = await apiFetch('/api/payments');
    payments.length = 0;
    Array.prototype.push.apply(payments, Array.isArray(resp) ? resp : (resp.data || []));
  } catch (err) {
    console.error('支払依頼の取得に失敗しました:', err.message);
  }
}

// S-14: 通知データをAPIから取得してローカルキャッシュを更新し、クライアント側通知（N-04/N-05/N-06）をマージ
async function refreshNotifications() {
  try {
    var apiResp = await apiFetch('/api/notifications');
    notifications.length = 0;
    Array.prototype.push.apply(notifications, Array.isArray(apiResp) ? apiResp : (apiResp.data || []));
  } catch (err) {
    console.error('通知の取得に失敗しました:', err.message);
  }
  var today = new Date().toISOString().slice(0, 10);
  var stalenessDays = (viewState.settings && viewState.settings.approvalStalenessDays) || 3;
  // N-04: 承認滞留通知
  var pendingItems = []
    .concat(
      quotations.filter(function(q) { return q.status === '承認依頼中'; }).map(function(q) { return Object.assign({}, q, { docType: '見積' }); }),
      orders.filter(function(o) { return o.status === '承認依頼中'; }).map(function(o) { return Object.assign({}, o, { docType: '受注' }); }),
      purchaseOrders.filter(function(po) { return po.status === '承認依頼中'; }).map(function(po) { return Object.assign({}, po, { docType: '発注' }); }),
      invoices.filter(function(inv) { return inv.status === '承認依頼中'; }).map(function(inv) { return Object.assign({}, inv, { docType: '請求' }); }),
      payments.filter(function(p) { return p.status === '承認依頼中'; }).map(function(p) { return Object.assign({}, p, { docType: '支払依頼' }); })
    );
  var overdueNotifs = checkOverdueApprovals(pendingItems, stalenessDays, today);
  Array.prototype.push.apply(notifications, overdueNotifs);
  // N-05: 請求支払期日通知
  Array.prototype.push.apply(notifications, createInvoiceDueNotifications(invoices, today));
  // N-06: 発注納品予定日通知
  Array.prototype.push.apply(notifications, createDeliveryDueNotifications(purchaseOrders, today));
}

// 認証済みユーザのキャッシュ（APIセッションと同期）
let currentUser = null;

function getSessionUser() {
  return currentUser;
}

async function initSession() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const { user: apiUser } = await res.json();
      const localUser = users.find(function (u) { return u.id === apiUser.id; });
      // VA-08: サーバーが permissions を返す場合はそれを優先し、なければローカル定義にフォールバック
      const permissions = Array.isArray(apiUser.permissions) && apiUser.permissions.length > 0
        ? apiUser.permissions
        : (localUser ? localUser.permissions : []);
      currentUser = Object.assign({}, localUser || {}, apiUser, { permissions });
      await refreshSettings();
    } else {
      currentUser = null;
    }
  } catch {
    currentUser = null;
  }
  renderApp();
}

function hasPermission(user, permission) {
  return !!user && user.permissions.indexOf(permission) >= 0;
}

function getVisibleScreens(user) {
  return screens.filter(function (screen) {
    return hasPermission(user, screen.permission);
  });
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash || "dashboard";
}

function ensureAllowedRoute(user) {
  const visible = getVisibleScreens(user);
  const current = getRoute();
  const active = visible.find(function (screen) {
    return screen.id === current;
  });

  if (!visible.length) {
    window.location.hash = "#/dashboard";
    return "dashboard";
  }

  if (!active) {
    window.location.hash = "#/" + visible[0].id;
    return visible[0].id;
  }

  return current;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTodayString() {
  const now = new Date();
  return now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
}

function setFormField(formContext, fieldKey, value) {
  const map = {
    project: 'projectForm',
    customer: 'customerForm',
    supplier: 'supplierForm',
    product: 'productForm',
    quotation: 'quotationForm'
  };
  const stateKey = map[formContext];
  if (stateKey && viewState[stateKey]) {
    viewState[stateKey].data[fieldKey] = value;
  }
}

function customerSearchHtml(fieldKey, selectedCode) {
  const selected = findCustomerByCode(customers, selectedCode);
  const displayText = selected ? selected.name : '';
  return (
    '<div class="customer-search" data-customer-search data-search-field="' + fieldKey + '">' +
      '<input class="input" type="text" ' +
        'data-customer-search-input ' +
        'value="' + escapeHtml(displayText) + '" ' +
        'placeholder="顧客名またはコードで検索" ' +
        'autocomplete="off">' +
      '<input type="hidden" data-form-field="' + fieldKey + '" value="' + escapeHtml(selectedCode) + '">' +
      '<div class="customer-search-dropdown" data-customer-search-dropdown></div>' +
    "</div>"
  );
}

function projectSearchHtml(fieldKey, selectedCode, filterStatuses) {
  const selected = projects.find(function (p) { return p.code === selectedCode; });
  let displayText = '';
  if (selected) {
    const c = findCustomerByCode(customers, selected.customerId);
    displayText = selected.name + (c ? '（' + c.name + '）' : '');
  }
  const statusAttr = filterStatuses ? ' data-project-status-filter="' + escapeHtml(filterStatuses.join(',')) + '"' : '';
  return (
    '<div class="project-search" data-project-search data-search-field="' + fieldKey + '"' + statusAttr + '>' +
      '<input class="input" type="text" ' +
        'data-project-search-input ' +
        'value="' + escapeHtml(displayText) + '" ' +
        'placeholder="案件名または顧客名で検索" ' +
        'autocomplete="off">' +
      '<input type="hidden" data-form-field="' + fieldKey + '" value="' + escapeHtml(selectedCode || '') + '">' +
      '<div class="project-search-dropdown" data-project-search-dropdown></div>' +
    '</div>'
  );
}

function metricCardsHtml() {
  const m = getDashboardMetrics(quotations, purchaseOrders, payments, orders, invoices);
  const byType = m.pendingApprovalsByType;
  const approvalTypeRows = [
    { label: '見積', count: byType.quotations, hash: '#approval?type=quotation' },
    { label: '受注', count: byType.orders, hash: '#approval?type=order' },
    { label: '発注', count: byType.purchaseOrders, hash: '#approval?type=purchaseOrder' },
    { label: '請求', count: byType.invoices, hash: '#approval?type=invoice' },
    { label: '支払依頼', count: byType.payments, hash: '#approval?type=payment' }
  ];
  const approvalTypeListHtml = approvalTypeRows.map(function(row) {
    const isZero = row.count === 0;
    return '<li class="approval-type-row' + (isZero ? ' is-zero' : '') + '">' +
      '<a href="' + row.hash + '" class="approval-type-link">' +
        '<span class="approval-type-name">' + row.label + '</span>' +
        '<span class="approval-type-count">' + row.count + '件</span>' +
      '</a>' +
    '</li>';
  }).join('');
  const approvalCard =
    '<article class="metric-card metric-card--approval" data-metric-route="approval" style="cursor:pointer">' +
      '<div class="metric-label">承認待ち</div>' +
      '<div class="metric-value">' + String(m.pendingApprovals).padStart(2, '0') + '</div>' +
      '<ul class="approval-type-list">' + approvalTypeListHtml + '</ul>' +
    '</article>';

  const otherMetrics = [
    { label: "未請求", value: String(m.unbilled).padStart(2, "0"), note: "請求対象化済みの未請求受注", route: "invoice" },
    { label: "未収", value: String(m.uncollected).padStart(2, "0"), note: "送付済・一部入金の請求", route: "invoice" },
    { label: "未払", value: String(m.unpaid).padStart(2, "0"), note: "承認済みの支払依頼", route: "payment" }
  ];
  const otherCardsHtml = otherMetrics.map(function (metric) {
    return (
      '<article class="metric-card" data-metric-route="' + metric.route + '" style="cursor:pointer">' +
        '<div class="metric-label">' + metric.label + "</div>" +
        '<div class="metric-value">' + metric.value + "</div>" +
        '<div class="metric-note">' + escapeHtml(metric.note) + "</div>" +
      "</article>"
    );
  }).join("");

  return approvalCard + otherCardsHtml;
}

function tableRowsHtml(rows) {
  return rows.map(function (row) {
    return (
      '<div class="table-row">' +
        "<div>" + row[0] + "</div>" +
        "<div>" + row[1] + "</div>" +
        "<div><span class=\"status " + statusClass(row[2]) + "\">" + row[2] + "</span></div>" +
        "<div>" + row[3] + "</div>" +
      "</div>"
    );
  }).join("");
}

function statusClass(status) {
  if (status === "承認待ち") return "is-pending";
  if (status === "進行中" || status === "有効") return "is-open";
  if (status === "請求準備") return "is-info";
  if (status === "停止") return "is-locked";
  return "is-info";
}

function placeholderScreenHtml(screen, user) {
  const editGranted = hasPermission(user, screen.id + ":edit");
  const actGranted = hasPermission(user, screen.id + ":act");
  const exportGranted =
    screen.id === "report" ||
    screen.id === "invoice" ||
    screen.id === "purchase-order" ||
    hasPermission(user, screen.id + ":export");

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">' + screen.tag + "</div>" +
          '<div class="panel-title-text">' + screen.title + "</div>" +
        "</div>" +
        '<span class="menu-tag">' + user.department + "</span>" +
      "</div>" +
      '<div class="empty-card">' +
        '<div class="empty-title">最小実装の着手済み画面</div>' +
        '<div class="empty-copy">' +
          screen.description +
          " 現在は共通基盤、一覧共通部品、認証認可の確認を優先し、この画面は権限・導線・デザイン整合を確認できる状態まで用意しています。" +
        "</div>" +
        '<div class="permissions-grid">' +
          permissionCardHtml("参照権限", "このユーザは " + (hasPermission(user, screen.permission) ? "参照可能" : "参照不可") + " と判定されます。") +
          permissionCardHtml("更新権限", "更新操作は " + (editGranted ? "許可" : "未付与") + " です。") +
          permissionCardHtml("承認権限", "承認操作は " + (actGranted ? "許可" : "未付与") + " です。") +
          permissionCardHtml("出力権限", "帳票またはCSV出力は " + (exportGranted ? "許可" : "未付与") + " です。") +
        "</div>" +
      "</div>" +
    "</section>"
  );
}

function permissionCardHtml(title, copy) {
  return (
    '<article class="permission-card">' +
      "<h4>" + title + "</h4>" +
      "<p>" + copy + "</p>" +
    "</article>"
  );
}

function dashboardHtml(user) {
  const pending = getPendingApprovals(quotations, purchaseOrders, payments, orders, invoices);
  const canApprove = hasPermission(user, "approval:view");

  const pendingListHtml = canApprove && pending.length > 0
    ? pending.slice(0, 5).map(function(item) {
        var typeCls = item.type === '見積' ? 'is-open' : item.type === '発注' ? 'is-pending' : 'is-draft';
        return (
          '<article class="list-item">' +
            '<div class="list-item-title">' +
              '<span class="status-badge ' + typeCls + '">' + escapeHtml(item.type) + '</span> ' +
              escapeHtml(item.code) +
            '</div>' +
            '<div class="list-item-copy">' + escapeHtml(item.title) + '</div>' +
          '</article>'
        );
      }).join("")
    : '<div class="empty-card"><div class="empty-copy">承認待ちの案件はありません。</div></div>';

  return (
    '<section class="dashboard-grid">' +
      '<div class="metrics-row">' + metricCardsHtml() + "</div>" +
      '<section class="panel wide-panel">' +
        '<div class="panel-header">' +
          "<div>" +
            '<div class="panel-label">S-02</div>' +
            '<div class="panel-title-text">ダッシュボード</div>' +
          "</div>" +
          '<span class="menu-tag">' + escapeHtml(user.name) + "</span>" +
        "</div>" +
        '<div class="permissions-grid">' +
          permissionCardHtml("利用者区分", escapeHtml(user.userType) + " としてログイン中です。") +
          permissionCardHtml("所属部門", escapeHtml(user.department) + " に基づく画面導線を表示しています。") +
          permissionCardHtml("役職", escapeHtml(user.position) + " のため承認表示とダッシュボード内容が調整されます。") +
          permissionCardHtml("ユーザ個別権限", "付与数: " + user.permissions.length + "件。") +
        "</div>" +
      "</section>" +
      '<section class="panel narrow-panel">' +
        '<div class="panel-header">' +
          "<div>" +
            '<div class="panel-label">承認待ち</div>' +
            '<div class="panel-title-text">要承認の伝票</div>' +
          "</div>" +
        "</div>" +
        '<div class="list">' + pendingListHtml + "</div>" +
      "</section>" +
    "</section>"
  );
}

function getCustomerTableConfig(user) {
  const canEdit = user && hasPermission(user, "master:edit");
  const columns = [
    { key: "code", label: "顧客コード", sortable: true },
    { key: "name", label: "顧客名", sortable: true },
    { key: "department", label: "主管部門", sortable: true },
    { key: "contact", label: "担当窓口", sortable: true },
    { key: "closingDay", label: "締日", sortable: true },
    { key: "paymentSite", label: "支払サイト", sortable: true },
    {
      key: "status",
      label: "状態",
      sortable: true,
      render: function (value) {
        return '<span class="status ' + statusClass(value) + '">' + escapeHtml(value) + "</span>";
      }
    }
  ];
  if (canEdit) {
    columns.push({
      key: "_actions",
      label: "操作",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-edit="' + escapeHtml(row.code) + '">編集</button>';
      }
    });
  }
  return {
    stateKey: "customerMaster",
    title: "顧客マスタ一覧",
    rows: customers,
    columns: columns,
    searchKeys: ["code", "name", "contact", "billingTo"],
    filters: [
      {
        key: "department",
        label: "所属部門",
        options: ["all", "営業部門", "営業事務部門", "購買部門", "経理部門", "管理部門"],
        allLabel: "全部門"
      },
      {
        key: "status",
        label: "状態",
        options: ["all", "有効", "停止"],
        allLabel: "全状態"
      }
    ],
    emptyMessage: "条件に一致する顧客がありません。",
    hasActions: canEdit,
    toolbarExtra: canEdit
      ? '<button class="button button-primary" type="button" id="new-customer-btn">+ 新規登録</button>'
      : ""
  };
}

function getSupplierTableConfig(user) {
  const canEdit = user && hasPermission(user, "master:edit");
  const columns = [
    { key: "code", label: "仕入先コード", sortable: true },
    { key: "name", label: "仕入先名", sortable: true },
    { key: "contact", label: "担当窓口", sortable: true },
    { key: "paymentSite", label: "支払サイト", sortable: true },
    {
      key: "status",
      label: "状態",
      sortable: true,
      render: function (value) {
        return '<span class="status ' + statusClass(value) + '">' + escapeHtml(value) + "</span>";
      }
    }
  ];
  if (canEdit) {
    columns.push({
      key: "_actions",
      label: "操作",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-edit-supplier="' + escapeHtml(row.code) + '">編集</button>';
      }
    });
  }
  return {
    stateKey: "supplierMaster",
    title: "仕入先マスタ一覧",
    rows: suppliers,
    columns: columns,
    searchKeys: ["code", "name", "contact"],
    filters: [
      {
        key: "status",
        label: "状態",
        options: ["all", "有効", "停止"],
        allLabel: "全状態"
      }
    ],
    emptyMessage: "条件に一致する仕入先がありません。",
    hasActions: canEdit,
    tableClass: "supplier",
    toolbarExtra: canEdit
      ? '<button class="button button-primary" type="button" id="new-supplier-btn">+ 新規登録</button>'
      : ""
  };
}

function getProductTableConfig(user) {
  const canEdit = user && hasPermission(user, "master:edit");
  const columns = [
    { key: "code", label: "商品コード", sortable: true },
    { key: "name", label: "商品名", sortable: true },
    { key: "unit", label: "単位", sortable: true },
    {
      key: "unitPrice",
      label: "単価",
      sortable: true,
      render: function (value) {
        const n = Number(value);
        return isNaN(n) ? escapeHtml(value) : n.toLocaleString('ja-JP') + " 円";
      }
    },
    { key: "tax", label: "税区分", sortable: true },
    {
      key: "status",
      label: "状態",
      sortable: true,
      render: function (value) {
        return '<span class="status ' + statusClass(value) + '">' + escapeHtml(value) + "</span>";
      }
    }
  ];
  if (canEdit) {
    columns.push({
      key: "_actions",
      label: "操作",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-edit-product="' + escapeHtml(row.code) + '">編集</button>';
      }
    });
  }
  return {
    stateKey: "productMaster",
    title: "商品マスタ一覧",
    rows: products,
    columns: columns,
    searchKeys: ["code", "name"],
    filters: [
      {
        key: "tax",
        label: "税区分",
        options: ["all", "課税", "非課税", "軽減税率"],
        allLabel: "全税区分"
      },
      {
        key: "status",
        label: "状態",
        options: ["all", "有効", "停止"],
        allLabel: "全状態"
      }
    ],
    emptyMessage: "条件に一致する商品がありません。",
    hasActions: canEdit,
    tableClass: "product",
    toolbarExtra: canEdit
      ? '<button class="button button-primary" type="button" id="new-product-btn">+ 新規登録</button>'
      : ""
  };
}

function getProjectTableConfig(user) {
  const canEdit = user && hasPermission(user, "project:edit");
  const columns = [
    { key: "code", label: "案件コード", sortable: true },
    { key: "name", label: "案件名", sortable: true },
    {
      key: "customerId",
      label: "顧客名",
      sortable: true,
      render: function (value) {
        const c = findCustomerByCode(customers, value);
        return c ? escapeHtml(c.name) : escapeHtml(value);
      }
    },
    { key: "department", label: "主管部門", sortable: true },
    {
      key: "status",
      label: "状態",
      sortable: true,
      render: function (value) {
        return '<span class="status ' + statusClass(value) + '">' + escapeHtml(value) + "</span>";
      }
    },
    { key: "dueDate", label: "次アクション日", sortable: true },
    {
      key: "_detail",
      label: "詳細",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-detail-project="' + escapeHtml(row.code) + '">詳細</button>';
      }
    }
  ];
  if (canEdit) {
    columns.push({
      key: "_actions",
      label: "操作",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-edit-project="' + escapeHtml(row.code) + '">編集</button>';
      }
    });
  }
  return {
    stateKey: "projectList",
    title: "案件一覧",
    rows: projects,
    columns: columns,
    searchKeys: ["code", "name", "customerId", "description"],
    filters: [
      {
        key: "department",
        label: "主管部門",
        options: ["all", "営業部門", "営業事務部門", "購買部門", "経理部門", "管理部門"],
        allLabel: "全部門"
      },
      {
        key: "status",
        label: "状態",
        options: ["all", "商談中", "進行中", "承認待ち", "請求準備", "完了", "中止"],
        allLabel: "全状態"
      }
    ],
    emptyMessage: "条件に一致する案件がありません。",
    hasActions: true,
    tableClass: "project",
    toolbarExtra: canEdit
      ? '<button class="button button-primary" type="button" id="new-project-btn">+ 新規登録</button>'
      : ""
  };
}

function projectFormHtml() {
  const form = viewState.projectForm;
  const isEdit = form.mode === "edit";
  const data = form.data;
  const errors = form.errors;

  function fieldHtml(id, label, inputHtml, required, errorKey) {
    const error = errors[errorKey] || null;
    return (
      '<div class="form-field' + (required ? " is-required" : "") + '">' +
        '<label class="field-label" for="' + id + '">' +
          escapeHtml(label) +
          (required ? '<span class="required-mark">必須</span>' : "") +
        "</label>" +
        inputHtml +
        '<div class="field-error">' + (error ? escapeHtml(error) : "") + "</div>" +
      "</div>"
    );
  }

  function textInputHtml(id, key, placeholder, readonly, type) {
    const hasError = !!(errors[key]);
    return (
      '<input class="input' + (hasError ? " is-error" : "") + (readonly ? " is-readonly" : "") + '" id="' + id + '" type="' + (type || "text") + '" ' +
        'data-form-field="' + key + '" ' +
        'value="' + escapeHtml(data[key]) + '" ' +
        'placeholder="' + escapeHtml(placeholder) + '"' +
        (readonly ? " readonly" : "") + ">"
    );
  }

  function selectInputHtml(id, key, options) {
    const hasError = !!(errors[key]);
    return (
      '<select class="select' + (hasError ? " is-error" : "") + '" id="' + id + '" data-form-field="' + key + '">' +
        '<option value="">選択してください</option>' +
        options.map(function (opt) {
          return (
            '<option value="' + escapeHtml(opt) + '"' + (data[key] === opt ? " selected" : "") + ">" +
              escapeHtml(opt) +
            "</option>"
          );
        }).join("") +
      "</select>"
    );
  }

  const customerOptions = customers.map(function (c) { return c.code + " " + c.name; });
  const departmentOptions = ["営業部門", "営業事務部門", "購買部門", "経理部門", "管理部門"];
  const statusOptions = ["商談中", "進行中", "承認待ち", "請求準備", "完了", "中止"];

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">S-03 Step ' + (isEdit ? "3b" : "3a") + "</div>" +
          '<div class="panel-title-text">案件' + (isEdit ? "編集" : "登録") + "</div>" +
        "</div>" +
        '<span class="menu-tag">' + (isEdit ? "編集中: " + escapeHtml(form.editCode) : "新規登録") + "</span>" +
      "</div>" +
      '<form class="register-form" id="project-register-form" data-form-context="project" novalidate>' +
        '<div class="form-grid">' +
          fieldHtml("f-code", "案件コード", textInputHtml("f-code", "code", "PJ-XXXXX", isEdit), !isEdit, "code") +
          fieldHtml("f-name", "案件名", textInputHtml("f-name", "name", "新規保守案件"), true, "name") +
          fieldHtml("f-customer-id", "顧客", customerSearchHtml("customerId", data.customerId), true, "customerId") +
          fieldHtml("f-department", "主管部門", selectInputHtml("f-department", "department", departmentOptions), true, "department") +
          fieldHtml("f-status", "状態", selectInputHtml("f-status", "status", statusOptions), true, "status") +
          fieldHtml("f-start-date", "開始予定日", textInputHtml("f-start-date", "startDate", "2026-05-01", false, "date"), false, "startDate") +
          fieldHtml("f-due-date", "次アクション日", textInputHtml("f-due-date", "dueDate", "2026-05-31", false, "date"), false, "dueDate") +
        "</div>" +
        '<div class="form-field">' +
          '<label class="field-label" for="f-description">概要</label>' +
          '<textarea class="input" id="f-description" data-form-field="description" rows="3" placeholder="案件の概要・備考">' + escapeHtml(data.description) + '</textarea>' +
          '<div class="field-error"></div>' +
        "</div>" +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">' + (isEdit ? "更新する" : "登録する") + "</button>" +
          '<button class="button button-secondary" type="button" id="project-form-cancel">キャンセル</button>' +
        "</div>" +
      "</form>" +
    "</section>"
  );
}

function projectDetailHtml(user) {
  const project = findProjectByCode(projects, viewState.projectDetailCode);
  if (!project) return '<div class="empty-card">案件が見つかりません。</div>';

  const customer = findCustomerByCode(customers, project.customerId);
  const canEdit = hasPermission(user, "project:edit");

  const linkedOrders = orders.filter(function(o) { return o.projectCode === project.code; });
  const ordersHtml = linkedOrders.length === 0
    ? '<div class="empty-card"><div class="empty-copy">紐づく受注はありません。</div></div>'
    : linkedOrders.map(function(o) {
        return (
          '<div class="detail-row">' +
            '<span class="detail-label">' + escapeHtml(o.code) + '</span>' +
            '<span class="detail-value">' +
              escapeHtml(o.title) + '&nbsp;' +
              '<span class="status ' + statusClass(o.status) + '">' + escapeHtml(o.status) + '</span>' +
              '&nbsp;' + Number(o.total).toLocaleString('ja-JP') + ' 円' +
              '&nbsp;（納期: ' + escapeHtml(o.deliveryDate) + '）' +
            '</span>' +
          '</div>'
        );
      }).join('');

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">S-03 案件詳細</div>' +
          '<div class="panel-title-text">' + escapeHtml(project.name) + "</div>" +
        "</div>" +
        '<div class="toolbar">' +
          (canEdit
            ? '<button class="button button-secondary" type="button" data-action-edit-project="' + escapeHtml(project.code) + '">編集</button>'
            : "") +
          '<button class="button button-ghost" type="button" id="project-detail-back">一覧へ戻る</button>' +
        "</div>" +
      "</div>" +
      '<div class="detail-grid">' +
        '<div class="detail-row"><span class="detail-label">案件コード</span><span class="detail-value">' + escapeHtml(project.code) + "</span></div>" +
        '<div class="detail-row"><span class="detail-label">案件名</span><span class="detail-value">' + escapeHtml(project.name) + "</span></div>" +
        '<div class="detail-row"><span class="detail-label">顧客</span><span class="detail-value">' + escapeHtml(project.customerId) + (customer ? " " + escapeHtml(customer.name) : "") + "</span></div>" +
        '<div class="detail-row"><span class="detail-label">主管部門</span><span class="detail-value">' + escapeHtml(project.department) + "</span></div>" +
        '<div class="detail-row"><span class="detail-label">状態</span><span class="detail-value"><span class="status ' + statusClass(project.status) + '">' + escapeHtml(project.status) + "</span></span></div>" +
        '<div class="detail-row"><span class="detail-label">開始予定日</span><span class="detail-value">' + escapeHtml(project.startDate || "—") + "</span></div>" +
        '<div class="detail-row"><span class="detail-label">次アクション日</span><span class="detail-value">' + escapeHtml(project.dueDate || "—") + "</span></div>" +
        (project.description ? '<div class="detail-row detail-row-full"><span class="detail-label">概要</span><span class="detail-value">' + escapeHtml(project.description) + "</span></div>" : "") +
      "</div>" +
      '<div class="panel-header" style="margin-top:20px;">' +
        '<div class="panel-label">紐づく受注</div>' +
      '</div>' +
      '<div class="detail-grid" id="project-detail-orders">' + ordersHtml + '</div>' +
    "</section>"
  );
}

function projectScreenHtml(user) {
  if (viewState.projectForm.mode === "register" || viewState.projectForm.mode === "edit") {
    return projectFormHtml();
  }
  if (viewState.projectView === "detail" && viewState.projectDetailCode) {
    return projectDetailHtml(user);
  }
  return dataTableHtml(getProjectTableConfig(user));
}

function getQuotationTableConfig(user) {
  const canEdit = user && hasPermission(user, "quotation:edit");
  const columns = [
    { key: "code", label: "見積番号", sortable: true },
    { key: "title", label: "見積件名", sortable: true },
    {
      key: "projectCode",
      label: "案件名",
      sortable: true,
      render: function (value) {
        const p = projects.find(function (pj) { return pj.code === value; });
        return p ? escapeHtml(p.name) : escapeHtml(value);
      }
    },
    {
      key: "customerId",
      label: "顧客名",
      sortable: true,
      render: function (value) {
        const c = findCustomerByCode(customers, value);
        return c ? escapeHtml(c.name) : escapeHtml(value);
      }
    },
    { key: "issueDate", label: "発行日", sortable: true },
    {
      key: "total",
      label: "合計金額",
      sortable: true,
      render: function (value) {
        return escapeHtml(Number(value).toLocaleString()) + " 円";
      }
    },
    {
      key: "status",
      label: "状態",
      sortable: true,
      render: function (value) {
        return '<span class="status ' + quotationStatusClass(value) + '">' + escapeHtml(value) + "</span>";
      }
    },
    {
      key: "_detail",
      label: "詳細",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-detail-quotation="' + escapeHtml(row.code) + '">詳細</button>';
      }
    }
  ];
  if (canEdit) {
    columns.push({
      key: "_actions",
      label: "操作",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-edit-quotation="' + escapeHtml(row.code) + '">編集</button>';
      }
    });
  }
  return {
    stateKey: "quotationList",
    title: "見積一覧",
    rows: quotations,
    columns: columns,
    searchKeys: ["code", "title", "projectCode", "customerId"],
    filters: [
      {
        key: "status",
        label: "状態",
        options: ["all", "下書き", "承認依頼中", "承認済み", "取消", "失注"],
        allLabel: "全状態"
      }
    ],
    emptyMessage: "条件に一致する見積がありません。",
    hasActions: canEdit,
    tableClass: "quotation",
    toolbarExtra: canEdit
      ? '<button class="button button-primary" type="button" id="new-quotation-btn">+ 新規登録</button>'
      : ""
  };
}

function quotationStatusClass(status) {
  if (status === "承認済み") return "is-open";
  if (status === "承認依頼中") return "is-pending";
  if (status === "取消" || status === "失注") return "is-locked";
  return "is-info";
}

function quotationFormHtml(user) {
  const form = viewState.quotationForm;
  const isNew = form.mode === "register";
  const data = form.data;
  const errors = form.errors;

  const canEdit = hasPermission(user, "quotation:edit");
  const canApprove = hasPermission(user, "approval:act");

  // ワークフロー状態から操作権限を決定
  const isDraft = isNew || data.status === "下書き";
  const isPending = data.status === "承認依頼中";
  const isApproved = data.status === "承認済み";
  const isEditable = isNew || (isDraft && canEdit);
  const isApprovalAction = !isNew && isPending && canApprove;
  const isLostAction = !isNew && isApproved && canEdit;

  function fieldHtml(id, label, inputHtml, required, errorKey) {
    const error = errors[errorKey] || null;
    return (
      '<div class="form-field' + (required ? " is-required" : "") + '">' +
        '<label class="field-label" for="' + id + '">' +
          escapeHtml(label) +
          (required ? '<span class="required-mark">必須</span>' : "") +
        "</label>" +
        inputHtml +
        '<div class="field-error">' + (error ? escapeHtml(error) : "") + "</div>" +
      "</div>"
    );
  }

  function textInputHtml(id, key, placeholder, forceReadonly, type) {
    const readonly = forceReadonly || !isEditable;
    const hasError = !readonly && !!(errors[key]);
    return (
      '<input class="input' + (hasError ? " is-error" : "") + (readonly ? " is-readonly" : "") + '" id="' + id + '" type="' + (type || "text") + '" ' +
        'data-form-field="' + key + '" ' +
        'value="' + escapeHtml(data[key] || "") + '" ' +
        'placeholder="' + escapeHtml(placeholder) + '"' +
        (readonly ? " readonly" : "") + ">"
    );
  }

  function textareaHtml(id, key, placeholder) {
    const readonly = !isEditable;
    return (
      '<textarea class="input' + (readonly ? " is-readonly" : "") + '" id="' + id + '" data-form-field="' + key + '" rows="3" placeholder="' + escapeHtml(placeholder) + '"' +
        (readonly ? " readonly" : "") + '>' + escapeHtml(data[key] || "") + '</textarea>'
    );
  }

  const selectedProject = projects.find(function (p) { return p.code === data.projectCode; });
  const selectedCustomer = selectedProject ? findCustomerByCode(customers, selectedProject.customerId) : null;
  const customerDisplay = selectedCustomer ? selectedCustomer.name : "—";

  const statusBadge = '<span class="status ' + quotationStatusClass(data.status) + '">' + escapeHtml(data.status || "下書き") + "</span>";

  let buttonsHtml = "";
  if (isEditable) {
    buttonsHtml =
      '<button class="button button-primary" type="submit" data-quo-action="draft">下書き保存</button>' +
      '<button class="button button-warning" type="submit" data-quo-action="request">承認依頼</button>' +
      '<button class="button button-secondary" type="button" id="quotation-form-cancel">キャンセル</button>';
  } else if (isApprovalAction) {
    buttonsHtml =
      '<button class="button button-primary" type="submit" data-quo-action="approve">承認する</button>' +
      '<button class="button button-danger" type="submit" data-quo-action="reject">却下する</button>' +
      '<button class="button button-secondary" type="button" id="quotation-form-cancel">キャンセル</button>';
  } else if (isLostAction) {
    buttonsHtml =
      '<button class="button button-danger" type="submit" data-quo-action="lost">失注に変更</button>' +
      '<button class="button button-secondary" type="button" id="quotation-form-cancel">キャンセル</button>';
  } else {
    buttonsHtml = '<button class="button button-secondary" type="button" id="quotation-form-cancel">一覧に戻る</button>';
  }

  // 新規登録は商談中のみ選択可。編集は既存プロジェクトが残るため絞り込まない
  const projectStatusFilter = isNew ? ['商談中'] : null;
  const projectFieldHtml = isEditable
    ? fieldHtml("f-quo-project", "案件", projectSearchHtml("projectCode", data.projectCode, projectStatusFilter), true, "projectCode")
    : '<div class="form-field"><label class="field-label">案件</label><div class="input is-readonly">' + escapeHtml(selectedProject ? selectedProject.name : data.projectCode) + "</div></div>";

  const panelLabel = isApprovalAction ? "S-04 承認" : isLostAction ? "S-04 失注処理" : isNew ? "S-04 Step 2a" : "S-04 Step 2b";
  const panelTitle = isApprovalAction ? "見積承認" : isLostAction ? "見積 失注処理" : "見積" + (isNew ? "登録" : "編集");

  const details = form.details;
  const taxRateOptions = [
    { value: "0.10", label: "10%" },
    { value: "0.08", label: "8%" },
    { value: "0.00", label: "非課税" }
  ];

  function detailRowHtml(d) {
    const subtotal = d.unitPrice * d.quantity - (d.discount || 0);
    const amount = subtotal + Math.floor(subtotal * d.taxRate);
    const readonly = !isEditable;
    const productOpts = products.map(function (p) {
      return '<option value="' + escapeHtml(p.code) + '"' + (d.productCode === p.code ? " selected" : "") + ">" + escapeHtml(p.name) + "</option>";
    }).join("");
    const taxOpts = taxRateOptions.map(function (t) {
      return '<option value="' + t.value + '"' + (String(d.taxRate) === t.value ? " selected" : "") + ">" + t.label + "</option>";
    }).join("");

    return (
      '<div class="detail-line" data-line-no="' + d.lineNo + '">' +
        '<select class="select select-sm" data-detail-field="productCode"' + (readonly ? " disabled" : "") + '>' +
          '<option value="">選択</option>' + productOpts +
        '</select>' +
        '<input class="input input-sm" type="text" data-detail-field="productName" value="' + escapeHtml(d.productName) + '" placeholder="商品名"' + (readonly ? " readonly" : "") + '>' +
        '<input class="input input-sm" type="number" data-detail-field="quantity" value="' + d.quantity + '" min="1"' + (readonly ? " readonly" : "") + '>' +
        '<input class="input input-sm" type="text" data-detail-field="unit" value="' + escapeHtml(d.unit) + '" placeholder="式"' + (readonly ? " readonly" : "") + '>' +
        '<input class="input input-sm" type="number" data-detail-field="unitPrice" value="' + d.unitPrice + '" min="0"' + (readonly ? " readonly" : "") + '>' +
        '<input class="input input-sm" type="number" data-detail-field="discount" value="' + (d.discount || 0) + '" min="0"' + (readonly ? " readonly" : "") + '>' +
        '<select class="select select-sm" data-detail-field="taxRate"' + (readonly ? " disabled" : "") + '>' + taxOpts + '</select>' +
        '<div class="detail-amount">' + Number(amount).toLocaleString() + ' 円</div>' +
        (isEditable ? '<button class="button button-ghost button-sm" type="button" data-remove-line="' + d.lineNo + '">削除</button>' : '<div></div>') +
      '</div>'
    );
  }

  const subtotal = details.reduce(function (s, d) { return s + d.unitPrice * d.quantity - (d.discount || 0); }, 0);
  const taxAmount = details.reduce(function (s, d) { return s + Math.floor((d.unitPrice * d.quantity - (d.discount || 0)) * d.taxRate); }, 0);
  const total = subtotal + taxAmount;

  const detailsHtml = (
    '<div class="detail-section">' +
      '<div class="detail-section-header">' +
        '<span class="detail-section-title">見積明細</span>' +
        (isEditable ? '<button class="button button-secondary button-sm" type="button" id="add-detail-line">＋ 行追加</button>' : '') +
      '</div>' +
      '<div class="detail-table">' +
        '<div class="detail-table-head">' +
          '<div>商品</div><div>商品名</div><div>数量</div><div>単位</div><div>単価</div><div>値引</div><div>税率</div><div>金額</div>' +
          (isEditable ? '<div></div>' : '<div></div>') +
        '</div>' +
        '<div id="detail-lines">' +
          (details.length ? details.map(detailRowHtml).join('') : '<div class="detail-empty">明細行がありません。「＋ 行追加」で追加してください。</div>') +
        '</div>' +
      '</div>' +
      '<div class="detail-totals">' +
        '<div class="detail-total-row"><span>小計</span><span>' + Number(subtotal).toLocaleString() + ' 円</span></div>' +
        '<div class="detail-total-row"><span>消費税</span><span>' + Number(taxAmount).toLocaleString() + ' 円</span></div>' +
        '<div class="detail-total-row is-total"><span>合計</span><span>' + Number(total).toLocaleString() + ' 円</span></div>' +
      '</div>' +
    '</div>'
  );

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">' + panelLabel + "</div>" +
          '<div class="panel-title-text">' + panelTitle + "</div>" +
        "</div>" +
        '<div class="toolbar">' +
          statusBadge +
          '<span class="menu-tag">' + (isNew ? "新規登録" : escapeHtml(form.editCode)) + "</span>" +
        "</div>" +
      "</div>" +
      '<form class="register-form" id="quotation-register-form" data-form-context="quotation" novalidate>' +
        '<input type="hidden" id="f-quo-version" value="' + (data.version || 1) + '">' +
        '<div class="form-grid">' +
          fieldHtml("f-quo-code", "見積番号", textInputHtml("f-quo-code", "code", "QUO-XXXXX", true), true, "code") +
          fieldHtml("f-quo-title", "見積件名", textInputHtml("f-quo-title", "title", "○○案件 見積", false), true, "title") +
          projectFieldHtml +
          '<div class="form-field">' +
            '<label class="field-label">顧客名（案件から自動設定）</label>' +
            '<div class="input is-readonly" id="quotation-customer-display">' + escapeHtml(customerDisplay) + "</div>" +
          "</div>" +
          fieldHtml("f-quo-issue-date", "発行日", textInputHtml("f-quo-issue-date", "issueDate", "2026-05-01", false, "date"), isEditable, "issueDate") +
          fieldHtml("f-quo-validity-date", "有効期限", textInputHtml("f-quo-validity-date", "validityDate", "2026-06-01", false, "date"), false, "validityDate") +
        "</div>" +
        detailsHtml +
        '<div class="form-field">' +
          '<label class="field-label" for="f-quo-notes">備考</label>' +
          textareaHtml("f-quo-notes", "notes", "顧客への備考・伝達事項") +
          '<div class="field-error"></div>' +
        "</div>" +
        (isApprovalAction
          ? '<div class="form-field is-required">' +
              '<label class="field-label" for="f-quo-reject-reason">却下理由<span class="required-mark">必須（却下時）</span></label>' +
              '<textarea class="input' + (errors.rejectReason ? " is-error" : "") + '" id="f-quo-reject-reason" data-form-field="rejectReason" rows="3" placeholder="却下する場合は理由を入力してください">' +
                escapeHtml(data.rejectReason || "") +
              '</textarea>' +
              '<div class="field-error">' + (errors.rejectReason ? escapeHtml(errors.rejectReason) : "") + '</div>' +
            '</div>'
          : '') +
        '<div class="form-actions">' + buttonsHtml + "</div>" +
      "</form>" +
    "</section>"
  );
}

function quotationDetailHtml(user) {
  const q = findQuotationByCode(quotations, viewState.quotationDetailCode);
  if (!q) return '<div class="empty-card">見積が見つかりません。</div>';

  const project = projects.find(function (p) { return p.code === q.projectCode; });
  const customer = findCustomerByCode(customers, q.customerId);
  const canEdit = hasPermission(user, "quotation:edit");
  const canApprove = hasPermission(user, "approval:act");
  const canApproveThis = canApprove && q.status === '承認依頼中';

  const subtotal = q.subtotal || 0;
  const taxAmount = q.taxAmount || 0;
  const total = q.total || 0;

  const detailRowsHtml = (q.details || []).map(function (d) {
    return (
      '<div class="detail-line">' +
        '<div class="input-sm is-readonly">' + escapeHtml(d.productCode) + '</div>' +
        '<div class="input-sm is-readonly">' + escapeHtml(d.productName) + '</div>' +
        '<div class="input-sm is-readonly" style="text-align:right">' + d.quantity + '</div>' +
        '<div class="input-sm is-readonly">' + escapeHtml(d.unit) + '</div>' +
        '<div class="input-sm is-readonly" style="text-align:right">' + Number(d.unitPrice).toLocaleString() + '</div>' +
        '<div class="input-sm is-readonly" style="text-align:right">' + Number(d.discount || 0).toLocaleString() + '</div>' +
        '<div class="input-sm is-readonly">' + (d.taxRate === 0.10 ? '10%' : d.taxRate === 0.08 ? '8%' : '非課税') + '</div>' +
        '<div class="detail-amount">' + Number(d.amount || 0).toLocaleString() + ' 円</div>' +
        '<div></div>' +
      '</div>'
    );
  }).join('');

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-04 見積詳細</div>' +
          '<div class="panel-title-text">' + escapeHtml(q.title) + '</div>' +
        '</div>' +
        '<div class="toolbar">' +
          '<span class="status ' + quotationStatusClass(q.status) + '">' + escapeHtml(q.status) + '</span>' +
          (canEdit && q.status === '下書き'
            ? '<button class="button button-secondary" type="button" data-action-edit-quotation="' + escapeHtml(q.code) + '">編集</button>'
            : '') +
          (canEdit && q.status === '承認済み'
            ? '<button class="button button-warning" type="button" data-action-revise-quotation="' + escapeHtml(q.code) + '">改版</button>'
            : '') +
          (canEdit && q.status === '承認済み'
            ? '<button class="button button-primary" type="button" data-action-create-order="' + escapeHtml(q.code) + '">受注作成</button>'
            : '') +
          (canEdit && q.status === '却下'
            ? '<button class="button button-secondary" type="button" id="quotation-return-draft-btn">下書きに戻す</button>'
            : '') +
          '<button class="button button-secondary" type="button" data-action-print-quotation="' + escapeHtml(q.code) + '">PDF出力</button>' +
          (canApproveThis
            ? '<button class="button button-primary" type="button" id="quotation-approve-btn">承認する</button>' +
              '<button class="button button-danger" type="button" id="quotation-reject-btn">却下</button>'
            : '') +
          (viewState.approvalFrom === 'approval'
            ? '<button class="button button-ghost" type="button" id="quotation-detail-back">承認一覧に戻る</button>'
            : '<button class="button button-ghost" type="button" id="quotation-detail-back">一覧へ戻る</button>') +
        '</div>' +
      '</div>' +
      (canApproveThis ? approvalActionPanelHtml() : '') +
      '<div class="detail-grid">' +
        '<div class="detail-row"><span class="detail-label">見積番号</span><span class="detail-value">' + escapeHtml(q.code) + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">版数</span><span class="detail-value">第 ' + q.version + ' 版</span></div>' +
        '<div class="detail-row"><span class="detail-label">案件</span><span class="detail-value">' + escapeHtml(project ? project.name : q.projectCode) + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">顧客</span><span class="detail-value">' + escapeHtml(customer ? customer.name : q.customerId) + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">発行日</span><span class="detail-value">' + escapeHtml(q.issueDate || '—') + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">有効期限</span><span class="detail-value">' + escapeHtml(q.validityDate || '—') + '</span></div>' +
        (q.notes ? '<div class="detail-row detail-row-full"><span class="detail-label">備考</span><span class="detail-value">' + escapeHtml(q.notes) + '</span></div>' : '') +
        (q.rejectReason ? '<div class="detail-row detail-row-full"><span class="detail-label reject-reason-label">却下理由</span><span class="detail-value reject-reason-value">' + escapeHtml(q.rejectReason) + '</span></div>' : '') +
      '</div>' +
      '<div class="detail-section">' +
        '<div class="detail-section-header"><span class="detail-section-title">見積明細</span></div>' +
        '<div class="detail-table">' +
          '<div class="detail-table-head"><div>商品</div><div>商品名</div><div>数量</div><div>単位</div><div>単価</div><div>値引</div><div>税率</div><div>金額</div><div></div></div>' +
          '<div>' + (detailRowsHtml || '<div class="detail-empty">明細なし</div>') + '</div>' +
        '</div>' +
        '<div class="detail-totals">' +
          '<div class="detail-total-row"><span>小計</span><span>' + Number(subtotal).toLocaleString() + ' 円</span></div>' +
          '<div class="detail-total-row"><span>消費税</span><span>' + Number(taxAmount).toLocaleString() + ' 円</span></div>' +
          '<div class="detail-total-row is-total"><span>合計</span><span>' + Number(total).toLocaleString() + ' 円</span></div>' +
        '</div>' +
      '</div>' +
      approvalHistorySectionHtml(q) +
    '</section>'
  );
}

function quotationScreenHtml(user) {
  if (viewState.quotationForm.mode === "register" || viewState.quotationForm.mode === "edit") {
    return quotationFormHtml(user);
  }
  if (viewState.quotationView === "detail" && viewState.quotationDetailCode) {
    return quotationDetailHtml(user);
  }
  return dataTableHtml(getQuotationTableConfig(user));
}

function orderStatusClass(status) {
  if (status === '完了') return 'is-open';
  if (status === 'キャンセル') return 'is-locked';
  return 'is-info';
}

function getOrderTableConfig(user) {
  const columns = [
    { key: "code", label: "受注番号", sortable: true },
    { key: "title", label: "受注件名", sortable: true },
    {
      key: "projectCode",
      label: "案件名",
      sortable: true,
      render: function (value) {
        const p = projects.find(function (pj) { return pj.code === value; });
        return p ? escapeHtml(p.name) : escapeHtml(value);
      }
    },
    {
      key: "customerId",
      label: "顧客名",
      sortable: true,
      render: function (value) {
        const c = findCustomerByCode(customers, value);
        return c ? escapeHtml(c.name) : escapeHtml(value);
      }
    },
    { key: "orderDate", label: "受注日", sortable: true },
    {
      key: "total",
      label: "受注金額",
      sortable: true,
      render: function (value) {
        return escapeHtml(Number(value).toLocaleString()) + " 円";
      }
    },
    {
      key: "status",
      label: "状態",
      sortable: true,
      render: function (value) {
        return '<span class="status ' + orderStatusClass(value) + '">' + escapeHtml(value) + "</span>";
      }
    },
    {
      key: "_detail",
      label: "詳細",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-detail-order="' + escapeHtml(row.code) + '">詳細</button>';
      }
    }
  ];
  return {
    stateKey: "orderList",
    title: "受注一覧",
    rows: orders,
    columns: columns,
    searchKeys: ["code", "title"],
    filters: [
      {
        key: "status",
        label: "状態",
        options: ["all", "受注済み", "完了", "キャンセル"],
        allLabel: "全状態"
      }
    ],
    emptyMessage: "条件に一致する受注がありません。",
    hasActions: false,
    tableClass: "order",
    toolbarExtra: ""
  };
}

function orderDetailHtml(user) {
  const order = findOrderByCode(orders, viewState.orderDetailCode);
  if (!order) return '<div class="panel"><div class="panel-header"><div class="panel-title-text">受注が見つかりません</div></div></div>';

  const project = projects.find(function (p) { return p.code === order.projectCode; });
  const customer = findCustomerByCode(customers, order.customerId);
  const canEdit = user && hasPermission(user, "sales-order:edit");
  const canApproveOrder = user && hasPermission(user, "approval:act") && order.status === '承認依頼中';
  const linkedQuotation = order.quotationCode ? findQuotationByCode(quotations, order.quotationCode) : null;
  const statusClass = orderStatusClass(order.status);

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-05 受注詳細</div>' +
          '<div class="panel-title-text">' + escapeHtml(order.title) + '</div>' +
        '</div>' +
        '<div class="panel-actions">' +
          (canEdit && order.status === '受注済み' ?
            '<button class="button button-warning button-sm" type="button" id="order-submit-approval-btn">承認依頼</button>'
          : '') +
          (canEdit && order.status === '却下' ?
            '<button class="button button-secondary button-sm" type="button" id="order-return-draft-btn">下書きに戻す</button>'
          : '') +
          (canEdit && order.status === '承認済み' && !order.billingTarget ?
            '<button class="button button-primary button-sm" type="button" data-action-billing-target="' + escapeHtml(order.code) + '">請求対象化</button>'
          : '') +
          (canEdit && order.status === '承認済み' && order.billingTarget ?
            '<span class="status-badge is-open">請求対象</span>'
          : '') +
          (canEdit && order.status === '承認済み' ?
            '<button class="button button-secondary button-sm" type="button" data-action-create-purchase-order="' + escapeHtml(order.code) + '">発注起票</button>'
          : '') +
          (hasPermission(user, 'user-permission:edit') && order.status === '承認済み' ?
            '<button class="button button-primary button-sm" type="button" id="order-complete-contract-btn">契約手続き済にする</button>'
          : '') +
          (canApproveOrder ?
            '<button class="button button-primary button-sm" type="button" id="order-approve-btn">承認する</button>' +
            '<button class="button button-danger button-sm" type="button" id="order-reject-btn">却下</button>'
          : '') +
          (viewState.approvalFrom === 'approval'
            ? '<button class="button button-ghost button-sm" type="button" id="order-detail-back">承認一覧に戻る</button>'
            : '<button class="button button-secondary button-sm" type="button" id="order-detail-back">一覧に戻る</button>') +
        '</div>' +
      '</div>' +
      (canApproveOrder ? approvalActionPanelHtml() : '') +
      '<div class="detail-grid">' +
        '<div class="detail-field">' +
          '<div class="detail-label">受注番号</div>' +
          '<div class="detail-value">' + escapeHtml(order.code) + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">ステータス</div>' +
          '<div class="detail-value"><span class="status-badge ' + statusClass + '">' + escapeHtml(order.status) + '</span></div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">見積番号</div>' +
          '<div class="detail-value">' + escapeHtml(order.quotationCode || '-') + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">案件</div>' +
          '<div class="detail-value">' + escapeHtml(project ? project.name : order.projectCode) + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">顧客</div>' +
          '<div class="detail-value">' + escapeHtml(customer ? customer.name : order.customerId) + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">受注日</div>' +
          '<div class="detail-value">' + escapeHtml(order.orderDate || '-') + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">納期</div>' +
          '<div class="detail-value">' + escapeHtml(order.deliveryDate || '-') + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">受注金額</div>' +
          '<div class="detail-value">' + Number(order.total || 0).toLocaleString() + ' 円</div>' +
        '</div>' +
      '</div>' +
      (order.notes ?
        '<div class="detail-section">' +
          '<div class="detail-section-label">備考</div>' +
          '<div class="detail-section-body">' + escapeHtml(order.notes) + '</div>' +
        '</div>'
      : '') +
      ((order.attachments && order.attachments.length > 0) ?
        '<div class="detail-section">' +
          '<div class="detail-section-label">添付ファイル</div>' +
          '<ul class="attachment-list">' +
          order.attachments.map(function (a) {
            return '<li class="attachment-item">' +
              '<span class="attachment-name">' + escapeHtml(a.name) + '</span>' +
              '<span class="attachment-size">(' + Math.ceil(a.size / 1024) + ' KB)</span>' +
              '</li>';
          }).join('') +
          '</ul>' +
        '</div>'
      : '') +
      approvalHistorySectionHtml(order) +
    '</section>'
  );
}

function orderFormHtml(user) {
  const form = viewState.orderForm;
  const data = form.data;
  const errors = form.errors;
  const project = projects.find(function (p) { return p.code === data.projectCode; });
  const customer = findCustomerByCode(customers, data.customerId);

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-05 受注登録</div>' +
          '<div class="panel-title-text">受注登録</div>' +
        '</div>' +
      '</div>' +
      '<form class="register-form" id="order-register-form" novalidate>' +
        '<input type="hidden" id="f-order-code" value="' + escapeHtml(data.code) + '">' +
        '<input type="hidden" id="f-order-quotation-code" value="' + escapeHtml(data.quotationCode) + '">' +
        '<div class="form-grid">' +
          '<div class="form-field is-required">' +
            '<label class="field-label">受注番号</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.code) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">見積番号</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.quotationCode) + '</div>' +
          '</div>' +
          '<div class="form-field is-required">' +
            '<label class="field-label" for="f-order-title">受注件名<span class="required-mark">必須</span></label>' +
            '<input class="input" id="f-order-title" type="text" value="' + escapeHtml(data.title) + '" placeholder="受注件名">' +
            '<div class="field-error">' + (errors.title ? escapeHtml(errors.title) : '') + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">案件</label>' +
            '<div class="input is-readonly">' + escapeHtml(project ? project.name : data.projectCode) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">顧客</label>' +
            '<div class="input is-readonly">' + escapeHtml(customer ? customer.name : data.customerId) + '</div>' +
          '</div>' +
          '<div class="form-field is-required">' +
            '<label class="field-label" for="f-order-date">受注日<span class="required-mark">必須</span></label>' +
            '<input class="input' + (errors.orderDate ? ' is-error' : '') + '" id="f-order-date" type="date" value="' + escapeHtml(data.orderDate) + '">' +
            '<div class="field-error">' + (errors.orderDate ? escapeHtml(errors.orderDate) : '') + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-order-delivery-date">納期</label>' +
            '<input class="input" id="f-order-delivery-date" type="date" value="' + escapeHtml(data.deliveryDate || '') + '">' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">受注金額</label>' +
            '<div class="input is-readonly">' + Number(data.total).toLocaleString() + ' 円</div>' +
          '</div>' +
        '</div>' +
        '<div class="form-field">' +
          '<label class="field-label" for="f-order-notes">備考</label>' +
          '<textarea class="input" id="f-order-notes" rows="3" placeholder="受注備考">' + escapeHtml(data.notes || '') + '</textarea>' +
        '</div>' +
        '<div class="form-field">' +
          '<label class="field-label">添付ファイル</label>' +
          '<input class="input" type="file" id="f-order-attachment" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg">' +
          (form.attachments.length > 0 ?
            '<ul class="attachment-list" id="order-attachment-list">' +
            form.attachments.map(function (a, i) {
              return '<li class="attachment-item" data-attachment-index="' + i + '">' +
                '<span class="attachment-name">' + escapeHtml(a.name) + '</span>' +
                '<span class="attachment-size">(' + Math.ceil(a.size / 1024) + ' KB)</span>' +
                '<button type="button" class="button button-danger button-sm" data-action-remove-attachment="' + i + '">削除</button>' +
                '</li>';
            }).join('') +
            '</ul>'
          : '') +
        '</div>' +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">受注登録</button>' +
          '<button class="button button-secondary" type="button" id="order-form-cancel">キャンセル</button>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

function salesOrderScreenHtml(user) {
  if (viewState.orderForm.mode === "register") {
    return orderFormHtml(user);
  }
  if (viewState.orderView === "detail" && viewState.orderDetailCode) {
    return orderDetailHtml(user);
  }
  return dataTableHtml(getOrderTableConfig(user));
}

function purchaseOrderStatusClass(status) {
  if (status === '下書き') return 'is-info';
  if (status === '承認依頼中') return 'is-pending';
  if (status === '承認済・発注待ち') return 'is-approved';
  if (status === '発注済') return 'is-open';
  if (status === '一部納品') return 'is-open';
  if (status === '納品済') return 'is-complete';
  if (status === '取下げ') return 'is-locked';
  if (status === '却下') return 'is-locked';
  return '';
}

function findSupplierById(supplierId) {
  return suppliers.find(function(s) { return s.code === supplierId; });
}

function getPurchaseOrderTableConfig(user) {
  const canEdit = user && hasPermission(user, "purchase-order:edit");
  const columns = [
    { key: "code", label: "発注番号", sortable: true },
    { key: "title", label: "件名", sortable: true },
    {
      key: "supplierName",
      label: "仕入先",
      sortable: false,
      render: function(val) { return escapeHtml(val); }
    },
    { key: "orderCode", label: "受注番号", sortable: true },
    { key: "orderDate", label: "発注日", sortable: true },
    {
      key: "total",
      label: "発注金額",
      sortable: true,
      render: function(val) { return Number(val).toLocaleString() + ' 円'; }
    },
    {
      key: "status",
      label: "ステータス",
      sortable: true,
      render: function(val) {
        return '<span class="status-badge ' + purchaseOrderStatusClass(val) + '">' + escapeHtml(val) + '</span>';
      }
    },
    {
      key: "actions",
      label: "",
      sortable: false,
      render: function(_, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-detail-purchase-order="' + escapeHtml(row.code) + '">詳細</button>';
      }
    }
  ];
  const tableState = viewState.tables.purchaseOrderList;
  const rows = purchaseOrders.map(function(po) {
    const sup = findSupplierById(po.supplierId);
    return Object.assign({}, po, { supplierName: sup ? sup.name : po.supplierId });
  });
  return {
    columns: columns,
    rows: rows,
    stateKey: "purchaseOrderList",
    searchKeys: ["code", "title", "supplierName", "orderCode"],
    title: "発注一覧",
    tableState: tableState,
    filters: [
      {
        key: "status",
        label: "ステータス",
        allLabel: "すべて",
        options: ["all", "下書き", "承認依頼中", "承認済・発注待ち", "発注済", "一部納品", "納品済", "取下げ", "却下"]
      }
    ],
    emptyMessage: "条件に一致する発注がありません。",
    hasActions: false,
    tableClass: "purchase-order",
    toolbarExtra: canEdit
      ? '<button class="button button-primary" type="button" id="new-purchase-order-btn">新規発注</button>'
      : ""
  };
}

function purchaseOrderDetailHtml(user) {
  const pod = findPurchaseOrderByCode(purchaseOrders, viewState.purchaseOrderDetailCode);
  if (!pod) return '<div class="panel"><div class="panel-header"><div class="panel-title-text">発注が見つかりません</div></div></div>';

  const supplier = findSupplierById(pod.supplierId);
  const order = pod.orderCode ? findOrderByCode(orders, pod.orderCode) : null;
  const canEdit = user && hasPermission(user, "purchase-order:edit");
  const canApprovePod = user && hasPermission(user, "approval:act") && pod.status === '承認依頼中';
  const statusCls = purchaseOrderStatusClass(pod.status);

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-06 発注詳細</div>' +
          '<div class="panel-title-text">' + escapeHtml(pod.title || pod.code) + '</div>' +
        '</div>' +
        '<div class="panel-actions">' +
          (canEdit && pod.status === '下書き' ?
            '<button class="button button-warning button-sm" type="button" id="pod-submit-approval-btn">承認依頼</button>'
          : '') +
          '<button class="button button-secondary button-sm" type="button" data-action-print-pod="' + escapeHtml(pod.code) + '">発注書出力</button>' +
          (canEdit && pod.status === '承認済・発注待ち' ?
            '<button class="button button-primary button-sm" type="button" data-action-pod-status="発注済" data-pod-code="' + escapeHtml(pod.code) + '">発注確定</button>'
          : '') +
          (canEdit && (pod.status === '発注済' || pod.status === '一部納品') ?
            '<button class="button button-primary button-sm" type="button" data-action-delivery-register="' + escapeHtml(pod.code) + '">納品登録</button>'
          : '') +
          (pod.status === '承認済・発注待ち' ?
            '<button class="button button-secondary button-sm" type="button" data-action-contract-process="' + escapeHtml(pod.code) + '">契約書類出力</button>'
          : '') +
          (canEdit && pod.status === '下書き' ?
            '<button class="button button-danger button-sm" type="button" data-action-pod-status="取下げ" data-pod-code="' + escapeHtml(pod.code) + '">取下げ</button>'
          : '') +
          (canEdit && pod.status === '却下' ?
            '<button class="button button-secondary button-sm" type="button" id="pod-return-draft-btn">下書きに戻す</button>'
          : '') +
          (canApprovePod ?
            '<button class="button button-primary button-sm" type="button" id="pod-approve-btn">承認する</button>' +
            '<button class="button button-danger button-sm" type="button" id="pod-reject-btn">却下</button>'
          : '') +
          (viewState.approvalFrom === 'approval'
            ? '<button class="button button-ghost button-sm" type="button" id="pod-detail-back">承認一覧に戻る</button>'
            : '<button class="button button-secondary button-sm" type="button" id="pod-detail-back">一覧に戻る</button>') +
        '</div>' +
      '</div>' +
      (canApprovePod ? approvalActionPanelHtml() : '') +
      '<div class="detail-grid">' +
        '<div class="detail-field">' +
          '<div class="detail-label">発注番号</div>' +
          '<div class="detail-value">' + escapeHtml(pod.code) + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">ステータス</div>' +
          '<div class="detail-value"><span class="status-badge ' + statusCls + '">' + escapeHtml(pod.status) + '</span></div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">受注番号</div>' +
          '<div class="detail-value">' + escapeHtml(pod.orderCode || '-') + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">仕入先</div>' +
          '<div class="detail-value">' + escapeHtml(supplier ? supplier.name : pod.supplierId) + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">発注日</div>' +
          '<div class="detail-value">' + escapeHtml(pod.orderDate || '-') + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">納期</div>' +
          '<div class="detail-value">' + escapeHtml(pod.deliveryDate || '-') + '</div>' +
        '</div>' +
        '<div class="detail-field">' +
          '<div class="detail-label">発注金額</div>' +
          '<div class="detail-value">' + Number(pod.total || 0).toLocaleString() + ' 円</div>' +
        '</div>' +
        (pod.contractMethod ?
          '<div class="detail-field">' +
            '<div class="detail-label">契約処理方法</div>' +
            '<div class="detail-value">' + escapeHtml(pod.contractMethod) + '</div>' +
          '</div>'
        : '') +
      '</div>' +
      (pod.notes ?
        '<div class="detail-section">' +
          '<div class="detail-section-label">備考</div>' +
          '<div class="detail-section-body">' + escapeHtml(pod.notes) + '</div>' +
        '</div>'
      : '') +
      ((pod.details && pod.details.length > 0) ?
        '<div class="detail-section">' +
          '<div class="detail-section-label">発注明細</div>' +
          '<div class="detail-table">' +
            '<div class="detail-table-head">' +
              '<div>行</div><div>品名</div><div>数量</div><div>単位</div><div>単価</div><div>金額</div>' +
            '</div>' +
            pod.details.map(function(d) {
              const lineSubtotal = (d.quantity || 1) * (d.unitPrice || 0) * (1 - (d.discount || 0));
              const lineTotal = lineSubtotal + Math.floor(lineSubtotal * (d.taxRate || 0));
              return '<div class="detail-table-row">' +
                '<div>' + d.lineNo + '</div>' +
                '<div>' + escapeHtml(d.productName) + '</div>' +
                '<div>' + d.quantity + '</div>' +
                '<div>' + escapeHtml(d.unit || '') + '</div>' +
                '<div>' + Number(d.unitPrice).toLocaleString() + '</div>' +
                '<div>' + Number(lineTotal).toLocaleString() + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>'
      : '') +
      ((pod.attachments && pod.attachments.length > 0) ?
        '<div class="detail-section">' +
          '<div class="detail-section-label">添付ファイル</div>' +
          '<ul class="attachment-list">' +
          pod.attachments.map(function(a) {
            return '<li class="attachment-item">' +
              '<span class="attachment-name">' + escapeHtml(a.name) + '</span>' +
              '<span class="attachment-size">(' + Math.ceil(a.size / 1024) + ' KB)</span>' +
              '</li>';
          }).join('') +
          '</ul>' +
        '</div>'
      : '') +
      (function() {
        const podDeliveries = deliveries.filter(function(d) { return d.purchaseOrderCode === pod.code; });
        if (podDeliveries.length === 0) return '';
        return '<div class="detail-section">' +
          '<div class="detail-section-label">納品実績</div>' +
          '<div class="detail-table">' +
            '<div class="detail-table-head">' +
              '<div>納品番号</div><div>納品日</div><div>ステータス</div><div>備考</div><div>操作</div>' +
            '</div>' +
            podDeliveries.map(function(d) {
              return '<div class="detail-table-row" data-delivery-code="' + escapeHtml(d.code) + '">' +
                '<div>' + escapeHtml(d.code) + '</div>' +
                '<div>' + escapeHtml(d.deliveryDate) + '</div>' +
                '<div>' + escapeHtml(d.status) + '</div>' +
                '<div>' + escapeHtml(d.notes || '') + '</div>' +
                '<div>' +
                  (d.status === '検収待ち' ?
                    '<button class="button button-primary button-xs" type="button" data-action-accept-delivery="' + escapeHtml(d.code) + '">検収済にする</button>' +
                    '<button class="button button-danger button-xs" type="button" data-action-reject-delivery="' + escapeHtml(d.code) + '">検収NG</button>'
                  : '') +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      })() +
      approvalHistorySectionHtml(pod) +
    '</section>'
  );
}

function deliveryFormHtml() {
  const form = viewState.deliveryForm;
  const data = form.data;
  const errors = form.errors;
  const pod = findPurchaseOrderByCode(purchaseOrders, data.purchaseOrderCode);
  const podDetails = pod ? (pod.details || []) : [];

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-07 納品登録</div>' +
          '<div class="panel-title-text">納品登録</div>' +
        '</div>' +
      '</div>' +
      '<form class="register-form" id="delivery-register-form" novalidate>' +
        '<input type="hidden" id="f-dlv-code" value="' + escapeHtml(data.code) + '">' +
        '<input type="hidden" id="f-dlv-pod-code" value="' + escapeHtml(data.purchaseOrderCode) + '">' +
        '<div class="form-grid">' +
          '<div class="form-field">' +
            '<label class="field-label">納品番号</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.code) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">発注番号</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.purchaseOrderCode) + '</div>' +
          '</div>' +
          '<div class="form-field' + (errors.deliveryDate ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-dlv-date">納品日 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-dlv-date" type="date" value="' + escapeHtml(data.deliveryDate || '') + '">' +
            (errors.deliveryDate ? '<div class="error-message">' + escapeHtml(errors.deliveryDate) + '</div>' : '') +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-dlv-notes">備考</label>' +
            '<input class="input" id="f-dlv-notes" type="text" value="' + escapeHtml(data.notes || '') + '">' +
          '</div>' +
        '</div>' +
        (podDetails.length > 0 ?
          '<div class="detail-section">' +
            '<div class="detail-section-label">納品数量</div>' +
            '<div class="detail-table">' +
              '<div class="detail-table-head">' +
                '<div>行</div><div>品名</div><div>発注数</div><div>今回納品数 <span class="required-mark">*</span></div>' +
              '</div>' +
              podDetails.map(function(d) {
                return '<div class="detail-table-row">' +
                  '<div>' + d.lineNo + '</div>' +
                  '<div>' + escapeHtml(d.productName) + '</div>' +
                  '<div>' + d.quantity + '</div>' +
                  '<div><input class="input input-sm" type="number" min="0" max="' + d.quantity + '" id="f-dlv-qty-' + d.lineNo + '" data-line-no="' + d.lineNo + '" value="' + d.quantity + '"></div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>'
        : '') +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">登録</button>' +
          '<button class="button button-secondary" type="button" id="delivery-form-cancel">キャンセル</button>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

function purchaseOrderFormHtml() {
  const form = viewState.purchaseOrderForm;
  const data = form.data;
  const errors = form.errors;
  const order = findOrderByCode(orders, data.orderCode);
  const project = order ? projects.find(function(p) { return p.code === order.projectCode; }) : null;
  const customer = order ? findCustomerByCode(customers, order.customerId) : null;
  const activeSuppliers = suppliers.filter(function(s) { return s.status === '有効'; });
  const isStandalone = form.isStandalone;

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-06 発注登録</div>' +
          '<div class="panel-title-text">発注登録</div>' +
        '</div>' +
      '</div>' +
      '<form class="register-form" id="purchase-order-register-form" novalidate>' +
        '<input type="hidden" id="f-pod-code" value="' + escapeHtml(data.code) + '">' +
        '<input type="hidden" id="f-pod-order-code" value="' + escapeHtml(data.orderCode) + '">' +
        '<div class="form-grid">' +
          '<div class="form-field">' +
            '<label class="field-label">発注番号</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.code) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-pod-order-code">受注番号</label>' +
            (isStandalone
              ? '<input class="input" id="f-pod-order-code-input" type="text" value="' + escapeHtml(data.orderCode) + '" placeholder="関連する受注番号（任意）">'
              : '<div class="input is-readonly">' + escapeHtml(data.orderCode) + '</div>') +
          '</div>' +
          '<div class="form-field is-required">' +
            '<label class="field-label" for="f-pod-title">発注件名<span class="required-mark">必須</span></label>' +
            '<input class="input" id="f-pod-title" type="text" value="' + escapeHtml(data.title) + '" placeholder="発注件名">' +
            '<div class="field-error">' + (errors.title ? escapeHtml(errors.title) : '') + '</div>' +
          '</div>' +
          '<div class="form-field is-required">' +
            '<label class="field-label" for="f-pod-supplier">仕入先<span class="required-mark">必須</span></label>' +
            '<select class="select' + (errors.supplierId ? ' is-error' : '') + '" id="f-pod-supplier">' +
              '<option value="">-- 仕入先を選択 --</option>' +
              activeSuppliers.map(function(s) {
                return '<option value="' + escapeHtml(s.code) + '"' + (data.supplierId === s.code ? ' selected' : '') + '>' + escapeHtml(s.name) + '</option>';
              }).join('') +
            '</select>' +
            '<div class="field-error">' + (errors.supplierId ? escapeHtml(errors.supplierId) : '') + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">案件</label>' +
            '<div class="input is-readonly">' + escapeHtml(project ? project.name : '-') + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">顧客</label>' +
            '<div class="input is-readonly">' + escapeHtml(customer ? customer.name : '-') + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-pod-contract-method">契約処理方法</label>' +
            '<select class="select" id="f-pod-contract-method">' +
              '<option value="">-- 選択してください --</option>' +
              ['注文請書', '発注書', '契約書', 'その他'].map(function(m) {
                return '<option value="' + m + '"' + (data.contractMethod === m ? ' selected' : '') + '>' + m + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="form-field is-required">' +
            '<label class="field-label" for="f-pod-date">発注日<span class="required-mark">必須</span></label>' +
            '<input class="input' + (errors.orderDate ? ' is-error' : '') + '" id="f-pod-date" type="date" value="' + escapeHtml(data.orderDate) + '">' +
            '<div class="field-error">' + (errors.orderDate ? escapeHtml(errors.orderDate) : '') + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-pod-delivery-date">納期</label>' +
            '<input class="input" id="f-pod-delivery-date" type="date" value="' + escapeHtml(data.deliveryDate || '') + '">' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">発注金額</label>' +
            '<div class="input is-readonly">' + Number(data.total).toLocaleString() + ' 円</div>' +
          '</div>' +
        '</div>' +
        '<div class="form-field">' +
          '<label class="field-label" for="f-pod-notes">備考</label>' +
          '<textarea class="input" id="f-pod-notes" rows="3" placeholder="発注備考">' + escapeHtml(data.notes || '') + '</textarea>' +
        '</div>' +
        (!isStandalone && form.details.length > 0 ?
          '<div class="form-section">' +
            '<div class="form-section-label">発注明細（チェックで今回の発注に含める）</div>' +
            '<div class="detail-table">' +
              '<div class="detail-table-head">' +
                '<div></div>' +
                '<div>行</div><div>品名</div><div>数量</div><div>単位</div><div>単価</div><div>金額</div>' +
              '</div>' +
              form.details.map(function(d) {
                const checked = form.selectedLineNos.indexOf(d.lineNo) >= 0 ? ' checked' : '';
                const lineSubtotal = (d.quantity || 1) * (d.unitPrice || 0) * (1 - (d.discount || 0));
                const lineTotal = lineSubtotal + Math.floor(lineSubtotal * (d.taxRate || 0));
                return '<div class="detail-table-row">' +
                  '<div><input type="checkbox" class="pod-line-check" data-line-no="' + d.lineNo + '"' + checked + '></div>' +
                  '<div>' + d.lineNo + '</div>' +
                  '<div>' + escapeHtml(d.productName) + '</div>' +
                  '<div>' + d.quantity + '</div>' +
                  '<div>' + escapeHtml(d.unit || '') + '</div>' +
                  '<div>' + Number(d.unitPrice).toLocaleString() + '</div>' +
                  '<div>' + Number(lineTotal).toLocaleString() + '</div>' +
                  '</div>';
              }).join('') +
            '</div>' +
          '</div>'
        : '') +
        '<div class="form-field">' +
          '<label class="field-label">添付ファイル</label>' +
          '<input class="input" type="file" id="f-pod-attachment" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg">' +
          (form.attachments.length > 0 ?
            '<ul class="attachment-list" id="pod-attachment-list">' +
            form.attachments.map(function(a, i) {
              return '<li class="attachment-item" data-pod-attachment-index="' + i + '">' +
                '<span class="attachment-name">' + escapeHtml(a.name) + '</span>' +
                '<span class="attachment-size">(' + Math.ceil(a.size / 1024) + ' KB)</span>' +
                '<button type="button" class="button button-danger button-sm" data-action-remove-pod-attachment="' + i + '">削除</button>' +
                '</li>';
            }).join('') +
            '</ul>'
          : '') +
        '</div>' +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">発注登録</button>' +
          '<button class="button button-secondary" type="button" id="purchase-order-form-cancel">キャンセル</button>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

function purchaseOrderScreenHtml(user) {
  if (viewState.deliveryView === "register") {
    return deliveryFormHtml();
  }
  if (viewState.purchaseOrderForm.mode === "register") {
    return purchaseOrderFormHtml();
  }
  if (viewState.purchaseOrderView === "detail" && viewState.purchaseOrderDetailCode) {
    return purchaseOrderDetailHtml(user);
  }
  return dataTableHtml(getPurchaseOrderTableConfig(user));
}

function deliveryStatusClass(status) {
  if (status === '検収待ち') return 'is-pending';
  if (status === '検収済') return 'is-complete';
  if (status === '検収NG') return 'is-rejected';
  return '';
}

function getDeliveryTableConfig(user) {
  const canEdit = user && hasPermission(user, 'delivery:edit');
  const columns = [
    { key: 'code', label: '納品番号', sortable: true },
    {
      key: 'purchaseOrderCode',
      label: '発注番号',
      sortable: true,
      render: function(value) {
        return '<button class="button button-ghost button-sm" type="button" data-action-goto-purchase-order="' + escapeHtml(value) + '">' + escapeHtml(value) + '</button>';
      }
    },
    { key: 'deliveryDate', label: '納品日', sortable: true },
    {
      key: 'status',
      label: '検収状態',
      sortable: true,
      render: function(value) {
        return '<span class="status ' + deliveryStatusClass(value) + '">' + escapeHtml(value) + '</span>';
      }
    }
  ];
  if (canEdit) {
    columns.push({
      key: '_actions',
      label: '操作',
      sortable: false,
      render: function(value, row) {
        var btns = '';
        if (row.status === '検収待ち') {
          btns += '<button class="button button-primary button-sm" type="button" data-action-accept-delivery="' + escapeHtml(row.code) + '">検収済</button> ';
          btns += '<button class="button button-danger button-sm" type="button" data-action-reject-delivery="' + escapeHtml(row.code) + '">検収NG</button>';
        }
        return btns;
      }
    });
  }
  return {
    stateKey: 'deliveryList',
    title: '納品・検収一覧',
    rows: deliveries,
    columns: columns,
    searchKeys: ['code', 'purchaseOrderCode', 'deliveryDate'],
    filters: [
      {
        key: 'status',
        label: '検収状態',
        options: ['all', '検収待ち', '検収済', '検収NG'],
        allLabel: '全状態'
      }
    ],
    emptyMessage: '納品実績がありません。',
    hasActions: canEdit,
    tableClass: 'delivery',
    toolbarExtra: ''
  };
}

function deliveryScreenHtml(user) {
  return dataTableHtml(getDeliveryTableConfig(user));
}

function invoiceStatusClass(status) {
  if (status === '下書き') return 'is-info';
  if (status === '確定') return 'is-approved';
  if (status === '送付済') return 'is-open';
  if (status === '入金済') return 'is-complete';
  if (status === 'キャンセル') return 'is-locked';
  return '';
}

function getInvoiceTableConfig(user) {
  const columns = [
    { key: "code", label: "請求番号", sortable: true },
    { key: "title", label: "件名", sortable: true },
    {
      key: "customerId",
      label: "顧客",
      sortable: true,
      render: function(value) {
        const customer = findCustomerByCode(customers, value);
        return escapeHtml(customer ? customer.name : value);
      }
    },
    { key: "invoiceDate", label: "請求日", sortable: true },
    { key: "dueDate", label: "支払期日", sortable: true },
    {
      key: "total",
      label: "請求金額",
      sortable: true,
      render: function(value) { return Number(value || 0).toLocaleString() + ' 円'; }
    },
    {
      key: "status",
      label: "ステータス",
      sortable: true,
      render: function(value) {
        return '<span class="status-badge ' + invoiceStatusClass(value) + '">' + escapeHtml(value) + '</span>';
      }
    },
    {
      key: "_detail",
      label: "詳細",
      sortable: false,
      render: function(value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-detail-invoice="' + escapeHtml(row.code) + '">詳細</button>';
      }
    }
  ];
  return {
    stateKey: "invoiceList",
    title: "請求一覧",
    rows: invoices,
    columns: columns,
    searchKeys: ["code", "title"],
    filters: [
      {
        key: "status",
        label: "ステータス",
        options: ["all", "下書き", "確定", "送付済", "入金済", "キャンセル"],
        allLabel: "全ステータス"
      }
    ],
    emptyMessage: "条件に一致する請求がありません。",
    hasActions: false,
    tableClass: "invoice",
    toolbarExtra: (user && hasPermission(user, "invoice:edit"))
      ? '<button class="button button-primary" type="button" id="invoice-extract-btn">請求対象抽出</button>'
      : ""
  };
}

function invoiceFormHtml() {
  const form = viewState.invoiceForm;
  const data = form.data;
  const errors = form.errors;
  const order = findOrderByCode(orders, data.orderCode);
  const customer = order ? findCustomerByCode(customers, order.customerId) : findCustomerByCode(customers, data.customerId);

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-08 請求起票</div>' +
          '<div class="panel-title-text">請求起票</div>' +
        '</div>' +
      '</div>' +
      '<form class="register-form" id="invoice-register-form" novalidate>' +
        '<input type="hidden" id="f-inv-code" value="' + escapeHtml(data.code) + '">' +
        '<input type="hidden" id="f-inv-order-code" value="' + escapeHtml(data.orderCode) + '">' +
        '<input type="hidden" id="f-inv-customer-id" value="' + escapeHtml(data.customerId) + '">' +
        '<div class="form-grid">' +
          '<div class="form-field">' +
            '<label class="field-label">請求番号</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.code) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">受注番号</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.orderCode || '-') + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">顧客</label>' +
            '<div class="input is-readonly">' + escapeHtml(customer ? customer.name : data.customerId) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">件名</label>' +
            '<div class="input is-readonly">' + escapeHtml(data.title) + '</div>' +
          '</div>' +
          '<div class="form-field' + (errors.invoiceDate ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-inv-date">請求日 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-inv-date" type="date" value="' + escapeHtml(data.invoiceDate || '') + '">' +
            (errors.invoiceDate ? '<div class="error-message">' + escapeHtml(errors.invoiceDate) + '</div>' : '') +
          '</div>' +
          '<div class="form-field' + (errors.dueDate ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-inv-due-date">支払期日 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-inv-due-date" type="date" value="' + escapeHtml(data.dueDate || '') + '">' +
            (errors.dueDate ? '<div class="error-message">' + escapeHtml(errors.dueDate) + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">請求起票</button>' +
          '<button class="button button-secondary" type="button" id="invoice-form-cancel">キャンセル</button>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

function invoiceDetailHtml(invoice, user) {
  const canEdit = user && hasPermission(user, "invoice:edit");
  const canApproveInvoice = user && hasPermission(user, "approval:act") && invoice.status === '承認依頼中';
  const customer = findCustomerByCode(customers, invoice.customerId);
  const order = findOrderByCode(orders, invoice.orderCode);
  const status = invoice.status;

  const invoiceReceipts = receipts.filter(function(r) { return r.invoiceCode === invoice.code; });
  const remaining = calcRemainingBalance(invoice, receipts);
  const canReceive = canEdit && (status === '送付済' || status === '一部入金');

  const statusButtons = canEdit ? (
    (status === '下書き' ?
      '<button class="button button-warning button-sm" type="button" id="invoice-submit-approval-btn">承認依頼</button>'
    : '') +
    (status === '却下' ?
      '<button class="button button-secondary button-sm" type="button" id="invoice-return-draft-btn">下書きに戻す</button>'
    : '') +
    (status === '承認済み' ?
      '<button class="button button-primary button-sm" type="button" data-action-invoice-status="確定">確定する</button>'
    : '') +
    (status === '確定' ?
      '<button class="button button-primary button-sm" type="button" data-action-invoice-status="送付済">送付済にする</button>' +
      '<button class="button button-secondary button-sm" type="button" data-action-invoice-status="キャンセル">キャンセル</button>'
    : '') +
    (canReceive ?
      '<button class="button button-primary button-sm" type="button" data-action-register-receipt="' + escapeHtml(invoice.code) + '">入金登録</button>'
    : '')
  ) : '';

  const approvalButtons = canApproveInvoice ? (
    '<button class="button button-primary button-sm" type="button" id="invoice-approve-btn">承認する</button>' +
    '<button class="button button-danger button-sm" type="button" id="invoice-reject-btn">却下</button>'
  ) : '';

  const backButton = viewState.approvalFrom === 'approval'
    ? '<button class="button button-secondary button-sm" type="button" id="invoice-detail-back">承認一覧に戻る</button>'
    : '<button class="button button-secondary button-sm" type="button" id="invoice-detail-back">一覧に戻る</button>';

  const detailLines = (invoice.details || []).map(function(line) {
    return '<div class="detail-line">' +
      '<div>' + escapeHtml(String(line.lineNo || '')) + '</div>' +
      '<div>' + escapeHtml(line.productName || '') + '</div>' +
      '<div>' + escapeHtml(String(line.quantity || '')) + ' ' + escapeHtml(line.unit || '') + '</div>' +
      '<div>' + Number(line.unitPrice || 0).toLocaleString() + '</div>' +
      '<div>' + Number(line.amount || 0).toLocaleString() + '</div>' +
    '</div>';
  }).join('');

  const receiptRows = invoiceReceipts.map(function(r) {
    return '<div class="detail-table-row" data-receipt-code="' + escapeHtml(r.code) + '">' +
      '<div>' + escapeHtml(r.code) + '</div>' +
      '<div>' + escapeHtml(r.receiptDate) + '</div>' +
      '<div>' + Number(r.amount).toLocaleString() + ' 円</div>' +
      '<div>' + (r.fee ? Number(r.fee).toLocaleString() + ' 円' : '-') + '</div>' +
      '<div>' + escapeHtml(r.notes || '') + '</div>' +
    '</div>';
  }).join('');

  const receiptSection = (invoiceReceipts.length > 0 || (status === '送付済' || status === '一部入金' || status === '入金済')) ? (
    '<div class="detail-section">' +
      '<div class="detail-section-label">入金履歴</div>' +
      '<div class="detail-field" style="padding:0 0 12px"><div class="detail-label">未収残高</div><div class="detail-value" id="f-rcp-remaining">' + remaining.toLocaleString() + ' 円</div></div>' +
      (invoiceReceipts.length > 0 ?
        '<div class="detail-table detail-table--receipt-lines">' +
          '<div class="detail-table-head"><div>入金番号</div><div>入金日</div><div>入金額</div><div>手数料</div><div>備考</div></div>' +
          receiptRows +
        '</div>'
      : '<div class="empty-card" style="margin:0"><div class="empty-copy">入金履歴なし</div></div>') +
    '</div>'
  ) : '';

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-08 請求詳細</div>' +
          '<div class="panel-title-text">' + escapeHtml(invoice.title) + '</div>' +
        '</div>' +
        '<div class="panel-actions">' +
          statusButtons +
          approvalButtons +
          '<button class="button button-secondary button-sm" type="button" data-action-print-invoice="' + escapeHtml(invoice.code) + '">印刷</button>' +
          backButton +
        '</div>' +
      '</div>' +
      '<div class="panel-content">' +
        (canApproveInvoice ? approvalActionPanelHtml() : '') +
        '<div class="detail-grid">' +
          '<div class="detail-field"><div class="detail-label">請求番号</div><div class="detail-value">' + escapeHtml(invoice.code) + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">ステータス</div><div class="detail-value"><span class="status-badge ' + invoiceStatusClass(status) + '">' + escapeHtml(status) + '</span></div></div>' +
          '<div class="detail-field"><div class="detail-label">顧客</div><div class="detail-value">' + escapeHtml(customer ? customer.name : invoice.customerId) + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">受注番号</div><div class="detail-value">' + escapeHtml(invoice.orderCode || '-') + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">請求日</div><div class="detail-value">' + escapeHtml(invoice.invoiceDate || '-') + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">支払期日</div><div class="detail-value">' + escapeHtml(invoice.dueDate || '-') + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">小計</div><div class="detail-value">' + Number(invoice.subtotal || 0).toLocaleString() + ' 円</div></div>' +
          '<div class="detail-field"><div class="detail-label">消費税</div><div class="detail-value">' + Number(invoice.taxAmount || 0).toLocaleString() + ' 円</div></div>' +
          '<div class="detail-field"><div class="detail-label">請求金額</div><div class="detail-value">' + Number(invoice.total || 0).toLocaleString() + ' 円</div></div>' +
        '</div>' +
        '<div class="detail-section">' +
          '<div class="detail-section-label">請求明細</div>' +
          '<div class="detail-table detail-table--invoice-lines">' +
            '<div class="detail-table-head">' +
              '<div>行番号</div><div>品名</div><div>数量・単位</div><div>単価</div><div>金額</div>' +
            '</div>' +
            (detailLines || '<div class="detail-table-row"><div style="grid-column:1/-1;color:var(--text-muted)">明細なし</div></div>') +
          '</div>' +
        '</div>' +
        receiptSection +
        approvalHistorySectionHtml(invoice) +
      '</div>' +
    '</section>'
  );
}

function billableOrdersHtml(user) {
  const canEdit = user && hasPermission(user, "invoice:edit");
  const billable = findBillableOrders(orders, invoices);

  if (billable.length === 0) {
    return (
      '<section class="panel">' +
        '<div class="panel-header">' +
          '<div>' +
            '<div class="panel-label">S-08 請求対象</div>' +
            '<div class="panel-title-text">請求対象抽出</div>' +
          '</div>' +
          '<div class="panel-actions">' +
            '<button class="button button-secondary button-sm" type="button" id="invoice-back-to-list">一覧に戻る</button>' +
          '</div>' +
        '</div>' +
        '<div class="empty-card"><div class="empty-copy">請求対象の受注がありません。受注詳細で「請求対象にする」を操作してください。</div></div>' +
      '</section>'
    );
  }

  const today = getTodayString();

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-08 請求対象</div>' +
          '<div class="panel-title-text">請求対象抽出</div>' +
        '</div>' +
        '<div class="panel-actions">' +
          '<button class="button button-secondary button-sm" type="button" id="invoice-back-to-list">一覧に戻る</button>' +
        '</div>' +
      '</div>' +
      '<div class="detail-table detail-table--billable">' +
        '<div class="detail-table-head">' +
          '<div>受注番号</div><div>件名</div><div>顧客</div><div>請求金額</div>' +
          (canEdit ? '<div>請求日</div><div>支払期日</div><div>操作</div>' : '') +
        '</div>' +
        billable.map(function(order) {
          const customer = findCustomerByCode(customers, order.customerId);
          const defaultDue = getDefaultDueDate(today);
          return '<div class="detail-table-row" data-billable-order="' + escapeHtml(order.code) + '">' +
            '<div>' + escapeHtml(order.code) + '</div>' +
            '<div>' + escapeHtml(order.title) + '</div>' +
            '<div>' + escapeHtml(customer ? customer.name : order.customerId) + '</div>' +
            '<div>' + Number(order.total || 0).toLocaleString() + ' 円</div>' +
            (canEdit ?
              '<div><input class="input input-sm" type="date" data-inv-date-for="' + escapeHtml(order.code) + '" value="' + escapeHtml(today) + '"></div>' +
              '<div><input class="input input-sm" type="date" data-inv-due-date-for="' + escapeHtml(order.code) + '" value="' + escapeHtml(defaultDue) + '"></div>' +
              '<div><button class="button button-primary button-xs" type="button" data-action-create-invoice="' + escapeHtml(order.code) + '">請求起票</button></div>'
            : '') +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>'
  );
}

function invoiceScreenHtml(user) {
  if (viewState.invoiceView === "receipt-form") {
    const invoice = invoices.find(function(inv) { return inv.code === viewState.receiptForm.invoiceCode; });
    if (invoice) return receiptFormHtml(invoice);
  }
  if (viewState.invoiceView === "detail" && viewState.invoiceDetailCode) {
    const invoice = invoices.find(function(inv) { return inv.code === viewState.invoiceDetailCode; });
    if (invoice) return invoiceDetailHtml(invoice, user);
  }
  if (viewState.invoiceView === "billable") {
    return billableOrdersHtml(user);
  }
  return dataTableHtml(getInvoiceTableConfig(user));
}

function receiptFormHtml(invoice) {
  const errors = viewState.receiptForm.errors || {};
  const remaining = calcRemainingBalance(invoice, receipts);
  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-09 入金登録</div>' +
          '<div class="panel-title-text">入金登録</div>' +
        '</div>' +
      '</div>' +
      '<form class="register-form" id="receipt-register-form" novalidate>' +
        '<div class="form-grid">' +
          '<div class="form-field">' +
            '<label class="field-label">請求番号</label>' +
            '<div class="input is-readonly" id="f-rcp-invoice-code">' + escapeHtml(invoice.code) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">未収残高</label>' +
            '<div class="input is-readonly" id="f-rcp-remaining">' + remaining.toLocaleString() + ' 円</div>' +
          '</div>' +
          '<div class="form-field' + (errors.receiptDate ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-rcp-date">入金日 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-rcp-date" type="date" value="">' +
            (errors.receiptDate ? '<div class="error-message">' + escapeHtml(errors.receiptDate) + '</div>' : '') +
          '</div>' +
          '<div class="form-field' + (errors.amount ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-rcp-amount">入金額 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-rcp-amount" type="number" min="1" value="">' +
            (errors.amount ? '<div class="error-message">' + escapeHtml(errors.amount) + '</div>' : '') +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-rcp-fee">手数料</label>' +
            '<input class="input" id="f-rcp-fee" type="number" min="0" value="0">' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-rcp-notes">備考</label>' +
            '<input class="input" id="f-rcp-notes" type="text" value="">' +
          '</div>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">登録</button>' +
          '<button class="button button-secondary" type="button" id="receipt-form-cancel">キャンセル</button>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

function getReceiptTableConfig(user) {
  const rows = receipts.map(function(r) {
    const invoice = invoices.find(function(inv) { return inv.code === r.invoiceCode; });
    const customer = invoice ? findCustomerByCode(customers, invoice.customerId) : null;
    return Object.assign({}, r, {
      customerCode: customer ? customer.code : '-',
      customerName: customer ? customer.name : '-'
    });
  });
  const columns = [
    { key: "code", label: "入金番号", sortable: true },
    { key: "invoiceCode", label: "請求番号", sortable: true },
    { key: "customerCode", label: "顧客コード", sortable: true },
    { key: "customerName", label: "顧客名", sortable: true },
    { key: "receiptDate", label: "入金日", sortable: true },
    {
      key: "amount",
      label: "入金額",
      sortable: true,
      render: function(value) { return Number(value || 0).toLocaleString() + ' 円'; }
    },
    {
      key: "fee",
      label: "手数料",
      sortable: false,
      render: function(value) { return value ? Number(value).toLocaleString() + ' 円' : '-'; }
    },
    { key: "notes", label: "備考", sortable: false }
  ];
  return {
    stateKey: "receiptList",
    title: "入金一覧",
    rows: rows,
    columns: columns,
    searchKeys: ["code", "invoiceCode", "customerCode", "customerName"],
    filters: [],
    emptyMessage: "入金データがありません。",
    hasActions: false,
    tableClass: "receipt",
    toolbarExtra: ""
  };
}

function receiptScreenHtml(user) {
  return dataTableHtml(getReceiptTableConfig(user));
}

function paymentStatusClass(status) {
  if (status === '下書き') return 'is-info';
  if (status === '承認待ち') return 'is-pending';
  if (status === '承認済') return 'is-approved';
  if (status === '支払済') return 'is-complete';
  if (status === '差戻し') return 'is-rejected';
  if (status === 'キャンセル') return 'is-locked';
  return '';
}

function getApprovalTableConfig() {
  const pending = getPendingApprovals(quotations, purchaseOrders, payments, orders, invoices);
  const enriched = pending.map(function(item) {
    var tradingPartner = '';
    if (item.type === '見積') {
      var q = quotations.find(function(q) { return q.code === item.code; });
      if (q) {
        var c = findCustomerByCode(customers, q.customerId);
        tradingPartner = c ? c.name : q.customerId;
      }
    } else if (item.type === '受注') {
      var ord = orders.find(function(o) { return o.code === item.code; });
      if (ord) {
        var c2 = findCustomerByCode(customers, ord.customerId);
        tradingPartner = c2 ? c2.name : ord.customerId;
      }
    } else if (item.type === '発注') {
      var po = purchaseOrders.find(function(po) { return po.code === item.code; });
      if (po) {
        var s = findSupplierById(po.supplierId);
        tradingPartner = s ? s.name : po.supplierId;
      }
    } else if (item.type === '支払依頼') {
      var p = payments.find(function(p) { return p.code === item.code; });
      if (p) {
        var s2 = findSupplierById(p.supplierId);
        tradingPartner = s2 ? s2.name : p.supplierId;
      }
    }
    var submittedByUser = users.find(function(u) { return u.id === item.submittedBy; });
    var submittedByName = submittedByUser ? submittedByUser.name : (item.submittedBy || '');
    return Object.assign({}, item, { tradingPartner: tradingPartner, submittedByName: submittedByName });
  });
  return {
    stateKey: "approvalList",
    title: "承認待ち一覧",
    rows: enriched,
    searchKeys: ["type", "code", "title", "tradingPartner", "submittedByName"],
    emptyMessage: "承認待ちのデータがありません",
    hasActions: false,
    filters: [
      {
        key: "type",
        label: "種別",
        allLabel: "すべての種別",
        options: ["all", "見積", "受注", "発注", "支払依頼"]
      }
    ],
    columns: [
      {
        key: "type",
        label: "種別",
        sortable: true,
        render: function(val) {
          var cls = val === '見積' ? 'is-open' : val === '発注' ? 'is-pending' : 'is-draft';
          return '<span class="status-badge ' + cls + '">' + escapeHtml(val) + '</span>';
        }
      },
      { key: "code", label: "伝票コード", sortable: true },
      { key: "title", label: "件名", sortable: false },
      { key: "tradingPartner", label: "顧客名", sortable: true },
      { key: "submittedByName", label: "申請者", sortable: true },
      {
        key: "amount",
        label: "金額",
        sortable: true,
        render: function(val) {
          return (val !== undefined && val !== null) ? Number(val).toLocaleString() + ' 円' : '';
        }
      },
      { key: "submittedAt", label: "申請日", sortable: true },
      {
        key: "code",
        label: "",
        sortable: false,
        render: function(val, row) {
          return '<button class="button button-ghost button-sm" type="button" data-action-detail-approval="' + escapeHtml(row.type) + ':' + escapeHtml(val) + '">詳細</button>';
        }
      }
    ],
    toolbarExtra: ""
  };
}

function approvalActionPanelHtml() {
  const action = viewState.approvalAction;
  if (!action || !action.mode) return '';
  const isReject = action.mode === 'reject';
  const commentRequired = isReject ? '<span class="required-mark">必須</span>' : '';
  const commentError = isReject && action.commentError
    ? '<div class="error-message">' + escapeHtml(action.commentError) + '</div>'
    : '';
  return (
    '<div class="approval-action-panel" style="margin:12px 0;padding:12px;border:1px solid ' + (isReject ? 'var(--color-danger,#c0392b)' : 'var(--color-primary,#2980b9)') + ';border-radius:4px;background:#fafafa;">' +
      '<div style="margin-bottom:8px;font-weight:bold;">' + (isReject ? '却下理由を入力してください' : '承認コメント（任意）') + commentRequired + '</div>' +
      '<textarea id="approval-comment-input" class="input" rows="3" style="width:100%;box-sizing:border-box;" placeholder="' + (isReject ? '却下理由（必須）' : 'コメント（任意）') + '">' + escapeHtml(action.comment) + '</textarea>' +
      commentError +
      '<div style="margin-top:8px;display:flex;gap:8px;">' +
        (isReject
          ? '<button class="button button-danger button-sm" type="button" id="approval-confirm-reject">却下を確定</button>'
          : '<button class="button button-primary button-sm" type="button" id="approval-confirm-approve">承認を確定</button>') +
        '<button class="button button-ghost button-sm" type="button" id="approval-action-cancel">キャンセル</button>' +
      '</div>' +
    '</div>'
  );
}

function approvalHistorySectionHtml(doc) {
  const history = doc.approvalHistory || [];
  const statusLabel = (function() {
    var s = doc.status;
    if (s === '承認依頼中') return '<span class="status-badge status-warning">承認依頼中（承認待ち）</span>';
    if (s === '承認済み' || s === '承認済・発注待ち') return '<span class="status-badge status-success">' + escapeHtml(s) + '</span>';
    if (s === '却下') return '<span class="status-badge status-danger">却下</span>';
    return '';
  })();

  if (!statusLabel && history.length === 0) return '';

  var rows = history.map(function(entry) {
    return '<div class="detail-table-row">' +
      '<div>' + escapeHtml(entry.timestamp || '') + '</div>' +
      '<div>' + escapeHtml(entry.operatorName || '') + '</div>' +
      '<div>' + escapeHtml(entry.action || '') + '</div>' +
      '<div>' + escapeHtml(entry.comment || '') + '</div>' +
    '</div>';
  }).join('');

  return (
    '<div class="detail-section" id="approval-history-section">' +
      '<div class="detail-section-label">承認状況</div>' +
      (statusLabel ? '<div style="margin-bottom:12px;">' + statusLabel + '</div>' : '') +
      (history.length > 0 ?
        '<div class="detail-table">' +
          '<div class="detail-table-head"><div>操作日時</div><div>操作者</div><div>操作種別</div><div>コメント</div></div>' +
          rows +
        '</div>'
      : '<div class="empty-card" style="margin:0"><div class="empty-copy">承認履歴なし</div></div>') +
    '</div>'
  );
}

function approvalScreenHtml() {
  return dataTableHtml(getApprovalTableConfig());
}

function getNotificationTableConfig(user) {
  const userNotifications = getNotificationsForUser(notifications, user.id);
  const typeOptions = ["all", "承認依頼", "承認完了", "差戻し"];
  return {
    stateKey: "notificationList",
    title: "通知一覧",
    rows: userNotifications,
    searchKeys: ["message", "targetCode", "type"],
    emptyMessage: "通知はありません",
    hasActions: true,
    filters: [
      { key: "type", label: "種別", allLabel: "すべての種別", options: typeOptions }
    ],
    columns: [
      { key: "type", label: "種別", sortable: true, render: function(val) {
        var cls = val === '承認依頼' ? 'is-pending' : val === '承認完了' ? 'is-open' : 'is-draft';
        return '<span class="status-badge ' + cls + '">' + escapeHtml(val) + '</span>';
      }},
      { key: "message", label: "内容", sortable: false },
      { key: "targetCode", label: "対象コード", sortable: true },
      { key: "isRead", label: "既読", sortable: true, render: function(val) {
        return val ? '<span class="status-badge is-info">既読</span>' : '<span class="status-badge is-pending">未読</span>';
      }},
      { key: "createdAt", label: "通知日", sortable: true },
      { key: "_actions", label: "操作", sortable: false, render: function(val, row) {
        if (row.isRead) return '';
        return '<button class="button button-ghost button-sm" type="button" data-action-mark-read="' + escapeHtml(row.id) + '">既読にする</button>';
      }}
    ],
    toolbarExtra: ""
  };
}

function notificationScreenHtml(user) {
  return dataTableHtml(getNotificationTableConfig(user));
}

function reportTotalsRowHtml(totals) {
  var gpStyle = totals.grossProfit >= 0 ? '' : ' style="color:var(--color-danger,#c0392b)"';
  return (
    '<div class="data-table-body-row report-totals-row" id="report-summary-totals-row">' +
      '<div class="data-table-body-cell"><strong>合計</strong></div>' +
      '<div class="data-table-body-cell"><strong>' + Number(totals.sales).toLocaleString('ja-JP') + ' 円</strong></div>' +
      '<div class="data-table-body-cell"><strong>' + Number(totals.cost).toLocaleString('ja-JP') + ' 円</strong></div>' +
      '<div class="data-table-body-cell"' + gpStyle + '><strong>' + Number(totals.grossProfit).toLocaleString('ja-JP') + ' 円</strong></div>' +
    '</div>'
  );
}

function settingsScreenHtml(user) {
  const tab = viewState.settingsTab;
  const s = viewState.settings;
  const errors = viewState.settingsErrors || {};
  const canEdit = user && hasPermission(user, "settings:edit");

  const tabs =
    '<div class="master-tabs">' +
      '<button class="master-tab' + (tab === "company" ? " is-active" : "") + '" type="button" data-settings-tab="company">会社情報</button>' +
      '<button class="master-tab' + (tab === "fiscal" ? " is-active" : "") + '" type="button" data-settings-tab="fiscal">年度設定</button>' +
      '<button class="master-tab' + (tab === "approval-route" ? " is-active" : "") + '" type="button" data-settings-tab="approval-route">承認ルート設定</button>' +
      '<button class="master-tab' + (tab === "approval-condition" ? " is-active" : "") + '" type="button" data-settings-tab="approval-condition">承認条件設定</button>' +
    '</div>';

  const DOCUMENT_TYPE_LABELS = {
    quotation: '見積',
    order: '受注',
    purchaseOrder: '発注',
    invoice: '請求',
    payment: '支払依頼'
  };
  const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS);

  let formContent = '';
  if (tab === "company") {
    formContent =
      '<form id="settings-company-form" class="detail-form">' +
        '<div class="form-section">' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-company-name">会社名</label>' +
            '<input class="input' + (errors.name ? ' is-error' : '') + '" id="s-company-name" type="text" value="' + escapeHtml(s.name) + '"' + (canEdit ? '' : ' disabled') + '>' +
            (errors.name ? '<div class="field-error">' + escapeHtml(errors.name) + '</div>' : '') +
          '</div>' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-company-address">住所</label>' +
            '<input class="input" id="s-company-address" type="text" value="' + escapeHtml(s.address) + '"' + (canEdit ? '' : ' disabled') + '>' +
          '</div>' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-company-phone">電話番号</label>' +
            '<input class="input" id="s-company-phone" type="text" value="' + escapeHtml(s.phone) + '"' + (canEdit ? '' : ' disabled') + '>' +
          '</div>' +
        '</div>' +
        (canEdit
          ? '<div class="form-actions"><button class="button button-primary" type="submit">保存</button></div>'
          : '') +
      '</form>';
  } else if (tab === "fiscal") {
    const monthOptions = [1,2,3,4,5,6,7,8,9,10,11,12].map(function(m) {
      const startMonth = m === 12 ? 1 : m + 1;
      const label = m + '月決算（' + startMonth + '月始まり）';
      return '<option value="' + m + '"' + (s.fiscalEndMonth === m ? ' selected' : '') + '>' + label + '</option>';
    }).join('');
    formContent =
      '<form id="settings-fiscal-form" class="detail-form">' +
        '<div class="form-section">' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-fiscal-end-month">決算月</label>' +
            '<select class="select" id="s-fiscal-end-month"' + (canEdit ? '' : ' disabled') + '>' + monthOptions + '</select>' +
            '<div class="field-hint">レポートの年度集計に使用されます。変更すると即座にレポートへ反映されます。</div>' +
          '</div>' +
        '</div>' +
        (canEdit
          ? '<div class="form-actions"><button class="button button-primary" type="submit">保存</button></div>'
          : '') +
      '</form>';
  } else if (tab === "approval-condition") {
    const condErrors = viewState.approvalConditionErrors || {};
    formContent =
      '<form id="settings-approval-condition-form" class="detail-form">' +
        '<div class="form-section">' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-condition-profit-rate">利益率閾値（%）</label>' +
            '<input class="input' + (condErrors.profitRate ? ' is-error' : '') + '" id="s-condition-profit-rate" type="number" min="0" max="100" step="1" value="' + s.presidentApprovalProfitRateThreshold + '"' + (canEdit ? '' : ' disabled') + '>' +
            (condErrors.profitRate ? '<div class="field-error">' + escapeHtml(condErrors.profitRate) + '</div>' : '') +
          '</div>' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-condition-amount">見積金額合計閾値（円）</label>' +
            '<input class="input' + (condErrors.amount ? ' is-error' : '') + '" id="s-condition-amount" type="number" min="1" step="1" value="' + s.presidentApprovalAmountThreshold + '"' + (canEdit ? '' : ' disabled') + '>' +
            (condErrors.amount ? '<div class="field-error">' + escapeHtml(condErrors.amount) + '</div>' : '') +
          '</div>' +
          '<div class="field-hint" style="margin-bottom:12px">上記2条件のどちらか一方が超過した場合、社長決裁が必要になります（OR条件）。</div>' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-condition-stale-days">承認滞留判定日数</label>' +
            '<input class="input' + (condErrors.staleDays ? ' is-error' : '') + '" id="s-condition-stale-days" type="number" min="1" step="1" value="' + s.approvalStaleDays + '"' + (canEdit ? '' : ' disabled') + '>' +
            (condErrors.staleDays ? '<div class="field-error">' + escapeHtml(condErrors.staleDays) + '</div>' : '') +
            '<div class="field-hint">この日数を超えて承認が滞留した場合、通知を送信します（N-04）。</div>' +
          '</div>' +
        '</div>' +
        (canEdit
          ? '<div class="form-actions"><button class="button button-primary" type="submit">保存</button></div>'
          : '') +
      '</form>';
  } else {
    const routeForm = viewState.approvalRouteForm;
    const selectedType = routeForm.documentType;
    const typeOptions = DOCUMENT_TYPES.map(function(dt) {
      return '<option value="' + dt + '"' + (selectedType === dt ? ' selected' : '') + '>' + escapeHtml(DOCUMENT_TYPE_LABELS[dt]) + '</option>';
    }).join('');
    const currentRoutes = getRoutesByDocumentType(viewState.approvalRoutes, selectedType);
    const userOptions = users.map(function(u) {
      return '<option value="' + escapeHtml(u.id) + '"' + (routeForm.newApproverUserId === u.id ? ' selected' : '') + '>' + escapeHtml(u.name) + ' (' + escapeHtml(u.id) + ')</option>';
    }).join('');
    const routeRows = currentRoutes.length > 0
      ? currentRoutes.map(function(r) {
          const approver = users.find(function(u) { return u.id === r.approverUserId; });
          const approverName = approver ? approver.name + ' (' + r.approverUserId + ')' : r.approverUserId;
          return '<div class="data-table-body-row">' +
            '<div class="data-table-body-cell">第 ' + r.stepNumber + ' ステップ</div>' +
            '<div class="data-table-body-cell">' + escapeHtml(approverName) + '</div>' +
            (canEdit
              ? '<div class="data-table-body-cell"><button class="button button-danger button-sm" type="button" data-action-remove-route="' + (r.id != null ? r.id : escapeHtml(selectedType) + ':' + r.stepNumber) + '">削除</button></div>'
              : '<div class="data-table-body-cell"></div>') +
          '</div>';
        }).join('')
      : '<div class="data-table-empty">承認ステップが設定されていません。</div>';
    formContent =
      '<div class="detail-form">' +
        '<div class="form-section">' +
          '<div class="form-row">' +
            '<label class="field-label" for="s-route-doctype">伝票種別</label>' +
            '<select class="select" id="s-route-doctype" data-action-route-doctype>' + typeOptions + '</select>' +
          '</div>' +
          '<div class="field-hint" style="margin-bottom:12px">同一ステップに複数登録した場合、全員の承認が必要です（AND条件）。</div>' +
          '<div class="data-table">' +
            '<div class="data-table-head">' +
              '<div class="data-table-head-cell"><span>ステップ</span></div>' +
              '<div class="data-table-head-cell"><span>承認者</span></div>' +
              '<div class="data-table-head-cell"><span>操作</span></div>' +
            '</div>' +
            routeRows +
          '</div>' +
          (canEdit
            ? '<div class="form-row" style="margin-top:16px">' +
                '<label class="field-label">承認者を追加</label>' +
                '<select class="select" id="s-route-new-approver">' +
                  '<option value="">-- 承認者を選択 --</option>' + userOptions +
                '</select>' +
                '<button class="button button-primary button-sm" type="button" id="s-route-add-step" style="margin-left:8px">ステップを追加</button>' +
              '</div>'
            : '') +
        '</div>' +
      '</div>';
  }

  const panelTitles = { company: '会社情報', fiscal: '年度設定', 'approval-route': '承認ルート設定', 'approval-condition': '承認条件設定' };

  return tabs +
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-15</div>' +
          '<div class="panel-title-text">' + escapeHtml(panelTitles[tab] || '設定') + '</div>' +
        '</div>' +
      '</div>' +
      formContent +
    '</section>';
}

function reportScreenHtml() {
  const allSummaryRows = getSalesCostReport(invoices, payments);
  const fiscalEndMonth = viewState.settings.fiscalEndMonth;
  const selectedYear = viewState.reportFilter.year;
  const summaryRows = filterReportByFiscalYear(allSummaryRows, selectedYear, fiscalEndMonth);
  const uncollected = getUncollectedInvoices(invoices);
  const unpaid = getUnpaidPayments(payments);

  const availableFiscalYears = getAvailableFiscalYears(allSummaryRows, fiscalEndMonth);
  const yearOptions =
    '<option value="all"' + (selectedYear === 'all' ? ' selected' : '') + '>すべての年度</option>' +
    availableFiscalYears.map(function(y) {
      const ys = String(y);
      return '<option value="' + ys + '"' + (selectedYear === ys ? ' selected' : '') + '>' + ys + '年度</option>';
    }).join('');

  const summarySection =
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-13 Step 2</div>' +
          '<div class="panel-title-text">売上・原価・粗利集計表（月別）</div>' +
        '</div>' +
        '<div class="toolbar">' +
          '<label class="table-filter">' +
            '<span class="field-label">年度</span>' +
            '<select class="select" id="report-year-filter">' + yearOptions + '</select>' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div class="data-table" id="report-summary-table">' +
        '<div class="data-table-head">' +
          '<div class="data-table-head-cell"><span>年月</span></div>' +
          '<div class="data-table-head-cell"><span>売上合計</span></div>' +
          '<div class="data-table-head-cell"><span>原価合計</span></div>' +
          '<div class="data-table-head-cell"><span>粗利</span></div>' +
        '</div>' +
        (summaryRows.length
          ? summaryRows.map(function(row) {
              var gpClass = row.grossProfit >= 0 ? '' : ' style="color:var(--color-danger,#c0392b)"';
              return (
                '<div class="data-table-body-row">' +
                  '<div class="data-table-body-cell">' + escapeHtml(row.yearMonth) + '</div>' +
                  '<div class="data-table-body-cell">' + Number(row.sales).toLocaleString('ja-JP') + ' 円</div>' +
                  '<div class="data-table-body-cell">' + Number(row.cost).toLocaleString('ja-JP') + ' 円</div>' +
                  '<div class="data-table-body-cell"' + gpClass + '>' + Number(row.grossProfit).toLocaleString('ja-JP') + ' 円</div>' +
                '</div>'
              );
            }).join('') + reportTotalsRowHtml(getReportTotals(summaryRows))
          : '<div class="data-table-empty">集計対象のデータがありません。</div>'
        ) +
      '</div>' +
    '</section>';

  const uncollectedSection =
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-13 Step 3</div>' +
          '<div class="panel-title-text">未収一覧</div>' +
        '</div>' +
        '<div class="toolbar">' +
          '<button class="button button-secondary" type="button" id="report-export-uncollected">CSV 出力</button>' +
        '</div>' +
      '</div>' +
      '<div class="data-table" id="report-uncollected-table">' +
        '<div class="data-table-head">' +
          '<div class="data-table-head-cell"><span>請求コード</span></div>' +
          '<div class="data-table-head-cell"><span>タイトル</span></div>' +
          '<div class="data-table-head-cell"><span>請求日</span></div>' +
          '<div class="data-table-head-cell"><span>支払期限</span></div>' +
          '<div class="data-table-head-cell"><span>金額</span></div>' +
          '<div class="data-table-head-cell"><span>ステータス</span></div>' +
        '</div>' +
        (uncollected.length
          ? uncollected.map(function(inv) {
              return (
                '<div class="data-table-body-row">' +
                  '<div class="data-table-body-cell">' + escapeHtml(inv.code) + '</div>' +
                  '<div class="data-table-body-cell">' + escapeHtml(inv.title) + '</div>' +
                  '<div class="data-table-body-cell">' + escapeHtml(inv.invoiceDate) + '</div>' +
                  '<div class="data-table-body-cell">' + escapeHtml(inv.dueDate) + '</div>' +
                  '<div class="data-table-body-cell">' + Number(inv.total).toLocaleString('ja-JP') + ' 円</div>' +
                  '<div class="data-table-body-cell"><span class="status-badge is-pending">' + escapeHtml(inv.status) + '</span></div>' +
                '</div>'
              );
            }).join('')
          : '<div class="data-table-empty">未収の請求はありません。</div>'
        ) +
      '</div>' +
    '</section>';

  const unpaidSection =
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-13 Step 3</div>' +
          '<div class="panel-title-text">未払一覧</div>' +
        '</div>' +
        '<div class="toolbar">' +
          '<button class="button button-secondary" type="button" id="report-export-unpaid">CSV 出力</button>' +
        '</div>' +
      '</div>' +
      '<div class="data-table" id="report-unpaid-table">' +
        '<div class="data-table-head">' +
          '<div class="data-table-head-cell"><span>支払依頼コード</span></div>' +
          '<div class="data-table-head-cell"><span>タイトル</span></div>' +
          '<div class="data-table-head-cell"><span>支払予定日</span></div>' +
          '<div class="data-table-head-cell"><span>金額</span></div>' +
          '<div class="data-table-head-cell"><span>ステータス</span></div>' +
        '</div>' +
        (unpaid.length
          ? unpaid.map(function(p) {
              return (
                '<div class="data-table-body-row">' +
                  '<div class="data-table-body-cell">' + escapeHtml(p.code) + '</div>' +
                  '<div class="data-table-body-cell">' + escapeHtml(p.title) + '</div>' +
                  '<div class="data-table-body-cell">' + escapeHtml(p.paymentDate) + '</div>' +
                  '<div class="data-table-body-cell">' + Number(p.amount).toLocaleString('ja-JP') + ' 円</div>' +
                  '<div class="data-table-body-cell"><span class="status-badge is-pending">' + escapeHtml(p.status) + '</span></div>' +
                '</div>'
              );
            }).join('')
          : '<div class="data-table-empty">未払の支払依頼はありません。</div>'
        ) +
      '</div>' +
    '</section>';

  // Fiscal-year-filtered invoices and payments for drill-down
  const fyInvoices = selectedYear === 'all' ? invoices : invoices.filter(function(inv) {
    return String(getFiscalYear(inv.invoiceDate.slice(0, 7), fiscalEndMonth)) === selectedYear;
  });
  const fyPayments = selectedYear === 'all' ? payments : payments.filter(function(p) {
    return String(getFiscalYear(p.paymentDate.slice(0, 7), fiscalEndMonth)) === selectedYear;
  });

  const customerRows = getSalesCostByCustomer(fyInvoices, fyPayments, purchaseOrders, orders);
  const drilldownCustomerId = viewState.reportDrilldown.customerId;

  const customerSection =
    '<section class="panel" id="report-customer-section">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-13 Step 5</div>' +
          '<div class="panel-title-text">顧客別集計</div>' +
        '</div>' +
      '</div>' +
      '<div class="data-table" id="report-customer-table">' +
        '<div class="data-table-head">' +
          '<div class="data-table-head-cell"><span>顧客</span></div>' +
          '<div class="data-table-head-cell"><span>売上合計</span></div>' +
          '<div class="data-table-head-cell"><span>原価合計</span></div>' +
          '<div class="data-table-head-cell"><span>粗利</span></div>' +
          '<div class="data-table-head-cell"><span>詳細</span></div>' +
        '</div>' +
        (customerRows.length
          ? customerRows.map(function(row) {
              const customer = findCustomerByCode(customers, row.customerId);
              const name = customer ? customer.name : row.customerId;
              const isActive = row.customerId === drilldownCustomerId;
              const gpClass = row.grossProfit >= 0 ? '' : ' style="color:var(--color-danger,#c0392b)"';
              return (
                '<div class="data-table-body-row' + (isActive ? ' is-selected' : '') + '">' +
                  '<div class="data-table-body-cell">' + escapeHtml(name) + '</div>' +
                  '<div class="data-table-body-cell">' + Number(row.sales).toLocaleString('ja-JP') + ' 円</div>' +
                  '<div class="data-table-body-cell">' + Number(row.cost).toLocaleString('ja-JP') + ' 円</div>' +
                  '<div class="data-table-body-cell"' + gpClass + '>' + Number(row.grossProfit).toLocaleString('ja-JP') + ' 円</div>' +
                  '<div class="data-table-body-cell">' +
                    '<button class="button button-ghost button-sm" type="button" data-action-drill-customer="' + escapeHtml(row.customerId) + '">' +
                      (isActive ? '閉じる' : '案件別') +
                    '</button>' +
                  '</div>' +
                '</div>'
              );
            }).join('')
          : '<div class="data-table-empty">集計対象のデータがありません。</div>'
        ) +
      '</div>' +
    '</section>';

  let projectSection = '';
  if (drilldownCustomerId) {
    const customer = findCustomerByCode(customers, drilldownCustomerId);
    const customerName = customer ? customer.name : drilldownCustomerId;
    const projectRows = getSalesCostByProject(fyInvoices, fyPayments, purchaseOrders, orders, drilldownCustomerId);

    projectSection =
      '<section class="panel" id="report-project-section">' +
        '<div class="panel-header">' +
          '<div>' +
            '<div class="panel-label">S-13 Step 5</div>' +
            '<div class="panel-title-text">案件別集計 — ' + escapeHtml(customerName) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="data-table" id="report-project-table">' +
          '<div class="data-table-head">' +
            '<div class="data-table-head-cell"><span>案件</span></div>' +
            '<div class="data-table-head-cell"><span>売上合計</span></div>' +
            '<div class="data-table-head-cell"><span>原価合計</span></div>' +
            '<div class="data-table-head-cell"><span>粗利</span></div>' +
          '</div>' +
          (projectRows.length
            ? projectRows.map(function(row) {
                const project = row.projectCode ? projects.find(function(p) { return p.code === row.projectCode; }) : null;
                const projectName = project ? project.name : (row.projectCode || '案件なし');
                const gpClass = row.grossProfit >= 0 ? '' : ' style="color:var(--color-danger,#c0392b)"';
                return (
                  '<div class="data-table-body-row">' +
                    '<div class="data-table-body-cell">' +
                      (row.projectCode ? '<span class="chip">' + escapeHtml(row.projectCode) + '</span> ' : '') +
                      escapeHtml(projectName) +
                    '</div>' +
                    '<div class="data-table-body-cell">' + Number(row.sales).toLocaleString('ja-JP') + ' 円</div>' +
                    '<div class="data-table-body-cell">' + Number(row.cost).toLocaleString('ja-JP') + ' 円</div>' +
                    '<div class="data-table-body-cell"' + gpClass + '>' + Number(row.grossProfit).toLocaleString('ja-JP') + ' 円</div>' +
                  '</div>'
                );
              }).join('')
            : '<div class="data-table-empty">集計対象のデータがありません。</div>'
          ) +
        '</div>' +
      '</section>';
  }

  return summarySection + customerSection + projectSection + uncollectedSection + unpaidSection;
}

function getPaymentTableConfig(user) {
  const rows = payments.map(function(p) {
    const sup = findSupplierById(p.supplierId);
    return Object.assign({}, p, { supplierName: sup ? sup.name : p.supplierId });
  });
  const columns = [
    { key: "code", label: "支払依頼番号", sortable: true },
    { key: "purchaseOrderCode", label: "発注番号", sortable: true },
    { key: "supplierName", label: "仕入先", sortable: true },
    { key: "title", label: "件名", sortable: true },
    { key: "paymentDate", label: "支払予定日", sortable: true },
    {
      key: "amount",
      label: "支払金額",
      sortable: true,
      render: function(value) { return Number(value || 0).toLocaleString() + ' 円'; }
    },
    {
      key: "status",
      label: "ステータス",
      sortable: true,
      render: function(value) {
        return '<span class="status-badge ' + paymentStatusClass(value) + '">' + escapeHtml(value) + '</span>';
      }
    },
    {
      key: "_actions",
      label: "操作",
      sortable: false,
      render: function(value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-detail-payment="' + escapeHtml(row.code) + '">詳細</button>';
      }
    }
  ];
  return {
    stateKey: "paymentList",
    title: "支払依頼一覧",
    rows: rows,
    columns: columns,
    searchKeys: ["code", "purchaseOrderCode", "supplierName", "title"],
    filters: [
      {
        key: "status",
        label: "ステータス",
        allLabel: "すべて",
        options: ["all", "下書き", "承認待ち", "承認済", "支払済", "差戻し", "キャンセル"]
      }
    ],
    emptyMessage: "支払依頼データがありません。",
    hasActions: true,
    tableClass: "payment",
    toolbarExtra: ""
  };
}

function paymentDetailHtml(payment, user) {
  const canEdit = user && hasPermission(user, "payment:edit");
  const canApprove = user && hasPermission(user, "approval:act");
  const sup = findSupplierById(payment.supplierId);
  const po = purchaseOrders.find(function(p) { return p.code === payment.purchaseOrderCode; });
  const status = payment.status;

  const canApprovePayment = canApprove && status === '承認待ち';
  const statusButtons = (
    (canEdit && status === '下書き' ?
      '<button class="button button-primary button-sm" type="button" data-action-payment-status="承認待ち">承認依頼</button>' +
      '<button class="button button-secondary button-sm" type="button" data-action-payment-status="キャンセル">キャンセル</button>'
    : '') +
    (canApprovePayment ?
      '<button class="button button-primary button-sm" type="button" id="payment-approve-btn">承認する</button>' +
      '<button class="button button-danger button-sm" type="button" id="payment-reject-btn">却下</button>'
    : '') +
    (canEdit && status === '承認済' ?
      '<button class="button button-primary button-sm" type="button" id="payment-register-btn">支払登録</button>'
    : '')
  );

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-10 支払依頼詳細</div>' +
          '<div class="panel-title-text">' + escapeHtml(payment.title) + '</div>' +
        '</div>' +
        '<div class="panel-actions">' +
          statusButtons +
          (viewState.approvalFrom === 'approval'
            ? '<button class="button button-ghost button-sm" type="button" id="payment-detail-back">承認一覧に戻る</button>'
            : '<button class="button button-secondary button-sm" type="button" id="payment-detail-back">一覧に戻る</button>') +
        '</div>' +
      '</div>' +
      (canApprovePayment ? approvalActionPanelHtml() : '') +
      '<div class="panel-content">' +
        '<div class="detail-grid">' +
          '<div class="detail-field"><div class="detail-label">支払依頼番号</div><div class="detail-value">' + escapeHtml(payment.code) + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">ステータス</div><div class="detail-value"><span class="status-badge ' + paymentStatusClass(status) + '">' + escapeHtml(status) + '</span></div></div>' +
          '<div class="detail-field"><div class="detail-label">発注番号</div><div class="detail-value">' + escapeHtml(payment.purchaseOrderCode) + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">仕入先</div><div class="detail-value">' + escapeHtml(sup ? sup.name : payment.supplierId) + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">支払予定日</div><div class="detail-value">' + escapeHtml(payment.paymentDate || '-') + '</div></div>' +
          '<div class="detail-field"><div class="detail-label">支払金額</div><div class="detail-value">' + Number(payment.amount || 0).toLocaleString() + ' 円</div></div>' +
          '<div class="detail-field"><div class="detail-label">備考</div><div class="detail-value">' + escapeHtml(payment.notes || '-') + '</div></div>' +
        '</div>' +
        approvalHistorySectionHtml(payment) +
      '</div>' +
    '</section>'
  );
}

function paymentRegistrationFormHtml(payment) {
  const errors = viewState.paymentForm.errors || {};
  const sup = findSupplierById(payment.supplierId);
  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-10 支払登録</div>' +
          '<div class="panel-title-text">支払登録</div>' +
        '</div>' +
      '</div>' +
      '<form class="register-form" id="payment-exec-form" novalidate>' +
        '<div class="form-grid">' +
          '<div class="form-field">' +
            '<label class="field-label">支払依頼番号</label>' +
            '<div class="input is-readonly" id="f-pmte-code">' + escapeHtml(payment.code) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">仕入先</label>' +
            '<div class="input is-readonly">' + escapeHtml(sup ? sup.name : payment.supplierId) + '</div>' +
          '</div>' +
          '<div class="form-field' + (errors.paidDate ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-pmte-date">支払日 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-pmte-date" type="date" value="">' +
            (errors.paidDate ? '<div class="error-message">' + escapeHtml(errors.paidDate) + '</div>' : '') +
          '</div>' +
          '<div class="form-field' + (errors.paidAmount ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-pmte-amount">支払金額 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-pmte-amount" type="number" min="1" value="' + (payment.amount || '') + '">' +
            (errors.paidAmount ? '<div class="error-message">' + escapeHtml(errors.paidAmount) + '</div>' : '') +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-pmte-notes">備考</label>' +
            '<input class="input" id="f-pmte-notes" type="text" value="">' +
          '</div>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">支払確定</button>' +
          '<button class="button button-secondary" type="button" id="payment-exec-cancel">キャンセル</button>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

function payableOrdersHtml(user) {
  const payable = findPayablePurchaseOrders(purchaseOrders, payments);

  if (payable.length === 0) {
    return (
      '<section class="panel">' +
        '<div class="panel-header">' +
          '<div>' +
            '<div class="panel-label">S-10 支払対象</div>' +
            '<div class="panel-title-text">支払対象抽出</div>' +
          '</div>' +
          '<div class="panel-actions">' +
            '<button class="button button-secondary button-sm" type="button" id="payment-back-to-list">一覧に戻る</button>' +
          '</div>' +
        '</div>' +
        '<div class="empty-card"><div class="empty-copy">支払対象の発注がありません。納品・検収済みの発注がある場合にここに表示されます。</div></div>' +
      '</section>'
    );
  }

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-10 支払対象</div>' +
          '<div class="panel-title-text">支払対象抽出</div>' +
        '</div>' +
        '<div class="panel-actions">' +
          '<button class="button button-secondary button-sm" type="button" id="payment-back-to-list">一覧に戻る</button>' +
        '</div>' +
      '</div>' +
      '<div class="detail-table detail-table--payable">' +
        '<div class="detail-table-head">' +
          '<div>発注番号</div><div>件名</div><div>仕入先</div><div>発注金額</div><div>操作</div>' +
        '</div>' +
        payable.map(function(po) {
          const sup = findSupplierById(po.supplierId);
          return '<div class="detail-table-row" data-payable-order="' + escapeHtml(po.code) + '">' +
            '<div>' + escapeHtml(po.code) + '</div>' +
            '<div>' + escapeHtml(po.title) + '</div>' +
            '<div>' + escapeHtml(sup ? sup.name : po.supplierId) + '</div>' +
            '<div>' + Number(po.total || 0).toLocaleString() + ' 円</div>' +
            '<div><button class="button button-primary button-xs" type="button" data-action-create-payment="' + escapeHtml(po.code) + '">依頼作成</button></div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>'
  );
}

function paymentRequestFormHtml(po) {
  const errors = viewState.paymentForm.errors || {};
  const sup = findSupplierById(po.supplierId);
  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-10 支払依頼登録</div>' +
          '<div class="panel-title-text">支払依頼登録</div>' +
        '</div>' +
      '</div>' +
      '<form class="register-form" id="payment-register-form" novalidate>' +
        '<div class="form-grid">' +
          '<div class="form-field">' +
            '<label class="field-label">発注番号</label>' +
            '<div class="input is-readonly" id="f-pmt-po-code">' + escapeHtml(po.code) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label">仕入先</label>' +
            '<div class="input is-readonly">' + escapeHtml(sup ? sup.name : po.supplierId) + '</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-pmt-title">件名</label>' +
            '<input class="input" id="f-pmt-title" type="text" value="' + escapeHtml(po.title + ' 支払依頼') + '">' +
          '</div>' +
          '<div class="form-field' + (errors.paymentDate ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-pmt-date">支払予定日 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-pmt-date" type="date" value="">' +
            (errors.paymentDate ? '<div class="error-message">' + escapeHtml(errors.paymentDate) + '</div>' : '') +
          '</div>' +
          '<div class="form-field' + (errors.amount ? ' has-error' : '') + '">' +
            '<label class="field-label" for="f-pmt-amount">支払金額 <span class="required-mark">*</span></label>' +
            '<input class="input" id="f-pmt-amount" type="number" min="1" value="' + (po.total || '') + '">' +
            (errors.amount ? '<div class="error-message">' + escapeHtml(errors.amount) + '</div>' : '') +
          '</div>' +
          '<div class="form-field">' +
            '<label class="field-label" for="f-pmt-notes">備考</label>' +
            '<input class="input" id="f-pmt-notes" type="text" value="">' +
          '</div>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">登録</button>' +
          '<button class="button button-secondary" type="button" id="payment-form-cancel">キャンセル</button>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

function paymentScreenHtml(user) {
  const canEdit = user && hasPermission(user, "payment:edit");
  if (viewState.paymentView === "register" && viewState.paymentDetailCode) {
    const payment = payments.find(function(p) { return p.code === viewState.paymentDetailCode; });
    if (payment) return paymentRegistrationFormHtml(payment);
  }
  if (viewState.paymentView === "detail" && viewState.paymentDetailCode) {
    const payment = payments.find(function(p) { return p.code === viewState.paymentDetailCode; });
    if (payment) return paymentDetailHtml(payment, user);
  }
  if (viewState.paymentView === "form") {
    const po = purchaseOrders.find(function(p) { return p.code === viewState.paymentForm.purchaseOrderCode; });
    if (po) return paymentRequestFormHtml(po);
  }
  if (viewState.paymentView === "payable") {
    return payableOrdersHtml(user);
  }
  const config = getPaymentTableConfig(user);
  if (canEdit) {
    config.toolbarExtra = '<button class="button button-primary" type="button" id="payment-create-btn">支払依頼作成</button>';
  }
  return dataTableHtml(config);
}

function getUserTableConfig(user) {
  const canEdit = user && hasPermission(user, "user-permission:edit");
  const columns = [
    { key: "id", label: "ユーザID", sortable: true },
    { key: "name", label: "氏名", sortable: true },
    { key: "userType", label: "利用者区分", sortable: true },
    { key: "department", label: "所属部門", sortable: true },
    { key: "position", label: "役職", sortable: true },
    {
      key: "status",
      label: "状態",
      sortable: true,
      render: function (value) {
        return '<span class="status ' + statusClass(value) + '">' + escapeHtml(value) + "</span>";
      }
    }
  ];
  if (canEdit) {
    columns.push({
      key: "_actions",
      label: "操作",
      sortable: false,
      render: function (value, row) {
        return '<button class="button button-ghost button-sm" type="button" data-action-edit-user="' + escapeHtml(row.id) + '">編集</button>';
      }
    });
  }
  return {
    stateKey: "userMaster",
    title: "ユーザ管理",
    rows: users,
    columns: columns,
    searchKeys: ["id", "name", "department", "position"],
    filters: [
      {
        key: "userType",
        label: "利用者区分",
        options: ["all", "システム管理者", "一般ユーザ"],
        allLabel: "全区分"
      },
      {
        key: "status",
        label: "状態",
        options: ["all", "有効", "停止"],
        allLabel: "全状態"
      }
    ],
    emptyMessage: "条件に一致するユーザがありません。",
    hasActions: canEdit,
    tableClass: "user",
    toolbarExtra: canEdit
      ? '<button class="button button-primary" type="button" id="new-user-btn">+ 新規登録</button>'
      : ""
  };
}

function getPaymentTermTableConfig() {
  return {
    stateKey: "paymentTermMaster",
    title: "支払条件マスタ",
    rows: paymentTerms,
    columns: [
      { key: "code", label: "コード", sortable: true },
      { key: "name", label: "名称", sortable: true },
      { key: "days", label: "支払猶予(日)", sortable: true },
      { key: "description", label: "説明", sortable: false }
    ],
    searchKeys: ["code", "name", "description"],
    filters: [],
    emptyMessage: "支払条件がありません。",
    hasActions: false,
    tableClass: "payment-term",
    toolbarExtra: ""
  };
}

function getTaxRateTableConfig() {
  return {
    stateKey: "taxRateMaster",
    title: "税率マスタ",
    rows: taxRates,
    columns: [
      { key: "code", label: "コード", sortable: true },
      { key: "name", label: "名称", sortable: true },
      { key: "rate", label: "税率", sortable: true },
      { key: "taxType", label: "税区分", sortable: true },
      { key: "appliedFrom", label: "適用開始", sortable: true }
    ],
    searchKeys: ["code", "name", "taxType"],
    filters: [],
    emptyMessage: "税率データがありません。",
    hasActions: false,
    tableClass: "tax-rate",
    toolbarExtra: ""
  };
}

function getFilteredRows(config) {
  const state = viewState.tables[config.stateKey];
  let rows = config.rows.slice();

  if (state.search) {
    const keyword = state.search.toLowerCase();
    rows = rows.filter(function (row) {
      return config.searchKeys.some(function (key) {
        return String(row[key]).toLowerCase().indexOf(keyword) >= 0;
      });
    });
  }

  config.filters.forEach(function (filter) {
    const selected = state[filter.key];
    if (selected && selected !== "all") {
      rows = rows.filter(function (row) {
        return row[filter.key] === selected;
      });
    }
  });

  rows.sort(function (left, right) {
    const a = String(left[state.sortKey] || "");
    const b = String(right[state.sortKey] || "");
    const compared = a.localeCompare(b, "ja");
    return state.sortDir === "asc" ? compared : -compared;
  });

  return rows;
}

function getPagedRows(config) {
  const state = viewState.tables[config.stateKey];
  const filtered = getFilteredRows(config);
  const pageSize = state.pageSize || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * pageSize;
  return {
    rows: filtered.slice(start, start + pageSize),
    totalRows: filtered.length,
    totalPages: totalPages,
    page: state.page
  };
}

function sortArrow(config, column) {
  const state = viewState.tables[config.stateKey];
  if (state.sortKey !== column.key) return "↕";
  return state.sortDir === "asc" ? "↑" : "↓";
}

function renderTableCell(column, row) {
  if (column.render) return column.render(row[column.key], row);
  return escapeHtml(row[column.key]);
}

function dataTableHtml(config) {
  const state = viewState.tables[config.stateKey];
  const result = getPagedRows(config);
  const pageSize = state.pageSize || PAGE_SIZE;
  const summary =
    "全 " + config.rows.length + " 件中 " +
    (result.totalRows === 0 ? "0" : ((result.page - 1) * pageSize + 1)) +
    " - " +
    Math.min(result.page * pageSize, result.totalRows) +
    " 件を表示";

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-title-text">' + config.title + "</div>" +
        "</div>" +
        '<div class="toolbar">' +
          (config.toolbarExtra || "") +
          '<button class="button button-secondary" type="button" data-table-action="export" data-table="' + config.stateKey + '">CSV 出力</button>' +
        "</div>" +
      "</div>" +
      '<div class="table-tools">' +
        '<label class="table-search">' +
          '<span class="field-label">キーワード検索</span>' +
          '<input class="input" type="search" data-table-input="search" data-table="' + config.stateKey + '" value="' + escapeHtml(state.search) + '" placeholder="顧客コード、顧客名、担当窓口、請求先で検索">' +
        "</label>" +
        config.filters.map(function (filter) {
          return (
            '<label class="table-filter">' +
              '<span class="field-label">' + filter.label + "</span>" +
              '<select class="select" data-table-filter="' + filter.key + '" data-table="' + config.stateKey + '">' +
                filter.options.map(function (option) {
                  const label = option === "all" ? filter.allLabel : option;
                  const selected = state[filter.key] === option ? ' selected' : "";
                  return '<option value="' + option + '"' + selected + ">" + label + "</option>";
                }).join("") +
              "</select>" +
            "</label>"
          );
        }).join("") +
        '<label class="table-filter">' +
          '<span class="field-label">表示件数</span>' +
          '<select class="select" data-table-pagesize data-table="' + config.stateKey + '">' +
            [5, 20, 50].map(function(n) {
              return '<option value="' + n + '"' + (pageSize === n ? ' selected' : '') + '>' + n + '件</option>';
            }).join('') +
          '</select>' +
        '</label>' +
      "</div>" +
      '<div class="table-summary">' + summary + "</div>" +
      '<div class="data-table' + (config.tableClass ? " " + config.tableClass : "") + (config.hasActions ? " has-actions" : "") + '">' +
        '<div class="data-table-head">' +
          config.columns.map(function (column) {
            if (column.sortable) {
              return (
                '<button class="data-table-head-cell is-sortable" type="button" data-table-action="sort" data-table="' + config.stateKey + '" data-key="' + column.key + '">' +
                  "<span>" + column.label + "</span>" +
                  '<span class="sort-arrow">' + sortArrow(config, column) + "</span>" +
                "</button>"
              );
            }
            return '<div class="data-table-head-cell"><span>' + column.label + "</span></div>";
          }).join("") +
        "</div>" +
        (result.rows.length
          ? result.rows.map(function (row) {
              return (
                '<div class="data-table-body-row">' +
                  config.columns.map(function (column) {
                    return '<div class="data-table-body-cell">' + renderTableCell(column, row) + "</div>";
                  }).join("") +
                "</div>"
              );
            }).join("")
          : '<div class="data-table-empty">' + config.emptyMessage + "</div>") +
      "</div>" +
      '<div class="table-pagination">' +
        '<button class="button button-ghost" type="button" data-table-action="prev" data-table="' + config.stateKey + '"' + (result.page <= 1 ? " disabled" : "") + '>前へ</button>' +
        '<div class="pagination-text">' + result.page + " / " + result.totalPages + " ページ</div>" +
        '<button class="button button-ghost" type="button" data-table-action="next" data-table="' + config.stateKey + '"' + (result.page >= result.totalPages ? " disabled" : "") + '>次へ</button>' +
      "</div>" +
    "</section>"
  );
}

function customerRegisterFormHtml() {
  const form = viewState.customerForm;
  const isEdit = form.mode === "edit";
  const data = form.data;
  const errors = form.errors;

  function fieldHtml(id, label, inputHtml, required, errorKey) {
    const error = errors[errorKey] || null;
    return (
      '<div class="form-field' + (required ? " is-required" : "") + '">' +
        '<label class="field-label" for="' + id + '">' +
          escapeHtml(label) +
          (required ? '<span class="required-mark">必須</span>' : "") +
        "</label>" +
        inputHtml +
        '<div class="field-error">' + (error ? escapeHtml(error) : "") + "</div>" +
      "</div>"
    );
  }

  function textInputHtml(id, key, placeholder, readonly) {
    const hasError = !!(errors[key]);
    return (
      '<input class="input' + (hasError ? " is-error" : "") + (readonly ? " is-readonly" : "") + '" id="' + id + '" type="text" ' +
        'data-form-field="' + key + '" ' +
        'value="' + escapeHtml(data[key]) + '" ' +
        'placeholder="' + escapeHtml(placeholder) + '"' +
        (readonly ? " readonly" : "") + ">"
    );
  }

  function selectInputHtml(id, key, options) {
    const hasError = !!(errors[key]);
    return (
      '<select class="select' + (hasError ? " is-error" : "") + '" id="' + id + '" data-form-field="' + key + '">' +
        '<option value="">選択してください</option>' +
        options.map(function (opt) {
          return (
            '<option value="' + escapeHtml(opt) + '"' + (data[key] === opt ? " selected" : "") + ">" +
              escapeHtml(opt) +
            "</option>"
          );
        }).join("") +
      "</select>"
    );
  }

  const departmentOptions = ["営業部門", "営業事務部門", "購買部門", "経理部門", "管理部門"];
  const closingDayOptions = ["末日", "10日", "15日", "20日", "25日"];
  const statusOptions = ["有効", "停止"];

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">S-11 Step ' + (isEdit ? "3" : "2") + "</div>" +
          '<div class="panel-title-text">顧客マスタ' + (isEdit ? "編集" : "登録") + "</div>" +
        "</div>" +
        '<span class="menu-tag">' + (isEdit ? "編集中: " + escapeHtml(form.editCode) : "新規登録") + "</span>" +
      "</div>" +
      '<form class="register-form" id="customer-register-form" novalidate>' +
        '<div class="form-grid">' +
          fieldHtml("f-code", "顧客コード", textInputHtml("f-code", "code", "CUS-XXX", isEdit), !isEdit, "code") +
          fieldHtml("f-name", "顧客名", textInputHtml("f-name", "name", "株式会社 例"), true, "name") +
          fieldHtml("f-department", "主管部門", selectInputHtml("f-department", "department", departmentOptions), true, "department") +
          fieldHtml("f-contact", "担当窓口", textInputHtml("f-contact", "contact", "山田 太郎"), false, "contact") +
          fieldHtml("f-closing-day", "締日", selectInputHtml("f-closing-day", "closingDay", closingDayOptions), true, "closingDay") +
          fieldHtml("f-payment-site", "支払サイト", textInputHtml("f-payment-site", "paymentSite", "翌月末"), true, "paymentSite") +
          fieldHtml("f-billing-to", "請求先", textInputHtml("f-billing-to", "billingTo", "本社経理部"), false, "billingTo") +
          fieldHtml("f-status", "状態", selectInputHtml("f-status", "status", statusOptions), true, "status") +
        "</div>" +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">' + (isEdit ? "更新する" : "登録する") + "</button>" +
          '<button class="button button-secondary" type="button" id="customer-form-cancel">キャンセル</button>' +
        "</div>" +
      "</form>" +
    "</section>"
  );
}

function supplierRegisterFormHtml() {
  const form = viewState.supplierForm;
  const isEdit = form.mode === "edit";
  const data = form.data;
  const errors = form.errors;

  function fieldHtml(id, label, inputHtml, required, errorKey) {
    const error = errors[errorKey] || null;
    return (
      '<div class="form-field' + (required ? " is-required" : "") + '">' +
        '<label class="field-label" for="' + id + '">' +
          escapeHtml(label) +
          (required ? '<span class="required-mark">必須</span>' : "") +
        "</label>" +
        inputHtml +
        '<div class="field-error">' + (error ? escapeHtml(error) : "") + "</div>" +
      "</div>"
    );
  }

  function textInputHtml(id, key, placeholder, readonly) {
    const hasError = !!(errors[key]);
    return (
      '<input class="input' + (hasError ? " is-error" : "") + (readonly ? " is-readonly" : "") + '" id="' + id + '" type="text" ' +
        'data-form-field="' + key + '" ' +
        'value="' + escapeHtml(data[key]) + '" ' +
        'placeholder="' + escapeHtml(placeholder) + '"' +
        (readonly ? " readonly" : "") + ">"
    );
  }

  function selectInputHtml(id, key, options) {
    const hasError = !!(errors[key]);
    return (
      '<select class="select' + (hasError ? " is-error" : "") + '" id="' + id + '" data-form-field="' + key + '">' +
        '<option value="">選択してください</option>' +
        options.map(function (opt) {
          return (
            '<option value="' + escapeHtml(opt) + '"' + (data[key] === opt ? " selected" : "") + ">" +
              escapeHtml(opt) +
            "</option>"
          );
        }).join("") +
      "</select>"
    );
  }

  const statusOptions = ["有効", "停止"];

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">S-11 Step ' + (isEdit ? "4b" : "4a") + "</div>" +
          '<div class="panel-title-text">仕入先マスタ' + (isEdit ? "編集" : "登録") + "</div>" +
        "</div>" +
        '<span class="menu-tag">' + (isEdit ? "編集中: " + escapeHtml(form.editCode) : "新規登録") + "</span>" +
      "</div>" +
      '<form class="register-form" id="supplier-register-form" novalidate>' +
        '<div class="form-grid">' +
          fieldHtml("f-code", "仕入先コード", textInputHtml("f-code", "code", "SUP-XXX", isEdit), !isEdit, "code") +
          fieldHtml("f-name", "仕入先名", textInputHtml("f-name", "name", "株式会社 例"), true, "name") +
          fieldHtml("f-contact", "担当窓口", textInputHtml("f-contact", "contact", "山田 太郎"), false, "contact") +
          fieldHtml("f-payment-site", "支払サイト", textInputHtml("f-payment-site", "paymentSite", "翌月末"), true, "paymentSite") +
          fieldHtml("f-status", "状態", selectInputHtml("f-status", "status", statusOptions), true, "status") +
        "</div>" +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">' + (isEdit ? "更新する" : "登録する") + "</button>" +
          '<button class="button button-secondary" type="button" id="supplier-form-cancel">キャンセル</button>' +
        "</div>" +
      "</form>" +
    "</section>"
  );
}

function productRegisterFormHtml() {
  const form = viewState.productForm;
  const isEdit = form.mode === "edit";
  const data = form.data;
  const errors = form.errors;

  function fieldHtml(id, label, inputHtml, required, errorKey) {
    const error = errors[errorKey] || null;
    return (
      '<div class="form-field' + (required ? " is-required" : "") + '">' +
        '<label class="field-label" for="' + id + '">' +
          escapeHtml(label) +
          (required ? '<span class="required-mark">必須</span>' : "") +
        "</label>" +
        inputHtml +
        '<div class="field-error">' + (error ? escapeHtml(error) : "") + "</div>" +
      "</div>"
    );
  }

  function textInputHtml(id, key, placeholder, readonly) {
    const hasError = !!(errors[key]);
    return (
      '<input class="input' + (hasError ? " is-error" : "") + (readonly ? " is-readonly" : "") + '" id="' + id + '" type="text" ' +
        'data-form-field="' + key + '" ' +
        'value="' + escapeHtml(data[key]) + '" ' +
        'placeholder="' + escapeHtml(placeholder) + '"' +
        (readonly ? " readonly" : "") + ">"
    );
  }

  function selectInputHtml(id, key, options) {
    const hasError = !!(errors[key]);
    return (
      '<select class="select' + (hasError ? " is-error" : "") + '" id="' + id + '" data-form-field="' + key + '">' +
        '<option value="">選択してください</option>' +
        options.map(function (opt) {
          return (
            '<option value="' + escapeHtml(opt) + '"' + (data[key] === opt ? " selected" : "") + ">" +
              escapeHtml(opt) +
            "</option>"
          );
        }).join("") +
      "</select>"
    );
  }

  const unitOptions = ["個", "式", "時間", "月", "年"];
  const taxOptions = ["課税", "非課税", "軽減税率"];
  const statusOptions = ["有効", "停止"];

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">S-11 Step ' + (isEdit ? "5b" : "5a") + "</div>" +
          '<div class="panel-title-text">商品マスタ' + (isEdit ? "編集" : "登録") + "</div>" +
        "</div>" +
        '<span class="menu-tag">' + (isEdit ? "編集中: " + escapeHtml(form.editCode) : "新規登録") + "</span>" +
      "</div>" +
      '<form class="register-form" id="product-register-form" novalidate>' +
        '<div class="form-grid">' +
          fieldHtml("f-code", "商品コード", textInputHtml("f-code", "code", "PRD-XXX", isEdit), !isEdit, "code") +
          fieldHtml("f-name", "商品名", textInputHtml("f-name", "name", "サーバー保守サービス"), true, "name") +
          fieldHtml("f-unit", "単位", selectInputHtml("f-unit", "unit", unitOptions), true, "unit") +
          fieldHtml("f-unit-price", "単価（円）", textInputHtml("f-unit-price", "unitPrice", "50000"), true, "unitPrice") +
          fieldHtml("f-tax", "税区分", selectInputHtml("f-tax", "tax", taxOptions), true, "tax") +
          fieldHtml("f-status", "状態", selectInputHtml("f-status", "status", statusOptions), true, "status") +
        "</div>" +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">' + (isEdit ? "更新する" : "登録する") + "</button>" +
          '<button class="button button-secondary" type="button" id="product-form-cancel">キャンセル</button>' +
        "</div>" +
      "</form>" +
    "</section>"
  );
}

function userRegisterFormHtml() {
  const form = viewState.userForm;
  const isEdit = form.mode === "edit";
  const data = form.data;
  const errors = form.errors;

  function fieldHtml(id, label, inputHtml, required, errorKey) {
    const error = errors[errorKey] || null;
    return (
      '<div class="form-field' + (required ? " is-required" : "") + '">' +
        '<label class="field-label" for="' + id + '">' +
          escapeHtml(label) +
          (required ? '<span class="required-mark">必須</span>' : "") +
        "</label>" +
        inputHtml +
        '<div class="field-error">' + (error ? escapeHtml(error) : "") + "</div>" +
      "</div>"
    );
  }

  function textInputHtml(id, key, placeholder, readonly, type) {
    const hasError = !!(errors[key]);
    return (
      '<input class="input' + (hasError ? " is-error" : "") + (readonly ? " is-readonly" : "") + '" id="' + id + '" type="' + (type || "text") + '" ' +
        'data-user-field="' + key + '" ' +
        'value="' + escapeHtml(data[key]) + '" ' +
        'placeholder="' + escapeHtml(placeholder) + '"' +
        (readonly ? " readonly" : "") + ">"
    );
  }

  function selectInputHtml(id, key, options) {
    const hasError = !!(errors[key]);
    return (
      '<select class="select' + (hasError ? " is-error" : "") + '" id="' + id + '" data-user-field="' + key + '">' +
        '<option value="">選択してください</option>' +
        options.map(function (opt) {
          return (
            '<option value="' + escapeHtml(opt) + '"' + (data[key] === opt ? " selected" : "") + ">" +
              escapeHtml(opt) +
            "</option>"
          );
        }).join("") +
      "</select>"
    );
  }

  const userTypeOptions = ["システム管理者", "一般ユーザ"];
  const departmentOptions = ["営業部門", "営業事務部門", "購買部門", "経理部門", "管理部門"];
  const statusOptions = ["有効", "停止"];

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">S-11 Step 6</div>' +
          '<div class="panel-title-text">ユーザ' + (isEdit ? "編集" : "登録") + "</div>" +
        "</div>" +
        '<span class="menu-tag">' + (isEdit ? "編集中: " + escapeHtml(form.editId) : "新規登録") + "</span>" +
      "</div>" +
      '<form class="register-form" id="user-register-form" novalidate>' +
        '<div class="form-grid">' +
          fieldHtml("f-user-id", "ユーザID", textInputHtml("f-user-id", "id", "user01", isEdit), !isEdit, "id") +
          fieldHtml("f-password", "パスワード", textInputHtml("f-password", "password", "パスワードを入力", false, "password"), true, "password") +
          fieldHtml("f-user-name", "氏名", textInputHtml("f-user-name", "name", "山田 太郎"), true, "name") +
          fieldHtml("f-user-type", "利用者区分", selectInputHtml("f-user-type", "userType", userTypeOptions), true, "userType") +
          fieldHtml("f-user-department", "所属部門", selectInputHtml("f-user-department", "department", departmentOptions), true, "department") +
          fieldHtml("f-position", "役職", textInputHtml("f-position", "position", "担当者"), true, "position") +
          fieldHtml("f-user-status", "状態", selectInputHtml("f-user-status", "status", statusOptions), true, "status") +
        "</div>" +
        '<div class="form-actions">' +
          '<button class="button button-primary" type="submit">' + (isEdit ? "更新する" : "登録する") + "</button>" +
          '<button class="button button-secondary" type="button" id="user-form-cancel">キャンセル</button>' +
        "</div>" +
      "</form>" +
    "</section>"
  );
}

function masterScreenHtml(user) {
  const tab = viewState.masterTab;

  if (tab === "supplier") {
    if (viewState.supplierForm.mode === "register" || viewState.supplierForm.mode === "edit") {
      return masterTabsHtml(tab, user) + supplierRegisterFormHtml();
    }
    return masterTabsHtml(tab, user) + dataTableHtml(getSupplierTableConfig(user));
  }

  if (tab === "product") {
    if (viewState.productForm.mode === "register" || viewState.productForm.mode === "edit") {
      return masterTabsHtml(tab, user) + productRegisterFormHtml();
    }
    return masterTabsHtml(tab, user) + dataTableHtml(getProductTableConfig(user));
  }

  if (tab === "user" && hasPermission(user, "user-permission:edit")) {
    if (viewState.userForm.mode === "register" || viewState.userForm.mode === "edit") {
      return masterTabsHtml(tab, user) + userRegisterFormHtml();
    }
    return masterTabsHtml(tab, user) + dataTableHtml(getUserTableConfig(user));
  }

  if (tab === "payment-term") {
    return masterTabsHtml(tab, user) + dataTableHtml(getPaymentTermTableConfig());
  }

  if (tab === "tax-rate") {
    return masterTabsHtml(tab, user) + dataTableHtml(getTaxRateTableConfig());
  }

  if (viewState.customerForm.mode === "register" || viewState.customerForm.mode === "edit") {
    return masterTabsHtml("customer", user) + customerRegisterFormHtml();
  }

  return masterTabsHtml("customer", user) + dataTableHtml(getCustomerTableConfig(user));
}

function masterTabsHtml(activeTab, user) {
  const canManageUsers = user && hasPermission(user, "user-permission:edit");
  return (
    '<div class="master-tabs">' +
      '<button class="master-tab' + (activeTab === "customer" ? " is-active" : "") + '" type="button" data-master-tab="customer">顧客マスタ</button>' +
      '<button class="master-tab' + (activeTab === "supplier" ? " is-active" : "") + '" type="button" data-master-tab="supplier">仕入先マスタ</button>' +
      '<button class="master-tab' + (activeTab === "product" ? " is-active" : "") + '" type="button" data-master-tab="product">商品マスタ</button>' +
      '<button class="master-tab' + (activeTab === "payment-term" ? " is-active" : "") + '" type="button" data-master-tab="payment-term">支払条件</button>' +
      '<button class="master-tab' + (activeTab === "tax-rate" ? " is-active" : "") + '" type="button" data-master-tab="tax-rate">税率</button>' +
      (canManageUsers ? '<button class="master-tab' + (activeTab === "user" ? " is-active" : "") + '" type="button" data-master-tab="user">ユーザ管理</button>' : "") +
    "</div>"
  );
}

function sampleUsersHtml() {
  return users.map(function (user) {
    return (
      '<article class="sample-user">' +
        '<div class="sample-user-name">' + escapeHtml(user.name) + "</div>" +
        '<div class="sample-user-meta">' +
          "ID: " + escapeHtml(user.id) + "<br>" +
          "区分: " + escapeHtml(user.userType) + "<br>" +
          "所属: " + escapeHtml(user.department) + " / 役職: " + escapeHtml(user.position) +
        "</div>" +
        '<div class="sample-user-permissions">' +
          user.permissions.slice(0, 4).map(function (permission) {
            return '<span class="chip">' + escapeHtml(permission) + "</span>";
          }).join("") +
        "</div>" +
      "</article>"
    );
  }).join("");
}

function renderLogin(message, kind) {
  appRoot.innerHTML =
    '<div class="auth-shell">' +
      '<section class="auth-card">' +
        '<aside class="auth-brand">' +
          '<div class="brand-mark"></div>' +
          '<div class="brand-title">取引管理システム</div>' +
          '<div class="brand-copy">requirements_definition.md と implementation_plan.md に基づく初期実装です。共通基盤、認証認可、フォーム共通部品、顧客マスタ一覧・登録まで実装済みです。</div>' +
          '<div class="brand-nav">' +
            '<div class="brand-nav-item is-active">CB-01 画面レイアウト基盤</div>' +
            '<div class="brand-nav-item is-active">CB-02 認証・認可基盤</div>' +
            '<div class="brand-nav-item is-active">CB-03 一覧画面共通部品</div>' +
            '<div class="brand-nav-item is-active">CB-04 フォーム共通部品</div>' +
            '<div class="brand-nav-item is-active">S-11 顧客マスタ 一覧・登録</div>' +
          "</div>" +
        "</aside>" +
        '<div class="auth-main">' +
          '<div class="hero-panels">' +
            '<section class="hero-card">' +
              '<div class="hero-eyebrow">Implementation Start</div>' +
              '<div class="hero-value">所属・役職・個別権限</div>' +
              '<div class="hero-subcopy">利用者区分を「システム管理者 / 一般ユーザ」の2区分とし、所属部門・役職・ユーザ個別権限の組み合わせで認可する前提を反映しています。</div>' +
            "</section>" +
            '<section class="signal-card">' +
              '<div class="hero-eyebrow">Current Scope</div>' +
              '<div class="signal-value">Login / Layout / Guard / List / Form</div>' +
              '<div class="hero-subcopy">レビュー対象は、ログイン導線、権限に応じたメニュー表示、一覧部品、顧客マスタ一覧・登録フォームまでです。</div>' +
            "</section>" +
          "</div>" +
          '<div class="auth-content">' +
            '<section class="panel">' +
              '<div class="panel-label">S-01</div>' +
              '<h1 class="panel-title">ログイン</h1>' +
              '<div class="panel-copy">サンプルユーザでログインし、画面表示と操作可否が所属部門・役職・個別権限に応じて切り替わることを確認できます。admin は顧客マスタ登録も操作可能です。</div>' +
              '<form class="login-form" id="login-form">' +
                '<label class="field"><span class="field-label">ユーザ ID</span><input class="input" id="user-id" name="userId" autocomplete="username" placeholder="admin / sales01 / finance01"></label>' +
                '<label class="field"><span class="field-label">パスワード</span><input class="input" id="password" name="password" type="password" autocomplete="current-password" placeholder="パスワードを入力"></label>' +
                '<div class="actions">' +
                  '<button class="button button-primary" type="submit">ログイン</button>' +
                  '<button class="button button-secondary" type="button" id="fill-admin">管理者サンプル</button>' +
                "</div>" +
                '<div class="feedback ' + (kind ? "feedback-" + kind : "") + '" id="feedback">' + (message || "") + "</div>" +
              "</form>" +
            "</section>" +
            '<section class="sample-users">' + sampleUsersHtml() + "</section>" +
          "</div>" +
        "</div>" +
      "</section>" +
    "</div>";

  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("fill-admin").addEventListener("click", function () {
    document.getElementById("user-id").value = "admin";
    document.getElementById("password").value = "admin123";
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const userId = document.getElementById("user-id").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: userId, password: password }),
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        renderLogin("ユーザ ID またはパスワードが正しくありません。", "error");
      } else {
        renderLogin("ログインに失敗しました。しばらく後で再試行してください。", "error");
      }
      return;
    }

    const { user: apiUser } = await res.json();
    const localUser = users.find(function (u) { return u.id === apiUser.id; });
    currentUser = Object.assign({}, apiUser, { permissions: localUser ? localUser.permissions : [] });

    if (!window.location.hash) {
      window.location.hash = "#/dashboard";
    }
    renderApp();
  } catch {
    renderLogin("サーバーに接続できません。ネットワーク接続を確認してください。", "error");
  }
}

function sidebarHtml(visibleScreens, currentScreenId) {
  return visibleScreens.map(function (screen) {
    return (
      '<div class="menu-item ' + (screen.id === currentScreenId ? "is-active" : "") + '" data-route="' + screen.id + '">' +
        "<span>" + screen.title + "</span>" +
        '<span class="menu-tag">' + screen.tag + "</span>" +
      "</div>"
    );
  }).join("");
}

function renderApp() {
  const user = getSessionUser();
  if (!user) {
    renderLogin("", "");
    return;
  }

  const route = ensureAllowedRoute(user);

  if (route !== "master") {
    if (viewState.customerForm.mode !== "list") {
      viewState.customerForm.mode = "list";
      viewState.customerForm.editCode = null;
      viewState.customerForm.errors = {};
    }
    if (viewState.supplierForm.mode !== "list") {
      viewState.supplierForm.mode = "list";
      viewState.supplierForm.editCode = null;
      viewState.supplierForm.errors = {};
    }
    if (viewState.productForm.mode !== "list") {
      viewState.productForm.mode = "list";
      viewState.productForm.editCode = null;
      viewState.productForm.errors = {};
    }
    if (viewState.userForm.mode !== "list") {
      viewState.userForm.mode = "list";
      viewState.userForm.editId = null;
      viewState.userForm.errors = {};
    }
  }
  if (route !== "project") {
    if (viewState.projectForm.mode !== "list") {
      viewState.projectForm.mode = "list";
      viewState.projectForm.editCode = null;
      viewState.projectForm.errors = {};
    }
    viewState.projectView = "list";
    viewState.projectDetailCode = null;
  }
  if (route !== "payment") {
    viewState.paymentView = "list";
    viewState.paymentDetailCode = null;
    viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
  }
  if (route !== "invoice") {
    viewState.invoiceView = "list";
    viewState.invoiceDetailCode = null;
    viewState.receiptForm = { invoiceCode: null, errors: {} };
  }

  const visibleScreens = getVisibleScreens(user);
  const currentScreen = visibleScreens.find(function (screen) {
    return screen.id === route;
  }) || visibleScreens[0];

  let contentHtml = "";
  if (currentScreen.id === "dashboard") {
    contentHtml = dashboardHtml(user);
  } else if (currentScreen.id === "master") {
    contentHtml = masterScreenHtml(user);
  } else if (currentScreen.id === "project") {
    contentHtml = projectScreenHtml(user);
  } else if (currentScreen.id === "quotation") {
    contentHtml = quotationScreenHtml(user);
  } else if (currentScreen.id === "sales-order") {
    contentHtml = salesOrderScreenHtml(user);
  } else if (currentScreen.id === "purchase-order") {
    contentHtml = purchaseOrderScreenHtml(user);
  } else if (currentScreen.id === "delivery") {
    contentHtml = deliveryScreenHtml(user);
  } else if (currentScreen.id === "invoice") {
    contentHtml = invoiceScreenHtml(user);
  } else if (currentScreen.id === "receipt") {
    contentHtml = receiptScreenHtml(user);
  } else if (currentScreen.id === "payment") {
    contentHtml = paymentScreenHtml(user);
  } else if (currentScreen.id === "approval") {
    contentHtml = approvalScreenHtml();
  } else if (currentScreen.id === "notification") {
    contentHtml = notificationScreenHtml(user);
  } else if (currentScreen.id === "report") {
    contentHtml = reportScreenHtml();
  } else if (currentScreen.id === "settings") {
    contentHtml = settingsScreenHtml(user);
  } else {
    contentHtml = placeholderScreenHtml(currentScreen, user);
  }

  appRoot.innerHTML =
    '<div class="app-shell">' +
      '<div class="workspace' + (viewState.sidebarCollapsed ? ' sidebar-collapsed' : '') + '">' +
        '<aside class="sidebar' + (viewState.sidebarCollapsed ? ' is-collapsed' : '') + '">' +
          '<button class="sidebar-toggle" id="sidebar-toggle" type="button" title="サイドバーを' + (viewState.sidebarCollapsed ? '展開' : '折りたたむ') + '">' +
            (viewState.sidebarCollapsed ? '›' : '‹') +
          '</button>' +
          '<div class="sidebar-header">' +
            '<div class="brand-mark"></div>' +
            '<div class="brand-title">取引管理システム</div>' +
          "</div>" +
          '<nav class="menu">' + sidebarHtml(visibleScreens, currentScreen.id) + "</nav>" +
          '<div class="sidebar-footer">' +
            '<div class="identity">' +
              '<div class="identity-name">' + user.name + "</div>" +
              '<div class="identity-meta">' + user.userType + "<br>" + user.department + " / " + user.position + "</div>" +
            "</div>" +
            '<button class="button button-secondary" id="logout-button" type="button">ログアウト</button>' +
          "</div>" +
        "</aside>" +
        '<main class="content">' +
          '<header class="topbar">' +
            '<div class="page-heading">' +
              '<div class="panel-label">' + currentScreen.tag + "</div>" +
              '<div class="page-title">' + currentScreen.title + "</div>" +
            "</div>" +
            '<div class="toolbar">' +
              '<span class="menu-tag">' + user.department + "</span>" +
              '<span class="menu-tag">' + user.position + "</span>" +
              '<span class="menu-tag">権限 ' + user.permissions.length + "件</span>" +
            "</div>" +
          "</header>" +
          contentHtml +
        "</main>" +
      "</div>" +
    "</div>";

  bindAppEvents();
}

function bindAppEvents() {
  document.getElementById("sidebar-toggle").addEventListener("click", function () {
    viewState.sidebarCollapsed = !viewState.sidebarCollapsed;
    renderApp();
  });

  document.getElementById("logout-button").addEventListener("click", async function () {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ネットワークエラーは無視してログアウト継続 */ }
    currentUser = null;
    // hashchange を発火させずにセッションを破棄し、ログイン画面へ戻る
    renderLogin("ログアウトしました。", "success");
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-route]"), function (link) {
    link.addEventListener("click", function () {
      window.location.hash = "#/" + link.getAttribute("data-route");
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-table-input='search']"), function (input) {
    var composing = false;
    input.addEventListener("compositionstart", function() { composing = true; });
    input.addEventListener("compositionend", function() {
      composing = false;
      applySearchUpdate(input);
    });
    input.addEventListener("input", function() {
      if (composing) return;
      applySearchUpdate(input);
    });
    function applySearchUpdate(el) {
      var tableKey = el.getAttribute("data-table");
      var state = viewState.tables[tableKey];
      if (!state) return;
      state.search = el.value;
      state.page = 1;
      var cursorPos = el.selectionStart;
      renderApp();
      var newEl = document.querySelector("[data-table-input='search'][data-table='" + tableKey + "']");
      if (newEl) {
        newEl.focus();
        newEl.setSelectionRange(cursorPos, cursorPos);
      }
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-table-filter]"), function (select) {
    select.addEventListener("change", function () {
      const state = viewState.tables[select.getAttribute("data-table")];
      state[select.getAttribute("data-table-filter")] = select.value;
      state.page = 1;
      renderApp();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-table-pagesize]"), function (select) {
    select.addEventListener("change", function () {
      const state = viewState.tables[select.getAttribute("data-table")];
      state.pageSize = parseInt(select.value, 10);
      state.page = 1;
      renderApp();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-table-action='sort']"), function (button) {
    button.addEventListener("click", function () {
      const state = viewState.tables[button.getAttribute("data-table")];
      const key = button.getAttribute("data-key");
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "asc";
      }
      renderApp();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-table-action='prev']"), function (button) {
    button.addEventListener("click", function () {
      const state = viewState.tables[button.getAttribute("data-table")];
      state.page = Math.max(1, state.page - 1);
      renderApp();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-table-action='next']"), function (button) {
    button.addEventListener("click", function () {
      const state = viewState.tables[button.getAttribute("data-table")];
      state.page += 1;
      renderApp();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-table-action='export']"), function (button) {
    button.addEventListener("click", function () {
      const table = button.getAttribute("data-table");
      if (table === "customerMaster") exportCustomerCsv();
      else if (table === "supplierMaster") exportSupplierCsv();
      else if (table === "productMaster") exportProductCsv();
    });
  });

  // S-11 Step 4: マスタタブ切り替え
  Array.prototype.forEach.call(document.querySelectorAll("[data-master-tab]"), function (btn) {
    btn.addEventListener("click", function () {
      viewState.masterTab = btn.getAttribute("data-master-tab");
      renderApp();
    });
  });

  // S-11 Step 3: 編集ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-edit]"), function (btn) {
    btn.addEventListener("click", function () {
      const code = btn.getAttribute("data-action-edit");
      const customer = findCustomerByCode(customers, code);
      if (!customer) return;
      viewState.customerForm.data = {
        code: customer.code,
        name: customer.name,
        department: customer.department,
        contact: customer.contact,
        closingDay: customer.closingDay,
        paymentSite: customer.paymentSite,
        billingTo: customer.billingTo,
        status: customer.status
      };
      viewState.customerForm.editCode = code;
      viewState.customerForm.errors = {};
      viewState.customerForm.mode = "edit";
      renderApp();
    });
  });

  // S-11 Step 2: 新規登録ボタン
  const newCustomerBtn = document.getElementById("new-customer-btn");
  if (newCustomerBtn) {
    newCustomerBtn.addEventListener("click", function () {
      const codes = customers.map(function (c) { return c.code; });
      viewState.customerForm.data = {
        code: generateCustomerCode(codes),
        name: "",
        department: "",
        contact: "",
        closingDay: "",
        paymentSite: "",
        billingTo: "",
        status: "有効"
      };
      viewState.customerForm.errors = {};
      viewState.customerForm.mode = "register";
      renderApp();
    });
  }

  // フォームフィールドの状態更新（再描画せずに状態のみ更新）
  Array.prototype.forEach.call(document.querySelectorAll("[data-form-field]"), function (el) {
    const updateState = function () {
      const form = el.closest("[data-form-context]");
      const formContext = form ? form.getAttribute("data-form-context") : null;
      if (formContext) {
        setFormField(formContext, el.getAttribute("data-form-field"), el.value);
      } else {
        const tab = viewState.masterTab;
        const stateKey = tab === "supplier" ? "supplierForm" : tab === "product" ? "productForm" : tab === "user" ? "userForm" : "customerForm";
        viewState[stateKey].data[el.getAttribute("data-form-field")] = el.value;
      }
    };
    el.addEventListener("input", updateState);
    el.addEventListener("change", updateState);
  });

  // 顧客名検索コンポーネント
  Array.prototype.forEach.call(document.querySelectorAll("[data-customer-search]"), function (wrapper) {
    const input = wrapper.querySelector("[data-customer-search-input]");
    const hidden = wrapper.querySelector("[data-form-field]");
    const dropdown = wrapper.querySelector("[data-customer-search-dropdown]");
    const fieldKey = wrapper.getAttribute("data-search-field");

    function showDropdown(filtered) {
      dropdown.innerHTML = filtered.slice(0, 10).map(function (c) {
        return (
          '<div class="customer-search-item" data-code="' + escapeHtml(c.code) + '">' +
            '<span class="customer-search-code">' + escapeHtml(c.code) + '</span>' +
            '<span class="customer-search-name">' + escapeHtml(c.name) + '</span>' +
          '</div>'
        );
      }).join('');
      dropdown.classList.add('is-open');
    }

    function hideDropdown() {
      dropdown.classList.remove('is-open');
    }

    input.addEventListener('input', function () {
      const keyword = input.value;
      if (!keyword.trim()) {
        hidden.value = '';
        const form = wrapper.closest('[data-form-context]');
        if (form) setFormField(form.getAttribute('data-form-context'), fieldKey, '');
        hideDropdown();
        return;
      }
      const filtered = filterCustomersByName(customers, keyword);
      if (filtered.length) {
        showDropdown(filtered);
      } else {
        hideDropdown();
      }
    });

    input.addEventListener('focus', function () {
      const keyword = input.value;
      if (keyword.trim()) {
        const filtered = filterCustomersByName(customers, keyword);
        if (filtered.length) showDropdown(filtered);
      }
    });

    input.addEventListener('blur', function () {
      setTimeout(hideDropdown, 150);
    });

    dropdown.addEventListener('click', function (e) {
      const item = e.target.closest('.customer-search-item');
      if (!item) return;
      const code = item.getAttribute('data-code');
      const customer = findCustomerByCode(customers, code);
      input.value = customer ? customer.name : code;
      hidden.value = code;
      const form = wrapper.closest('[data-form-context]');
      if (form) setFormField(form.getAttribute('data-form-context'), fieldKey, code);
      hideDropdown();
    });
  });

  // S-11 Step 2: キャンセルボタン
  const cancelBtn = document.getElementById("customer-form-cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      viewState.customerForm.mode = "list";
      viewState.customerForm.errors = {};
      renderApp();
    });
  }

  // S-11 Step 2-3: フォーム送信（顧客 登録 / 編集）
  const regForm = document.getElementById("customer-register-form");
  if (regForm) {
    regForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const isEdit = viewState.customerForm.mode === "edit";
      const data = viewState.customerForm.data;
      const existingCodes = customers.map(function (c) { return c.code; });
      const rules = Object.assign(
        isEdit ? {} : {
          code: [
            { type: "required", fieldName: "顧客コード" },
            { type: "maxLength", max: 20, fieldName: "顧客コード" },
            { type: "unique", existingValues: existingCodes, fieldName: "顧客コード" }
          ]
        },
        {
          name: [
            { type: "required", fieldName: "顧客名" },
            { type: "maxLength", max: 100, fieldName: "顧客名" }
          ],
          department: [{ type: "required", fieldName: "主管部門" }],
          closingDay: [{ type: "required", fieldName: "締日" }],
          paymentSite: [
            { type: "required", fieldName: "支払サイト" },
            { type: "maxLength", max: 50, fieldName: "支払サイト" }
          ],
          status: [{ type: "required", fieldName: "状態" }]
        }
      );
      const errors = validateForm(data, rules);
      const hasError = Object.keys(errors).some(function (k) { return errors[k] !== null; });
      if (hasError) {
        viewState.customerForm.errors = errors;
        renderApp();
        return;
      }
      const submitBtn = regForm.querySelector('[type="submit"]');
      try {
        if (isEdit) {
          await withFeedback('/api/customers/' + viewState.customerForm.editCode, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }, { button: submitBtn, successMsg: '顧客を更新しました' });
          viewState.customerForm.editCode = null;
        } else {
          await withFeedback('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }, { button: submitBtn, successMsg: '顧客を登録しました' });
        }
        await refreshCustomers();
        viewState.tables.customerMaster.page = Math.ceil(customers.length / (viewState.tables.customerMaster.pageSize || PAGE_SIZE));
        viewState.customerForm.mode = "list";
        viewState.customerForm.errors = {};
        renderApp();
      } catch { /* エラーはwithFeedbackがトーストで通知済み */ }
    });
  }

  // S-11 Step 4: 仕入先 編集ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-edit-supplier]"), function (btn) {
    btn.addEventListener("click", function () {
      const code = btn.getAttribute("data-action-edit-supplier");
      const supplier = findSupplierByCode(suppliers, code);
      if (!supplier) return;
      viewState.supplierForm.data = {
        code: supplier.code,
        name: supplier.name,
        contact: supplier.contact,
        paymentSite: supplier.paymentSite,
        status: supplier.status
      };
      viewState.supplierForm.editCode = code;
      viewState.supplierForm.errors = {};
      viewState.supplierForm.mode = "edit";
      renderApp();
    });
  });

  // S-11 Step 4: 仕入先 新規登録ボタン
  const newSupplierBtn = document.getElementById("new-supplier-btn");
  if (newSupplierBtn) {
    newSupplierBtn.addEventListener("click", function () {
      const codes = suppliers.map(function (s) { return s.code; });
      viewState.supplierForm.data = {
        code: generateSupplierCode(codes),
        name: "",
        contact: "",
        paymentSite: "",
        status: "有効"
      };
      viewState.supplierForm.errors = {};
      viewState.supplierForm.mode = "register";
      renderApp();
    });
  }

  // S-11 Step 4: 仕入先 キャンセルボタン
  const supplierCancelBtn = document.getElementById("supplier-form-cancel");
  if (supplierCancelBtn) {
    supplierCancelBtn.addEventListener("click", function () {
      viewState.supplierForm.mode = "list";
      viewState.supplierForm.errors = {};
      renderApp();
    });
  }

  // S-11 Step 4: 仕入先 フォーム送信（登録 / 編集）
  const supplierForm = document.getElementById("supplier-register-form");
  if (supplierForm) {
    supplierForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const isEdit = viewState.supplierForm.mode === "edit";
      const data = viewState.supplierForm.data;
      const existingCodes = suppliers.map(function (s) { return s.code; });
      const rules = Object.assign(
        isEdit ? {} : {
          code: [
            { type: "required", fieldName: "仕入先コード" },
            { type: "maxLength", max: 20, fieldName: "仕入先コード" },
            { type: "unique", existingValues: existingCodes, fieldName: "仕入先コード" }
          ]
        },
        {
          name: [
            { type: "required", fieldName: "仕入先名" },
            { type: "maxLength", max: 100, fieldName: "仕入先名" }
          ],
          paymentSite: [
            { type: "required", fieldName: "支払サイト" },
            { type: "maxLength", max: 50, fieldName: "支払サイト" }
          ],
          status: [{ type: "required", fieldName: "状態" }]
        }
      );
      const errors = validateForm(data, rules);
      const hasError = Object.keys(errors).some(function (k) { return errors[k] !== null; });
      if (hasError) {
        viewState.supplierForm.errors = errors;
        renderApp();
        return;
      }
      if (isEdit) {
        const idx = suppliers.findIndex(function (s) { return s.code === viewState.supplierForm.editCode; });
        if (idx >= 0) suppliers[idx] = createSupplier(data);
        viewState.supplierForm.editCode = null;
      } else {
        suppliers.push(createSupplier(data));
        viewState.tables.supplierMaster.page = Math.ceil(suppliers.length / (viewState.tables.supplierMaster.pageSize || PAGE_SIZE));
      }
      viewState.supplierForm.mode = "list";
      viewState.supplierForm.errors = {};
      renderApp();
    });
  }

  // S-11 Step 5: 商品 編集ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-edit-product]"), function (btn) {
    btn.addEventListener("click", function () {
      const code = btn.getAttribute("data-action-edit-product");
      const product = findProductByCode(products, code);
      if (!product) return;
      viewState.productForm.data = {
        code: product.code,
        name: product.name,
        unit: product.unit,
        unitPrice: product.unitPrice,
        tax: product.tax,
        status: product.status
      };
      viewState.productForm.editCode = code;
      viewState.productForm.errors = {};
      viewState.productForm.mode = "edit";
      renderApp();
    });
  });

  // S-11 Step 5: 商品 新規登録ボタン
  const newProductBtn = document.getElementById("new-product-btn");
  if (newProductBtn) {
    newProductBtn.addEventListener("click", function () {
      const codes = products.map(function (p) { return p.code; });
      viewState.productForm.data = {
        code: generateProductCode(codes),
        name: "",
        unit: "",
        unitPrice: "",
        tax: "",
        status: "有効"
      };
      viewState.productForm.errors = {};
      viewState.productForm.mode = "register";
      renderApp();
    });
  }

  // S-11 Step 5: 商品 キャンセルボタン
  const productCancelBtn = document.getElementById("product-form-cancel");
  if (productCancelBtn) {
    productCancelBtn.addEventListener("click", function () {
      viewState.productForm.mode = "list";
      viewState.productForm.errors = {};
      renderApp();
    });
  }

  // S-11 Step 5: 商品 フォーム送信（登録 / 編集）
  const productFormEl = document.getElementById("product-register-form");
  if (productFormEl) {
    productFormEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const isEdit = viewState.productForm.mode === "edit";
      const data = viewState.productForm.data;
      const existingCodes = products.map(function (p) { return p.code; });
      const rules = Object.assign(
        isEdit ? {} : {
          code: [
            { type: "required", fieldName: "商品コード" },
            { type: "maxLength", max: 20, fieldName: "商品コード" },
            { type: "unique", existingValues: existingCodes, fieldName: "商品コード" }
          ]
        },
        {
          name: [
            { type: "required", fieldName: "商品名" },
            { type: "maxLength", max: 100, fieldName: "商品名" }
          ],
          unit: [{ type: "required", fieldName: "単位" }],
          unitPrice: [
            { type: "required", fieldName: "単価" },
            { type: "maxLength", max: 20, fieldName: "単価" }
          ],
          tax: [{ type: "required", fieldName: "税区分" }],
          status: [{ type: "required", fieldName: "状態" }]
        }
      );
      const errors = validateForm(data, rules);
      const hasError = Object.keys(errors).some(function (k) { return errors[k] !== null; });
      if (hasError) {
        viewState.productForm.errors = errors;
        renderApp();
        return;
      }
      if (isEdit) {
        const idx = products.findIndex(function (p) { return p.code === viewState.productForm.editCode; });
        if (idx >= 0) products[idx] = createProduct(data);
        viewState.productForm.editCode = null;
      } else {
        products.push(createProduct(data));
        viewState.tables.productMaster.page = Math.ceil(products.length / (viewState.tables.productMaster.pageSize || PAGE_SIZE));
      }
      viewState.productForm.mode = "list";
      viewState.productForm.errors = {};
      renderApp();
    });
  }

  // S-11 Step 6: ユーザフォームフィールドの状態更新
  Array.prototype.forEach.call(document.querySelectorAll("[data-user-field]"), function (el) {
    const updateState = function () {
      viewState.userForm.data[el.getAttribute("data-user-field")] = el.value;
    };
    el.addEventListener("input", updateState);
    el.addEventListener("change", updateState);
  });

  // S-11 Step 6: ユーザ 編集ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-edit-user]"), function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-action-edit-user");
      const u = findUserById(users, id);
      if (!u) return;
      viewState.userForm.data = {
        id: u.id,
        password: '',
        name: u.name,
        userType: u.userType,
        department: u.department,
        position: u.position,
        status: u.status || "有効"
      };
      viewState.userForm.editId = id;
      viewState.userForm.errors = {};
      viewState.userForm.mode = "edit";
      renderApp();
    });
  });

  // S-11 Step 6: ユーザ 新規登録ボタン
  const newUserBtn = document.getElementById("new-user-btn");
  if (newUserBtn) {
    newUserBtn.addEventListener("click", function () {
      viewState.userForm.data = {
        id: "",
        password: "",
        name: "",
        userType: "",
        department: "",
        position: "",
        status: "有効"
      };
      viewState.userForm.errors = {};
      viewState.userForm.mode = "register";
      renderApp();
    });
  }

  // S-11 Step 6: ユーザ キャンセルボタン
  const userCancelBtn = document.getElementById("user-form-cancel");
  if (userCancelBtn) {
    userCancelBtn.addEventListener("click", function () {
      viewState.userForm.mode = "list";
      viewState.userForm.errors = {};
      renderApp();
    });
  }

  // S-11 Step 6: ユーザ フォーム送信（登録 / 編集）
  const userFormEl = document.getElementById("user-register-form");
  if (userFormEl) {
    userFormEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const isEdit = viewState.userForm.mode === "edit";
      const data = viewState.userForm.data;
      const existingIds = users.map(function (u) { return u.id; });
      const rules = Object.assign(
        isEdit ? {} : {
          id: [
            { type: "required", fieldName: "ユーザID" },
            { type: "maxLength", max: 30, fieldName: "ユーザID" },
            { type: "unique", existingValues: existingIds, fieldName: "ユーザID" }
          ]
        },
        {
          password: [
            { type: "required", fieldName: "パスワード" },
            { type: "maxLength", max: 50, fieldName: "パスワード" }
          ],
          name: [
            { type: "required", fieldName: "氏名" },
            { type: "maxLength", max: 50, fieldName: "氏名" }
          ],
          userType: [{ type: "required", fieldName: "利用者区分" }],
          department: [{ type: "required", fieldName: "所属部門" }],
          position: [
            { type: "required", fieldName: "役職" },
            { type: "maxLength", max: 30, fieldName: "役職" }
          ],
          status: [{ type: "required", fieldName: "状態" }]
        }
      );
      const errors = validateForm(data, rules);
      const hasError = Object.keys(errors).some(function (k) { return errors[k] !== null; });
      if (hasError) {
        viewState.userForm.errors = errors;
        renderApp();
        return;
      }
      if (isEdit) {
        const idx = users.findIndex(function (u) { return u.id === viewState.userForm.editId; });
        if (idx >= 0) {
          const updated = createUser(data);
          updated.id = users[idx].id;
          users[idx] = updated;
        }
        viewState.userForm.editId = null;
      } else {
        users.push(createUser(data));
        viewState.tables.userMaster.page = Math.ceil(users.length / (viewState.tables.userMaster.pageSize || PAGE_SIZE));
      }
      viewState.userForm.mode = "list";
      viewState.userForm.errors = {};
      renderApp();
    });
  }

  // S-03: 案件 詳細ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-detail-project]"), function (btn) {
    btn.addEventListener("click", function () {
      viewState.projectDetailCode = btn.getAttribute("data-action-detail-project");
      viewState.projectView = "detail";
      renderApp();
    });
  });

  // S-03: 案件 一覧へ戻るボタン
  const projectDetailBackBtn = document.getElementById("project-detail-back");
  if (projectDetailBackBtn) {
    projectDetailBackBtn.addEventListener("click", function () {
      viewState.projectView = "list";
      viewState.projectDetailCode = null;
      renderApp();
    });
  }

  // S-03: 案件 編集ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-edit-project]"), function (btn) {
    btn.addEventListener("click", function () {
      const code = btn.getAttribute("data-action-edit-project");
      const project = findProjectByCode(projects, code);
      if (!project) return;
      viewState.projectForm.data = {
        code: project.code,
        name: project.name,
        customerId: project.customerId,
        department: project.department,
        status: project.status,
        startDate: project.startDate,
        dueDate: project.dueDate,
        description: project.description
      };
      viewState.projectForm.editCode = code;
      viewState.projectForm.errors = {};
      viewState.projectForm.mode = "edit";
      viewState.projectView = "list";
      renderApp();
    });
  });

  // S-03: 案件 新規登録ボタン
  const newProjectBtn = document.getElementById("new-project-btn");
  if (newProjectBtn) {
    newProjectBtn.addEventListener("click", function () {
      const codes = projects.map(function (p) { return p.code; });
      viewState.projectForm.data = {
        code: generateProjectCode(codes),
        name: "",
        customerId: "",
        department: "",
        status: "商談中",
        startDate: "",
        dueDate: "",
        description: ""
      };
      viewState.projectForm.errors = {};
      viewState.projectForm.mode = "register";
      renderApp();
    });
  }

  // S-03: 案件 キャンセルボタン
  const projectCancelBtn = document.getElementById("project-form-cancel");
  if (projectCancelBtn) {
    projectCancelBtn.addEventListener("click", function () {
      viewState.projectForm.mode = "list";
      viewState.projectForm.errors = {};
      renderApp();
    });
  }

  // S-03: 案件 フォーム送信（登録 / 編集）
  const projectFormEl = document.getElementById("project-register-form");
  if (projectFormEl) {
    projectFormEl.addEventListener("submit", async function (e) {
      e.preventDefault();
      const isEdit = viewState.projectForm.mode === "edit";
      const data = viewState.projectForm.data;
      const rules = Object.assign(
        {},
        {
          name: [
            { type: "required", fieldName: "案件名" },
            { type: "maxLength", max: 100, fieldName: "案件名" }
          ],
          customerId: [{ type: "required", fieldName: "顧客" }],
          department: [{ type: "required", fieldName: "主管部門" }],
          status: [{ type: "required", fieldName: "状態" }]
        }
      );
      const errors = validateForm(data, rules);
      const hasError = Object.keys(errors).some(function (k) { return errors[k] !== null; });
      if (hasError) {
        viewState.projectForm.errors = errors;
        renderApp();
        return;
      }
      const projectSubmitBtn = e.submitter || e.target.querySelector('[type="submit"]');
      try {
        if (isEdit) {
          await withFeedback('/api/projects/' + viewState.projectForm.editCode, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }, { button: projectSubmitBtn, successMsg: '案件を更新しました' });
          viewState.projectForm.editCode = null;
        } else {
          await withFeedback('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }, { button: projectSubmitBtn, successMsg: '案件を登録しました' });
        }
        await refreshProjects();
        viewState.tables.projectList.page = Math.ceil(projects.length / (viewState.tables.projectList.pageSize || PAGE_SIZE));
        viewState.projectForm.mode = "list";
        viewState.projectForm.errors = {};
        renderApp();
      } catch (err) {
        viewState.projectForm.errors = { _global: err.message };
        renderApp();
      }
    });
  }

  // S-04: 見積 詳細ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-detail-quotation]"), function (btn) {
    btn.addEventListener("click", function () {
      viewState.quotationView = "detail";
      viewState.quotationDetailCode = btn.getAttribute("data-action-detail-quotation");
      renderApp();
    });
  });

  // S-04: 見積 改版ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-revise-quotation]"), function (btn) {
    btn.addEventListener("click", function () {
      const code = btn.getAttribute("data-action-revise-quotation");
      const original = findQuotationByCode(quotations, code);
      if (!original) return;
      const newCode = generateQuotationCode(quotations.map(function (q) { return q.code; }));
      const revised = createRevision(original, newCode);
      viewState.quotationView = "list";
      viewState.quotationDetailCode = null;
      viewState.quotationForm.data = {
        code: revised.code,
        projectCode: revised.projectCode,
        customerId: revised.customerId,
        title: revised.title,
        issueDate: revised.issueDate,
        validityDate: revised.validityDate,
        version: revised.version,
        status: revised.status,
        notes: revised.notes
      };
      viewState.quotationForm.details = revised.details.map(function (d) { return Object.assign({}, d); });
      viewState.quotationForm.editCode = null;
      viewState.quotationForm.errors = {};
      viewState.quotationForm.mode = "register";
      renderApp();
    });
  });

  // S-04: 見積 PDF出力ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-print-quotation]"), function (btn) {
    btn.addEventListener("click", function () {
      const code = btn.getAttribute("data-action-print-quotation");
      const q = findQuotationByCode(quotations, code);
      if (!q) return;
      const project = projects.find(function (p) { return p.code === q.projectCode; }) || null;
      const customer = findCustomerByCode(customers, q.customerId) || null;
      const html = buildQuotationPrintHtml(q, project, customer, viewState.settings);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      }
    });
  });

  // S-05: 受注一覧 詳細ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-detail-order]"), function (btn) {
    btn.addEventListener("click", function () {
      viewState.orderDetailCode = btn.getAttribute("data-action-detail-order");
      viewState.orderView = "detail";
      renderApp();
    });
  });

  // S-05: 受注詳細 一覧に戻るボタン
  const orderDetailBackBtn = document.getElementById("order-detail-back");
  if (orderDetailBackBtn) {
    orderDetailBackBtn.addEventListener("click", function () {
      viewState.orderView = "list";
      viewState.orderDetailCode = null;
      if (viewState.approvalFrom === 'approval') {
        viewState.approvalFrom = null;
        window.location.hash = 'approval';
      } else {
        renderApp();
      }
    });
  }

  // S-05: 受注 承認依頼ボタン
  const orderSubmitApprovalBtn = document.getElementById("order-submit-approval-btn");
  if (orderSubmitApprovalBtn) {
    orderSubmitApprovalBtn.addEventListener("click", async function() {
      const order = orders.find(function(o) { return o.code === viewState.orderDetailCode; });
      if (!order) return;
      const linkedQuotation = order.quotationCode ? findQuotationByCode(quotations, order.quotationCode) : null;
      const errors = validateOrderApprovalSubmit(order, linkedQuotation);
      if (errors) {
        alert(errors.join('\n'));
        return;
      }
      try {
        await withFeedback('/api/orders/' + viewState.orderDetailCode + '/submit-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }, { button: orderSubmitApprovalBtn, successMsg: '承認依頼を送信しました' });
        await refreshOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  // S-05: 受注 承認ボタン
  var orderApproveBtn = document.getElementById("order-approve-btn");
  if (orderApproveBtn) {
    orderApproveBtn.addEventListener("click", function() { openApprovalActionPanel('approve'); });
  }

  // S-05: 受注 却下ボタン
  var orderRejectBtn = document.getElementById("order-reject-btn");
  if (orderRejectBtn) {
    orderRejectBtn.addEventListener("click", function() { openApprovalActionPanel('reject'); });
  }

  // P0-08: 受注 下書きに戻すボタン
  var orderReturnDraftBtn = document.getElementById("order-return-draft-btn");
  if (orderReturnDraftBtn) {
    orderReturnDraftBtn.addEventListener("click", async function() {
      try {
        await withFeedback('/api/orders/' + viewState.orderDetailCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '受注済み' })
        }, { button: orderReturnDraftBtn, successMsg: '受注済みに戻しました' });
        await refreshOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  // P0-08: 受注 契約手続き済ボタン（管理部長のみ）
  var orderCompleteContractBtn = document.getElementById("order-complete-contract-btn");
  if (orderCompleteContractBtn) {
    orderCompleteContractBtn.addEventListener("click", async function() {
      try {
        await withFeedback('/api/orders/' + viewState.orderDetailCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '契約手続き済' })
        }, { button: orderCompleteContractBtn, successMsg: '契約手続き済にしました' });
        await refreshOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  // S-05: 受注ステータス変更ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-order-status]"), function (btn) {
    btn.addEventListener("click", async function () {
      const newStatus = btn.getAttribute("data-action-order-status");
      const orderCode = btn.getAttribute("data-order-code");
      try {
        await withFeedback('/api/orders/' + orderCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }, { button: btn, successMsg: 'ステータスを更新しました' });
        await refreshOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-06: 発注一覧 新規発注ボタン
  const newPodBtn = document.getElementById("new-purchase-order-btn");
  if (newPodBtn) {
    newPodBtn.addEventListener("click", function () {
      const newCode = generatePurchaseOrderCode(purchaseOrders.map(function(p) { return p.code; }));
      viewState.purchaseOrderForm.data = {
        code: newCode,
        orderCode: "",
        supplierId: "",
        title: "",
        orderDate: "",
        deliveryDate: "",
        total: 0,
        notes: ""
      };
      viewState.purchaseOrderForm.details = [];
      viewState.purchaseOrderForm.attachments = [];
      viewState.purchaseOrderForm.errors = {};
      viewState.purchaseOrderForm.isStandalone = true;
      viewState.purchaseOrderForm.mode = "register";
      viewState.purchaseOrderSourceCode = null;
      renderApp();
    });
  }

  // S-06: 発注登録フォーム キャンセル
  const podFormCancelBtn = document.getElementById("purchase-order-form-cancel");
  if (podFormCancelBtn) {
    podFormCancelBtn.addEventListener("click", function () {
      viewState.purchaseOrderForm.mode = "list";
      viewState.purchaseOrderForm.errors = {};
      if (viewState.purchaseOrderSourceCode) {
        viewState.orderDetailCode = viewState.purchaseOrderSourceCode;
        viewState.orderView = "detail";
        window.location.hash = "#/sales-order";
      } else {
        renderApp();
      }
    });
  }

  // S-06: 発注明細チェックボックス
  Array.prototype.forEach.call(document.querySelectorAll(".pod-line-check"), function(chk) {
    chk.addEventListener("change", function() {
      const lineNo = parseInt(chk.getAttribute("data-line-no"), 10);
      const selected = viewState.purchaseOrderForm.selectedLineNos.slice();
      if (chk.checked) {
        if (selected.indexOf(lineNo) < 0) selected.push(lineNo);
      } else {
        const idx = selected.indexOf(lineNo);
        if (idx >= 0) selected.splice(idx, 1);
      }
      viewState.purchaseOrderForm.selectedLineNos = selected;
      const selectedDetails = viewState.purchaseOrderForm.details.filter(function(d) {
        return selected.indexOf(d.lineNo) >= 0;
      });
      const totals = calcTotalsFromDetails(selectedDetails);
      viewState.purchaseOrderForm.data.total = totals.total;
      renderApp();
    });
  });

  // S-06: 発注添付ファイル選択
  const podAttachmentInput = document.getElementById("f-pod-attachment");
  if (podAttachmentInput) {
    podAttachmentInput.addEventListener("change", function () {
      Array.prototype.forEach.call(this.files, function(file) {
        const attachment = {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString().slice(0, 10)
        };
        viewState.purchaseOrderForm.attachments = addAttachment(
          { attachments: viewState.purchaseOrderForm.attachments }, attachment
        ).attachments;
      });
      podAttachmentInput.value = "";
      renderApp();
    });
  }

  // S-06: 発注添付ファイル削除
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-remove-pod-attachment]"), function(btn) {
    btn.addEventListener("click", function() {
      const idx = parseInt(btn.getAttribute("data-action-remove-pod-attachment"), 10);
      viewState.purchaseOrderForm.attachments = removeAttachment(
        { attachments: viewState.purchaseOrderForm.attachments }, idx
      ).attachments;
      renderApp();
    });
  });

  // S-06: 発注登録フォーム 送信
  const podFormEl = document.getElementById("purchase-order-register-form");
  if (podFormEl) {
    podFormEl.addEventListener("submit", async function (e) {
      e.preventDefault();
      const data = viewState.purchaseOrderForm.data;
      const title = document.getElementById("f-pod-title") ? document.getElementById("f-pod-title").value : data.title;
      const supplierId = document.getElementById("f-pod-supplier") ? document.getElementById("f-pod-supplier").value : data.supplierId;
      const orderDate = document.getElementById("f-pod-date") ? document.getElementById("f-pod-date").value : data.orderDate;
      const deliveryDate = document.getElementById("f-pod-delivery-date") ? document.getElementById("f-pod-delivery-date").value : data.deliveryDate;
      const notes = document.getElementById("f-pod-notes") ? document.getElementById("f-pod-notes").value : data.notes;
      const contractMethod = document.getElementById("f-pod-contract-method") ? document.getElementById("f-pod-contract-method").value : data.contractMethod;

      const errors = {};
      if (!title || !title.trim()) errors.title = "発注件名は必須です。";
      if (!supplierId) errors.supplierId = "仕入先は必須です。";
      if (!orderDate || !orderDate.trim()) errors.orderDate = "発注日は必須です。";
      if (Object.keys(errors).length > 0) {
        viewState.purchaseOrderForm.errors = errors;
        renderApp();
        return;
      }

      const inputOrderCode = viewState.purchaseOrderForm.isStandalone
        ? (document.getElementById("f-pod-order-code-input") ? document.getElementById("f-pod-order-code-input").value : "")
        : data.orderCode;
      let saved;
      if (viewState.purchaseOrderForm.isStandalone) {
        saved = createPurchaseOrder(data.code, supplierId, title, orderDate);
        saved.orderCode = inputOrderCode || '';
      } else {
        const selectedLineNos = viewState.purchaseOrderForm.selectedLineNos;
        const selectedDetails = viewState.purchaseOrderForm.details.filter(function(d) {
          return selectedLineNos.indexOf(d.lineNo) >= 0;
        });
        const order = findOrderByCode(orders, data.orderCode);
        saved = createPurchaseOrderFromOrder(order || data, data.code, supplierId, orderDate);
        saved.title = title;
        saved.details = selectedDetails;
        const totals = calcTotalsFromDetails(selectedDetails);
        saved.subtotal = totals.subtotal;
        saved.taxAmount = totals.taxAmount;
        saved.total = totals.total;
      }
      saved.deliveryDate = deliveryDate;
      saved.notes = notes;
      saved.contractMethod = contractMethod;
      saved.attachments = viewState.purchaseOrderForm.attachments.slice();
      const podSubmitBtn = document.querySelector('#purchase-order-form [type="submit"]');
      try {
        await withFeedback('/api/purchase-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saved)
        }, { button: podSubmitBtn, successMsg: '発注書を登録しました' });
        await refreshPurchaseOrders();
        viewState.tables.purchaseOrderList.page = Math.ceil(purchaseOrders.length / (viewState.tables.purchaseOrderList.pageSize || PAGE_SIZE));
        viewState.purchaseOrderForm.mode = "list";
        viewState.purchaseOrderForm.errors = {};
        viewState.purchaseOrderSourceCode = null;
        renderApp();
      } catch (err) {
        viewState.purchaseOrderForm.errors = { _global: err.message };
        renderApp();
      }
    });
  }

  // S-06: 発注詳細ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-detail-purchase-order]"), function(btn) {
    btn.addEventListener("click", function() {
      viewState.purchaseOrderDetailCode = btn.getAttribute("data-action-detail-purchase-order");
      viewState.purchaseOrderView = "detail";
      renderApp();
    });
  });

  // S-06: 承認依頼ボタン（承認依頼→承認依頼中）
  const podSubmitApprovalBtn = document.getElementById("pod-submit-approval-btn");
  if (podSubmitApprovalBtn) {
    podSubmitApprovalBtn.addEventListener("click", async function() {
      const podCode = viewState.purchaseOrderDetailCode;
      try {
        await withFeedback('/api/purchase-orders/' + podCode + '/submit-approval', { method: 'POST' }, { button: podSubmitApprovalBtn, successMsg: '承認依頼を送信しました' });
        await refreshPurchaseOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  // S-13 Step 4: レポート年フィルター
  var reportYearFilter = document.getElementById("report-year-filter");
  if (reportYearFilter) {
    reportYearFilter.addEventListener("change", function() {
      viewState.reportFilter.year = reportYearFilter.value;
      viewState.reportDrilldown.customerId = null;
      renderApp();
    });
  }

  // S-13 Step 4: 未収CSV出力
  var exportUncollected = document.getElementById("report-export-uncollected");
  if (exportUncollected) {
    exportUncollected.addEventListener("click", function() {
      exportReportCsv(
        getUncollectedInvoices(invoices),
        ["code", "title", "invoiceDate", "dueDate", "total", "status"],
        ["請求コード", "タイトル", "請求日", "支払期限", "金額", "ステータス"],
        "uncollected.csv"
      );
    });
  }

  // S-13 Step 4: 未払CSV出力
  var exportUnpaid = document.getElementById("report-export-unpaid");
  if (exportUnpaid) {
    exportUnpaid.addEventListener("click", function() {
      exportReportCsv(
        getUnpaidPayments(payments),
        ["code", "title", "paymentDate", "amount", "status"],
        ["支払依頼コード", "タイトル", "支払予定日", "金額", "ステータス"],
        "unpaid.csv"
      );
    });
  }

  // S-08: 請求書印刷ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-print-invoice]"), function(btn) {
    btn.addEventListener("click", function() {
      const invCode = btn.getAttribute("data-action-print-invoice");
      const inv = invoices.find(function(i) { return i.code === invCode; });
      if (!inv) return;
      const customer = findCustomerByCode(customers, inv.customerId) || null;
      const order = findOrderByCode(orders, inv.orderCode) || null;
      const html = buildInvoicePrintHtml(inv, order, customer, viewState.settings);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      }
    });
  });

  // S-13 Step 5: 顧客別集計 → 案件別集計ドリルダウン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-drill-customer]"), function(btn) {
    btn.addEventListener("click", function() {
      const cid = btn.getAttribute("data-action-drill-customer");
      viewState.reportDrilldown.customerId = viewState.reportDrilldown.customerId === cid ? null : cid;
      renderApp();
    });
  });

  // S-12: 承認一覧 → 伝票詳細ドリルダウン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-detail-approval]"), function(btn) {
    btn.addEventListener("click", function() {
      const val = btn.getAttribute("data-action-detail-approval");
      const sepIdx = val.indexOf(':');
      const type = val.slice(0, sepIdx);
      const code = val.slice(sepIdx + 1);
      const route = getApprovalDetailRoute({ type: type, code: code });
      if (!route) return;
      viewState.approvalFrom = 'approval';
      if (route.screen === 'quotation') {
        viewState.quotationView = "detail";
        viewState.quotationDetailCode = route.code;
        window.location.hash = 'quotation';
      } else if (route.screen === 'order') {
        viewState.orderView = "detail";
        viewState.orderDetailCode = route.code;
        window.location.hash = 'sales-order';
      } else if (route.screen === 'purchaseOrder') {
        viewState.purchaseOrderView = "detail";
        viewState.purchaseOrderDetailCode = route.code;
        window.location.hash = 'purchase-order';
      } else if (route.screen === 'payment') {
        viewState.paymentView = "detail";
        viewState.paymentDetailCode = route.code;
        window.location.hash = 'payment';
      } else if (route.screen === 'invoice') {
        viewState.invoiceView = "detail";
        viewState.invoiceDetailCode = route.code;
        window.location.hash = 'invoice';
      }
    });
  });

  // S-12/P0-07: 承認操作 - 承認ボタン押下（見積・発注・支払依頼）
  function currentOperatorName() {
    const u = getSessionUser();
    return u ? (u.name || u.id) : '';
  }

  function nowTimestamp() {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
  }

  function openApprovalActionPanel(mode) {
    viewState.approvalAction = { mode: mode, comment: '', commentError: null };
    renderApp();
  }

  function closeApprovalActionPanel() {
    viewState.approvalAction = { mode: null, comment: '', commentError: null };
    renderApp();
  }

  function navigateBackToApproval() {
    viewState.approvalFrom = null;
    viewState.approvalAction = { mode: null, comment: '', commentError: null };
    window.location.hash = 'approval';
  }

  var quotationApproveBtn = document.getElementById("quotation-approve-btn");
  if (quotationApproveBtn) {
    quotationApproveBtn.addEventListener("click", function() { openApprovalActionPanel('approve'); });
  }

  var quotationRejectBtn = document.getElementById("quotation-reject-btn");
  if (quotationRejectBtn) {
    quotationRejectBtn.addEventListener("click", function() { openApprovalActionPanel('reject'); });
  }

  // P0-02: 見積 下書きに戻すボタン
  var quotationReturnDraftBtn = document.getElementById("quotation-return-draft-btn");
  if (quotationReturnDraftBtn) {
    quotationReturnDraftBtn.addEventListener("click", async function() {
      try {
        await withFeedback('/api/quotations/' + viewState.quotationDetailCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '下書き' })
        }, { button: quotationReturnDraftBtn, successMsg: '下書きに戻しました' });
        await refreshQuotations();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  var podApproveBtn = document.getElementById("pod-approve-btn");
  if (podApproveBtn) {
    podApproveBtn.addEventListener("click", function() { openApprovalActionPanel('approve'); });
  }

  var podRejectBtn = document.getElementById("pod-reject-btn");
  if (podRejectBtn) {
    podRejectBtn.addEventListener("click", function() { openApprovalActionPanel('reject'); });
  }

  var podReturnDraftBtn = document.getElementById("pod-return-draft-btn");
  if (podReturnDraftBtn) {
    podReturnDraftBtn.addEventListener("click", async function() {
      try {
        await withFeedback('/api/purchase-orders/' + viewState.purchaseOrderDetailCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '下書き' })
        }, { button: podReturnDraftBtn, successMsg: '下書きに戻しました' });
        await refreshPurchaseOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  var paymentApproveBtn = document.getElementById("payment-approve-btn");
  if (paymentApproveBtn) {
    paymentApproveBtn.addEventListener("click", function() { openApprovalActionPanel('approve'); });
  }

  var paymentRejectBtn = document.getElementById("payment-reject-btn");
  if (paymentRejectBtn) {
    paymentRejectBtn.addEventListener("click", function() { openApprovalActionPanel('reject'); });
  }

  var approvalCancelBtn = document.getElementById("approval-action-cancel");
  if (approvalCancelBtn) {
    approvalCancelBtn.addEventListener("click", closeApprovalActionPanel);
  }

  // 承認確定
  var approvalConfirmApproveBtn = document.getElementById("approval-confirm-approve");
  if (approvalConfirmApproveBtn) {
    approvalConfirmApproveBtn.addEventListener("click", async function() {
      const commentInput = document.getElementById("approval-comment-input");
      const comment = commentInput ? commentInput.value.trim() : '';
      viewState.approvalAction.comment = comment;

      var approveEntry = buildApprovalHistoryEntry('承認', currentOperatorName(), comment, nowTimestamp());
      const approveBtn = approvalConfirmApproveBtn;
      function applyApproveHistory(arr, code, newStatus) {
        var doc = arr.find(function(d) { return d.code === code; });
        if (doc) { doc.status = newStatus; doc.approvalHistory = (doc.approvalHistory || []).concat([approveEntry]); }
      }
      try {
        if (viewState.quotationDetailCode && viewState.quotationView === 'detail') {
          await withFeedback('/api/quotations/' + viewState.quotationDetailCode + '/approve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment })
          }, { button: approveBtn, successMsg: '承認しました' });
          applyApproveHistory(quotations, viewState.quotationDetailCode, '承認済み');
          await refreshQuotations();
          viewState.quotationView = 'list';
          viewState.quotationDetailCode = null;
        } else if (viewState.orderDetailCode && viewState.orderView === 'detail') {
          await withFeedback('/api/orders/' + viewState.orderDetailCode + '/approve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment })
          }, { button: approveBtn, successMsg: '承認しました' });
          applyApproveHistory(orders, viewState.orderDetailCode, '承認済み');
          await refreshOrders();
          viewState.orderView = 'list';
          viewState.orderDetailCode = null;
        } else if (viewState.purchaseOrderDetailCode && viewState.purchaseOrderView === 'detail') {
          await withFeedback('/api/purchase-orders/' + viewState.purchaseOrderDetailCode + '/approve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment })
          }, { button: approveBtn, successMsg: '承認しました' });
          applyApproveHistory(purchaseOrders, viewState.purchaseOrderDetailCode, '承認済・発注待ち');
          await refreshPurchaseOrders();
          viewState.purchaseOrderView = 'list';
          viewState.purchaseOrderDetailCode = null;
        } else if (viewState.paymentDetailCode && viewState.paymentView === 'detail') {
          await withFeedback('/api/payments/' + viewState.paymentDetailCode + '/approve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment })
          }, { button: approveBtn, successMsg: '承認しました' });
          applyApproveHistory(payments, viewState.paymentDetailCode, '承認済');
          await refreshPayments();
          viewState.paymentView = 'list';
          viewState.paymentDetailCode = null;
        } else if (viewState.invoiceDetailCode && viewState.invoiceView === 'detail') {
          var invCode = viewState.invoiceDetailCode;
          await withFeedback('/api/invoices/' + invCode + '/approve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment })
          }, { button: approveBtn, successMsg: '承認しました' });
          applyApproveHistory(invoices, invCode, '承認済');
          await refreshInvoices();
          viewState.invoiceView = 'list';
          viewState.invoiceDetailCode = null;
        }
      } catch { /* トーストで通知済み */ return; }
      navigateBackToApproval();
    });
  }

  // 却下確定
  var approvalConfirmRejectBtn = document.getElementById("approval-confirm-reject");
  if (approvalConfirmRejectBtn) {
    approvalConfirmRejectBtn.addEventListener("click", async function() {
      const commentInput = document.getElementById("approval-comment-input");
      const comment = commentInput ? commentInput.value.trim() : '';
      if (!comment) {
        viewState.approvalAction.commentError = '却下理由は必須です。';
        renderApp();
        return;
      }
      viewState.approvalAction.comment = comment;

      var rejectEntry = buildApprovalHistoryEntry('却下', currentOperatorName(), comment, nowTimestamp());
      const rejectBtn = approvalConfirmRejectBtn;
      function applyRejectHistory(arr, code) {
        var doc = arr.find(function(d) { return d.code === code; });
        if (doc) { doc.status = '却下'; doc.approvalHistory = (doc.approvalHistory || []).concat([rejectEntry]); }
      }
      try {
        if (viewState.quotationDetailCode && viewState.quotationView === 'detail') {
          await withFeedback('/api/quotations/' + viewState.quotationDetailCode + '/reject', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: comment })
          }, { button: rejectBtn, successMsg: '却下しました' });
          applyRejectHistory(quotations, viewState.quotationDetailCode);
          await refreshQuotations();
          viewState.quotationView = 'list';
          viewState.quotationDetailCode = null;
        } else if (viewState.orderDetailCode && viewState.orderView === 'detail') {
          await withFeedback('/api/orders/' + viewState.orderDetailCode + '/reject', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: comment })
          }, { button: rejectBtn, successMsg: '却下しました' });
          applyRejectHistory(orders, viewState.orderDetailCode);
          await refreshOrders();
          viewState.orderView = 'list';
          viewState.orderDetailCode = null;
        } else if (viewState.purchaseOrderDetailCode && viewState.purchaseOrderView === 'detail') {
          await withFeedback('/api/purchase-orders/' + viewState.purchaseOrderDetailCode + '/reject', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: comment })
          }, { button: rejectBtn, successMsg: '却下しました' });
          applyRejectHistory(purchaseOrders, viewState.purchaseOrderDetailCode);
          await refreshPurchaseOrders();
          viewState.purchaseOrderView = 'list';
          viewState.purchaseOrderDetailCode = null;
        } else if (viewState.paymentDetailCode && viewState.paymentView === 'detail') {
          await withFeedback('/api/payments/' + viewState.paymentDetailCode + '/reject', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: comment })
          }, { button: rejectBtn, successMsg: '却下しました' });
          applyRejectHistory(payments, viewState.paymentDetailCode);
          await refreshPayments();
          viewState.paymentView = 'list';
          viewState.paymentDetailCode = null;
        } else if (viewState.invoiceDetailCode && viewState.invoiceView === 'detail') {
          await withFeedback('/api/invoices/' + viewState.invoiceDetailCode + '/reject', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: comment })
          }, { button: rejectBtn, successMsg: '却下しました' });
          applyRejectHistory(invoices, viewState.invoiceDetailCode);
          await refreshInvoices();
          viewState.invoiceView = 'list';
          viewState.invoiceDetailCode = null;
        } else { return; }
      } catch { /* トーストで通知済み */ return;
      }
      navigateBackToApproval();
    });
  }

  // S-15: 設定タブ切り替え
  Array.prototype.forEach.call(document.querySelectorAll("[data-settings-tab]"), function(btn) {
    btn.addEventListener("click", function() {
      viewState.settingsTab = btn.getAttribute("data-settings-tab");
      viewState.settingsErrors = {};
      renderApp();
    });
  });

  // S-15: 会社情報フォーム保存
  var settingsCompanyForm = document.getElementById("settings-company-form");
  if (settingsCompanyForm) {
    settingsCompanyForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const name = document.getElementById("s-company-name").value.trim();
      const errors = {};
      if (!name) errors.name = "会社名は必須です。";
      if (Object.keys(errors).length > 0) {
        viewState.settingsErrors = errors;
        renderApp();
        return;
      }
      try {
        const patch = {
          name: name,
          address: document.getElementById("s-company-address").value.trim(),
          phone: document.getElementById("s-company-phone").value.trim()
        };
        await withFeedback('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }, { successMsg: '会社情報を保存しました' });
        Object.assign(viewState.settings, patch);
        viewState.settingsErrors = {};
        renderApp();
      } catch (err) {
        viewState.settingsErrors = { _global: err.message };
        renderApp();
      }
    });
  }

  // S-15: 年度設定フォーム保存
  var settingsFiscalForm = document.getElementById("settings-fiscal-form");
  if (settingsFiscalForm) {
    settingsFiscalForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const month = parseInt(document.getElementById("s-fiscal-end-month").value, 10);
      try {
        await withFeedback('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fiscalEndMonth: month }) }, { successMsg: '年度設定を保存しました' });
        viewState.settings.fiscalEndMonth = month;
        viewState.reportFilter.year = "all";
        viewState.settingsErrors = {};
        renderApp();
      } catch (err) {
        viewState.settingsErrors = { _global: err.message };
        renderApp();
      }
    });
  }

  // P0-11: 承認ルート設定 - 伝票種別選択
  var routeDoctypeSelect = document.querySelector("[data-action-route-doctype]");
  if (routeDoctypeSelect) {
    routeDoctypeSelect.addEventListener("change", function() {
      viewState.approvalRouteForm.documentType = routeDoctypeSelect.value;
      viewState.approvalRouteForm.newApproverUserId = '';
      renderApp();
    });
  }

  // P0-11 / S-15: 承認ルート設定 - ステップ追加
  var routeAddStepBtn = document.getElementById("s-route-add-step");
  if (routeAddStepBtn) {
    routeAddStepBtn.addEventListener("click", async function() {
      const approverSelect = document.getElementById("s-route-new-approver");
      const approverUserId = approverSelect ? approverSelect.value : '';
      if (!approverUserId) return;
      const docType = viewState.approvalRouteForm.documentType;
      const existing = viewState.approvalRoutes.filter(function(r) { return r.documentType === docType; });
      const maxStep = existing.reduce(function(max, r) { return Math.max(max, r.stepNumber); }, 0);
      try {
        await withFeedback('/api/approval-routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentType: docType, stepNumber: maxStep + 1, approverUserId: approverUserId })
        }, { button: routeAddStepBtn, successMsg: '承認ルートを追加しました' });
        viewState.approvalRoutes = addRouteStep(viewState.approvalRoutes, docType, approverUserId);
        await refreshApprovalRoutes();
        viewState.approvalRouteForm.newApproverUserId = '';
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  // P0-11 / S-15: 承認ルート設定 - ステップ削除
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-remove-route]"), function(btn) {
    btn.addEventListener("click", async function() {
      const val = btn.getAttribute("data-action-remove-route");
      const numId = Number(val);
      if (!isNaN(numId) && numId > 0) {
        try {
          await withFeedback('/api/approval-routes/' + numId, { method: 'DELETE' }, { button: btn, successMsg: '承認ルートを削除しました' });
          await refreshApprovalRoutes();
          renderApp();
        } catch { /* トーストで通知済み */ }
      } else {
        const parts = val.split(':');
        const docType = parts[0];
        const stepNumber = parseInt(parts[1], 10);
        viewState.approvalRoutes = removeRouteStep(viewState.approvalRoutes, docType, stepNumber);
        renderApp();
      }
    });
  });

  // P0-12 / S-15: 承認条件設定フォーム保存
  var approvalConditionForm = document.getElementById("settings-approval-condition-form");
  if (approvalConditionForm) {
    approvalConditionForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const profitRate = parseInt(document.getElementById("s-condition-profit-rate").value, 10);
      const amount = parseInt(document.getElementById("s-condition-amount").value, 10);
      const staleDays = parseInt(document.getElementById("s-condition-stale-days").value, 10);
      const errors = validateApprovalConditionSettings(profitRate, amount, staleDays);
      if (Object.keys(errors).length > 0) {
        viewState.approvalConditionErrors = errors;
        renderApp();
        return;
      }
      const updated = buildApprovalConditionSettings(profitRate, amount, staleDays);
      const conditionSubmitBtn = e.submitter || e.target.querySelector('[type="submit"]');
      try {
        await withFeedback('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }, { button: conditionSubmitBtn, successMsg: '承認条件を保存しました' });
        viewState.settings.presidentApprovalProfitRateThreshold = updated.presidentApprovalProfitRateThreshold;
        viewState.settings.presidentApprovalAmountThreshold = updated.presidentApprovalAmountThreshold;
        viewState.settings.approvalStaleDays = updated.approvalStaleDays;
        viewState.approvalConditionErrors = {};
      } catch (err) {
        viewState.approvalConditionErrors = { _global: err.message };
      }
      renderApp();
    });
  }

  // S-06: 発注書出力ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-print-pod]"), function(btn) {
    btn.addEventListener("click", function() {
      const podCode = btn.getAttribute("data-action-print-pod");
      const pod = findPurchaseOrderByCode(purchaseOrders, podCode);
      if (!pod) return;
      const supplier = findSupplierById(pod.supplierId);
      const html = buildPurchaseOrderPrintHtml(pod, supplier);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      }
    });
  });

  // S-06: 契約処理ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-contract-process]"), function(btn) {
    btn.addEventListener("click", function() {
      const podCode = btn.getAttribute("data-action-contract-process");
      const pod = findPurchaseOrderByCode(purchaseOrders, podCode);
      if (!pod) return;
      const supplier = findSupplierById(pod.supplierId);
      const html = buildPurchaseOrderPrintHtml(pod, supplier);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      }
    });
  });

  // S-06: 発注詳細 一覧に戻る
  const podDetailBackBtn = document.getElementById("pod-detail-back");
  if (podDetailBackBtn) {
    podDetailBackBtn.addEventListener("click", function() {
      viewState.purchaseOrderView = "list";
      viewState.purchaseOrderDetailCode = null;
      if (viewState.approvalFrom === 'approval') {
        viewState.approvalFrom = null;
        window.location.hash = 'approval';
      } else {
        renderApp();
      }
    });
  }

  // S-06: 発注ステータス変更
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-pod-status]"), function(btn) {
    btn.addEventListener("click", async function() {
      const newStatus = btn.getAttribute("data-action-pod-status");
      const podCode = btn.getAttribute("data-pod-code");
      var pod = purchaseOrders.find(function(p) { return p.code === podCode; });
      if (pod) { pod.status = newStatus; }
      renderApp();
      try {
        await withFeedback('/api/purchase-orders/' + podCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }, { button: btn, successMsg: 'ステータスを更新しました' });
        await refreshPurchaseOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-07: 納品一覧から発注詳細へのナビゲーション
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-goto-purchase-order]"), function(btn) {
    btn.addEventListener("click", function() {
      const podCode = btn.getAttribute("data-action-goto-purchase-order");
      viewState.purchaseOrderDetailCode = podCode;
      viewState.purchaseOrderView = "detail";
      window.location.hash = "#/purchase-order";
    });
  });

  // S-07: 納品登録ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-delivery-register]"), function(btn) {
    btn.addEventListener("click", function() {
      const podCode = btn.getAttribute("data-action-delivery-register");
      viewState.deliveryForm.data = {
        code: generateDeliveryCode(deliveries.map(function(d) { return d.code; })),
        purchaseOrderCode: podCode,
        deliveryDate: "",
        notes: ""
      };
      viewState.deliveryForm.errors = {};
      viewState.deliveryView = "register";
      renderApp();
    });
  });

  // S-07: 納品登録フォーム送信
  const deliveryRegisterForm = document.getElementById("delivery-register-form");
  if (deliveryRegisterForm) {
    deliveryRegisterForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const data = viewState.deliveryForm.data;
      const deliveryDate = document.getElementById("f-dlv-date") ? document.getElementById("f-dlv-date").value : data.deliveryDate;
      const notes = document.getElementById("f-dlv-notes") ? document.getElementById("f-dlv-notes").value : data.notes;

      // Read quantities from form before DOM is cleared
      const pod = findPurchaseOrderByCode(purchaseOrders, data.purchaseOrderCode);
      const formDetails = [];
      if (pod && pod.details) {
        pod.details.forEach(function(line) {
          var qtyInput = document.getElementById('f-dlv-qty-' + line.lineNo);
          var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 0) : line.quantity;
          formDetails.push({ lineNo: line.lineNo, deliveredQuantity: qty });
        });
      }

      const errors = {};
      if (!deliveryDate) errors.deliveryDate = "納品日は必須です";
      if (Object.keys(errors).length > 0) {
        viewState.deliveryForm.errors = errors;
        renderApp();
        return;
      }
      const deliverySubmitBtn = document.querySelector('#delivery-register-form [type="submit"]');
      try {
        await withFeedback('/api/deliveries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purchaseOrderCode: data.purchaseOrderCode, deliveryDate: deliveryDate, notes: notes, details: formDetails })
        }, { button: deliverySubmitBtn, successMsg: '納品を登録しました' });

        await refreshDeliveries();

        if (pod) {
          // Compute POD status from ALL deliveries (any status, sum across all)
          var podDeliveries = deliveries.filter(function(d) { return d.purchaseOrderCode === data.purchaseOrderCode; });
          var podLines = pod.details || [];
          var allFull = podLines.length === 0 || podLines.every(function(line) {
            var totalDelivered = podDeliveries.reduce(function(sum, dlv) {
              var detail = (dlv.details || []).find(function(d) { return d.lineNo === line.lineNo; });
              return sum + (detail ? detail.deliveredQuantity || 0 : 0);
            }, 0);
            return totalDelivered >= line.quantity;
          });
          var newStatus = allFull ? '納品済' : '一部納品';
          pod.status = newStatus;
          await withFeedback('/api/purchase-orders/' + data.purchaseOrderCode, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
          await refreshPurchaseOrders();
        }
        viewState.deliveryView = "list";
        viewState.deliveryForm.errors = {};
        viewState.purchaseOrderView = "detail";
        renderApp();
      } catch (err) {
        viewState.deliveryForm.errors = { _global: err.message };
        renderApp();
      }
    });
  }

  // S-07: 納品登録フォーム キャンセル
  const deliveryFormCancelBtn = document.getElementById("delivery-form-cancel");
  if (deliveryFormCancelBtn) {
    deliveryFormCancelBtn.addEventListener("click", function() {
      viewState.deliveryView = "list";
      viewState.deliveryForm.errors = {};
      viewState.purchaseOrderView = "detail";
      renderApp();
    });
  }

  // S-07: 検収済にするボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-accept-delivery]"), function(btn) {
    btn.addEventListener("click", async function() {
      const dlvCode = btn.getAttribute("data-action-accept-delivery");
      try {
        await withFeedback('/api/deliveries/' + encodeURIComponent(dlvCode), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '検収済' })
        }, { button: btn, successMsg: '検収済にしました' });
        await refreshDeliveries();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-07: 検収NGボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-reject-delivery]"), function(btn) {
    btn.addEventListener("click", async function() {
      const dlvCode = btn.getAttribute("data-action-reject-delivery");
      try {
        await withFeedback('/api/deliveries/' + encodeURIComponent(dlvCode), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '検収NG' })
        }, { button: btn, successMsg: '納品を差し戻しました' });
        await refreshDeliveries();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-08: 請求詳細ボタン（一覧から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-detail-invoice]"), function(btn) {
    btn.addEventListener("click", function() {
      viewState.invoiceDetailCode = btn.getAttribute("data-action-detail-invoice");
      viewState.invoiceView = "detail";
      renderApp();
    });
  });

  // S-08: 請求詳細 一覧に戻る
  const invoiceDetailBackBtn = document.getElementById("invoice-detail-back");
  if (invoiceDetailBackBtn) {
    invoiceDetailBackBtn.addEventListener("click", function() {
      viewState.invoiceView = "list";
      viewState.invoiceDetailCode = null;
      if (viewState.approvalFrom === 'approval') {
        viewState.approvalFrom = null;
        viewState.approvalAction = { mode: null, comment: '', commentError: null };
        window.location.hash = 'approval';
      } else {
        renderApp();
      }
    });
  }

  // S-08 P0-09: 請求承認依頼ボタン
  const invoiceSubmitApprovalBtn = document.getElementById("invoice-submit-approval-btn");
  if (invoiceSubmitApprovalBtn) {
    invoiceSubmitApprovalBtn.addEventListener("click", async function() {
      try {
        await withFeedback('/api/invoices/' + viewState.invoiceDetailCode + '/submit-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }, { button: invoiceSubmitApprovalBtn, successMsg: '承認依頼を送信しました' });
        await refreshInvoices();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  // S-08 P0-09: 請求承認・却下ボタン
  var invoiceApproveBtn = document.getElementById("invoice-approve-btn");
  if (invoiceApproveBtn) {
    invoiceApproveBtn.addEventListener("click", function() { openApprovalActionPanel('approve'); });
  }

  var invoiceRejectBtn = document.getElementById("invoice-reject-btn");
  if (invoiceRejectBtn) {
    invoiceRejectBtn.addEventListener("click", function() { openApprovalActionPanel('reject'); });
  }

  // P0-09: 請求 下書きに戻すボタン
  var invoiceReturnDraftBtn = document.getElementById("invoice-return-draft-btn");
  if (invoiceReturnDraftBtn) {
    invoiceReturnDraftBtn.addEventListener("click", async function() {
      try {
        await withFeedback('/api/invoices/' + viewState.invoiceDetailCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '下書き' })
        }, { button: invoiceReturnDraftBtn, successMsg: '下書きに戻しました' });
        await refreshInvoices();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  }

  // S-08: 請求ステータス変更ボタン（詳細画面から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-invoice-status]"), function(btn) {
    btn.addEventListener("click", async function() {
      const newStatus = btn.getAttribute("data-action-invoice-status");
      try {
        await withFeedback('/api/invoices/' + viewState.invoiceDetailCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }, { button: btn, successMsg: 'ステータスを更新しました' });
        await refreshInvoices();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-08: 請求対象抽出ボタン
  const invoiceExtractBtn = document.getElementById("invoice-extract-btn");
  if (invoiceExtractBtn) {
    invoiceExtractBtn.addEventListener("click", function() {
      viewState.invoiceView = "billable";
      renderApp();
    });
  }

  // S-08: 請求対象一覧 一覧に戻る
  const invoiceBackToListBtn = document.getElementById("invoice-back-to-list");
  if (invoiceBackToListBtn) {
    invoiceBackToListBtn.addEventListener("click", function() {
      viewState.invoiceView = "list";
      renderApp();
    });
  }

  // S-08: 請求起票ボタン（請求対象一覧から：インライン日付で直接作成）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-create-invoice]"), function(btn) {
    btn.addEventListener("click", async function() {
      const orderCode = btn.getAttribute("data-action-create-invoice");
      const dateInput = document.querySelector('[data-inv-date-for="' + orderCode + '"]');
      const dueDateInput = document.querySelector('[data-inv-due-date-for="' + orderCode + '"]');
      const invoiceDate = dateInput ? dateInput.value : "";
      const dueDate = dueDateInput ? dueDateInput.value : "";
      if (!invoiceDate || !dueDate) return;
      try {
        await withFeedback('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderCode: orderCode, invoiceDate: invoiceDate, dueDate: dueDate })
        }, { button: btn, successMsg: '請求書を起票しました' });
        await refreshInvoices();
        viewState.invoiceView = "billable";
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-05: 請求対象化ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-billing-target]"), function (btn) {
    btn.addEventListener("click", async function () {
      const orderCode = btn.getAttribute("data-action-billing-target");
      try {
        await withFeedback('/api/orders/' + orderCode, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billingTarget: true })
        }, { button: btn, successMsg: '請求対象に設定しました' });
        await refreshOrders();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-05/S-06: 発注起票ボタン（受注詳細から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-create-purchase-order]"), function (btn) {
    btn.addEventListener("click", function () {
      const orderCode = btn.getAttribute("data-action-create-purchase-order");
      const order = findOrderByCode(orders, orderCode);
      if (!order) return;
      const newCode = generatePurchaseOrderCode(purchaseOrders.map(function(p) { return p.code; }));
      viewState.purchaseOrderForm.data = {
        code: newCode,
        orderCode: order.code,
        supplierId: "",
        title: order.title,
        orderDate: "",
        deliveryDate: order.deliveryDate || "",
        total: order.total || 0,
        notes: order.notes || ""
      };
      viewState.purchaseOrderForm.details = (order.details || []).map(function(d) { return Object.assign({}, d); });
      viewState.purchaseOrderForm.selectedLineNos = (order.details || []).map(function(d) { return d.lineNo; });
      viewState.purchaseOrderForm.attachments = [];
      viewState.purchaseOrderForm.errors = {};
      viewState.purchaseOrderForm.isStandalone = false;
      viewState.purchaseOrderForm.mode = "register";
      viewState.purchaseOrderSourceCode = orderCode;
      window.location.hash = "#/purchase-order";
    });
  });

  // S-05: 受注作成ボタン（見積詳細から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-create-order]"), function (btn) {
    btn.addEventListener("click", function () {
      const quotationCode = btn.getAttribute("data-action-create-order");
      const quotation = findQuotationByCode(quotations, quotationCode);
      if (!quotation) return;
      const newCode = generateOrderCode(orders.map(function (o) { return o.code; }));
      viewState.orderForm.data = {
        code: newCode,
        quotationCode: quotation.code,
        projectCode: quotation.projectCode,
        customerId: quotation.customerId,
        title: quotation.title,
        orderDate: "",
        deliveryDate: "",
        total: quotation.total || 0,
        notes: quotation.notes || ""
      };
      viewState.orderForm.details = (quotation.details || []).map(function (d) { return Object.assign({}, d); });
      viewState.orderForm.attachments = [];
      viewState.orderForm.errors = {};
      viewState.orderForm.mode = "register";
      window.location.hash = "#/sales-order";
    });
  });

  // S-05: 受注登録フォーム キャンセル
  const orderFormCancelBtn = document.getElementById("order-form-cancel");
  if (orderFormCancelBtn) {
    orderFormCancelBtn.addEventListener("click", function () {
      viewState.orderForm.mode = "list";
      viewState.orderForm.errors = {};
      // 見積詳細に戻る
      if (viewState.quotationDetailCode) {
        viewState.quotationView = "detail";
        window.location.hash = "#/quotation";
      } else {
        renderApp();
      }
    });
  }

  // S-05: 添付ファイル選択
  const orderAttachmentInput = document.getElementById("f-order-attachment");
  if (orderAttachmentInput) {
    orderAttachmentInput.addEventListener("change", function () {
      Array.prototype.forEach.call(this.files, function (file) {
        const attachment = {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString().slice(0, 10)
        };
        viewState.orderForm.attachments = addAttachment({ attachments: viewState.orderForm.attachments }, attachment).attachments;
      });
      orderAttachmentInput.value = "";
      renderApp();
    });
  }

  // S-05: 添付ファイル削除
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-remove-attachment]"), function (btn) {
    btn.addEventListener("click", function () {
      const idx = parseInt(btn.getAttribute("data-action-remove-attachment"), 10);
      viewState.orderForm.attachments = removeAttachment({ attachments: viewState.orderForm.attachments }, idx).attachments;
      renderApp();
    });
  });

  // S-05: 受注登録フォーム 送信
  const orderFormEl = document.getElementById("order-register-form");
  if (orderFormEl) {
    orderFormEl.addEventListener("submit", async function (e) {
      e.preventDefault();
      const data = viewState.orderForm.data;
      const orderDate = document.getElementById("f-order-date") ? document.getElementById("f-order-date").value : data.orderDate;
      const deliveryDate = document.getElementById("f-order-delivery-date") ? document.getElementById("f-order-delivery-date").value : data.deliveryDate;
      const title = document.getElementById("f-order-title") ? document.getElementById("f-order-title").value : data.title;
      const notes = document.getElementById("f-order-notes") ? document.getElementById("f-order-notes").value : data.notes;

      const errors = {};
      if (!title || !title.trim()) errors.title = "受注件名は必須です。";
      if (!orderDate || !orderDate.trim()) errors.orderDate = "受注日は必須です。";
      if (Object.keys(errors).length > 0) {
        viewState.orderForm.errors = errors;
        renderApp();
        return;
      }

      const orderSubmitBtn = e.submitter || e.target.querySelector('[type="submit"]');
      try {
        await withFeedback('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quotationCode: data.quotationCode,
            title: title,
            orderDate: orderDate,
            deliveryDate: deliveryDate,
            notes: notes
          })
        }, { button: orderSubmitBtn, successMsg: '受注を登録しました' });
        await refreshOrders();
        viewState.tables.orderList.page = Math.ceil(orders.length / (viewState.tables.orderList.pageSize || PAGE_SIZE));
        viewState.orderForm.mode = "list";
        viewState.orderForm.errors = {};
        renderApp();
      } catch (err) {
        viewState.orderForm.errors = { _api: err.message };
        renderApp();
      }
    });
  }

  // S-04: 見積 詳細から一覧へ戻るボタン
  const quotationDetailBackBtn = document.getElementById("quotation-detail-back");
  if (quotationDetailBackBtn) {
    quotationDetailBackBtn.addEventListener("click", function () {
      viewState.quotationView = "list";
      viewState.quotationDetailCode = null;
      if (viewState.approvalFrom === 'approval') {
        viewState.approvalFrom = null;
        window.location.hash = 'approval';
      } else {
        renderApp();
      }
    });
  }

  // S-04: 見積 新規登録ボタン
  const newQuotationBtn = document.getElementById("new-quotation-btn");
  if (newQuotationBtn) {
    newQuotationBtn.addEventListener("click", function () {
      const codes = quotations.map(function (q) { return q.code; });
      viewState.quotationForm.data = {
        code: generateQuotationCode(codes),
        projectCode: "",
        customerId: "",
        title: "",
        issueDate: "",
        validityDate: "",
        version: 1,
        status: "下書き",
        notes: ""
      };
      viewState.quotationForm.details = [];
      viewState.quotationForm.errors = {};
      viewState.quotationForm.mode = "register";
      renderApp();
    });
  }

  // S-04: 見積 編集ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-edit-quotation]"), function (btn) {
    btn.addEventListener("click", function () {
      const code = btn.getAttribute("data-action-edit-quotation");
      const quotation = findQuotationByCode(quotations, code);
      if (!quotation) return;
      viewState.quotationForm.data = {
        code: quotation.code,
        projectCode: quotation.projectCode,
        customerId: quotation.customerId,
        title: quotation.title,
        issueDate: quotation.issueDate,
        validityDate: quotation.validityDate,
        version: quotation.version,
        status: quotation.status,
        notes: quotation.notes,
        rejectReason: ""
      };
      viewState.quotationForm.details = (quotation.details || []).map(function (d) { return Object.assign({}, d); });
      viewState.quotationForm.editCode = code;
      viewState.quotationForm.errors = {};
      viewState.quotationForm.mode = "edit";
      renderApp();
    });
  });

  // S-04: 見積 明細行 追加ボタン
  const addDetailLineBtn = document.getElementById("add-detail-line");
  if (addDetailLineBtn) {
    addDetailLineBtn.addEventListener("click", function () {
      viewState.quotationForm.details = addDetailLine(viewState.quotationForm.details);
      renderApp();
    });
  }

  // S-04: 見積 明細行 削除ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-remove-line]"), function (btn) {
    btn.addEventListener("click", function () {
      const lineNo = parseInt(btn.getAttribute("data-remove-line"), 10);
      viewState.quotationForm.details = removeDetailLine(viewState.quotationForm.details, lineNo);
      renderApp();
    });
  });

  // S-04: 見積 明細行 フィールド更新
  Array.prototype.forEach.call(document.querySelectorAll(".detail-line [data-detail-field]"), function (el) {
    el.addEventListener("change", function () {
      const lineNo = parseInt(el.closest(".detail-line").getAttribute("data-line-no"), 10);
      const field = el.getAttribute("data-detail-field");
      const numFields = ["quantity", "unitPrice", "discount", "taxRate"];
      const value = numFields.indexOf(field) >= 0 ? parseFloat(el.value) || 0 : el.value;
      viewState.quotationForm.details = updateDetailLine(viewState.quotationForm.details, lineNo, field, value);
      // 商品選択時は商品名も自動セット
      if (field === "productCode" && value) {
        const product = findProductByCode(products, value);
        if (product) {
          viewState.quotationForm.details = updateDetailLine(viewState.quotationForm.details, lineNo, "productName", product.name);
          viewState.quotationForm.details = updateDetailLine(viewState.quotationForm.details, lineNo, "unit", product.unit);
          viewState.quotationForm.details = updateDetailLine(viewState.quotationForm.details, lineNo, "unitPrice", parseFloat(product.unitPrice) || 0);
        }
      }
      renderApp();
    });
  });

  // S-04: 見積 案件検索コンポーネント
  Array.prototype.forEach.call(document.querySelectorAll("[data-project-search]"), function (wrapper) {
    const input = wrapper.querySelector("[data-project-search-input]");
    const hidden = wrapper.querySelector("[data-form-field]");
    const dropdown = wrapper.querySelector("[data-project-search-dropdown]");
    const fieldKey = wrapper.getAttribute("data-search-field");
    const statusFilterAttr = wrapper.getAttribute("data-project-status-filter");
    const statusFilter = statusFilterAttr ? statusFilterAttr.split(',') : null;

    function getCandidates() {
      return filterProjectsByStatus(projects, statusFilter);
    }

    function showDropdown(filtered) {
      dropdown.innerHTML = filtered.slice(0, 10).map(function (p) {
        const c = findCustomerByCode(customers, p.customerId);
        return (
          '<div class="project-search-item" data-code="' + escapeHtml(p.code) + '">' +
            '<span class="project-search-name">' + escapeHtml(p.name) + '</span>' +
            '<span class="project-search-customer">' + escapeHtml(c ? c.name : p.customerId) + '</span>' +
          '</div>'
        );
      }).join('');
      dropdown.classList.add('is-open');
    }

    function hideDropdown() {
      dropdown.classList.remove('is-open');
    }

    input.addEventListener('input', function () {
      const keyword = input.value;
      if (!keyword.trim()) {
        hidden.value = '';
        viewState.quotationForm.data[fieldKey] = '';
        viewState.quotationForm.data.customerId = '';
        const display = document.getElementById("quotation-customer-display");
        if (display) display.textContent = "—";
        hideDropdown();
        return;
      }
      const lowerKw = keyword.toLowerCase();
      const filtered = getCandidates().filter(function (p) {
        const c = findCustomerByCode(customers, p.customerId);
        return filterProjectsByName([p], keyword).length > 0 ||
               (c && c.name.toLowerCase().indexOf(lowerKw) >= 0);
      });
      if (filtered.length) {
        showDropdown(filtered);
      } else {
        hideDropdown();
      }
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) {
        const lowerKw = input.value.toLowerCase();
        const filtered = getCandidates().filter(function (p) {
          const c = findCustomerByCode(customers, p.customerId);
          return filterProjectsByName([p], input.value).length > 0 ||
                 (c && c.name.toLowerCase().indexOf(lowerKw) >= 0);
        });
        if (filtered.length) showDropdown(filtered);
      }
    });

    input.addEventListener('blur', function () {
      setTimeout(hideDropdown, 150);
    });

    dropdown.addEventListener('click', function (e) {
      const item = e.target.closest('.project-search-item');
      if (!item) return;
      const code = item.getAttribute('data-code');
      const project = projects.find(function (p) { return p.code === code; });
      const customer = project ? findCustomerByCode(customers, project.customerId) : null;
      input.value = project ? project.name + (customer ? '（' + customer.name + '）' : '') : code;
      hidden.value = code;
      viewState.quotationForm.data[fieldKey] = code;
      viewState.quotationForm.data.customerId = project ? project.customerId : '';
      const display = document.getElementById("quotation-customer-display");
      if (display) display.textContent = customer ? customer.name : "—";
      hideDropdown();
    });
  });

  // S-04: 見積 キャンセルボタン
  const quotationCancelBtn = document.getElementById("quotation-form-cancel");
  if (quotationCancelBtn) {
    quotationCancelBtn.addEventListener("click", function () {
      viewState.quotationForm.mode = "list";
      viewState.quotationForm.errors = {};
      renderApp();
    });
  }

  // S-04: 見積 フォーム送信（API統合版）
  const quotationFormEl = document.getElementById("quotation-register-form");
  if (quotationFormEl) {
    quotationFormEl.addEventListener("submit", async function (e) {
      e.preventDefault();
      const action = (e.submitter && e.submitter.getAttribute("data-quo-action")) || "draft";
      const isEdit = viewState.quotationForm.mode === "edit";
      const editCode = viewState.quotationForm.editCode;
      const data = viewState.quotationForm.data;

      const quotationSubmitBtn = e.submitter || e.target.querySelector('[type="submit"]');

      // 承認・失注はステータスをPATCHで更新
      if (action === "approve" || action === "lost") {
        const statusMap = { approve: "承認済み", lost: "失注" };
        const successMsgMap = { approve: '見積を承認済みにしました', lost: '失注として記録しました' };
        try {
          await withFeedback('/api/quotations/' + editCode, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusMap[action] })
          }, { button: quotationSubmitBtn, successMsg: successMsgMap[action] });
          await refreshQuotations();
        } catch (err) {
          viewState.quotationForm.errors = { _api: err.message };
        }
        viewState.quotationForm.mode = "list";
        viewState.quotationForm.errors = {};
        renderApp();
        return;
      }

      // 却下は却下理由が必須 → POST /api/quotations/:code/reject
      if (action === "reject") {
        const reason = (data.rejectReason || "").trim();
        if (!reason) {
          viewState.quotationForm.errors = { rejectReason: "却下理由は必須です。" };
          renderApp();
          return;
        }
        try {
          await withFeedback('/api/quotations/' + editCode + '/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: reason })
          }, { button: quotationSubmitBtn, successMsg: '却下しました' });
          await refreshQuotations();
        } catch (err) {
          viewState.quotationForm.errors = { _api: err.message };
        }
        viewState.quotationForm.mode = "list";
        viewState.quotationForm.errors = {};
        renderApp();
        return;
      }

      // 下書き保存・承認依頼はバリデーションあり
      const rules = {
        title: [
          { type: "required", fieldName: "見積件名" },
          { type: "maxLength", max: 100, fieldName: "見積件名" }
        ],
        projectCode: [{ type: "required", fieldName: "案件" }],
        issueDate: [{ type: "required", fieldName: "発行日" }]
      };
      const errors = validateForm(data, rules);
      const hasError = Object.keys(errors).some(function (k) { return errors[k] !== null; });
      if (hasError) {
        viewState.quotationForm.errors = errors;
        renderApp();
        return;
      }

      const body = {
        title: data.title,
        projectCode: data.projectCode,
        customerId: data.customerId,
        issueDate: data.issueDate,
        validityDate: data.validityDate,
        notes: data.notes,
        details: viewState.quotationForm.details
      };

      const saveSuccessMsg = action === "request" ? '承認依頼を送信しました' : '見積を保存しました';
      try {
        var targetCode = editCode;
        if (isEdit) {
          await withFeedback('/api/quotations/' + editCode, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }, { button: quotationSubmitBtn });
        } else {
          var created = await withFeedback('/api/quotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }, { button: quotationSubmitBtn });
          targetCode = created.code;
        }
        // 承認依頼時はsubmit-approvalも呼び出す
        if (action === "request") {
          await withFeedback('/api/quotations/' + targetCode + '/submit-approval', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }, { successMsg: saveSuccessMsg });
        } else {
          showToast(saveSuccessMsg, 'success');
        }
        await refreshQuotations();
        viewState.quotationForm.mode = "list";
        viewState.quotationForm.errors = {};
        viewState.quotationForm.editCode = null;
      } catch (err) {
        viewState.quotationForm.errors = { _api: err.message };
      }
      renderApp();
    });
  }

  // S-09: 入金登録フォーム表示
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-register-receipt]"), function(btn) {
    btn.addEventListener("click", function() {
      const invoiceCode = btn.getAttribute("data-action-register-receipt");
      viewState.receiptForm = { invoiceCode: invoiceCode, errors: {} };
      viewState.invoiceView = "receipt-form";
      renderApp();
    });
  });

  // S-09: 入金登録フォームキャンセル
  const receiptFormCancelBtn = document.getElementById("receipt-form-cancel");
  if (receiptFormCancelBtn) {
    receiptFormCancelBtn.addEventListener("click", function() {
      viewState.invoiceView = "detail";
      viewState.receiptForm = { invoiceCode: null, errors: {} };
      renderApp();
    });
  }

  // S-09: 入金登録フォームサブミット
  const receiptRegisterForm = document.getElementById("receipt-register-form");
  if (receiptRegisterForm) {
    receiptRegisterForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const dateVal = document.getElementById("f-rcp-date").value;
      const amountVal = document.getElementById("f-rcp-amount").value;
      const feeVal = document.getElementById("f-rcp-fee").value;
      const notesVal = document.getElementById("f-rcp-notes").value;

      const errors = {};
      if (!dateVal) errors.receiptDate = '入金日は必須です';
      if (!amountVal) errors.amount = '入金額は必須です';

      if (Object.keys(errors).length > 0) {
        viewState.receiptForm.errors = errors;
        renderApp();
        return;
      }

      const invoiceCode = viewState.receiptForm.invoiceCode;
      const receiptSubmitBtn = e.submitter || e.target.querySelector('[type="submit"]');
      try {
        await withFeedback('/api/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceCode: invoiceCode,
            receiptDate: dateVal,
            amount: Number(amountVal),
            fee: Number(feeVal) || 0,
            notes: notesVal
          })
        }, { button: receiptSubmitBtn, successMsg: '入金を登録しました' });
        await refreshReceipts();
        await refreshInvoices();
        viewState.invoiceView = "detail";
        viewState.invoiceDetailCode = invoiceCode;
        viewState.receiptForm = { invoiceCode: null, errors: {} };
        renderApp();
      } catch (err) {
        viewState.receiptForm.errors = { _global: err.message };
        renderApp();
      }
    });
  }

  // S-10: 支払依頼詳細ボタン（一覧から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-detail-payment]"), function(btn) {
    btn.addEventListener("click", function() {
      viewState.paymentDetailCode = btn.getAttribute("data-action-detail-payment");
      viewState.paymentView = "detail";
      renderApp();
    });
  });

  // S-10: 支払依頼詳細 一覧に戻る
  const paymentDetailBackBtn = document.getElementById("payment-detail-back");
  if (paymentDetailBackBtn) {
    paymentDetailBackBtn.addEventListener("click", function() {
      viewState.paymentView = "list";
      viewState.paymentDetailCode = null;
      if (viewState.approvalFrom === 'approval') {
        viewState.approvalFrom = null;
        window.location.hash = 'approval';
      } else {
        renderApp();
      }
    });
  }

  // S-10: 支払ステータス変更ボタン（詳細画面から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-payment-status]"), function(btn) {
    btn.addEventListener("click", async function() {
      const newStatus = btn.getAttribute("data-action-payment-status");
      const pmtCode = viewState.paymentDetailCode;
      try {
        if (newStatus === '承認待ち') {
          await withFeedback('/api/payments/' + pmtCode + '/submit-approval', { method: 'POST' }, { button: btn, successMsg: '承認依頼を送信しました' });
        } else if (newStatus === 'キャンセル') {
          await withFeedback('/api/payments/' + pmtCode + '/cancel', { method: 'POST' }, { button: btn, successMsg: '支払依頼をキャンセルしました' });
        }
        await refreshPayments();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });

  // S-10: 支払登録ボタン（詳細から）
  const paymentRegisterBtn = document.getElementById("payment-register-btn");
  if (paymentRegisterBtn) {
    paymentRegisterBtn.addEventListener("click", function() {
      viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
      viewState.paymentView = "register";
      renderApp();
    });
  }

  // S-10: 支払登録フォームキャンセル
  const paymentExecCancelBtn = document.getElementById("payment-exec-cancel");
  if (paymentExecCancelBtn) {
    paymentExecCancelBtn.addEventListener("click", function() {
      viewState.paymentView = "detail";
      viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
      renderApp();
    });
  }

  // S-10: 支払登録フォームサブミット
  const paymentExecForm = document.getElementById("payment-exec-form");
  if (paymentExecForm) {
    paymentExecForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const dateVal = document.getElementById("f-pmte-date").value;
      const amountVal = document.getElementById("f-pmte-amount").value;

      const errors = {};
      if (!dateVal) errors.paidDate = '支払日は必須です';
      if (!amountVal) errors.paidAmount = '支払金額は必須です';

      if (Object.keys(errors).length > 0) {
        viewState.paymentForm.errors = errors;
        renderApp();
        return;
      }

      const payExecSubmitBtn = e.submitter || e.target.querySelector('[type="submit"]');
      try {
        await withFeedback('/api/payments/' + viewState.paymentDetailCode + '/register', { method: 'POST' }, { button: payExecSubmitBtn, successMsg: '支払を実行しました' });
        await refreshPayments();
        viewState.paymentView = "detail";
        viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
        renderApp();
      } catch (err) {
        viewState.paymentForm.errors = { _global: err.message };
        renderApp();
      }
    });
  }

  // S-10: 支払依頼作成ボタン（一覧から）
  const paymentCreateBtn = document.getElementById("payment-create-btn");
  if (paymentCreateBtn) {
    paymentCreateBtn.addEventListener("click", function() {
      viewState.paymentView = "payable";
      renderApp();
    });
  }

  // S-10: 支払対象一覧 一覧に戻る
  const paymentBackToListBtn = document.getElementById("payment-back-to-list");
  if (paymentBackToListBtn) {
    paymentBackToListBtn.addEventListener("click", function() {
      viewState.paymentView = "list";
      renderApp();
    });
  }

  // S-10: 依頼作成ボタン（支払対象一覧から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-create-payment]"), function(btn) {
    btn.addEventListener("click", function() {
      const poCode = btn.getAttribute("data-action-create-payment");
      viewState.paymentForm = { purchaseOrderCode: poCode, errors: {} };
      viewState.paymentView = "form";
      renderApp();
    });
  });

  // S-10: 支払依頼登録フォームキャンセル
  const paymentFormCancelBtn = document.getElementById("payment-form-cancel");
  if (paymentFormCancelBtn) {
    paymentFormCancelBtn.addEventListener("click", function() {
      viewState.paymentView = "payable";
      viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
      renderApp();
    });
  }

  // S-10: 支払依頼登録フォームサブミット
  const paymentRegisterForm = document.getElementById("payment-register-form");
  if (paymentRegisterForm) {
    paymentRegisterForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const dateVal = document.getElementById("f-pmt-date").value;
      const amountVal = document.getElementById("f-pmt-amount").value;
      const titleVal = document.getElementById("f-pmt-title").value;
      const notesVal = document.getElementById("f-pmt-notes").value;

      const errors = {};
      if (!dateVal) errors.paymentDate = '支払予定日は必須です';
      if (!amountVal) errors.amount = '支払金額は必須です';

      if (Object.keys(errors).length > 0) {
        viewState.paymentForm.errors = errors;
        renderApp();
        return;
      }

      const poCode = viewState.paymentForm.purchaseOrderCode;
      const po = purchaseOrders.find(function(p) { return p.code === poCode; });
      const paymentSubmitBtn = e.submitter || e.target.querySelector('[type="submit"]');
      try {
        await withFeedback('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseOrderCode: poCode,
            supplierId: po ? po.supplierId : '',
            title: titleVal,
            paymentDate: dateVal,
            amount: Number(amountVal),
            notes: notesVal
          })
        }, { button: paymentSubmitBtn, successMsg: '支払依頼を登録しました' });
        await refreshPayments();
        viewState.paymentView = "list";
        viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
        renderApp();
      } catch (err) {
        viewState.paymentForm.errors = { _global: err.message };
        renderApp();
      }
    });
  }

  // S-14: 通知既読ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-mark-read]"), function(btn) {
    btn.addEventListener("click", async function() {
      const id = btn.getAttribute("data-action-mark-read");
      try {
        await withFeedback('/api/notifications/' + encodeURIComponent(id) + '/read', { method: 'PUT' }, { button: btn });
        await refreshNotifications();
        renderApp();
      } catch { /* トーストで通知済み */ }
    });
  });
}

function exportReportCsv(rows, keys, labels, filename) {
  var lines = [labels.map(function(l) { return '"' + l + '"'; }).join(",")];
  rows.forEach(function(row) {
    lines.push(keys.map(function(k) {
      return '"' + String(row[k] || "").replace(/"/g, '""') + '"';
    }).join(","));
  });
  var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function exportCustomerCsv() {
  const config = getCustomerTableConfig(null);
  const rows = getFilteredRows(config);
  const lines = [
    config.columns.map(function (column) { return '"' + column.label + '"'; }).join(",")
  ];

  rows.forEach(function (row) {
    lines.push(
      config.columns.map(function (column) {
        const value = String(row[column.key] || "").replace(/"/g, '""');
        return '"' + value + '"';
      }).join(",")
    );
  });

  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "customer_master.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function exportProductCsv() {
  const config = getProductTableConfig(null);
  const rows = getFilteredRows(config);
  const lines = [
    config.columns.map(function (column) { return '"' + column.label + '"'; }).join(",")
  ];

  rows.forEach(function (row) {
    lines.push(
      config.columns.map(function (column) {
        const value = String(row[column.key] || "").replace(/"/g, '""');
        return '"' + value + '"';
      }).join(",")
    );
  });

  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "product_master.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function exportSupplierCsv() {
  const config = getSupplierTableConfig(null);
  const rows = getFilteredRows(config);
  const lines = [
    config.columns.map(function (column) { return '"' + column.label + '"'; }).join(",")
  ];

  rows.forEach(function (row) {
    lines.push(
      config.columns.map(function (column) {
        const value = String(row[column.key] || "").replace(/"/g, '""');
        return '"' + value + '"';
      }).join(",")
    );
  });

  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "supplier_master.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

async function handleHashChange() {
  var route = getRoute();
  if (route === 'quotation') await refreshQuotations();
  if (route === 'sales-order') await refreshOrders();
  if (route === 'invoice') { await refreshInvoices(); await refreshReceipts(); }
  if (route === 'project') await refreshProjects();
  if (route === 'purchase-order') await refreshPurchaseOrders();
  if (route === 'delivery') await refreshDeliveries();
  if (route === 'receipt') await refreshReceipts();
  if (route === 'payment') await refreshPayments();
  if (route === 'notification') await refreshNotifications();
  if (route === 'master') await refreshCustomers();
  if (route === 'settings') { await refreshSettings(); await refreshApprovalRoutes(); }
  renderApp();
}
window.addEventListener("hashchange", handleHashChange);
initFeedbackUI();
initSession();
