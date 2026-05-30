import { sql } from 'drizzle-orm';
import {
  users, customers, suppliers, products, projects,
  quotations, quotationDetails,
  orders, orderDetails, orderAttachments,
  purchaseOrders, purchaseOrderDetails,
  invoices, invoiceDetails,
  receipts, payments, deliveries,
  approvalRoutes,
  sequenceCounters
} from './schema.js';
import {
  seedUsers, seedCustomers, seedSuppliers, seedProducts, seedProjects,
  seedQuotations, seedOrders, seedPurchaseOrders, seedInvoices,
  seedReceipts, seedPayments, seedDeliveries
} from './seedData.js';

// in-memoryモードの初期採番値と一致させる（server/index.js参照）
const SEQ_INITIAL = {
  quotation:     11,
  order:         7,
  purchaseOrder: 6,
  invoice:       7,
  receipt:       1,
  payment:       2,
  delivery:      1
};

const seedApprovalRoutes = [
  { documentType: 'quotation',      stepNumber: 1, approverUserId: 'manager01',  isActive: true },
  { documentType: 'quotation',      stepNumber: 2, approverUserId: 'director01', isActive: true },
  { documentType: 'order',          stepNumber: 1, approverUserId: 'manager01',  isActive: true },
  { documentType: 'purchaseOrder',  stepNumber: 1, approverUserId: 'manager01',  isActive: true },
  { documentType: 'invoice',        stepNumber: 1, approverUserId: 'finance01',  isActive: true },
  { documentType: 'payment',        stepNumber: 1, approverUserId: 'finance01',  isActive: true },
];

export async function resetDb(db) {
  await db.execute(sql`
    TRUNCATE TABLE
      audit_logs, approval_history, notifications,
      quotation_details, order_details, order_attachments, purchase_order_details, invoice_details,
      receipts, payments, deliveries, invoices, purchase_orders, orders, quotations,
      approval_routes, projects, customers, suppliers, products, sequence_counters,
      refresh_tokens, users
    RESTART IDENTITY CASCADE
  `);

  await db.insert(users).values(
    seedUsers.map(u => ({
      id: u.id, name: u.name, passwordHash: u.passwordHash,
      userType: u.userType, department: u.department, position: u.position,
      status: u.status, failedLoginCount: u.failedLoginCount, lockedUntil: u.lockedUntil ?? null
    }))
  );

  await db.insert(approvalRoutes).values(seedApprovalRoutes);

  await db.insert(customers).values(
    seedCustomers.map(c => ({
      code: c.code, name: c.name, department: c.department, contact: c.contact,
      closingDay: c.closingDay, paymentSite: c.paymentSite, billingTo: c.billingTo, status: c.status
    }))
  );

  await db.insert(suppliers).values(
    seedSuppliers.map(s => ({
      code: s.code, name: s.name, contact: s.contact, paymentSite: s.paymentSite, status: s.status
    }))
  );

  await db.insert(products).values(
    seedProducts.map(p => ({
      code: p.code, name: p.name, unit: p.unit, unitPrice: String(p.unitPrice), tax: p.tax, status: p.status
    }))
  );

  await db.insert(projects).values(
    seedProjects.map(p => ({
      code: p.code, name: p.name, customerId: p.customerId, department: p.department,
      status: p.status, startDate: p.startDate, dueDate: p.dueDate, description: p.description
    }))
  );

  for (const q of seedQuotations) {
    const { details, ...header } = q;
    await db.insert(quotations).values({
      code: header.code, projectCode: header.projectCode, customerId: header.customerId,
      title: header.title, issueDate: header.issueDate, validityDate: header.validityDate,
      version: header.version, status: header.status, notes: header.notes ?? null,
      subtotal: String(header.subtotal), taxAmount: String(header.taxAmount), total: String(header.total),
      approvalComment: header.approvalComment ?? null, rejectReason: header.rejectReason ?? null,
      submittedBy: header.submittedBy ?? null
    });
    if (details?.length) {
      await db.insert(quotationDetails).values(
        details.map(d => ({
          quotationCode: header.code, lineNo: d.lineNo, productCode: d.productCode ?? null,
          productName: d.productName, quantity: String(d.quantity), unit: d.unit,
          unitPrice: String(d.unitPrice), discount: String(d.discount ?? 0),
          taxRate: String(d.taxRate), amount: String(d.amount)
        }))
      );
    }
  }

  for (const o of seedOrders) {
    const { details, attachments, ...header } = o;
    await db.insert(orders).values({
      code: header.code, quotationCode: header.quotationCode, projectCode: header.projectCode,
      customerId: header.customerId, title: header.title, orderDate: header.orderDate,
      deliveryDate: header.deliveryDate, status: header.status,
      subtotal: String(header.subtotal), taxAmount: String(header.taxAmount), total: String(header.total),
      notes: header.notes ?? null, billingTarget: header.billingTarget ?? false,
      paidAmount: String(header.paidAmount ?? 0),
      approvalComment: header.approvalComment ?? null, rejectReason: header.rejectReason ?? null,
      submittedBy: header.submittedBy ?? null
    });
    if (details?.length) {
      await db.insert(orderDetails).values(
        details.map(d => ({
          orderCode: header.code, lineNo: d.lineNo, productCode: d.productCode ?? null,
          productName: d.productName, quantity: String(d.quantity), unit: d.unit,
          unitPrice: String(d.unitPrice), discount: String(d.discount ?? 0),
          taxRate: String(d.taxRate), amount: String(d.amount)
        }))
      );
    }
    if (attachments?.length) {
      await db.insert(orderAttachments).values(
        attachments.map(a => ({
          orderCode: header.code, fileName: a.name, fileSize: a.size ?? null,
          fileType: a.type ?? null, uploadedAt: a.uploadedAt ? new Date(a.uploadedAt) : new Date()
        }))
      );
    }
  }

  for (const po of seedPurchaseOrders) {
    const { details, ...header } = po;
    await db.insert(purchaseOrders).values({
      code: header.code, orderCode: header.orderCode, supplierId: header.supplierId,
      title: header.title, orderDate: header.orderDate, deliveryDate: header.deliveryDate,
      status: header.status, subtotal: String(header.subtotal), taxAmount: String(header.taxAmount),
      total: String(header.total), notes: header.notes ?? null,
      approvalComment: header.approvalComment ?? null, rejectReason: header.rejectReason ?? null,
      submittedBy: header.submittedBy ?? null
    });
    if (details?.length) {
      await db.insert(purchaseOrderDetails).values(
        details.map(d => ({
          purchaseOrderCode: header.code, lineNo: d.lineNo, productCode: d.productCode ?? null,
          productName: d.productName, quantity: String(d.quantity ?? 1), unit: d.unit ?? null,
          unitPrice: String(d.unitPrice), discount: String(d.discount ?? 0),
          taxRate: String(d.taxRate ?? 0.10), amount: String(d.amount)
        }))
      );
    }
  }

  for (const inv of seedInvoices) {
    const { details, projectCode: _projectCode, ...header } = inv;
    await db.insert(invoices).values({
      code: header.code, orderCode: header.orderCode, customerId: header.customerId,
      title: header.title, invoiceDate: header.invoiceDate, dueDate: header.dueDate,
      status: header.status, subtotal: String(header.subtotal), taxAmount: String(header.taxAmount),
      total: String(header.total), notes: header.notes ?? null,
      approvalComment: header.approvalComment ?? null, rejectReason: header.rejectReason ?? null,
      submittedBy: header.submittedBy ?? null
    });
    if (details?.length) {
      await db.insert(invoiceDetails).values(
        details.map(d => ({
          invoiceCode: header.code, lineNo: d.lineNo, productCode: d.productCode ?? null,
          productName: d.productName, quantity: String(d.quantity), unit: d.unit,
          unitPrice: String(d.unitPrice), discount: String(d.discount ?? 0),
          taxRate: String(d.taxRate), amount: String(d.amount)
        }))
      );
    }
  }

  if (seedReceipts.length) {
    await db.insert(receipts).values(
      seedReceipts.map(r => ({
        code: r.code, invoiceCode: r.invoiceCode, receiptDate: r.receiptDate,
        amount: String(r.amount), fee: String(r.fee ?? 0), notes: r.notes ?? null, status: r.status ?? '未消込'
      }))
    );
  }

  if (seedPayments.length) {
    await db.insert(payments).values(
      seedPayments.map(p => ({
        code: p.code, purchaseOrderCode: p.purchaseOrderCode, supplierId: p.supplierId,
        title: p.title, paymentDate: p.paymentDate, amount: String(p.amount),
        status: p.status, notes: p.notes ?? null,
        approvalComment: p.approvalComment ?? null, rejectReason: p.rejectReason ?? null
      }))
    );
  }

  if (seedDeliveries.length) {
    await db.insert(deliveries).values(
      seedDeliveries.map(d => ({
        code: d.code, purchaseOrderCode: d.purchaseOrderCode,
        deliveryDate: d.deliveryDate, notes: d.notes ?? null, status: d.status
      }))
    );
  }

  await db.insert(sequenceCounters).values(
    Object.entries(SEQ_INITIAL).map(([entityType, currentVal]) => ({ entityType, currentVal }))
  );
}
