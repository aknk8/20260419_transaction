import { pgTable, varchar, text, timestamp, boolean, integer, numeric, serial, uuid } from 'drizzle-orm/pg-core';

const tstz = (name) => timestamp(name, { withTimezone: true });

export const users = pgTable('users', {
  id:               varchar('id', { length: 50 }).primaryKey(),
  name:             varchar('name', { length: 100 }).notNull(),
  passwordHash:     varchar('password_hash', { length: 255 }).notNull(),
  userType:         varchar('user_type', { length: 50 }).notNull(),
  department:       varchar('department', { length: 100 }),
  position:         varchar('position', { length: 100 }),
  status:           varchar('status', { length: 20 }).notNull().default('有効'),
  failedLoginCount: integer('failed_login_count').notNull().default(0),
  lockedUntil:      tstz('locked_until'),
  createdAt:        tstz('created_at').notNull().defaultNow(),
  updatedAt:        tstz('updated_at').notNull().defaultNow()
});

export const refreshTokens = pgTable('refresh_tokens', {
  id:         text('id').primaryKey(),
  userId:     varchar('user_id', { length: 50 }).notNull().references(() => users.id),
  tokenHash:  varchar('token_hash', { length: 255 }).notNull(),
  expiresAt:  tstz('expires_at').notNull(),
  revoked:    boolean('revoked').notNull().default(false),
  createdAt:  tstz('created_at').notNull().defaultNow()
});

export const customers = pgTable('customers', {
  code:        varchar('code', { length: 20 }).primaryKey(),
  name:        varchar('name', { length: 100 }).notNull(),
  department:  varchar('department', { length: 100 }),
  contact:     varchar('contact', { length: 100 }),
  closingDay:  varchar('closing_day', { length: 10 }),
  paymentSite: varchar('payment_site', { length: 20 }),
  billingTo:   varchar('billing_to', { length: 100 }),
  status:      varchar('status', { length: 20 }).notNull().default('有効'),
  createdAt:   tstz('created_at').notNull().defaultNow(),
  updatedAt:   tstz('updated_at').notNull().defaultNow()
});

export const suppliers = pgTable('suppliers', {
  code:        varchar('code', { length: 20 }).primaryKey(),
  name:        varchar('name', { length: 100 }).notNull(),
  contact:     varchar('contact', { length: 100 }),
  paymentSite: varchar('payment_site', { length: 20 }),
  status:      varchar('status', { length: 20 }).notNull().default('有効'),
  createdAt:   tstz('created_at').notNull().defaultNow(),
  updatedAt:   tstz('updated_at').notNull().defaultNow()
});

export const products = pgTable('products', {
  code:      varchar('code', { length: 20 }).primaryKey(),
  name:      varchar('name', { length: 100 }).notNull(),
  unit:      varchar('unit', { length: 20 }),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }),
  tax:       numeric('tax', { precision: 5, scale: 2 }),
  status:    varchar('status', { length: 20 }).notNull().default('有効'),
  createdAt: tstz('created_at').notNull().defaultNow(),
  updatedAt: tstz('updated_at').notNull().defaultNow()
});

export const projects = pgTable('projects', {
  code:        varchar('code', { length: 20 }).primaryKey(),
  name:        varchar('name', { length: 200 }).notNull(),
  customerId:  varchar('customer_id', { length: 20 }),
  department:  varchar('department', { length: 100 }),
  status:      varchar('status', { length: 20 }).notNull().default('進行中'),
  startDate:   varchar('start_date', { length: 10 }),
  dueDate:     varchar('due_date', { length: 10 }),
  description: text('description'),
  createdAt:   tstz('created_at').notNull().defaultNow(),
  updatedAt:   tstz('updated_at').notNull().defaultNow()
});

export const quotations = pgTable('quotations', {
  code:            varchar('code', { length: 20 }).primaryKey(),
  projectCode:     varchar('project_code', { length: 20 }),
  customerId:      varchar('customer_id', { length: 20 }),
  title:           varchar('title', { length: 200 }).notNull(),
  issueDate:       varchar('issue_date', { length: 10 }),
  validityDate:    varchar('validity_date', { length: 10 }),
  version:         integer('version').notNull().default(1),
  status:          varchar('status', { length: 20 }).notNull().default('下書き'),
  notes:           text('notes'),
  subtotal:        numeric('subtotal', { precision: 14, scale: 2 }).default('0'),
  taxAmount:       numeric('tax_amount', { precision: 14, scale: 2 }).default('0'),
  total:           numeric('total', { precision: 14, scale: 2 }).default('0'),
  approvalComment: text('approval_comment'),
  rejectReason:    text('reject_reason'),
  submittedBy:     varchar('submitted_by', { length: 50 }),
  createdAt:       tstz('created_at').notNull().defaultNow(),
  updatedAt:       tstz('updated_at').notNull().defaultNow()
});

export const quotationDetails = pgTable('quotation_details', {
  id:           serial('id').primaryKey(),
  quotationCode: varchar('quotation_code', { length: 20 }).notNull().references(() => quotations.code),
  lineNo:       integer('line_no').notNull(),
  productCode:  varchar('product_code', { length: 20 }),
  productName:  varchar('product_name', { length: 200 }),
  quantity:     numeric('quantity', { precision: 10, scale: 2 }).default('0'),
  unit:         varchar('unit', { length: 20 }),
  unitPrice:    numeric('unit_price', { precision: 12, scale: 2 }).default('0'),
  discount:     numeric('discount', { precision: 12, scale: 2 }).default('0'),
  taxRate:      numeric('tax_rate', { precision: 5, scale: 4 }).default('0.1000'),
  amount:       numeric('amount', { precision: 14, scale: 2 }).default('0')
});

export const orders = pgTable('orders', {
  code:            varchar('code', { length: 20 }).primaryKey(),
  quotationCode:   varchar('quotation_code', { length: 20 }),
  projectCode:     varchar('project_code', { length: 20 }),
  customerId:      varchar('customer_id', { length: 20 }),
  title:           varchar('title', { length: 200 }).notNull(),
  orderDate:       varchar('order_date', { length: 10 }),
  deliveryDate:    varchar('delivery_date', { length: 10 }),
  status:          varchar('status', { length: 20 }).notNull().default('受注済み'),
  subtotal:        numeric('subtotal', { precision: 14, scale: 2 }).default('0'),
  taxAmount:       numeric('tax_amount', { precision: 14, scale: 2 }).default('0'),
  total:           numeric('total', { precision: 14, scale: 2 }).default('0'),
  notes:           text('notes'),
  billingTarget:   boolean('billing_target').notNull().default(false),
  paidAmount:      numeric('paid_amount', { precision: 14, scale: 2 }).default('0'),
  approvalComment: text('approval_comment'),
  rejectReason:    text('reject_reason'),
  submittedBy:     varchar('submitted_by', { length: 50 }),
  createdAt:       tstz('created_at').notNull().defaultNow(),
  updatedAt:       tstz('updated_at').notNull().defaultNow()
});

export const purchaseOrders = pgTable('purchase_orders', {
  code:            varchar('code', { length: 20 }).primaryKey(),
  orderCode:       varchar('order_code', { length: 20 }),
  supplierId:      varchar('supplier_id', { length: 20 }),
  title:           varchar('title', { length: 200 }).notNull(),
  orderDate:       varchar('order_date', { length: 10 }),
  deliveryDate:    varchar('delivery_date', { length: 10 }),
  status:          varchar('status', { length: 20 }).notNull().default('下書き'),
  subtotal:        numeric('subtotal', { precision: 14, scale: 2 }).default('0'),
  taxAmount:       numeric('tax_amount', { precision: 14, scale: 2 }).default('0'),
  total:           numeric('total', { precision: 14, scale: 2 }).default('0'),
  notes:           text('notes'),
  approvalComment: text('approval_comment'),
  rejectReason:    text('reject_reason'),
  submittedBy:     varchar('submitted_by', { length: 50 }),
  createdAt:       tstz('created_at').notNull().defaultNow(),
  updatedAt:       tstz('updated_at').notNull().defaultNow()
});

export const purchaseOrderDetails = pgTable('purchase_order_details', {
  id:                serial('id').primaryKey(),
  purchaseOrderCode: varchar('purchase_order_code', { length: 20 }).notNull().references(() => purchaseOrders.code),
  lineNo:            integer('line_no').notNull(),
  productCode:       varchar('product_code', { length: 20 }),
  productName:       varchar('product_name', { length: 200 }),
  quantity:          numeric('quantity', { precision: 10, scale: 2 }).default('0'),
  unit:              varchar('unit', { length: 20 }),
  unitPrice:         numeric('unit_price', { precision: 12, scale: 2 }).default('0'),
  discount:          numeric('discount', { precision: 12, scale: 2 }).default('0'),
  taxRate:           numeric('tax_rate', { precision: 5, scale: 4 }).default('0.1000'),
  amount:            numeric('amount', { precision: 14, scale: 2 }).default('0')
});

export const invoices = pgTable('invoices', {
  code:            varchar('code', { length: 20 }).primaryKey(),
  orderCode:       varchar('order_code', { length: 20 }),
  customerId:      varchar('customer_id', { length: 20 }),
  title:           varchar('title', { length: 200 }).notNull(),
  invoiceDate:     varchar('invoice_date', { length: 10 }),
  dueDate:         varchar('due_date', { length: 10 }),
  status:          varchar('status', { length: 20 }).notNull().default('下書き'),
  subtotal:        numeric('subtotal', { precision: 14, scale: 2 }).default('0'),
  taxAmount:       numeric('tax_amount', { precision: 14, scale: 2 }).default('0'),
  total:           numeric('total', { precision: 14, scale: 2 }).default('0'),
  notes:           text('notes'),
  approvalComment: text('approval_comment'),
  rejectReason:    text('reject_reason'),
  submittedBy:     varchar('submitted_by', { length: 50 }),
  createdAt:       tstz('created_at').notNull().defaultNow(),
  updatedAt:       tstz('updated_at').notNull().defaultNow()
});

export const invoiceDetails = pgTable('invoice_details', {
  id:          serial('id').primaryKey(),
  invoiceCode: varchar('invoice_code', { length: 20 }).notNull().references(() => invoices.code),
  lineNo:      integer('line_no').notNull(),
  productCode: varchar('product_code', { length: 20 }),
  productName: varchar('product_name', { length: 200 }),
  quantity:    numeric('quantity', { precision: 10, scale: 2 }).default('0'),
  unit:        varchar('unit', { length: 20 }),
  unitPrice:   numeric('unit_price', { precision: 12, scale: 2 }).default('0'),
  discount:    numeric('discount', { precision: 12, scale: 2 }).default('0'),
  taxRate:     numeric('tax_rate', { precision: 5, scale: 4 }).default('0.1000'),
  amount:      numeric('amount', { precision: 14, scale: 2 }).default('0')
});

export const receipts = pgTable('receipts', {
  code:        varchar('code', { length: 20 }).primaryKey(),
  invoiceCode: varchar('invoice_code', { length: 20 }),
  receiptDate: varchar('receipt_date', { length: 10 }),
  amount:      numeric('amount', { precision: 14, scale: 2 }).default('0'),
  fee:         numeric('fee', { precision: 14, scale: 2 }).default('0'),
  status:      varchar('status', { length: 20 }).notNull().default('未消込'),
  notes:       text('notes'),
  createdAt:   tstz('created_at').notNull().defaultNow(),
  updatedAt:   tstz('updated_at').notNull().defaultNow()
});

export const payments = pgTable('payments', {
  code:              varchar('code', { length: 20 }).primaryKey(),
  purchaseOrderCode: varchar('purchase_order_code', { length: 20 }),
  supplierId:        varchar('supplier_id', { length: 20 }),
  title:             varchar('title', { length: 200 }).notNull(),
  paymentDate:       varchar('payment_date', { length: 10 }),
  amount:            numeric('amount', { precision: 14, scale: 2 }).default('0'),
  status:            varchar('status', { length: 20 }).notNull().default('下書き'),
  notes:             text('notes'),
  approvalComment:   text('approval_comment'),
  rejectReason:      text('reject_reason'),
  createdAt:         tstz('created_at').notNull().defaultNow(),
  updatedAt:         tstz('updated_at').notNull().defaultNow()
});

export const approvalRoutes = pgTable('approval_routes', {
  id:              serial('id').primaryKey(),
  documentType:    varchar('document_type', { length: 50 }).notNull(),
  stepNumber:      integer('step_number').notNull(),
  approverUserId:  varchar('approver_user_id', { length: 50 }).references(() => users.id),
  isActive:        boolean('is_active').notNull().default(true),
  createdAt:       tstz('created_at').notNull().defaultNow()
});

export const approvalHistory = pgTable('approval_history', {
  id:           uuid('id').primaryKey().defaultRandom(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  documentId:   varchar('document_id', { length: 100 }).notNull(),
  stepNumber:   integer('step_number').notNull(),
  actorUserId:  varchar('actor_user_id', { length: 50 }),
  actorName:    varchar('actor_name', { length: 100 }),
  action:       varchar('action', { length: 20 }).notNull(),
  comment:      text('comment'),
  createdAt:    tstz('created_at').notNull().defaultNow()
});

export const notifications = pgTable('notifications', {
  id:          uuid('id').primaryKey().defaultRandom(),
  type:        varchar('type', { length: 10 }).notNull(),
  recipientId: varchar('recipient_id', { length: 50 }).notNull(),
  docType:     varchar('doc_type', { length: 50 }),
  docCode:     varchar('doc_code', { length: 50 }),
  message:     text('message').notNull(),
  isRead:      boolean('is_read').notNull().default(false),
  createdAt:   tstz('created_at').notNull().defaultNow()
});

export const auditLogs = pgTable('audit_logs', {
  id:          serial('id').primaryKey(),
  userId:      varchar('user_id', { length: 50 }),
  userName:    varchar('user_name', { length: 100 }),
  action:      varchar('action', { length: 50 }).notNull(),
  entityType:  varchar('entity_type', { length: 50 }),
  entityId:    varchar('entity_id', { length: 100 }),
  beforeData:  text('before_data'),
  afterData:   text('after_data'),
  ipAddress:   varchar('ip_address', { length: 64 }),
  userAgent:   text('user_agent'),
  result:      varchar('result', { length: 20 }).notNull().default('SUCCESS'),
  errorDetail: text('error_detail'),
  createdAt:   tstz('created_at').notNull().defaultNow()
});

export const deliveries = pgTable('deliveries', {
  code:              varchar('code', { length: 20 }).primaryKey(),
  purchaseOrderCode: varchar('purchase_order_code', { length: 20 }),
  deliveryDate:      varchar('delivery_date', { length: 10 }),
  notes:             text('notes'),
  status:            varchar('status', { length: 20 }).notNull().default('検収待ち'),
  createdAt:         tstz('created_at').notNull().defaultNow(),
  updatedAt:         tstz('updated_at').notNull().defaultNow()
});

export const orderDetails = pgTable('order_details', {
  id:          serial('id').primaryKey(),
  orderCode:   varchar('order_code', { length: 20 }).notNull().references(() => orders.code),
  lineNo:      integer('line_no').notNull(),
  productCode: varchar('product_code', { length: 20 }),
  productName: varchar('product_name', { length: 200 }),
  quantity:    numeric('quantity', { precision: 10, scale: 2 }).default('0'),
  unit:        varchar('unit', { length: 20 }),
  unitPrice:   numeric('unit_price', { precision: 12, scale: 2 }).default('0'),
  discount:    numeric('discount', { precision: 12, scale: 2 }).default('0'),
  taxRate:     numeric('tax_rate', { precision: 5, scale: 4 }).default('0.1000'),
  amount:      numeric('amount', { precision: 14, scale: 2 }).default('0')
});

export const orderAttachments = pgTable('order_attachments', {
  id:         serial('id').primaryKey(),
  orderCode:  varchar('order_code', { length: 20 }).notNull().references(() => orders.code),
  fileName:   varchar('file_name', { length: 255 }).notNull(),
  fileSize:   integer('file_size'),
  fileType:   varchar('file_type', { length: 100 }),
  uploadedAt: tstz('uploaded_at').notNull().defaultNow()
});

export const sequenceCounters = pgTable('sequence_counters', {
  entityType: varchar('entity_type', { length: 50 }).primaryKey(),
  currentVal: integer('current_val').notNull().default(0)
});
