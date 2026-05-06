import { describe, it, expect, vi } from 'vitest';
import { generateCode } from './sequenceService.js';

const makeSequenceRepo = (nextValReturn = 1) => ({
  nextVal: vi.fn().mockResolvedValue(nextValReturn)
});

describe('generateCode', () => {
  it('should return QUO-00001 when nextVal is 1 for quotation', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await generateCode('quotation', { sequenceRepository });

    // Assert
    expect(result).toBe('QUO-00001');
  });

  it('should return ORD-00042 when nextVal is 42 for order', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(42);

    // Act
    const result = await generateCode('order', { sequenceRepository });

    // Assert
    expect(result).toBe('ORD-00042');
  });

  it('should return POD-00010 when nextVal is 10 for purchaseOrder', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(10);

    // Act
    const result = await generateCode('purchaseOrder', { sequenceRepository });

    // Assert
    expect(result).toBe('POD-00010');
  });

  it('should return INV-00099 when nextVal is 99 for invoice', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(99);

    // Act
    const result = await generateCode('invoice', { sequenceRepository });

    // Assert
    expect(result).toBe('INV-00099');
  });

  it('should return RCP-00001 for receipt', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await generateCode('receipt', { sequenceRepository });

    // Assert
    expect(result).toBe('RCP-00001');
  });

  it('should return PMT-00001 for payment', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await generateCode('payment', { sequenceRepository });

    // Assert
    expect(result).toBe('PMT-00001');
  });

  it('should return DLV-00001 for delivery', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await generateCode('delivery', { sequenceRepository });

    // Assert
    expect(result).toBe('DLV-00001');
  });

  it('should call nextVal with the correct entity type', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    await generateCode('invoice', { sequenceRepository });

    // Assert
    expect(sequenceRepository.nextVal).toHaveBeenCalledWith('invoice');
  });

  it('should pad the number to 5 digits with leading zeros', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(3);

    // Act
    const result = await generateCode('delivery', { sequenceRepository });

    // Assert
    expect(result).toBe('DLV-00003');
  });

  it('should throw when entity type is unknown', async () => {
    // Arrange
    const sequenceRepository = makeSequenceRepo(1);

    // Act & Assert
    await expect(generateCode('unknown', { sequenceRepository }))
      .rejects.toThrow('Unknown entity type: unknown');
  });
});
