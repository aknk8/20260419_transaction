export function getNotificationsForUser(notifications, userId) {
  return notifications.filter(function(n) { return n.recipientId === userId; });
}
