import { describe, it, expect } from 'vitest';
import {
  generateProjectCode,
  createProject,
  findProjectByCode,
  filterProjectsByName,
  filterProjectsByStatus
} from './project.js';

describe('generateProjectCode', () => {
  it('should return PJ-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];
    // Act
    const result = generateProjectCode(existingCodes);
    // Assert
    expect(result).toBe('PJ-00001');
  });

  it('should return next sequential code after consecutive existing codes', () => {
    // Arrange
    const existingCodes = ['PJ-00001', 'PJ-00002', 'PJ-00003'];
    // Act
    const result = generateProjectCode(existingCodes);
    // Assert
    expect(result).toBe('PJ-00004');
  });

  it('should return next code after the highest existing code when there are gaps', () => {
    // Arrange
    const existingCodes = ['PJ-00001', 'PJ-00005'];
    // Act
    const result = generateProjectCode(existingCodes);
    // Assert
    expect(result).toBe('PJ-00006');
  });

  it('should pad the number to 5 digits', () => {
    // Arrange
    const existingCodes = ['PJ-00009'];
    // Act
    const result = generateProjectCode(existingCodes);
    // Assert
    expect(result).toBe('PJ-00010');
  });

  it('should ignore codes with non-matching format', () => {
    // Arrange
    const existingCodes = ['INVALID', 'PJ-00003'];
    // Act
    const result = generateProjectCode(existingCodes);
    // Assert
    expect(result).toBe('PJ-00004');
  });
});

describe('createProject', () => {
  it('should return project object with all fields from formData', () => {
    // Arrange
    const formData = {
      code: 'PJ-00001',
      name: '新規保守案件',
      customerId: 'CUS-001',
      department: '営業部門',
      status: '商談中',
      startDate: '2026-05-01',
      dueDate: '2026-05-31',
      description: '初期提案フェーズ'
    };
    // Act
    const result = createProject(formData);
    // Assert
    expect(result).toEqual({
      code: 'PJ-00001',
      name: '新規保守案件',
      customerId: 'CUS-001',
      department: '営業部門',
      status: '商談中',
      startDate: '2026-05-01',
      dueDate: '2026-05-31',
      description: '初期提案フェーズ'
    });
  });

  it('should allow empty optional fields', () => {
    // Arrange
    const formData = {
      code: 'PJ-00002',
      name: 'テスト案件',
      customerId: 'CUS-002',
      department: '購買部門',
      status: '商談中',
      startDate: '',
      dueDate: '',
      description: ''
    };
    // Act
    const result = createProject(formData);
    // Assert
    expect(result.startDate).toBe('');
    expect(result.dueDate).toBe('');
    expect(result.description).toBe('');
  });
});

describe('findProjectByCode', () => {
  it('should return project when code exists in projects', () => {
    // Arrange
    const projects = [
      { code: 'PJ-00001', name: '新規保守案件' },
      { code: 'PJ-00002', name: 'B社機器更新' }
    ];
    // Act
    const result = findProjectByCode(projects, 'PJ-00001');
    // Assert
    expect(result).toEqual({ code: 'PJ-00001', name: '新規保守案件' });
  });

  it('should return null when code does not exist in projects', () => {
    // Arrange
    const projects = [{ code: 'PJ-00001', name: '新規保守案件' }];
    // Act
    const result = findProjectByCode(projects, 'PJ-99999');
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when projects array is empty', () => {
    // Arrange
    const projects = [];
    // Act
    const result = findProjectByCode(projects, 'PJ-00001');
    // Assert
    expect(result).toBeNull();
  });
});

describe('filterProjectsByName', () => {
  const projects = [
    { code: 'PJ-00001', name: '新規保守案件', customerId: 'CUS-001' },
    { code: 'PJ-00002', name: 'B社機器更新', customerId: 'CUS-002' },
    { code: 'PJ-00003', name: 'C社定例運用', customerId: 'CUS-003' }
  ];

  it('should return all projects when keyword is empty string', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, '');
    // Assert
    expect(result).toHaveLength(3);
  });

  it('should return all projects when keyword is whitespace only', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, '   ');
    // Assert
    expect(result).toHaveLength(3);
  });

  it('should return all projects when keyword is null', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, null);
    // Assert
    expect(result).toHaveLength(3);
  });

  it('should return matching projects when keyword matches project name', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, '保守');
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('PJ-00001');
  });

  it('should return matching projects when keyword matches project code', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, 'PJ-00002');
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('B社機器更新');
  });

  it('should return multiple matching projects when keyword matches more than one', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, '社');
    // Assert
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no projects match keyword', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, 'zzz不一致');
    // Assert
    expect(result).toHaveLength(0);
  });

  it('should match case-insensitively', () => {
    // Arrange & Act
    const result = filterProjectsByName(projects, 'pj-00001');
    // Assert
    expect(result).toHaveLength(1);
  });
});

describe('filterProjectsByStatus', () => {
  const projects = [
    { code: 'PJ-00001', name: '案件A', status: '商談中' },
    { code: 'PJ-00002', name: '案件B', status: '進行中' },
    { code: 'PJ-00003', name: '案件C', status: '商談中' },
    { code: 'PJ-00004', name: '案件D', status: '完了' },
    { code: 'PJ-00005', name: '案件E', status: '中止' }
  ];

  it('should return only projects with matching status when single status given', () => {
    // Arrange & Act
    const result = filterProjectsByStatus(projects, ['商談中']);
    // Assert
    expect(result).toHaveLength(2);
    expect(result.every(function (p) { return p.status === '商談中'; })).toBe(true);
  });

  it('should return projects matching any of multiple statuses', () => {
    // Arrange & Act
    const result = filterProjectsByStatus(projects, ['商談中', '進行中']);
    // Assert
    expect(result).toHaveLength(3);
  });

  it('should return all projects when statuses array is empty', () => {
    // Arrange & Act
    const result = filterProjectsByStatus(projects, []);
    // Assert
    expect(result).toHaveLength(5);
  });

  it('should return all projects when statuses is null', () => {
    // Arrange & Act
    const result = filterProjectsByStatus(projects, null);
    // Assert
    expect(result).toHaveLength(5);
  });

  it('should return empty array when no projects match the status', () => {
    // Arrange & Act
    const result = filterProjectsByStatus(projects, ['承認待ち']);
    // Assert
    expect(result).toHaveLength(0);
  });
});
