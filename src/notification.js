export function getNotificationsForUser(notifications, userId) {
  return notifications.filter(function(n) { return n.recipientId === userId; });
}

export function createApprovalRequestNotifications(docType, docCode, approverIds) {
  return approverIds.map(function(approverId) {
    return {
      type: 'N-01',
      recipientId: approverId,
      docType: docType,
      docCode: docCode,
      message: docType + ' ' + docCode + ' の承認依頼があります',
      isRead: false
    };
  });
}

export function createApprovalCompleteNotification(docType, docCode, applicantId) {
  return {
    type: 'N-02',
    recipientId: applicantId,
    docType: docType,
    docCode: docCode,
    message: docType + ' ' + docCode + ' が承認されました',
    isRead: false
  };
}

export function createRejectionNotification(docType, docCode, applicantId, rejectComment) {
  return {
    type: 'N-03',
    recipientId: applicantId,
    docType: docType,
    docCode: docCode,
    message: docType + ' ' + docCode + ' が却下されました。理由：' + rejectComment,
    isRead: false
  };
}

export function checkOverdueApprovals(pendingApprovals, stalenessDays, today) {
  var todayMs = new Date(today).getTime();
  return pendingApprovals
    .filter(function(item) {
      if (!item.submittedAt) return false;
      var submittedMs = new Date(item.submittedAt).getTime();
      var diffDays = Math.floor((todayMs - submittedMs) / (1000 * 60 * 60 * 24));
      return diffDays >= stalenessDays;
    })
    .map(function(item) {
      return {
        type: 'N-04',
        recipientId: item.submittedBy,
        docType: item.docType,
        docCode: item.code,
        message: item.code + ' の承認が ' + stalenessDays + ' 日以上滞留しています',
        isRead: false
      };
    });
}

export function createInvoiceDueNotifications(invoices, today) {
  return invoices
    .filter(function(inv) { return inv.dueDate === today; })
    .map(function(inv) {
      return {
        type: 'N-05',
        recipientId: inv.createdBy,
        docType: '請求',
        docCode: inv.code,
        message: '請求 ' + inv.code + ' の支払期日が本日です',
        isRead: false
      };
    });
}

export function createDeliveryDueNotifications(purchaseOrders, today) {
  return purchaseOrders
    .filter(function(po) { return po.deliveryDate === today; })
    .map(function(po) {
      return {
        type: 'N-06',
        recipientId: po.createdBy,
        docType: '発注',
        docCode: po.code,
        message: '発注 ' + po.code + ' の納品予定日が本日です',
        isRead: false
      };
    });
}
