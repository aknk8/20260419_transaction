import { describe, it, expect } from 'vitest';
import {
  buildApprovalRoute,
  getRoutesByDocumentType,
  addRouteStep,
  removeRouteStep,
  updateRouteStep
} from './approvalRoute.js';

describe('buildApprovalRoute', () => {
  it('should return object with documentType when provided', () => {
    const result = buildApprovalRoute('quotation', 1, 'user-001');
    expect(result.documentType).toBe('quotation');
  });

  it('should return object with stepNumber when provided', () => {
    const result = buildApprovalRoute('quotation', 1, 'user-001');
    expect(result.stepNumber).toBe(1);
  });

  it('should return object with approverUserId when provided', () => {
    const result = buildApprovalRoute('quotation', 1, 'user-001');
    expect(result.approverUserId).toBe('user-001');
  });
});

describe('getRoutesByDocumentType', () => {
  const routes = [
    { documentType: 'quotation', stepNumber: 2, approverUserId: 'user-002' },
    { documentType: 'order', stepNumber: 1, approverUserId: 'user-003' },
    { documentType: 'quotation', stepNumber: 1, approverUserId: 'user-001' }
  ];

  it('should return only routes matching documentType', () => {
    const result = getRoutesByDocumentType(routes, 'quotation');
    expect(result.every(r => r.documentType === 'quotation')).toBe(true);
  });

  it('should return correct count for documentType', () => {
    const result = getRoutesByDocumentType(routes, 'quotation');
    expect(result.length).toBe(2);
  });

  it('should return routes sorted by stepNumber ascending', () => {
    const result = getRoutesByDocumentType(routes, 'quotation');
    expect(result[0].stepNumber).toBe(1);
    expect(result[1].stepNumber).toBe(2);
  });

  it('should return empty array when no routes match documentType', () => {
    const result = getRoutesByDocumentType(routes, 'invoice');
    expect(result).toEqual([]);
  });

  it('should not mutate the original routes array', () => {
    const original = [...routes];
    getRoutesByDocumentType(routes, 'quotation');
    expect(routes).toEqual(original);
  });
});

describe('addRouteStep', () => {
  it('should add route with stepNumber 1 when no steps exist for documentType', () => {
    const routes = [];
    const result = addRouteStep(routes, 'quotation', 'user-001');
    expect(result.length).toBe(1);
    expect(result[0].stepNumber).toBe(1);
    expect(result[0].documentType).toBe('quotation');
    expect(result[0].approverUserId).toBe('user-001');
  });

  it('should add route with stepNumber incremented from max existing step', () => {
    const routes = [
      { documentType: 'quotation', stepNumber: 1, approverUserId: 'user-001' }
    ];
    const result = addRouteStep(routes, 'quotation', 'user-002');
    const newStep = result.find(r => r.approverUserId === 'user-002');
    expect(newStep.stepNumber).toBe(2);
  });

  it('should not affect routes of other document types', () => {
    const routes = [
      { documentType: 'order', stepNumber: 1, approverUserId: 'user-003' }
    ];
    const result = addRouteStep(routes, 'quotation', 'user-001');
    const orderRoutes = result.filter(r => r.documentType === 'order');
    expect(orderRoutes.length).toBe(1);
  });

  it('should not mutate the original routes array', () => {
    const routes = [];
    addRouteStep(routes, 'quotation', 'user-001');
    expect(routes.length).toBe(0);
  });
});

describe('removeRouteStep', () => {
  const routes = [
    { documentType: 'quotation', stepNumber: 1, approverUserId: 'user-001' },
    { documentType: 'quotation', stepNumber: 2, approverUserId: 'user-002' },
    { documentType: 'order', stepNumber: 1, approverUserId: 'user-003' }
  ];

  it('should remove the matching route step', () => {
    const result = removeRouteStep(routes, 'quotation', 1);
    const removed = result.find(r => r.documentType === 'quotation' && r.stepNumber === 1);
    expect(removed).toBeUndefined();
  });

  it('should keep other steps of same document type', () => {
    const result = removeRouteStep(routes, 'quotation', 1);
    const step2 = result.find(r => r.documentType === 'quotation' && r.stepNumber === 2);
    expect(step2).toBeDefined();
  });

  it('should not affect routes of other document types', () => {
    const result = removeRouteStep(routes, 'quotation', 1);
    const orderRoutes = result.filter(r => r.documentType === 'order');
    expect(orderRoutes.length).toBe(1);
  });

  it('should not mutate the original routes array', () => {
    const original = routes.length;
    removeRouteStep(routes, 'quotation', 1);
    expect(routes.length).toBe(original);
  });
});

describe('updateRouteStep', () => {
  const routes = [
    { documentType: 'quotation', stepNumber: 1, approverUserId: 'user-001' },
    { documentType: 'quotation', stepNumber: 2, approverUserId: 'user-002' }
  ];

  it('should update approverUserId for matching step', () => {
    const result = updateRouteStep(routes, 'quotation', 1, 'user-999');
    const updated = result.find(r => r.documentType === 'quotation' && r.stepNumber === 1);
    expect(updated.approverUserId).toBe('user-999');
  });

  it('should not affect other steps', () => {
    const result = updateRouteStep(routes, 'quotation', 1, 'user-999');
    const step2 = result.find(r => r.stepNumber === 2);
    expect(step2.approverUserId).toBe('user-002');
  });

  it('should not mutate the original routes array', () => {
    updateRouteStep(routes, 'quotation', 1, 'user-999');
    expect(routes[0].approverUserId).toBe('user-001');
  });

  it('should return same length array after update', () => {
    const result = updateRouteStep(routes, 'quotation', 1, 'user-999');
    expect(result.length).toBe(routes.length);
  });
});
