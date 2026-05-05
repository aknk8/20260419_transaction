import { describe, it, expect, vi } from 'vitest';
import { listDeliveries, registerDelivery, updateDelivery } from './deliveryService.js';

const sampleDelivery = { code: 'DLV-00001', purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01', status: '検収待ち' };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleDelivery]),
  findAllCodes: vi.fn().mockResolvedValue(['DLV-00001']),
  save: vi.fn().mockResolvedValue(sampleDelivery),
  update: vi.fn().mockResolvedValue({ ...sampleDelivery, status: '検収済' }),
  ...overrides
});

describe('listDeliveries', () => {
  it('should return all deliveries', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listDeliveries({ repository });

    // Assert
    expect(result).toEqual([sampleDelivery]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('registerDelivery', () => {
  it('should create delivery with generated code', async () => {
    // Arrange
    const repository = makeRepo({ findAllCodes: vi.fn().mockResolvedValue([]) });

    // Act
    const result = await registerDelivery(
      { purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01', notes: '' },
      { repository }
    );

    // Assert
    expect(result.code).toBe('DLV-00001');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('should set initial status to 検収待ち', async () => {
    // Arrange
    const repository = makeRepo({ findAllCodes: vi.fn().mockResolvedValue([]) });

    // Act
    await registerDelivery(
      { purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01' },
      { repository }
    );

    // Assert
    const saved = repository.save.mock.calls[0][0];
    expect(saved.status).toBe('検収待ち');
  });

  it('should generate sequential code based on existing codes', async () => {
    // Arrange
    const repository = makeRepo({ findAllCodes: vi.fn().mockResolvedValue(['DLV-00001', 'DLV-00002']) });

    // Act
    await registerDelivery(
      { purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01' },
      { repository }
    );

    // Assert
    const saved = repository.save.mock.calls[0][0];
    expect(saved.code).toBe('DLV-00003');
  });
});

describe('updateDelivery', () => {
  it('should update delivery status and return updated record', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await updateDelivery('DLV-00001', { status: '検収済' }, { repository });

    // Assert
    expect(result.status).toBe('検収済');
    expect(repository.update).toHaveBeenCalledWith('DLV-00001', { status: '検収済' });
  });

  it('should update status to 検収NG', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockResolvedValue({ ...sampleDelivery, status: '検収NG' })
    });

    // Act
    const result = await updateDelivery('DLV-00001', { status: '検収NG' }, { repository });

    // Assert
    expect(result.status).toBe('検収NG');
  });
});
