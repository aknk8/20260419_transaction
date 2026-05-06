import { createInvoice } from '../../src/invoice.js';
import { generateCode } from './sequenceService.js';
import { withTransaction } from '../db/transaction.js';

function notFound(msg) { return Object.assign(new Error(msg), { statusCode: 404 }); }
function validationError(msg) { return Object.assign(new Error(msg), { statusCode: 400 }); }

export async function listInvoices({ repository }) {
  return repository.findAll();
}

export async function getInvoiceByCode(code, { repository }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  return invoice;
}

export async function registerInvoice(formData, { repository, sequenceRepository, orderRepository, db }) {
  // INF-10: wrap sequence generation + invoice save in single transaction
  return withTransaction(db ?? null, async () => {
    const code = await generateCode('invoice', { sequenceRepository });

    const orderCodes = formData.orderCodes ?? (formData.orderCode ? [formData.orderCode] : []);

    let details, subtotal, taxAmount, total;

    if (formData.details !== undefined) {
      // Partial invoice: use explicitly specified details and totals
      details = formData.details;
      subtotal = Number(formData.subtotal ?? 0);
      taxAmount = Number(formData.taxAmount ?? 0);
      total = Number(formData.total ?? (subtotal + taxAmount));
    } else if (orderRepository && orderCodes.length > 0) {
      // Multi-order merge: calculate tax one-shot on combined subtotal (BL-02)
      const fetchedOrders = await Promise.all(orderCodes.map((c) => orderRepository.findByCode(c)));
      details = fetchedOrders.flatMap((o) => (o?.details ?? []).map((d) => ({ ...d })));
      subtotal = fetchedOrders.reduce((sum, o) => sum + Number(o?.subtotal ?? 0), 0);
      const taxRate = details.length > 0 ? Number(details[0].taxRate ?? 0.10) : 0.10;
      taxAmount = Math.floor(subtotal * taxRate);
      total = subtotal + taxAmount;
    } else {
      details = [];
      subtotal = Number(formData.subtotal ?? 0);
      taxAmount = Number(formData.taxAmount ?? 0);
      total = Number(formData.total ?? (subtotal + taxAmount));
    }

    const invoice = createInvoice(
      code,
      orderCodes[0] ?? null,
      formData.customerId,
      formData.title,
      formData.invoiceDate,
      formData.dueDate
    );
    return repository.save({ ...invoice, subtotal, taxAmount, total, details });
  });
}

export async function updateInvoice(code, data, { repository }) {
  return repository.update(code, data);
}

export async function submitInvoiceApproval(code, { repository, submittedBy }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  if (invoice.status !== '下書き') throw validationError('下書き状態のみ承認依頼できます');
  const updateData = { status: '承認依頼中' };
  if (submittedBy) updateData.submittedBy = submittedBy;
  return repository.update(code, updateData);
}

export async function approveInvoice(code, comment, { repository, auditLogRepository, actor, db }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  if (invoice.status !== '承認依頼中') throw validationError('承認依頼中状態のみ承認できます');

  // INF-10: wrap status update + audit log in single transaction
  return withTransaction(db ?? null, async () => {
    const result = await repository.update(code, { status: '確定', approvalComment: comment ?? null });

    if (auditLogRepository) {
      await auditLogRepository.save({
        userId: actor?.userId ?? null,
        userName: actor?.userName ?? null,
        action: 'INVOICE_APPROVE',
        entityType: 'invoice',
        entityId: code,
        result: 'SUCCESS'
      });
    }

    return result;
  });
}

export async function rejectInvoice(code, reason, { repository }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  if (invoice.status !== '承認依頼中') throw validationError('承認依頼中状態のみ却下できます');
  return repository.update(code, { status: '却下', rejectReason: reason ?? null });
}

// BL-01: 締日に基づく請求対象受注の抽出
function parseClosingDay(closingDay) {
  if (!closingDay || closingDay === '末日') return null;
  const match = closingDay.match(/^(\d+)日$/);
  return match ? parseInt(match[1], 10) : null;
}

function calculateBillingPeriod(year, month, closingDay) {
  const day = parseClosingDay(closingDay);
  const pad = (n) => String(n).padStart(2, '0');

  if (day === null) {
    const lastDay = new Date(year, month, 0).getDate();
    return { start: `${year}-${pad(month)}-01`, end: `${year}-${pad(month)}-${pad(lastDay)}` };
  }

  const end = `${year}-${pad(month)}-${pad(day)}`;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrev = new Date(prevYear, prevMonth, 0).getDate();
  const startDay = Math.min(day + 1, daysInPrev);
  return { start: `${prevYear}-${pad(prevMonth)}-${pad(startDay)}`, end };
}

export async function listInvoiceCandidates(year, month, { orderRepository, customerRepository }) {
  const [orders, customers] = await Promise.all([
    orderRepository.findAll(),
    customerRepository.findAll()
  ]);

  const customerMap = new Map(customers.map((c) => [c.code, c]));

  return orders.filter((order) => {
    if (order.status !== '承認済み') return false;
    const customer = customerMap.get(order.customerId);
    if (!customer) return false;
    const { start, end } = calculateBillingPeriod(year, month, customer.closingDay);
    const orderDate = order.orderDate ?? '';
    return orderDate >= start && orderDate <= end;
  });
}

// BL-01: 月次売上・原価・粗利の案件別集計
export async function getMonthlySummary(year, month, { invoiceRepository, orderRepository, purchaseOrderRepository }) {
  const [invoices, orders, purchaseOrders] = await Promise.all([
    invoiceRepository.findAll(),
    orderRepository.findAll(),
    purchaseOrderRepository.findAll()
  ]);

  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthlyInvoices = invoices.filter((inv) => (inv.invoiceDate ?? '').startsWith(prefix));
  if (monthlyInvoices.length === 0) return [];

  const orderMap = new Map(orders.map((o) => [o.code, o]));
  const posByOrder = new Map();
  for (const po of purchaseOrders) {
    if (!po.orderCode) continue;
    if (!posByOrder.has(po.orderCode)) posByOrder.set(po.orderCode, []);
    posByOrder.get(po.orderCode).push(po);
  }

  const totals = new Map();
  for (const inv of monthlyInvoices) {
    const order = orderMap.get(inv.orderCode);
    const projectCode = order?.projectCode ?? null;
    const sales = Number(inv.subtotal ?? 0);
    const cost = (posByOrder.get(inv.orderCode) ?? []).reduce((s, po) => s + Number(po.subtotal ?? 0), 0);
    const key = projectCode ?? '__no_project__';
    const entry = totals.get(key) ?? { projectCode, sales: 0, cost: 0 };
    entry.sales += sales;
    entry.cost += cost;
    totals.set(key, entry);
  }

  return Array.from(totals.values()).map((t) => ({ ...t, profit: t.sales - t.cost }));
}
