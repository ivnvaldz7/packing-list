import { describe, expect, it } from 'vitest';
import { validateShipmentDocument } from './validation';
import type { ShipmentDocument, PalletItem, Pallet } from '../types';

describe('validation', () => {
  const createMockItem = (overrides: Partial<PalletItem> = {}): PalletItem => ({
    id: '1',
    planId: 'plan-1',
    productId: 'prod-1',
    sku: 'SKU1',
    description: 'Test',
    lotPrefix: 'L',
    productionNumber: '123',
    unit: 'Frascos',
    unitsPerBox: 12,
    weightPerBoxKg: 2.5,
    plannedQuantity: 24,
    quantity: 24,
    ...overrides,
  });

  const createMockPallet = (items: PalletItem[]): Pallet => ({
    id: 'p1',
    label: 'Paleta 1',
    palletTareWeightKg: 15,
    items,
  });

  const createMockDocument = (pallets: Pallet[], mode: 'preparacion' | 'carga'): ShipmentDocument => ({
    id: 'doc-1',
    workflowStatus: mode,
    updatedAt: '',
    header: {
      country: 'PANAMA',
      laboratoryName: '',
      address: '',
      invoiceNumber: 'E-0005-0001',
      transportType: 'Maritimo',
      shipmentDate: '2026-06-23',
    },
    pallets,
  });

  it('should validate correctly when actual quantities match planned across splits', () => {
    const item1 = createMockItem({ quantity: 12, plannedQuantity: 24, planId: 'group-1', id: 'i1' });
    const item2 = createMockItem({ quantity: 12, plannedQuantity: 24, planId: 'group-1', id: 'i2' });
    
    const doc = createMockDocument([createMockPallet([item1, item2])], 'carga');
    const validation = validateShipmentDocument(doc, 'carga');
    
    // Sum is 24, matches planned 24. No errors expected.
    const errors = validation.palletErrors.find(p => p.palletId === 'p1')?.itemErrors ?? {};
    expect(errors['i1']?.quantity).toBeUndefined();
    expect(errors['i2']?.quantity).toBeUndefined();
  });

  it('should report missing quantities if sum of splits is less than planned', () => {
    const item1 = createMockItem({ quantity: 12, plannedQuantity: 36, planId: 'group-1', id: 'i1' });
    const item2 = createMockItem({ quantity: 12, plannedQuantity: 36, planId: 'group-1', id: 'i2' });
    
    const doc = createMockDocument([createMockPallet([item1, item2])], 'carga');
    const validation = validateShipmentDocument(doc, 'carga');
    
    // Sum is 24, planned is 36. Diff = 12.
    const errors = validation.palletErrors.find(p => p.palletId === 'p1')?.itemErrors ?? {};
    expect(errors['i1']?.quantity).toBe('Faltan 12 frascos.');
  });

  it('should enforce multiple of unitsPerBox (closed boxes)', () => {
    const item = createMockItem({ quantity: 14, unitsPerBox: 12, plannedQuantity: 14 });
    const doc = createMockDocument([createMockPallet([item])], 'carga');
    const validation = validateShipmentDocument(doc, 'carga');
    
    const errors = validation.palletErrors.find(p => p.palletId === 'p1')?.itemErrors ?? {};
    expect(errors['1']?.quantity).toBe('Caja cerrada x12.');
  });

  it('should require productionNumber in carga stage', () => {
    const item = createMockItem({ productionNumber: '' });
    const doc = createMockDocument([createMockPallet([item])], 'carga');
    const validation = validateShipmentDocument(doc, 'carga');
    
    const errors = validation.palletErrors.find(p => p.palletId === 'p1')?.itemErrors ?? {};
    expect(errors['1']?.productionNumber).toBe('Completá lote.');
  });

  it('should NOT require productionNumber in preparacion stage', () => {
    const item = createMockItem({ productionNumber: '' });
    const doc = createMockDocument([createMockPallet([item])], 'preparacion');
    const validation = validateShipmentDocument(doc, 'preparacion');
    
    const errors = validation.palletErrors.find(p => p.palletId === 'p1')?.itemErrors ?? {};
    expect(errors['1']?.productionNumber).toBeUndefined();
  });
});
