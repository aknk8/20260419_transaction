// Seed data for in-memory repositories (dev/test only)
export const seedUsers = [
  {
    id: 'admin',
    name: '中村 管理者',
    userType: 'システム管理者',
    department: '管理部門',
    position: '部長',
    status: '有効',
    // password: admin123
    passwordHash: '$2b$10$9eiwVSksdG5cwuSmwWBy..v6rGRkHElcS17x8F8jD2461.ND3rYVu',
    failedLoginCount: 0,
    lockedUntil: null
  },
  {
    id: 'sales01',
    name: '佐藤 営業',
    userType: '一般ユーザ',
    department: '営業部門',
    position: '担当者',
    status: '有効',
    // password: sales123
    passwordHash: '$2b$10$HrzVHjUuYOAKuaLc01cRiO5BEEvg.kJj6X1g2c03kvSdqlMN3Kzou',
    failedLoginCount: 0,
    lockedUntil: null
  },
  {
    id: 'manager01',
    name: '田中 部長',
    userType: '一般ユーザ',
    department: '営業部門',
    position: '部長',
    status: '有効',
    // password: manager123
    passwordHash: '$2b$10$4oq757sYMRfeaMbrPMfL5OYU4vznXsbOIC3zU0olXYpc08YQGuCBC',
    failedLoginCount: 0,
    lockedUntil: null
  },
  {
    id: 'director01',
    name: '鈴木 役員',
    userType: '一般ユーザ',
    department: '経営企画部門',
    position: '取締役',
    status: '有効',
    // password: director123
    passwordHash: '$2b$10$s7r9DOhIIhK/z7T1UObbYuA40/AK4h1AVhfW/wZOoBkVKPZc3j2ui',
    failedLoginCount: 0,
    lockedUntil: null
  },
  {
    id: 'finance01',
    name: '鈴木 経理',
    userType: '一般ユーザ',
    department: '経理部門',
    position: '課長',
    status: '有効',
    // password: finance123
    passwordHash: '$2b$10$1OdQyUtaqiCgrJ0wqGl3f.6zJsXTWekrJlD0g8kwrn2EMwedPTwvy',
    failedLoginCount: 0,
    lockedUntil: null
  },
  {
    id: 'president01',
    name: '山田 社長',
    userType: 'システム管理者',
    department: '経営企画部門',
    position: '代表取締役社長',
    status: '有効',
    // password: president123
    passwordHash: '$2b$10$pZ6NzPnbk5mDGUprQU.dkefZo9ST3xwAQFuShS67EDbsEHWbcSMAy',
    failedLoginCount: 0,
    lockedUntil: null
  }
];

export const seedCustomers = [
  { code: 'CUS-001', name: '株式会社青葉システム', department: '営業部門', contact: '山田 一郎', closingDay: '末日', paymentSite: '翌月末', billingTo: '東京本社', status: '有効' },
  { code: 'CUS-002', name: '東都ネットワーク株式会社', department: '営業事務部門', contact: '高橋 未来', closingDay: '20日', paymentSite: '翌月20日', billingTo: '大阪支店', status: '有効' },
  { code: 'CUS-003', name: 'みなと物流サービス株式会社', department: '購買部門', contact: '小林 伸', closingDay: '15日', paymentSite: '翌月末', billingTo: '名古屋営業所', status: '有効' },
  { code: 'CUS-004', name: '北星メディカル機器株式会社', department: '営業部門', contact: '松本 玲子', closingDay: '末日', paymentSite: '翌々月5日', billingTo: '札幌支店', status: '停止' },
  { code: 'CUS-005', name: '新都建設エンジニアリング株式会社', department: '管理部門', contact: '田口 大樹', closingDay: '25日', paymentSite: '翌月末', billingTo: '本店経理部', status: '有効' },
  { code: 'CUS-006', name: 'フェニックス販売株式会社', department: '経理部門', contact: '加藤 優子', closingDay: '末日', paymentSite: '翌月15日', billingTo: '福岡支社', status: '有効' },
  { code: 'CUS-007', name: '丸山ソリューションズ株式会社', department: '営業部門', contact: '西村 健', closingDay: '10日', paymentSite: '翌月末', billingTo: '横浜オフィス', status: '有効' },
  { code: 'CUS-008', name: '南海オートメーション株式会社', department: '購買部門', contact: '佐々木 光', closingDay: '20日', paymentSite: '翌月25日', billingTo: '神戸事業所', status: '有効' },
  { code: 'CUS-009', name: '中央ソフトサプライ株式会社', department: '営業事務部門', contact: '斎藤 理沙', closingDay: '末日', paymentSite: '翌月末', billingTo: '本社請求課', status: '停止' }
];

export const seedSuppliers = [
  { code: 'SUP-001', name: '株式会社日本テクノロジー', contact: '中村 誠', paymentSite: '翌月末', status: '有効' },
  { code: 'SUP-002', name: 'アジア部品サプライ株式会社', contact: '李 明', paymentSite: '翌月20日', status: '有効' },
  { code: 'SUP-003', name: '東洋精密機器株式会社', contact: '田中 幸雄', paymentSite: '翌々月5日', status: '有効' },
  { code: 'SUP-004', name: 'グローバル電材株式会社', contact: '伊藤 直美', paymentSite: '翌月末', status: '停止' },
  { code: 'SUP-005', name: '北海道産業資材株式会社', contact: '吉田 雄大', paymentSite: '翌月末', status: '有効' }
];

export const seedProducts = [
  { code: 'PRD-001', name: 'サーバー保守サービス', unit: '月', unitPrice: '50000', tax: '課税', status: '有効' },
  { code: 'PRD-002', name: 'ネットワーク機器 導入支援', unit: '式', unitPrice: '200000', tax: '課税', status: '有効' },
  { code: 'PRD-003', name: 'ソフトウェアライセンス', unit: '年', unitPrice: '120000', tax: '課税', status: '有効' },
  { code: 'PRD-004', name: '技術支援 スポット対応', unit: '時間', unitPrice: '15000', tax: '課税', status: '有効' },
  { code: 'PRD-005', name: '消耗品セット', unit: '個', unitPrice: '3000', tax: '課税', status: '停止' }
];

export const seedProjects = [
  { code: 'PJ-00001', name: '新規保守案件', customerId: 'CUS-001', department: '営業部門', status: '進行中', startDate: '2026-04-01', dueDate: '2026-04-30', description: '青葉システム向け月次保守契約。4月より開始。' },
  { code: 'PJ-00002', name: 'B社機器更新', customerId: 'CUS-002', department: '管理部門', status: '承認待ち', startDate: '2026-03-15', dueDate: '2026-04-28', description: 'ネットワーク機器の更新提案。承認後に発注起票予定。' },
  { code: 'PJ-00003', name: 'C社定例運用', customerId: 'CUS-003', department: '営業事務部門', status: '請求準備', startDate: '2026-01-01', dueDate: '2026-05-02', description: '定例運用サポート。5月分請求準備中。' },
  { code: 'PJ-00004', name: 'D社システム導入', customerId: 'CUS-005', department: '営業部門', status: '商談中', startDate: '2026-05-01', dueDate: '2026-05-15', description: '新規導入提案。初回訪問完了、見積作成中。' },
  { code: 'PJ-00005', name: 'E社ライセンス更新', customerId: 'CUS-007', department: '営業部門', status: '完了', startDate: '2026-02-01', dueDate: '2026-03-31', description: 'ソフトウェアライセンス更新。入金確認済み。' }
];

export const seedQuotations = [
  {
    code: 'QUO-00001', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 初回見積', issueDate: '2026-01-10', validityDate: '2026-02-10',
    version: 1, status: '承認済み', notes: '',
    subtotal: 600000, taxAmount: 60000, total: 660000,
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 660000 }]
  },
  {
    code: 'QUO-00002', projectCode: 'PJ-00002', customerId: 'CUS-002',
    title: 'B社機器更新 提案見積', issueDate: '2026-03-20', validityDate: '2026-04-20',
    version: 1, status: '下書き', notes: '機器選定中につき暫定金額',
    subtotal: 200000, taxAmount: 20000, total: 220000,
    details: [{ lineNo: 1, productCode: 'PRD-002', productName: 'ネットワーク機器 導入支援', quantity: 1, unit: '式', unitPrice: 200000, discount: 0, taxRate: 0.10, amount: 220000 }]
  },
  {
    code: 'QUO-00003', projectCode: 'PJ-00003', customerId: 'CUS-003',
    title: 'C社定例運用 継続見積', issueDate: '2026-04-01', validityDate: '2026-04-30',
    version: 2, status: '承認依頼中', submittedBy: 'sales01', notes: '前回から単価改定あり',
    subtotal: 660000, taxAmount: 66000, total: 726000,
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 55000, discount: 0, taxRate: 0.10, amount: 726000 }]
  },
  {
    code: 'QUO-00004', projectCode: 'PJ-00004', customerId: 'CUS-005',
    title: 'D社システム導入 初回見積', issueDate: '2026-05-01', validityDate: '2026-05-31',
    version: 1, status: '下書き', notes: '',
    subtotal: 340000, taxAmount: 34000, total: 374000,
    details: [{ lineNo: 1, productCode: 'PRD-003', productName: 'ソフトウェアライセンス', quantity: 3, unit: '年', unitPrice: 120000, discount: 10000, taxRate: 0.10, amount: 374000 }]
  },
  {
    code: 'QUO-00005', projectCode: 'PJ-00005', customerId: 'CUS-007',
    title: 'E社ライセンス更新 見積', issueDate: '2026-02-01', validityDate: '2026-03-01',
    version: 1, status: '承認済み', notes: '',
    subtotal: 120000, taxAmount: 12000, total: 132000,
    details: [{ lineNo: 1, productCode: 'PRD-003', productName: 'ソフトウェアライセンス', quantity: 1, unit: '年', unitPrice: 120000, discount: 0, taxRate: 0.10, amount: 132000 }]
  },
  {
    code: 'QUO-00006', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 第2四半期見積', issueDate: '2026-03-01', validityDate: '2026-03-31',
    version: 1, status: '承認済み', notes: '4月〜6月（3か月）',
    subtotal: 150000, taxAmount: 15000, total: 165000,
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 3, unit: '月', unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 165000 }]
  },
  {
    code: 'QUO-00007', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 第3四半期見積', issueDate: '2026-06-01', validityDate: '2026-06-30',
    version: 1, status: '承認済み', notes: '7月〜9月（3か月）',
    subtotal: 150000, taxAmount: 15000, total: 165000,
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 3, unit: '月', unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 165000 }]
  },
  {
    code: 'QUO-00008', projectCode: 'PJ-00003', customerId: 'CUS-003',
    title: 'C社定例運用 取消済みサンプル', issueDate: '2026-01-01', validityDate: '2026-01-31',
    version: 1, status: '取消', notes: '取引中止につき取消',
    subtotal: 100000, taxAmount: 10000, total: 110000,
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 2, unit: '月', unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 110000 }]
  }
];

export const seedOrders = [
  {
    code: 'ORD-00001', quotationCode: 'QUO-00001', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 初回見積', orderDate: '2026-01-20', deliveryDate: '2026-12-31',
    status: '受注済み', subtotal: 600000, taxAmount: 60000, total: 660000,
    notes: '', billingTarget: false, paidAmount: 0, attachments: [],
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 528000 },
      { lineNo: 2, productCode: 'PRD-002', productName: 'ネットワーク機器保守', quantity: 12, unit: '月', unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 132000 }
    ]
  },
  {
    code: 'ORD-00002', quotationCode: 'QUO-00004', projectCode: 'PJ-00004', customerId: 'CUS-005',
    title: 'セキュリティ診断サービス 提案', orderDate: '2026-03-01', deliveryDate: '2026-06-30',
    status: '受注済み', subtotal: 300000, taxAmount: 30000, total: 330000,
    notes: '', billingTarget: false, paidAmount: 0, attachments: [],
    details: [
      { lineNo: 1, productCode: 'PRD-004', productName: 'セキュリティ診断', quantity: 1, unit: '式', unitPrice: 300000, discount: 0, taxRate: 0.10, amount: 330000 }
    ]
  },
  {
    code: 'ORD-00003', quotationCode: 'QUO-00005', projectCode: 'PJ-00005', customerId: 'CUS-005',
    title: 'ライセンス更新見積', orderDate: '2026-04-01', deliveryDate: '2026-03-31',
    status: '完了', subtotal: 120000, taxAmount: 12000, total: 132000,
    notes: '', billingTarget: true, paidAmount: 132000, attachments: [],
    details: [
      { lineNo: 1, productCode: 'PRD-003', productName: 'ソフトウェアライセンス', quantity: 1, unit: '年', unitPrice: 120000, discount: 0, taxRate: 0.10, amount: 132000 }
    ]
  },
  {
    code: 'ORD-00004', quotationCode: 'QUO-00006', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 第2四半期', orderDate: '2026-03-20', deliveryDate: '2026-06-30',
    status: '受注済み', subtotal: 150000, taxAmount: 15000, total: 165000,
    notes: '4月〜6月（3か月）', billingTarget: true, paidAmount: 0, attachments: [],
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 3, unit: '月', unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 132000 },
      { lineNo: 2, productCode: 'PRD-002', productName: 'ネットワーク機器保守', quantity: 3, unit: '月', unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 33000 }
    ]
  },
  {
    code: 'ORD-00005', quotationCode: 'QUO-00007', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 第3四半期', orderDate: '2026-06-01', deliveryDate: '2026-09-30',
    status: '受注済み', subtotal: 150000, taxAmount: 15000, total: 165000,
    notes: '7月〜9月（3か月）', billingTarget: false, paidAmount: 0, attachments: [],
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 3, unit: '月', unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 132000 },
      { lineNo: 2, productCode: 'PRD-002', productName: 'ネットワーク機器保守', quantity: 3, unit: '月', unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 33000 }
    ]
  },
  {
    code: 'ORD-00006', quotationCode: 'QUO-00001', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 承認申請中', orderDate: '2026-05-01', deliveryDate: '2026-12-31',
    status: '承認依頼中', subtotal: 600000, taxAmount: 60000, total: 660000,
    notes: '', billingTarget: false, paidAmount: 0, submittedBy: 'user01',
    attachments: [{ name: '契約書.pdf', size: 102400, type: 'application/pdf', uploadedAt: '2026-05-01' }],
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 40000, discount: 0, taxRate: 0.10, amount: 528000 },
      { lineNo: 2, productCode: 'PRD-002', productName: 'ネットワーク機器保守', quantity: 12, unit: '月', unitPrice: 10000, discount: 0, taxRate: 0.10, amount: 132000 }
    ]
  }
];

export const seedPurchaseOrders = [
  {
    code: 'POD-00001', orderCode: 'ORD-00001', supplierId: 'SUP-001',
    title: 'サーバー保守サービス 発注', orderDate: '2026-01-25', deliveryDate: '2026-12-31',
    status: '下書き', subtotal: 480000, taxAmount: 48000, total: 528000, notes: '',
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 40000, amount: 528000 }]
  },
  {
    code: 'POD-00002', orderCode: 'ORD-00002', supplierId: 'SUP-003',
    title: 'セキュリティ診断 発注', orderDate: '2026-03-05', deliveryDate: '2026-06-30',
    status: '承認済・発注待ち', subtotal: 250000, taxAmount: 25000, total: 275000, notes: '',
    details: [{ lineNo: 1, productCode: 'PRD-004', productName: 'セキュリティ診断', quantity: 1, unit: '式', unitPrice: 250000, amount: 275000 }]
  },
  {
    code: 'POD-00003', orderCode: 'ORD-00003', supplierId: 'SUP-002',
    title: 'ライセンス調達 発注', orderDate: '2026-04-05', deliveryDate: '2026-03-31',
    status: '納品済', subtotal: 100000, taxAmount: 10000, total: 110000, notes: '',
    details: [{ lineNo: 1, productCode: 'PRD-003', productName: 'ソフトウェアライセンス', quantity: 1, unit: '年', unitPrice: 100000, amount: 110000 }]
  },
  {
    code: 'POD-00004', orderCode: 'ORD-00001', supplierId: 'SUP-001',
    title: 'インフラ構築支援 発注', orderDate: '2026-04-10', deliveryDate: '2026-04-30',
    status: '納品済', subtotal: 1000000, taxAmount: 100000, total: 1100000, notes: '',
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'インフラ構築支援', quantity: 1, unit: '式', unitPrice: 1000000, amount: 1100000 }]
  },
  {
    code: 'POD-00005', orderCode: 'ORD-00002', supplierId: 'SUP-001',
    title: '保守サービス 発注', orderDate: '2026-04-20', deliveryDate: '2026-05-15',
    status: '納品済', subtotal: 1000000, taxAmount: 100000, total: 1100000, notes: '',
    details: [{ lineNo: 1, productCode: 'PRD-001', productName: '保守サービス', quantity: 1, unit: '式', unitPrice: 1000000, amount: 1100000 }]
  },
  {
    code: 'POD-00006', orderCode: 'ORD-00002', supplierId: 'SUP-003',
    title: 'ネットワーク機器 発注', orderDate: '2026-04-15', deliveryDate: '2026-06-30',
    status: '承認依頼中', submittedBy: 'sales01', subtotal: 300000, taxAmount: 30000, total: 330000, notes: '',
    details: [{ lineNo: 1, productCode: 'PRD-002', productName: 'ネットワーク機器 導入支援', quantity: 1, unit: '式', unitPrice: 300000, amount: 330000 }]
  }
];

export const seedDeliveries = [
  {
    code: 'DLV-00001', purchaseOrderCode: 'POD-00003', deliveryDate: '2026-03-28',
    notes: '', status: '検収済',
    details: [{ lineNo: 1, deliveredQuantity: 1 }]
  }
];

export const seedInvoices = [
  {
    code: 'INV-00001', orderCode: 'ORD-00001', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: 'サーバー保守サービス 2026年1月分', invoiceDate: '2026-01-31', dueDate: '2026-02-28',
    status: '送付済', subtotal: 480000, taxAmount: 48000, total: 528000, notes: '',
    details: [{ lineNo: 1, productName: 'サーバー保守サービス', quantity: 1, unit: '月', unitPrice: 480000, taxRate: 0.10, amount: 528000 }]
  },
  {
    code: 'INV-00002', orderCode: 'ORD-00002', projectCode: 'PJ-00004', customerId: 'CUS-005',
    title: 'セキュリティ診断サービス 請求', invoiceDate: '2026-03-31', dueDate: '2026-04-30',
    status: '入金済', subtotal: 2000000, taxAmount: 200000, total: 2200000, notes: '',
    details: [{ lineNo: 1, productName: 'セキュリティ診断サービス', quantity: 1, unit: '式', unitPrice: 2000000, taxRate: 0.10, amount: 2200000 }]
  },
  {
    code: 'INV-00003', orderCode: 'ORD-00002', projectCode: 'PJ-00004', customerId: 'CUS-005',
    title: 'セキュリティ診断 追加作業 請求', invoiceDate: '2026-04-30', dueDate: '2026-05-31',
    status: '下書き', subtotal: 350000, taxAmount: 35000, total: 385000, notes: '',
    details: [{ lineNo: 1, productName: 'セキュリティ診断 追加作業', quantity: 1, unit: '式', unitPrice: 350000, taxRate: 0.10, amount: 385000 }]
  },
  {
    code: 'INV-00004', orderCode: 'ORD-00004', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: 'サーバー保守サービス 2026年4月分', invoiceDate: '2026-04-30', dueDate: '2026-05-31',
    status: '送付済', subtotal: 50000, taxAmount: 5000, total: 55000, notes: '',
    details: [{ lineNo: 1, productName: 'サーバー保守サービス', quantity: 1, unit: '月', unitPrice: 50000, taxRate: 0.10, amount: 55000 }]
  },
  {
    code: 'INV-00005', orderCode: 'ORD-00001', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 承認申請中', invoiceDate: '2026-05-01', dueDate: '2026-05-31',
    status: '承認依頼中', subtotal: 600000, taxAmount: 60000, total: 660000, notes: '',
    submittedBy: 'user01',
    details: [{ lineNo: 1, productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 50000, taxRate: 0.10, amount: 660000 }]
  },
  {
    code: 'INV-00006', orderCode: 'ORD-00005', projectCode: 'PJ-00001', customerId: 'CUS-001',
    title: '新規保守案件 第3四半期 確定済', invoiceDate: '2026-06-30', dueDate: '2026-07-31',
    status: '確定', subtotal: 150000, taxAmount: 15000, total: 165000, notes: '',
    details: [{ lineNo: 1, productName: 'サーバー保守サービス', quantity: 3, unit: '月', unitPrice: 50000, taxRate: 0.10, amount: 165000 }]
  }
];

export const seedReceipts = [
  { code: 'RCP-00001', invoiceCode: 'INV-00002', receiptDate: '2026-04-28', amount: 2200000, fee: 0, notes: '' }
];

export const seedPayments = [
  {
    code: 'PMT-00001', purchaseOrderCode: 'POD-00003', supplierId: 'SUP-002',
    title: 'ライセンス調達 支払依頼', paymentDate: '2026-04-30', amount: 110000,
    status: '支払済', paidDate: '2026-04-30', paidAmount: 110000, notes: ''
  },
  {
    code: 'PMT-00002', purchaseOrderCode: 'POD-00004', supplierId: 'SUP-001',
    title: 'インフラ構築支援 支払依頼', paymentDate: '2026-05-31', amount: 1100000,
    status: '承認済', notes: ''
  }
];

export const seedNotifications = [
  {
    id: 'NTF-00001', type: '承認依頼', message: '見積 QUO-00003 の承認依頼が届いています',
    targetType: 'quotation', targetCode: 'QUO-00003', recipientId: 'admin',
    createdAt: new Date('2026-04-20'), isRead: false
  },
  {
    id: 'NTF-00002', type: '承認依頼', message: '発注 POD-00006 の承認依頼が届いています',
    targetType: 'purchase-order', targetCode: 'POD-00006', recipientId: 'admin',
    createdAt: new Date('2026-04-15'), isRead: false
  },
  {
    id: 'NTF-00003', type: '承認依頼', message: '支払依頼 PMT-00002 の承認依頼が届いています',
    targetType: 'payment', targetCode: 'PMT-00002', recipientId: 'admin',
    createdAt: new Date('2026-05-01'), isRead: true
  }
];
