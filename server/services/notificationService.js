import {
  createApprovalRequestNotifications,
  createApprovalCompleteNotification,
  createRejectionNotification,
  checkOverdueApprovals
} from '../../src/notification.js';

export function createNotificationService() {
  return {
    async getNotificationsForUser(userId, { repository }) {
      return repository.findByRecipientId(userId);
    },

    async notifyApprovalRequest(docType, docCode, approverIds, { repository }) {
      const notifications = createApprovalRequestNotifications(docType, docCode, approverIds);
      await Promise.all(notifications.map((n) => repository.save(n)));
    },

    async notifyApprovalComplete(docType, docCode, applicantId, { repository }) {
      const notification = createApprovalCompleteNotification(docType, docCode, applicantId);
      return repository.save(notification);
    },

    async notifyRejection(docType, docCode, applicantId, comment, { repository }) {
      const notification = createRejectionNotification(docType, docCode, applicantId, comment);
      return repository.save(notification);
    },

    async markAsRead(id, { repository }) {
      return repository.markAsRead(id);
    },

    async notifyStaleApprovals(staleDays, today, { pendingDocuments, repository }) {
      const stale = checkOverdueApprovals(pendingDocuments, staleDays, today);
      await Promise.all(stale.map((n) => repository.save(n)));
      return stale.length;
    }
  };
}
