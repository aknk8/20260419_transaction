import { describe, it, expect } from 'vitest';
import { getPermissionsForUserType } from './permissionService.js';

describe('getPermissionsForUserType', () => {
  it('should return all permissions when userType is システム管理者', () => {
    // Arrange & Act
    const permissions = getPermissionsForUserType('システム管理者');

    // Assert
    expect(permissions).toContain('master:edit');
    expect(permissions).toContain('approval:act');
    expect(permissions).toContain('payment:edit');
    expect(permissions).toContain('user-permission:edit');
  });

  it('should include approval:apply for システム管理者', () => {
    // Arrange & Act
    const permissions = getPermissionsForUserType('システム管理者');

    // Assert
    expect(permissions).toContain('approval:apply');
  });

  it('should return default permissions for unknown userType', () => {
    // Arrange & Act
    const permissions = getPermissionsForUserType('一般ユーザ');

    // Assert
    expect(permissions).toContain('approval:apply');
    expect(permissions).not.toContain('master:edit');
    expect(permissions).not.toContain('approval:act');
  });

  it('should return default permissions when userType is undefined', () => {
    // Arrange & Act
    const permissions = getPermissionsForUserType(undefined);

    // Assert
    expect(Array.isArray(permissions)).toBe(true);
    expect(permissions.length).toBeGreaterThan(0);
  });

  it('should not include payment:edit in default permissions', () => {
    // Arrange & Act
    const permissions = getPermissionsForUserType('一般ユーザ');

    // Assert
    expect(permissions).not.toContain('payment:edit');
  });

  it('should not include user-permission:edit in default permissions', () => {
    // Arrange & Act
    const permissions = getPermissionsForUserType('一般ユーザ');

    // Assert
    expect(permissions).not.toContain('user-permission:edit');
  });
});
