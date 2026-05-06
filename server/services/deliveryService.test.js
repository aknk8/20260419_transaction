import { describe, it, expect, vi } from 'vitest';
import { listDeliveries, registerDelivery, updateDelivery } from './deliveryService.js';

const sampleDelivery = { code: 'DLV-00001', purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01', status: '検収待ち' };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleDelivery]),
  save: vi.fn().mockResolvedValue(sampleDelivery),
  update: vi.fn().mockResolvedValue({ ...sampleDelivery, status: '検収済' }),
  ...overrides
});

const makeSequenceRepo = (nextVal = 1) => ({
  nextVal: vi.fn().mockResolvedValue(nextVal)
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
  it('should create delivery with sequenced code', async () => {
    // Arrange
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await registerDelivery(
      { purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01', notes: '' },
      { repository, sequenceRepository }
    );

    // Assert
    expect(result.code).toBe('DLV-00001');
    expect(repository.save).toHaveBeenCalledOnce();
    expect(sequenceRepository.nextVal).toHaveBeenCalledWith('delivery');
  });

  it('should set initial status to 検収待ち', async () => {
    // Arrange
    const repository = makeRepo({ save: vi.fn().mockImplementation(async (d) => d) });
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    await registerDelivery(
      { purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01' },
      { repository, sequenceRepository }
    );

    // Assert
    const saved = repository.save.mock.calls[0][0];
    expect(saved.status).toBe('検収待ち');
  });

  it('should assign DLV-00003 when sequenceRepository returns 3', async () => {
    // Arrange
    const repository = makeRepo({ save: vi.fn().mockImplementation(async (d) => d) });
    const sequenceRepository = makeSequenceRepo(3);

    // Act
    await registerDelivery(
      { purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01' },
      { repository, sequenceRepository }
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
