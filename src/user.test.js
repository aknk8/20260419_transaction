import { describe, it, expect } from 'vitest';
import {
  createUser,
  findUserById
} from './user.js';

describe('createUser', () => {
  it('should return user object with all fields from formData', () => {
    // Arrange
    const formData = {
      id: 'user01',
      password: 'pass123',
      name: '田中 太郎',
      userType: '一般ユーザ',
      department: '営業部門',
      position: '担当者',
      status: '有効'
    };
    // Act
    const result = createUser(formData);
    // Assert
    expect(result.id).toBe('user01');
    expect(result.password).toBe('pass123');
    expect(result.name).toBe('田中 太郎');
    expect(result.userType).toBe('一般ユーザ');
    expect(result.department).toBe('営業部門');
    expect(result.position).toBe('担当者');
    expect(result.status).toBe('有効');
  });

  it('should set status to 有効 by default when not specified in formData', () => {
    // Arrange
    const formData = {
      id: 'user02',
      password: 'pass123',
      name: '鈴木 花子',
      userType: '一般ユーザ',
      department: '経理部門',
      position: '課長'
    };
    // Act
    const result = createUser(formData);
    // Assert
    expect(result.status).toBe('有効');
  });

  it('should include user-permission:edit in permissions when userType is システム管理者', () => {
    // Arrange
    const formData = {
      id: 'admin02',
      password: 'admin456',
      name: '山田 管理',
      userType: 'システム管理者',
      department: '管理部門',
      position: '部長',
      status: '有効'
    };
    // Act
    const result = createUser(formData);
    // Assert
    expect(result.permissions).toContain('master:edit');
    expect(result.permissions).toContain('user-permission:edit');
  });

  it('should not include user-permission:edit in permissions when userType is 一般ユーザ', () => {
    // Arrange
    const formData = {
      id: 'user03',
      password: 'pass789',
      name: '佐藤 一般',
      userType: '一般ユーザ',
      department: '営業部門',
      position: '担当者',
      status: '有効'
    };
    // Act
    const result = createUser(formData);
    // Assert
    expect(result.permissions).toContain('dashboard:view');
    expect(result.permissions).toContain('master:view');
    expect(result.permissions).not.toContain('user-permission:edit');
    expect(result.permissions).not.toContain('master:edit');
  });

  it('should return permissions as an array', () => {
    // Arrange
    const formData = {
      id: 'user04',
      password: 'pass000',
      name: '中村 サンプル',
      userType: '一般ユーザ',
      department: '購買部門',
      position: '担当者',
      status: '有効'
    };
    // Act
    const result = createUser(formData);
    // Assert
    expect(Array.isArray(result.permissions)).toBe(true);
    expect(result.permissions.length).toBeGreaterThan(0);
  });
});

describe('findUserById', () => {
  it('should return user when id exists in users', () => {
    // Arrange
    const users = [
      { id: 'admin', name: '管理者' },
      { id: 'user01', name: '田中 太郎' }
    ];
    // Act
    const result = findUserById(users, 'admin');
    // Assert
    expect(result).toEqual({ id: 'admin', name: '管理者' });
  });

  it('should return null when id does not exist in users', () => {
    // Arrange
    const users = [{ id: 'admin', name: '管理者' }];
    // Act
    const result = findUserById(users, 'unknown');
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when users array is empty', () => {
    // Arrange
    const users = [];
    // Act
    const result = findUserById(users, 'admin');
    // Assert
    expect(result).toBeNull();
  });
});
