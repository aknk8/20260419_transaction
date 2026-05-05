import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStaleApprovalJob } from './staleApprovalJob.js';

const STALE_DATE = '2026-04-01';
const TODAY = '2026-05-05';

const makeRepos = (overrides = {}) => ({
  quotationRepository: { findAll: vi.fn().mockResolvedValue([]) },
  orderRepository: { findAll: vi.fn().mockResolvedValue([]) },
  purchaseOrderRepository: { findAll: vi.fn().mockResolvedValue([]) },
  invoiceRepository: { findAll: vi.fn().mockResolvedValue([]) },
  notificationRepository: {
    save: vi.fn().mockImplementation(async (n) => ({ id: 'uuid-001', ...n }))
  },
  ...overrides
});

describe('createStaleApprovalJob', () => {
  describe('run', () => {
    it('should send N-04 notification for stale pending quotation', async () => {
      // Arrange
      const repos = makeRepos({
        quotationRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'QUO-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'user01', updatedAt: STALE_DATE }
          ])
        }
      });
      const job = createStaleApprovalJob({ ...repos, staleDays: 3 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(1);
      expect(repos.notificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'N-04', recipientId: 'user01', docCode: 'QUO-00001' })
      );
    });

    it('should send N-04 notification for stale pending order', async () => {
      // Arrange
      const repos = makeRepos({
        orderRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'ORD-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'user02', updatedAt: STALE_DATE }
          ])
        }
      });
      const job = createStaleApprovalJob({ ...repos, staleDays: 3 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(1);
      expect(repos.notificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'N-04', docCode: 'ORD-00001' })
      );
    });

    it('should send N-04 notification for stale pending purchase order', async () => {
      // Arrange
      const repos = makeRepos({
        purchaseOrderRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'POD-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'user03', updatedAt: STALE_DATE }
          ])
        }
      });
      const job = createStaleApprovalJob({ ...repos, staleDays: 3 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(1);
      expect(repos.notificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'N-04', docCode: 'POD-00001' })
      );
    });

    it('should send N-04 notification for stale pending invoice', async () => {
      // Arrange
      const repos = makeRepos({
        invoiceRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'INV-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'user04', updatedAt: STALE_DATE }
          ])
        }
      });
      const job = createStaleApprovalJob({ ...repos, staleDays: 3 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(1);
      expect(repos.notificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'N-04', docCode: 'INV-00001' })
      );
    });

    it('should not send notification for non-pending documents', async () => {
      // Arrange
      const repos = makeRepos({
        quotationRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'QUO-00001', status: '承認済み', submittedAt: STALE_DATE, submittedBy: 'user01', updatedAt: STALE_DATE }
          ])
        }
      });
      const job = createStaleApprovalJob({ ...repos, staleDays: 3 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(0);
      expect(repos.notificationRepository.save).not.toHaveBeenCalled();
    });

    it('should not send notification when pending document is not yet stale', async () => {
      // Arrange
      const repos = makeRepos({
        quotationRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'QUO-00001', status: '承認依頼中', submittedAt: '2026-05-04', submittedBy: 'user01', updatedAt: '2026-05-04' }
          ])
        }
      });
      const job = createStaleApprovalJob({ ...repos, staleDays: 3 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(0);
    });

    it('should aggregate stale documents across all four document types', async () => {
      // Arrange
      const repos = makeRepos({
        quotationRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'QUO-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'u1', updatedAt: STALE_DATE }
          ])
        },
        orderRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'ORD-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'u2', updatedAt: STALE_DATE }
          ])
        },
        purchaseOrderRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'POD-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'u3', updatedAt: STALE_DATE }
          ])
        },
        invoiceRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'INV-00001', status: '承認依頼中', submittedAt: STALE_DATE, submittedBy: 'u4', updatedAt: STALE_DATE }
          ])
        }
      });
      const job = createStaleApprovalJob({ ...repos, staleDays: 3 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(4);
    });

    it('should use staleDays from settings when provided as default', async () => {
      // Arrange
      const repos = makeRepos({
        quotationRepository: {
          findAll: vi.fn().mockResolvedValue([
            { code: 'QUO-00001', status: '承認依頼中', submittedAt: '2026-04-30', submittedBy: 'user01', updatedAt: '2026-04-30' }
          ])
        }
      });
      // TODAY is 2026-05-05, submittedAt 2026-04-30 = 5 days diff, staleDays=7 → not stale
      const job = createStaleApprovalJob({ ...repos, staleDays: 7 });

      // Act
      const count = await job.run(TODAY);

      // Assert
      expect(count).toBe(0);
    });
  });
});
