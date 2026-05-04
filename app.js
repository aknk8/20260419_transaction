import { validateForm } from './src/validation.js';
import { generateCustomerCode, generateSupplierCode, createCustomer, createSupplier, findCustomerByCode, findSupplierByCode, filterCustomersByName } from './src/customer.js';
import { generateProductCode, createProduct, findProductByCode } from './src/product.js';
import { createUser, findUserById } from './src/user.js';
import { generateProjectCode, createProject, findProjectByCode, filterProjectsByName, filterProjectsByStatus } from './src/project.js';
import { generateQuotationCode, createQuotation, findQuotationByCode, addDetailLine, removeDetailLine, updateDetailLine, createRevision, rejectQuotation, buildQuotationPrintHtml } from './src/quotation.js';
import { generateOrderCode, createOrderFromQuotation, addAttachment, removeAttachment, findOrderByCode, updateOrderStatus, markAsBillingTarget, applyPayment } from './src/order.js';
import { generatePurchaseOrderCode, createPurchaseOrderFromOrder, createPurchaseOrder, calcTotalsFromDetails, findPurchaseOrderByCode, updatePurchaseOrderStatus, buildPurchaseOrderPrintHtml, submitPurchaseOrderApproval } from './src/purchaseOrder.js';
import { generateDeliveryCode, createDelivery, acceptDelivery, rejectDelivery, isFullyDelivered } from './src/delivery.js';
import { generateInvoiceCode, createInvoice, findBillableOrders, createInvoiceFromOrder, getDefaultDueDate, confirmInvoice, markInvoiceAsSent, cancelInvoice } from './src/invoice.js';
import { generateReceiptCode, createReceipt, calcRemainingBalance, isFullyPaid } from './src/receipt.js';
import { generatePaymentCode, createPaymentRequest, findPayablePurchaseOrders, submitPaymentApproval, approvePayment, rejectPayment, cancelPayment, registerPayment } from './src/payment.js';
import { getPendingApprovals } from './src/approval.js';

const STORAGE_KEY = "transaction-system-session";
const PAGE_SIZE = 5;

const users = [
  {
    id: "admin",
    password: "admin123",
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
      "invoice:view",
      "invoice:edit",
      "receipt:view",
      "payment:view",
      "payment:edit",
      "approval:view",
      "approval:act",
      "report:view",
      "notification:view",
      "user-permission:edit"
    ]
  },
  {
    id: "sales01",
    password: "sales123",
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
      "invoice:view",
      "approval:view",
      "notification:view"
    ]
  },
  {
    id: "finance01",
    password: "finance123",
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
    customerId: "CUS-002",
    title: "クラウド移行支援 請求",
    invoiceDate: "2026-03-31",
    dueDate: "2026-04-30",
    status: "入金済",
    subtotal: 2000000,
    taxAmount: 200000,
    total: 2200000,
    notes: "",
    details: [
      { lineNo: 1, productName: "クラウド移行支援", quantity: 1, unit: "式", unitPrice: 2000000, taxRate: 0.10, amount: 2200000 }
    ]
  },
  {
    code: "INV-00003",
    orderCode: "ORD-00002",
    customerId: "CUS-003",
    title: "セキュリティ診断 請求",
    invoiceDate: "2026-04-30",
    dueDate: "2026-05-31",
    status: "下書き",
    subtotal: 350000,
    taxAmount: 35000,
    total: 385000,
    notes: "",
    details: [
      { lineNo: 1, productName: "セキュリティ診断", quantity: 1, unit: "式", unitPrice: 350000, taxRate: 0.10, amount: 385000 }
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
      page: 1
    },
    customerMaster: {
      search: "",
      department: "all",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    supplierMaster: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    productMaster: {
      search: "",
      tax: "all",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    userMaster: {
      search: "",
      userType: "all",
      status: "all",
      sortKey: "id",
      sortDir: "asc",
      page: 1
    },
    paymentTermMaster: {
      search: "",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    taxRateMaster: {
      search: "",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    quotationList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    orderList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    purchaseOrderList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    invoiceList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    receiptList: {
      search: "",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    paymentList: {
      search: "",
      status: "all",
      sortKey: "code",
      sortDir: "asc",
      page: 1
    },
    approvalList: {
      search: "",
      type: "all",
      sortKey: "submittedAt",
      sortDir: "desc",
      page: 1
    }
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

function saveSession(userId) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: userId }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function getSessionUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return users.find(function (user) {
      return user.id === parsed.userId;
    }) || null;
  } catch (error) {
    return null;
  }
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
  return dashboardMetrics.map(function (metric) {
    return (
      '<article class="metric-card">' +
        '<div class="metric-label">' + metric.label + "</div>" +
        '<div class="metric-value">' + metric.value + "</div>" +
        '<div class="metric-note">' + metric.note + "</div>" +
      "</article>"
    );
  }).join("");
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
  return (
    '<section class="dashboard-grid">' +
      '<div class="metrics-row">' + metricCardsHtml() + "</div>" +
      '<section class="panel wide-panel">' +
        '<div class="panel-header">' +
          "<div>" +
            '<div class="panel-label">案件サマリ</div>' +
            '<div class="panel-title-text">担当案件と関連伝票の起点</div>' +
          "</div>" +
          '<span class="menu-tag">' + user.position + "</span>" +
        "</div>" +
        '<div class="table">' +
          '<div class="table-row table-row-head">' +
            "<div>案件</div><div>主管部門</div><div>状態</div><div>次アクション</div>" +
          "</div>" +
          tableRowsHtml(projectRows) +
        "</div>" +
      "</section>" +
      '<section class="panel narrow-panel">' +
        '<div class="panel-header">' +
          "<div>" +
            '<div class="panel-label">承認</div>' +
            '<div class="panel-title-text">本日の確認事項</div>' +
          "</div>" +
        "</div>" +
        '<div class="list">' +
          approvalItems.map(function (item) {
            return (
              '<article class="list-item">' +
                '<div class="list-item-title">' + item.title + "</div>" +
                '<div class="list-item-copy">' + item.copy + "</div>" +
              "</article>"
            );
          }).join("") +
        "</div>" +
      "</section>" +
      '<section class="panel wide-panel">' +
        '<div class="panel-header">' +
          "<div>" +
            '<div class="panel-label">認可モデル</div>' +
            '<div class="panel-title-text">利用者区分・所属部門・役職・個別権限</div>' +
          "</div>" +
        "</div>" +
        '<div class="permissions-grid">' +
          permissionCardHtml("利用者区分", user.userType + " としてログイン中です。") +
          permissionCardHtml("所属部門", user.department + " に基づく画面導線を表示しています。") +
          permissionCardHtml("役職", user.position + " のため承認表示とダッシュボード内容が調整されます。") +
          permissionCardHtml("ユーザ個別権限", "付与数: " + user.permissions.length + "件。個別権限で画面表示と操作可否を制御します。") +
        "</div>" +
      "</section>" +
      '<section class="panel narrow-panel">' +
        '<div class="panel-header">' +
          "<div>" +
            '<div class="panel-label">着手状況</div>' +
            '<div class="panel-title-text">実装計画との対応</div>' +
          "</div>" +
        "</div>" +
        '<div class="list">' +
          '<article class="list-item"><div class="list-item-title">CB-04 フォーム共通部品</div><div class="list-item-copy">必須・文字数・重複チェック、インラインエラー表示を共通バリデーションエンジンとして実装済み。</div></article>' +
          '<article class="list-item"><div class="list-item-title">S-11 Step 2-3 顧客マスタ登録・編集・無効化</div><div class="list-item-copy">コード自動採番、フォームバリデーション、登録・編集・無効化（状態を停止に変更）を実装済み。admin ユーザで確認可能。</div></article>' +
          '<article class="list-item"><div class="list-item-title">次の候補</div><div class="list-item-copy">S-11 Step 4: 仕入先マスタ。または CB-06 添付・承認・通知・帳票の基礎。</div></article>' +
        "</div>" +
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
        options: ["all", "下書き", "承認依頼中", "承認済み", "却下", "失注"],
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
  if (status === "却下" || status === "失注") return "is-locked";
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
          fieldHtml("f-quo-code", "見積番号", textInputHtml("f-quo-code", "code", "QUO-XXXXX", !isNew), !isNew, "code") +
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
          '<button class="button button-secondary" type="button" data-action-print-quotation="' + escapeHtml(q.code) + '">PDF出力</button>' +
          '<button class="button button-ghost" type="button" id="quotation-detail-back">一覧へ戻る</button>' +
        '</div>' +
      '</div>' +
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
  const statusClass = orderStatusClass(order.status);

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        '<div>' +
          '<div class="panel-label">S-05 受注詳細</div>' +
          '<div class="panel-title-text">' + escapeHtml(order.title) + '</div>' +
        '</div>' +
        '<div class="panel-actions">' +
          (canEdit && order.status === '受注済み' && !order.billingTarget ?
            '<button class="button button-primary button-sm" type="button" data-action-billing-target="' + escapeHtml(order.code) + '">請求対象化</button>'
          : '') +
          (canEdit && order.status === '受注済み' && order.billingTarget ?
            '<span class="status-badge is-open">請求対象</span>'
          : '') +
          (canEdit && order.status === '受注済み' ?
            '<button class="button button-secondary button-sm" type="button" data-action-create-purchase-order="' + escapeHtml(order.code) + '">発注起票</button>'
          : '') +
          (canEdit && order.status === '受注済み' ?
            '<button class="button button-warning button-sm" type="button" data-action-order-status="キャンセル" data-order-code="' + escapeHtml(order.code) + '">キャンセル</button>'
          : '') +
          '<button class="button button-secondary button-sm" type="button" id="order-detail-back">一覧に戻る</button>' +
        '</div>' +
      '</div>' +
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
          (canEdit && pod.status === '承認依頼中' ?
            '<button class="button button-danger button-sm" type="button" data-action-pod-status="却下" data-pod-code="' + escapeHtml(pod.code) + '">却下</button>'
          : '') +
          '<button class="button button-secondary button-sm" type="button" id="pod-detail-back">一覧に戻る</button>' +
        '</div>' +
      '</div>' +
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
      key: "_actions",
      label: "",
      sortable: false,
      render: function(value, row) {
        return '<button class="button button-secondary button-xs" type="button" data-action-detail-invoice="' + escapeHtml(row.code) + '">詳細</button>';
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
  const customer = findCustomerByCode(customers, invoice.customerId);
  const order = findOrderByCode(orders, invoice.orderCode);
  const status = invoice.status;

  const invoiceReceipts = receipts.filter(function(r) { return r.invoiceCode === invoice.code; });
  const remaining = calcRemainingBalance(invoice, receipts);
  const canReceive = canEdit && (status === '送付済' || status === '一部入金');

  const statusButtons = canEdit ? (
    (status === '下書き' ?
      '<button class="button button-primary button-sm" type="button" data-action-invoice-status="確定">確定する</button>' +
      '<button class="button button-secondary button-sm" type="button" data-action-invoice-status="キャンセル">キャンセル</button>'
    : '') +
    (status === '確定' ?
      '<button class="button button-primary button-sm" type="button" data-action-invoice-status="送付済">送付済にする</button>' +
      '<button class="button button-secondary button-sm" type="button" data-action-invoice-status="キャンセル">キャンセル</button>'
    : '') +
    (canReceive ?
      '<button class="button button-primary button-sm" type="button" data-action-register-receipt="' + escapeHtml(invoice.code) + '">入金登録</button>'
    : '')
  ) : '';

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
          '<button class="button button-secondary button-sm" type="button" id="invoice-detail-back">一覧に戻る</button>' +
        '</div>' +
      '</div>' +
      '<div class="panel-content">' +
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
  const pending = getPendingApprovals(quotations, purchaseOrders, payments);
  const enriched = pending.map(function(item) {
    var tradingPartner = '';
    if (item.type === '見積') {
      var q = quotations.find(function(q) { return q.code === item.code; });
      if (q) {
        var c = findCustomerByCode(customers, q.customerId);
        tradingPartner = c ? c.name : q.customerId;
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
        options: ["all", "見積", "発注", "支払依頼"]
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
      { key: "submittedAt", label: "申請日", sortable: true }
    ],
    toolbarExtra: ""
  };
}

function approvalScreenHtml() {
  return dataTableHtml(getApprovalTableConfig());
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

  const statusButtons = (
    (canEdit && status === '下書き' ?
      '<button class="button button-primary button-sm" type="button" data-action-payment-status="承認待ち">承認依頼</button>' +
      '<button class="button button-secondary button-sm" type="button" data-action-payment-status="キャンセル">キャンセル</button>'
    : '') +
    (canApprove && status === '承認待ち' ?
      '<button class="button button-primary button-sm" type="button" data-action-payment-status="承認済">承認</button>' +
      '<button class="button button-danger button-sm" type="button" data-action-payment-status="差戻し">差戻し</button>'
    : '') +
    (canEdit && status === '差戻し' ?
      '<button class="button button-primary button-sm" type="button" data-action-payment-status="承認待ち">再申請</button>' +
      '<button class="button button-secondary button-sm" type="button" data-action-payment-status="キャンセル">キャンセル</button>'
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
          '<button class="button button-secondary button-sm" type="button" id="payment-detail-back">一覧に戻る</button>' +
        '</div>' +
      '</div>' +
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
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  return {
    rows: filtered.slice(start, start + PAGE_SIZE),
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
  const summary =
    "全 " + config.rows.length + " 件中 " +
    (result.totalRows === 0 ? "0" : ((result.page - 1) * PAGE_SIZE + 1)) +
    " - " +
    Math.min(result.page * PAGE_SIZE, result.totalRows) +
    " 件を表示";

  return (
    '<section class="panel">' +
      '<div class="panel-header">' +
        "<div>" +
          '<div class="panel-label">CB-03 / S-11 Step 1</div>' +
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
        '<div class="sample-user-name">' + user.name + "</div>" +
        '<div class="sample-user-meta">' +
          "ID: " + user.id + "<br>" +
          "区分: " + user.userType + "<br>" +
          "所属: " + user.department + " / 役職: " + user.position +
        "</div>" +
        '<div class="sample-user-permissions">' +
          user.permissions.slice(0, 4).map(function (permission) {
            return '<span class="chip">' + permission + "</span>";
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

function handleLogin(event) {
  event.preventDefault();
  const userId = document.getElementById("user-id").value.trim();
  const password = document.getElementById("password").value;
  const user = users.find(function (candidate) {
    return candidate.id === userId && candidate.password === password;
  });

  if (!user) {
    renderLogin("ユーザ ID またはパスワードが正しくありません。", "error");
    return;
  }

  if (user.status === "停止") {
    renderLogin("このユーザは停止されています。システム管理者にお問い合わせください。", "error");
    return;
  }

  saveSession(user.id);
  if (!window.location.hash) {
    window.location.hash = "#/dashboard";
  }
  renderApp();
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
  } else if (currentScreen.id === "invoice") {
    contentHtml = invoiceScreenHtml(user);
  } else if (currentScreen.id === "receipt") {
    contentHtml = receiptScreenHtml(user);
  } else if (currentScreen.id === "payment") {
    contentHtml = paymentScreenHtml(user);
  } else if (currentScreen.id === "approval") {
    contentHtml = approvalScreenHtml();
  } else {
    contentHtml = placeholderScreenHtml(currentScreen, user);
  }

  appRoot.innerHTML =
    '<div class="app-shell">' +
      '<div class="workspace">' +
        '<aside class="sidebar">' +
          '<div class="sidebar-header">' +
            '<div class="brand-mark"></div>' +
            '<div class="brand-title">取引管理システム</div>' +
            '<div class="sidebar-subtitle">共通基盤、認証認可、フォーム部品、顧客マスタ一覧・登録まで実装済み。</div>' +
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
              '<div class="page-copy">' + currentScreen.description + "</div>" +
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
  document.getElementById("logout-button").addEventListener("click", function () {
    clearSession();
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
        const stateKey = tab === "supplier" ? "supplierForm" : tab === "product" ? "productForm" : "customerForm";
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
    regForm.addEventListener("submit", function (e) {
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
      if (isEdit) {
        const idx = customers.findIndex(function (c) { return c.code === viewState.customerForm.editCode; });
        if (idx >= 0) customers[idx] = createCustomer(data);
        viewState.customerForm.editCode = null;
      } else {
        customers.push(createCustomer(data));
        viewState.tables.customerMaster.page = Math.ceil(customers.length / PAGE_SIZE);
      }
      viewState.customerForm.mode = "list";
      viewState.customerForm.errors = {};
      renderApp();
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
        viewState.tables.supplierMaster.page = Math.ceil(suppliers.length / PAGE_SIZE);
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
        viewState.tables.productMaster.page = Math.ceil(products.length / PAGE_SIZE);
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
        password: u.password,
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
        viewState.tables.userMaster.page = Math.ceil(users.length / PAGE_SIZE);
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
    projectFormEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const isEdit = viewState.projectForm.mode === "edit";
      const data = viewState.projectForm.data;
      const existingCodes = projects.map(function (p) { return p.code; });
      const rules = Object.assign(
        isEdit ? {} : {
          code: [
            { type: "required", fieldName: "案件コード" },
            { type: "maxLength", max: 20, fieldName: "案件コード" },
            { type: "unique", existingValues: existingCodes, fieldName: "案件コード" }
          ]
        },
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
      if (isEdit) {
        const idx = projects.findIndex(function (p) { return p.code === viewState.projectForm.editCode; });
        if (idx >= 0) projects[idx] = createProject(data);
        viewState.projectForm.editCode = null;
      } else {
        projects.push(createProject(data));
        viewState.tables.projectList.page = Math.ceil(projects.length / PAGE_SIZE);
      }
      viewState.projectForm.mode = "list";
      viewState.projectForm.errors = {};
      renderApp();
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
      const html = buildQuotationPrintHtml(q, project, customer);
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
      renderApp();
    });
  }

  // S-05: 受注ステータス変更ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-order-status]"), function (btn) {
    btn.addEventListener("click", function () {
      const newStatus = btn.getAttribute("data-action-order-status");
      const orderCode = btn.getAttribute("data-order-code");
      const idx = orders.findIndex(function (o) { return o.code === orderCode; });
      if (idx < 0) return;
      orders[idx] = updateOrderStatus(orders[idx], newStatus);
      renderApp();
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
    podFormEl.addEventListener("submit", function (e) {
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
      purchaseOrders.push(saved);
      viewState.tables.purchaseOrderList.page = Math.ceil(purchaseOrders.length / PAGE_SIZE);
      viewState.purchaseOrderForm.mode = "list";
      viewState.purchaseOrderForm.errors = {};
      viewState.purchaseOrderSourceCode = null;
      renderApp();
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
    podSubmitApprovalBtn.addEventListener("click", function() {
      const podCode = viewState.purchaseOrderDetailCode;
      const idx = purchaseOrders.findIndex(function(p) { return p.code === podCode; });
      if (idx < 0) return;
      purchaseOrders[idx] = submitPurchaseOrderApproval(purchaseOrders[idx]);
      renderApp();
    });
  }

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
      renderApp();
    });
  }

  // S-06: 発注ステータス変更
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-pod-status]"), function(btn) {
    btn.addEventListener("click", function() {
      const newStatus = btn.getAttribute("data-action-pod-status");
      const podCode = btn.getAttribute("data-pod-code");
      const idx = purchaseOrders.findIndex(function(p) { return p.code === podCode; });
      if (idx < 0) return;
      purchaseOrders[idx] = updatePurchaseOrderStatus(purchaseOrders[idx], newStatus);
      renderApp();
    });
  });

  // S-07: 納品登録ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-delivery-register]"), function(btn) {
    btn.addEventListener("click", function() {
      const podCode = btn.getAttribute("data-action-delivery-register");
      const newCode = generateDeliveryCode(deliveries.map(function(d) { return d.code; }));
      viewState.deliveryForm.data = {
        code: newCode,
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
    deliveryRegisterForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const data = viewState.deliveryForm.data;
      const deliveryDate = document.getElementById("f-dlv-date") ? document.getElementById("f-dlv-date").value : data.deliveryDate;
      const notes = document.getElementById("f-dlv-notes") ? document.getElementById("f-dlv-notes").value : data.notes;
      const errors = {};
      if (!deliveryDate) errors.deliveryDate = "納品日は必須です";
      if (Object.keys(errors).length > 0) {
        viewState.deliveryForm.errors = errors;
        renderApp();
        return;
      }
      const pod = findPurchaseOrderByCode(purchaseOrders, data.purchaseOrderCode);
      const dlvDetails = (pod ? pod.details || [] : []).map(function(d) {
        const qtyInput = document.getElementById("f-dlv-qty-" + d.lineNo);
        const deliveredQuantity = qtyInput ? parseInt(qtyInput.value, 10) || 0 : d.quantity;
        return { lineNo: d.lineNo, deliveredQuantity: deliveredQuantity };
      });
      const newDelivery = Object.assign(createDelivery(data.code, data.purchaseOrderCode, deliveryDate, notes), { details: dlvDetails });
      deliveries.push(newDelivery);
      const podIdx = purchaseOrders.findIndex(function(p) { return p.code === data.purchaseOrderCode; });
      if (podIdx >= 0) {
        const newStatus = isFullyDelivered(purchaseOrders[podIdx], deliveries) ? '納品済' : '一部納品';
        purchaseOrders[podIdx] = updatePurchaseOrderStatus(purchaseOrders[podIdx], newStatus);
      }
      viewState.deliveryView = "list";
      viewState.deliveryForm.errors = {};
      viewState.purchaseOrderView = "detail";
      renderApp();
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
    btn.addEventListener("click", function() {
      const dlvCode = btn.getAttribute("data-action-accept-delivery");
      const idx = deliveries.findIndex(function(d) { return d.code === dlvCode; });
      if (idx < 0) return;
      deliveries[idx] = acceptDelivery(deliveries[idx]);
      renderApp();
    });
  });

  // S-07: 検収NGボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-reject-delivery]"), function(btn) {
    btn.addEventListener("click", function() {
      const dlvCode = btn.getAttribute("data-action-reject-delivery");
      const idx = deliveries.findIndex(function(d) { return d.code === dlvCode; });
      if (idx < 0) return;
      deliveries[idx] = rejectDelivery(deliveries[idx]);
      renderApp();
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
      renderApp();
    });
  }

  // S-08: 請求ステータス変更ボタン（詳細画面から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-invoice-status]"), function(btn) {
    btn.addEventListener("click", function() {
      const newStatus = btn.getAttribute("data-action-invoice-status");
      const idx = invoices.findIndex(function(inv) { return inv.code === viewState.invoiceDetailCode; });
      if (idx < 0) return;
      if (newStatus === '確定') invoices[idx] = confirmInvoice(invoices[idx]);
      else if (newStatus === '送付済') invoices[idx] = markInvoiceAsSent(invoices[idx]);
      else if (newStatus === 'キャンセル') invoices[idx] = cancelInvoice(invoices[idx]);
      renderApp();
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
    btn.addEventListener("click", function() {
      const orderCode = btn.getAttribute("data-action-create-invoice");
      const order = findOrderByCode(orders, orderCode);
      if (!order) return;
      const dateInput = document.querySelector('[data-inv-date-for="' + orderCode + '"]');
      const dueDateInput = document.querySelector('[data-inv-due-date-for="' + orderCode + '"]');
      const invoiceDate = dateInput ? dateInput.value : "";
      const dueDate = dueDateInput ? dueDateInput.value : "";
      if (!invoiceDate || !dueDate) return;
      const newCode = generateInvoiceCode(invoices.map(function(inv) { return inv.code; }));
      const newInvoice = createInvoiceFromOrder(order, newCode, invoiceDate, dueDate);
      invoices.push(newInvoice);
      viewState.invoiceView = "billable";
      renderApp();
    });
  });

  // S-05: 請求対象化ボタン
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-billing-target]"), function (btn) {
    btn.addEventListener("click", function () {
      const orderCode = btn.getAttribute("data-action-billing-target");
      const idx = orders.findIndex(function (o) { return o.code === orderCode; });
      if (idx < 0) return;
      orders[idx] = markAsBillingTarget(orders[idx]);
      renderApp();
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
    orderFormEl.addEventListener("submit", function (e) {
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

      const quotation = findQuotationByCode(quotations, data.quotationCode);
      const saved = createOrderFromQuotation(quotation || data, data.code, orderDate);
      saved.title = title;
      saved.deliveryDate = deliveryDate;
      saved.notes = notes;
      saved.attachments = viewState.orderForm.attachments.slice();
      orders.push(saved);
      viewState.tables.orderList.page = Math.ceil(orders.length / PAGE_SIZE);
      viewState.orderForm.mode = "list";
      viewState.orderForm.errors = {};
      renderApp();
    });
  }

  // S-04: 見積 詳細から一覧へ戻るボタン
  const quotationDetailBackBtn = document.getElementById("quotation-detail-back");
  if (quotationDetailBackBtn) {
    quotationDetailBackBtn.addEventListener("click", function () {
      viewState.quotationView = "list";
      viewState.quotationDetailCode = null;
      renderApp();
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

  // S-04: 見積 フォーム送信（ワークフローアクション）
  const quotationFormEl = document.getElementById("quotation-register-form");
  if (quotationFormEl) {
    quotationFormEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const action = (e.submitter && e.submitter.getAttribute("data-quo-action")) || "draft";
      const isEdit = viewState.quotationForm.mode === "edit";
      const data = viewState.quotationForm.data;

      // 承認・失注はバリデーション不要でステータスを更新
      if (action === "approve" || action === "lost") {
        const statusMap = { approve: "承認済み", lost: "失注" };
        const idx = quotations.findIndex(function (q) { return q.code === viewState.quotationForm.editCode; });
        if (idx >= 0) quotations[idx] = Object.assign({}, quotations[idx], { status: statusMap[action] });
        viewState.quotationForm.mode = "list";
        viewState.quotationForm.errors = {};
        renderApp();
        return;
      }

      // 却下は却下理由が必須
      if (action === "reject") {
        const reason = (data.rejectReason || "").trim();
        if (!reason) {
          viewState.quotationForm.errors = { rejectReason: "却下理由は必須です。" };
          renderApp();
          return;
        }
        const idx = quotations.findIndex(function (q) { return q.code === viewState.quotationForm.editCode; });
        if (idx >= 0) quotations[idx] = rejectQuotation(quotations[idx], reason);
        viewState.quotationForm.mode = "list";
        viewState.quotationForm.errors = {};
        renderApp();
        return;
      }

      // 下書き保存・承認依頼はバリデーションあり
      const targetStatus = action === "request" ? "承認依頼中" : "下書き";
      const existingCodes = quotations.map(function (q) { return q.code; });
      const rules = Object.assign(
        isEdit ? {} : {
          code: [
            { type: "required", fieldName: "見積番号" },
            { type: "maxLength", max: 20, fieldName: "見積番号" },
            { type: "unique", existingValues: existingCodes, fieldName: "見積番号" }
          ]
        },
        {
          title: [
            { type: "required", fieldName: "見積件名" },
            { type: "maxLength", max: 100, fieldName: "見積件名" }
          ],
          projectCode: [{ type: "required", fieldName: "案件" }],
          issueDate: [{ type: "required", fieldName: "発行日" }]
        }
      );
      const errors = validateForm(data, rules);
      const hasError = Object.keys(errors).some(function (k) { return errors[k] !== null; });
      if (hasError) {
        viewState.quotationForm.errors = errors;
        renderApp();
        return;
      }
      const saved = createQuotation(Object.assign({}, data, {
        status: targetStatus,
        details: viewState.quotationForm.details
      }));
      if (isEdit) {
        const idx = quotations.findIndex(function (q) { return q.code === viewState.quotationForm.editCode; });
        if (idx >= 0) quotations[idx] = saved;
        viewState.quotationForm.editCode = null;
      } else {
        quotations.push(saved);
        viewState.tables.quotationList.page = Math.ceil(quotations.length / PAGE_SIZE);
      }
      viewState.quotationForm.mode = "list";
      viewState.quotationForm.errors = {};
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
    receiptRegisterForm.addEventListener("submit", function(e) {
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
      const newCode = generateReceiptCode(receipts.map(function(r) { return r.code; }));
      const newReceipt = createReceipt(newCode, invoiceCode, dateVal, Number(amountVal), Number(feeVal) || 0, notesVal);
      receipts.push(newReceipt);

      const idx = invoices.findIndex(function(inv) { return inv.code === invoiceCode; });
      if (idx >= 0) {
        if (isFullyPaid(invoices[idx], receipts)) {
          invoices[idx] = Object.assign({}, invoices[idx], { status: '入金済' });
        } else {
          invoices[idx] = Object.assign({}, invoices[idx], { status: '一部入金' });
        }
      }

      viewState.invoiceView = "detail";
      viewState.invoiceDetailCode = invoiceCode;
      viewState.receiptForm = { invoiceCode: null, errors: {} };
      renderApp();
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
      renderApp();
    });
  }

  // S-10: 支払ステータス変更ボタン（詳細画面から）
  Array.prototype.forEach.call(document.querySelectorAll("[data-action-payment-status]"), function(btn) {
    btn.addEventListener("click", function() {
      const newStatus = btn.getAttribute("data-action-payment-status");
      const idx = payments.findIndex(function(p) { return p.code === viewState.paymentDetailCode; });
      if (idx < 0) return;
      if (newStatus === '承認待ち') payments[idx] = submitPaymentApproval(payments[idx]);
      else if (newStatus === '承認済') payments[idx] = approvePayment(payments[idx]);
      else if (newStatus === '差戻し') payments[idx] = rejectPayment(payments[idx]);
      else if (newStatus === 'キャンセル') payments[idx] = cancelPayment(payments[idx]);
      renderApp();
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
    paymentExecForm.addEventListener("submit", function(e) {
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

      const idx = payments.findIndex(function(p) { return p.code === viewState.paymentDetailCode; });
      if (idx >= 0) {
        payments[idx] = Object.assign({}, registerPayment(payments[idx]), {
          paidDate: dateVal,
          paidAmount: Number(amountVal)
        });
      }

      viewState.paymentView = "detail";
      viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
      renderApp();
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
    paymentRegisterForm.addEventListener("submit", function(e) {
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
      const newCode = generatePaymentCode(payments.map(function(p) { return p.code; }));
      const newPayment = createPaymentRequest(newCode, poCode, po ? po.supplierId : '', titleVal, dateVal, Number(amountVal), notesVal);
      payments.push(newPayment);

      viewState.paymentView = "list";
      viewState.paymentForm = { purchaseOrderCode: null, errors: {} };
      renderApp();
    });
  }
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

window.addEventListener("hashchange", renderApp);
renderApp();
