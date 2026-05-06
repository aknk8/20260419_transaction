const ENTITY_CODES = {
  quotation:     { prefix: 'QUO', width: 5 },
  order:         { prefix: 'ORD', width: 5 },
  purchaseOrder: { prefix: 'POD', width: 5 },
  invoice:       { prefix: 'INV', width: 5 },
  receipt:       { prefix: 'RCP', width: 5 },
  payment:       { prefix: 'PMT', width: 5 },
  delivery:      { prefix: 'DLV', width: 5 }
};

export async function generateCode(entityType, { sequenceRepository }) {
  const config = ENTITY_CODES[entityType];
  if (!config) throw new Error(`Unknown entity type: ${entityType}`);
  const nextVal = await sequenceRepository.nextVal(entityType);
  return `${config.prefix}-${String(nextVal).padStart(config.width, '0')}`;
}
