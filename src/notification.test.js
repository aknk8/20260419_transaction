import { describe, it, expect } from 'vitest';
import { getNotificationsForUser } from './notification.js';

describe('getNotificationsForUser', () => {
  it('should return empty array when notifications is empty', () => {
    // Arrange
    const notifications = [];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return notifications for the given user', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return notifications for other users', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'sales01', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return only notifications for the specified user when mixed recipients exist', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト1' },
      { id: 'NTF-00002', recipientId: 'sales01', type: '承認完了', message: 'テスト2' },
      { id: 'NTF-00003', recipientId: 'admin', type: '差戻し', message: 'テスト3' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(2);
  });

  it('should return notification with correct id', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].id).toBe('NTF-00001');
  });

  it('should return notification with correct type', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].type).toBe('承認依頼');
  });

  it('should return notification with correct message', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: '見積 QUO-00003 の承認依頼があります' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].message).toBe('見積 QUO-00003 の承認依頼があります');
  });

  it('should return notification with isRead field', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト', isRead: false }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].isRead).toBe(false);
  });

  it('should return unread notification', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト', isRead: false },
      { id: 'NTF-00002', recipientId: 'admin', type: '承認完了', message: 'テスト2', isRead: true }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(2);
    expect(result.filter(function(n) { return !n.isRead; })).toHaveLength(1);
  });
});
