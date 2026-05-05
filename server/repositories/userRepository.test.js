import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserRepository } from './userRepository.js';

const makeUser = (overrides = {}) => ({
  id: 'user01',
  name: '田中 太郎',
  passwordHash: '$2b$10$hash',
  userType: '営業',
  department: '営業部',
  position: '主任',
  status: '有効',
  ...overrides
});

describe('userRepository.findByUsername', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: {
        users: { findFirst: vi.fn() }
      }
    };
  });

  it('should return user when found', async () => {
    // Arrange
    const user = makeUser();
    mockDb.query.users.findFirst.mockResolvedValue(user);
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findByUsername('user01');

    // Assert
    expect(result).toEqual(user);
  });

  it('should return null when user not found', async () => {
    // Arrange
    mockDb.query.users.findFirst.mockResolvedValue(undefined);
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findByUsername('unknown');

    // Assert
    expect(result).toBeNull();
  });

  it('should query by the given username', async () => {
    // Arrange
    mockDb.query.users.findFirst.mockResolvedValue(makeUser());
    const repo = createUserRepository(mockDb);

    // Act
    await repo.findByUsername('user01');

    // Assert — findFirst was called once
    expect(mockDb.query.users.findFirst).toHaveBeenCalledOnce();
  });

  it('should return user with id field', async () => {
    // Arrange
    mockDb.query.users.findFirst.mockResolvedValue(makeUser({ id: 'user01' }));
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findByUsername('user01');

    // Assert
    expect(result.id).toBe('user01');
  });

  it('should return user with passwordHash field', async () => {
    // Arrange
    mockDb.query.users.findFirst.mockResolvedValue(makeUser({ passwordHash: '$2b$10$hash' }));
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findByUsername('user01');

    // Assert
    expect(result.passwordHash).toBe('$2b$10$hash');
  });

  it('should return user with userType field', async () => {
    // Arrange
    mockDb.query.users.findFirst.mockResolvedValue(makeUser({ userType: '管理者' }));
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findByUsername('user01');

    // Assert
    expect(result.userType).toBe('管理者');
  });
});

describe('userRepository.findById', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: {
        users: { findFirst: vi.fn() }
      }
    };
  });

  it('should return user when id matches', async () => {
    // Arrange
    const user = makeUser();
    mockDb.query.users.findFirst.mockResolvedValue(user);
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findById('user01');

    // Assert
    expect(result).toEqual(user);
  });

  it('should return null when id not found', async () => {
    // Arrange
    mockDb.query.users.findFirst.mockResolvedValue(undefined);
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findById('nonexistent');

    // Assert
    expect(result).toBeNull();
  });
});

describe('userRepository.findAll', () => {
  it('should return all users', async () => {
    // Arrange
    const user = makeUser();
    const mockDb = {
      query: { users: { findMany: vi.fn().mockResolvedValue([user]) } }
    };
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.findAll();

    // Assert
    expect(result).toEqual([user]);
    expect(mockDb.query.users.findMany).toHaveBeenCalledOnce();
  });
});

describe('userRepository.save', () => {
  it('should insert user and return saved record', async () => {
    // Arrange
    const user = makeUser();
    const mockDb = {
      query: { users: { findMany: vi.fn(), findFirst: vi.fn() } },
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([user]) })
      })
    };
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.save(user);

    // Assert
    expect(result).toEqual(user);
    expect(mockDb.insert).toHaveBeenCalledOnce();
  });
});

describe('userRepository.update', () => {
  it('should update user and return updated record', async () => {
    // Arrange
    const user = makeUser();
    const mockDb = {
      query: { users: { findFirst: vi.fn() } },
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([user]) })
        })
      })
    };
    const repo = createUserRepository(mockDb);

    // Act
    const result = await repo.update('user01', { name: '変更後' });

    // Assert
    expect(result).toEqual(user);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });
});
