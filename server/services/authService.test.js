import { describe, it, expect, vi } from 'vitest';
import { authenticate, getPermissionsForUserType } from './authService.js';

describe('getPermissionsForUserType', () => {
  it('should return full permission set for システム管理者', () => {
    // Act
    const perms = getPermissionsForUserType('システム管理者');

    // Assert
    expect(perms).toContain('master:edit');
    expect(perms).toContain('user-permission:edit');
    expect(perms).toContain('approval:act');
    expect(perms).toContain('approval:apply');
    expect(perms).toContain('payment:edit');
  });

  it('should return approval:apply for non-admin users', () => {
    // Act
    const perms = getPermissionsForUserType('一般ユーザ');

    // Assert
    expect(perms).toContain('approval:apply');
  });

  it('should not include master:edit for non-admin users', () => {
    // Act
    const perms = getPermissionsForUserType('一般ユーザ');

    // Assert
    expect(perms).not.toContain('master:edit');
  });

  it('should not include user-permission:edit for non-admin users', () => {
    // Act
    const perms = getPermissionsForUserType('一般ユーザ');

    // Assert
    expect(perms).not.toContain('user-permission:edit');
  });

  it('should return an array for unknown userType', () => {
    // Act
    const perms = getPermissionsForUserType('未知の種別');

    // Assert
    expect(Array.isArray(perms)).toBe(true);
  });
});

describe('authenticate - permissions', () => {
  const validUser = {
    id: 'user01',
    name: '田中 太郎',
    userType: 'システム管理者',
    status: '有効',
    passwordHash: '$2b$10$hashedpassword',
    failedLoginCount: 0,
    lockedUntil: null
  };

  it('should include permissions in result based on userType', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    const result = await authenticate('user01', 'pass', { findUser, comparePassword });

    // Assert
    expect(Array.isArray(result.permissions)).toBe(true);
    expect(result.permissions).toContain('master:edit');
  });

  it('should include basic permissions for non-admin user', async () => {
    // Arrange
    const user = { ...validUser, userType: '一般ユーザ' };
    const findUser = vi.fn().mockResolvedValue(user);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    const result = await authenticate('user01', 'pass', { findUser, comparePassword });

    // Assert
    expect(result.permissions).toContain('approval:apply');
    expect(result.permissions).not.toContain('master:edit');
  });
});

describe('authenticate', () => {
  const validUser = {
    id: 'user01',
    name: '田中 太郎',
    userType: '営業',
    status: '有効',
    passwordHash: '$2b$10$hashedpassword',
    failedLoginCount: 0,
    lockedUntil: null
  };

  it('should throw when user is not found', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(null);
    const comparePassword = vi.fn();

    // Act & Assert
    await expect(authenticate('unknown', 'pass', { findUser, comparePassword }))
      .rejects.toThrow();
  });

  it('should throw when password is incorrect', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(false);

    // Act & Assert
    await expect(authenticate('user01', 'wrongpass', { findUser, comparePassword }))
      .rejects.toThrow();
  });

  it('should return user data when credentials are valid', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    const result = await authenticate('user01', 'correctpass', { findUser, comparePassword });

    // Assert
    expect(result).toBeDefined();
  });

  it('should return id in result', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    const result = await authenticate('user01', 'correctpass', { findUser, comparePassword });

    // Assert
    expect(result.id).toBe('user01');
  });

  it('should return name in result', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    const result = await authenticate('user01', 'correctpass', { findUser, comparePassword });

    // Assert
    expect(result.name).toBe('田中 太郎');
  });

  it('should return userType in result', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    const result = await authenticate('user01', 'correctpass', { findUser, comparePassword });

    // Assert
    expect(result.userType).toBe('営業');
  });

  it('should not return passwordHash in result', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    const result = await authenticate('user01', 'correctpass', { findUser, comparePassword });

    // Assert
    expect(result.passwordHash).toBeUndefined();
  });

  it('should call findUser with the provided username', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    await authenticate('user01', 'correctpass', { findUser, comparePassword });

    // Assert
    expect(findUser).toHaveBeenCalledWith('user01');
  });

  it('should call comparePassword with plain password and stored hash', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(validUser);
    const comparePassword = vi.fn().mockResolvedValue(true);

    // Act
    await authenticate('user01', 'correctpass', { findUser, comparePassword });

    // Assert
    expect(comparePassword).toHaveBeenCalledWith('correctpass', validUser.passwordHash);
  });
});

describe('authenticate - account lock', () => {
  const lockedUser = {
    id: 'user01',
    name: '田中 太郎',
    userType: '営業',
    status: '有効',
    passwordHash: '$2b$10$hashedpassword',
    failedLoginCount: 5,
    lockedUntil: new Date(Date.now() + 30 * 60 * 1000)
  };

  const activeUser = {
    id: 'user01',
    name: '田中 太郎',
    userType: '営業',
    status: '有効',
    passwordHash: '$2b$10$hashedpassword',
    failedLoginCount: 0,
    lockedUntil: null
  };

  it('should throw when account is locked', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(lockedUser);
    const comparePassword = vi.fn();
    const updateLoginState = vi.fn();

    // Act & Assert
    await expect(authenticate('user01', 'pass', { findUser, comparePassword, updateLoginState }))
      .rejects.toThrow();
  });

  it('should not reveal lock reason in error message', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(lockedUser);
    const comparePassword = vi.fn();
    const updateLoginState = vi.fn();

    // Act & Assert
    await expect(authenticate('user01', 'pass', { findUser, comparePassword, updateLoginState }))
      .rejects.toThrow('ユーザ名またはパスワードが正しくありません');
  });

  it('should unlock and authenticate when lockedUntil is in the past', async () => {
    // Arrange
    const expiredLockUser = {
      ...lockedUser,
      lockedUntil: new Date(Date.now() - 1000)
    };
    const findUser = vi.fn().mockResolvedValue(expiredLockUser);
    const comparePassword = vi.fn().mockResolvedValue(true);
    const updateLoginState = vi.fn().mockResolvedValue(undefined);

    // Act
    const result = await authenticate('user01', 'correctpass', { findUser, comparePassword, updateLoginState });

    // Assert
    expect(result.id).toBe('user01');
  });

  it('should reset counter on successful login', async () => {
    // Arrange
    const userWithFailures = { ...activeUser, failedLoginCount: 3 };
    const findUser = vi.fn().mockResolvedValue(userWithFailures);
    const comparePassword = vi.fn().mockResolvedValue(true);
    const updateLoginState = vi.fn().mockResolvedValue(undefined);

    // Act
    await authenticate('user01', 'correctpass', { findUser, comparePassword, updateLoginState });

    // Assert
    expect(updateLoginState).toHaveBeenCalledWith('user01', { failedLoginCount: 0, lockedUntil: null });
  });

  it('should increment failure count on wrong password', async () => {
    // Arrange
    const findUser = vi.fn().mockResolvedValue(activeUser);
    const comparePassword = vi.fn().mockResolvedValue(false);
    const updateLoginState = vi.fn().mockResolvedValue(undefined);

    // Act
    try { await authenticate('user01', 'wrong', { findUser, comparePassword, updateLoginState }); } catch { /* expected */ }

    // Assert
    expect(updateLoginState).toHaveBeenCalledWith('user01', expect.objectContaining({ failedLoginCount: 1 }));
  });

  it('should lock account after 5 consecutive failures', async () => {
    // Arrange
    const userWith4Failures = { ...activeUser, failedLoginCount: 4 };
    const findUser = vi.fn().mockResolvedValue(userWith4Failures);
    const comparePassword = vi.fn().mockResolvedValue(false);
    const updateLoginState = vi.fn().mockResolvedValue(undefined);

    // Act
    try { await authenticate('user01', 'wrong', { findUser, comparePassword, updateLoginState }); } catch { /* expected */ }

    // Assert
    const callArg = updateLoginState.mock.calls[0][1];
    expect(callArg.failedLoginCount).toBe(5);
    expect(callArg.lockedUntil).toBeInstanceOf(Date);
    expect(callArg.lockedUntil.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('authenticate - disabled user', () => {
  it('should throw when user status is not 有効', async () => {
    // Arrange
    const disabledUser = {
      id: 'user01',
      name: '田中 太郎',
      userType: '営業',
      status: '無効',
      passwordHash: '$2b$10$hashedpassword',
      failedLoginCount: 0,
      lockedUntil: null
    };
    const findUser = vi.fn().mockResolvedValue(disabledUser);
    const comparePassword = vi.fn();
    const updateLoginState = vi.fn();

    // Act & Assert
    await expect(authenticate('user01', 'pass', { findUser, comparePassword, updateLoginState }))
      .rejects.toThrow();
  });

  it('should use generic error message for disabled user', async () => {
    // Arrange
    const disabledUser = {
      id: 'user01',
      name: '田中 太郎',
      userType: '営業',
      status: '停止',
      passwordHash: '$2b$10$hashedpassword',
      failedLoginCount: 0,
      lockedUntil: null
    };
    const findUser = vi.fn().mockResolvedValue(disabledUser);
    const comparePassword = vi.fn();
    const updateLoginState = vi.fn();

    // Act & Assert
    await expect(authenticate('user01', 'pass', { findUser, comparePassword, updateLoginState }))
      .rejects.toThrow('ユーザ名またはパスワードが正しくありません');
  });
});
