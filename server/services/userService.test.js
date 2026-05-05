import { describe, it, expect, vi } from 'vitest';
import {
  listUsers,
  getUserById,
  registerUser,
  updateUser
} from './userService.js';

const storedUser = {
  id: 'user01',
  name: '田中 太郎',
  passwordHash: '$2b$10$hashedvalue',
  userType: '営業',
  department: '営業部',
  position: '担当者',
  status: '有効'
};

// passwordHash を含まない公開フィールド
const publicUser = {
  id: 'user01',
  name: '田中 太郎',
  userType: '営業',
  department: '営業部',
  position: '担当者',
  status: '有効'
};

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([storedUser]),
  findById: vi.fn().mockResolvedValue(storedUser),
  save: vi.fn().mockResolvedValue(storedUser),
  update: vi.fn().mockImplementation(async (id, data) => ({ ...storedUser, ...data })),
  ...overrides
});

const mockHashPassword = vi.fn().mockResolvedValue('$2b$10$hashedvalue');

describe('listUsers', () => {
  it('should return all users without passwordHash', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listUsers({ repository });

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].passwordHash).toBeUndefined();
    expect(result[0].id).toBe('user01');
  });
});

describe('getUserById', () => {
  it('should return user without passwordHash when id exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getUserById('user01', { repository });

    // Assert
    expect(result.passwordHash).toBeUndefined();
    expect(result.id).toBe('user01');
    expect(repository.findById).toHaveBeenCalledWith('user01');
  });

  it('should throw 404 error when id does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findById: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getUserById('unknown', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerUser', () => {
  it('should hash password and save user', async () => {
    // Arrange
    const repository = makeRepo({ save: vi.fn().mockResolvedValue(storedUser) });
    const formData = {
      id: 'user01',
      name: '田中 太郎',
      password: 'plaintext',
      userType: '営業',
      department: '営業部',
      position: '担当者',
      status: '有効'
    };

    // Act
    const result = await registerUser(formData, { repository, hashPassword: mockHashPassword });

    // Assert
    expect(mockHashPassword).toHaveBeenCalledWith('plaintext');
    expect(repository.save).toHaveBeenCalledOnce();
    const savedArg = repository.save.mock.calls[0][0];
    expect(savedArg.passwordHash).toBe('$2b$10$hashedvalue');
    expect(savedArg.password).toBeUndefined();
  });

  it('should return user without passwordHash', async () => {
    // Arrange
    const repository = makeRepo({ save: vi.fn().mockResolvedValue(storedUser) });

    // Act
    const result = await registerUser(
      { id: 'user01', name: '田中 太郎', password: 'pass', userType: '営業', status: '有効' },
      { repository, hashPassword: mockHashPassword }
    );

    // Assert
    expect(result.passwordHash).toBeUndefined();
  });

  it('should throw validation error when id is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerUser({ name: '田中', password: 'pass', userType: '営業' }, { repository, hashPassword: mockHashPassword }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw validation error when name is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerUser({ id: 'u1', password: 'pass', userType: '営業' }, { repository, hashPassword: mockHashPassword }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw validation error when password is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerUser({ id: 'u1', name: '田中', userType: '営業' }, { repository, hashPassword: mockHashPassword }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('updateUser', () => {
  it('should update user and return result without passwordHash', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockResolvedValue({ ...storedUser, name: '変更後' })
    });

    // Act
    const result = await updateUser('user01', { name: '変更後' }, { repository, hashPassword: mockHashPassword });

    // Assert
    expect(result.name).toBe('変更後');
    expect(result.passwordHash).toBeUndefined();
  });

  it('should re-hash password when password field is provided', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockResolvedValue(storedUser)
    });

    // Act
    await updateUser('user01', { password: 'newpass' }, { repository, hashPassword: mockHashPassword });

    // Assert
    expect(mockHashPassword).toHaveBeenCalledWith('newpass');
    const updateArg = repository.update.mock.calls[0][1];
    expect(updateArg.passwordHash).toBe('$2b$10$hashedvalue');
    expect(updateArg.password).toBeUndefined();
  });

  it('should throw 404 error when updating non-existent user', async () => {
    // Arrange
    const repository = makeRepo({ findById: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(updateUser('unknown', { name: 'X' }, { repository, hashPassword: mockHashPassword }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
