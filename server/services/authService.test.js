import { describe, it, expect, vi } from 'vitest';
import { authenticate } from './authService.js';

describe('authenticate', () => {
  const validUser = {
    id: 'user01',
    name: '田中 太郎',
    userType: '営業',
    passwordHash: '$2b$10$hashedpassword'
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
