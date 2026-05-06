import cron from 'node-cron';
import { createNotificationService } from '../services/notificationService.js';

const PENDING_STATUS = '承認依頼中';
// 平日9:00 JST: cron expression in Asia/Tokyo timezone
const WEEKDAY_9AM_JST = '0 9 * * 1-5';

export function createStaleApprovalJob({
  quotationRepository,
  orderRepository,
  purchaseOrderRepository,
  invoiceRepository,
  notificationRepository,
  staleDays = 3
}) {
  const notificationService = createNotificationService();

  async function run(today = new Date().toISOString().slice(0, 10)) {
    const [quotations, orders, purchaseOrders, invoices] = await Promise.all([
      quotationRepository.findAll(),
      orderRepository.findAll(),
      purchaseOrderRepository.findAll(),
      invoiceRepository.findAll()
    ]);

    const pendingDocuments = [];

    quotations
      .filter((q) => q.status === PENDING_STATUS)
      .forEach((q) => pendingDocuments.push({
        code: q.code, docType: 'quotation',
        submittedAt: q.submittedAt || q.updatedAt, submittedBy: q.submittedBy
      }));

    orders
      .filter((o) => o.status === PENDING_STATUS)
      .forEach((o) => pendingDocuments.push({
        code: o.code, docType: 'order',
        submittedAt: o.submittedAt || o.updatedAt, submittedBy: o.submittedBy
      }));

    purchaseOrders
      .filter((po) => po.status === PENDING_STATUS)
      .forEach((po) => pendingDocuments.push({
        code: po.code, docType: 'purchaseOrder',
        submittedAt: po.submittedAt || po.updatedAt, submittedBy: po.submittedBy
      }));

    invoices
      .filter((inv) => inv.status === PENDING_STATUS)
      .forEach((inv) => pendingDocuments.push({
        code: inv.code, docType: 'invoice',
        submittedAt: inv.submittedAt || inv.updatedAt, submittedBy: inv.submittedBy
      }));

    return notificationService.notifyStaleApprovals(staleDays, today, {
      pendingDocuments,
      repository: notificationRepository
    });
  }

  function start() {
    const task = cron.schedule(WEEKDAY_9AM_JST, () => {
      run().catch((err) => console.error('[staleApprovalJob] run failed:', err.message));
    }, { timezone: 'Asia/Tokyo' });
    return task;
  }

  return { run, start };
}
