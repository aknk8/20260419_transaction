const PENDING = '承認依頼中';

const CODE_PREFIX_MAP = {
  QUO: 'quotation',
  ORD: 'order',
  POD: 'purchaseOrder',
  INV: 'invoice',
  PAY: 'payment'
};

const DOC_TYPE_LABEL = {
  quotation: '見積',
  order: '受注',
  purchaseOrder: '発注',
  invoice: '請求',
  payment: '支払依頼'
};

function resolveDocType(code) {
  const prefix = (code ?? '').split('-')[0];
  return CODE_PREFIX_MAP[prefix] ?? null;
}

function unknownCode(code) {
  const err = new Error(`伝票コード ${code} の種別を特定できません`);
  err.statusCode = 400;
  return err;
}

export async function listPendingApprovals(docTypeFilter, { quotationService, orderService, purchaseOrderService, invoiceService, paymentService }) {
  const [quotations, orders, purchaseOrders, invoices, payments] = await Promise.all([
    quotationService.listQuotations(),
    orderService.listOrders(),
    purchaseOrderService.listPurchaseOrders(),
    invoiceService.listInvoices(),
    paymentService.listPayments()
  ]);

  const tagged = [
    ...quotations.map((q) => ({ ...q, docType: 'quotation' })),
    ...orders.map((o) => ({ ...o, docType: 'order' })),
    ...purchaseOrders.map((po) => ({ ...po, docType: 'purchaseOrder' })),
    ...invoices.map((inv) => ({ ...inv, docType: 'invoice' })),
    ...payments.map((p) => ({ ...p, docType: 'payment' }))
  ].filter((d) => d.status === PENDING);

  if (docTypeFilter) return tagged.filter((d) => d.docType === docTypeFilter);
  return tagged;
}

export async function approveDocument(code, comment, services) {
  const docType = resolveDocType(code);
  if (!docType) throw unknownCode(code);

  const approvers = {
    quotation: () => services.quotationService.approveQuotation(code, comment),
    order: () => services.orderService.approveOrder(code, comment),
    purchaseOrder: () => services.purchaseOrderService.approvePurchaseOrder(code, comment),
    invoice: () => services.invoiceService.approveInvoice(code, comment),
    payment: () => services.paymentService.approvePayment(code, comment)
  };

  const result = await approvers[docType]();

  // INF-10: atomically record approval history
  if (services.approvalHistoryRepository) {
    await services.approvalHistoryRepository.save({
      documentType: docType,
      documentId: code,
      stepNumber: 1,
      action: '承認',
      comment: comment ?? null
    });
  }

  // INF-10: atomically notify the applicant
  if (services.notificationRepository && result.submittedBy) {
    const label = DOC_TYPE_LABEL[docType] ?? docType;
    await services.notificationRepository.save({
      type: 'N-02',
      recipientId: result.submittedBy,
      docType: label,
      docCode: code,
      message: `${label} ${code} が承認されました`,
      isRead: false
    });
  }

  return result;
}

export async function rejectDocument(code, reason, services) {
  const docType = resolveDocType(code);
  if (!docType) throw unknownCode(code);

  if (!reason) {
    const err = new Error('却下理由は必須です');
    err.statusCode = 400;
    throw err;
  }

  const rejecters = {
    quotation: () => services.quotationService.rejectQuotation(code, reason),
    order: () => services.orderService.rejectOrder(code, reason),
    purchaseOrder: () => services.purchaseOrderService.rejectPurchaseOrder(code, reason),
    invoice: () => services.invoiceService.rejectInvoice(code, reason),
    payment: () => services.paymentService.rejectPayment(code, reason)
  };

  const result = await rejecters[docType]();

  // INF-10: atomically record rejection history
  if (services.approvalHistoryRepository) {
    await services.approvalHistoryRepository.save({
      documentType: docType,
      documentId: code,
      stepNumber: 1,
      action: '却下',
      comment: reason
    });
  }

  // INF-10: atomically notify the applicant of rejection
  if (services.notificationRepository && result.submittedBy) {
    const label = DOC_TYPE_LABEL[docType] ?? docType;
    await services.notificationRepository.save({
      type: 'N-03',
      recipientId: result.submittedBy,
      docType: label,
      docCode: code,
      message: `${label} ${code} が却下されました：${reason}`,
      isRead: false
    });
  }

  return result;
}
