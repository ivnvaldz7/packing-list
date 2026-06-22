import { describe, expect, it } from 'vitest';
import type { PalletItem, Pallet } from '../types';
import { calculateComputedPallet, calculateDocumentTotals, calculateItemBoxes, calculateItemNetWeight } from './calculations';

describe('calculations', () => {
  const createMockItem = (overrides: Partial<PalletItem> = {}): PalletItem => ({
    id: '1',
    planId: 'plan-1',
    productId: 'prod-1',
    sku: 'SKU1',
    description: 'Test Product',
    lotPrefix: 'L',
    productionNumber: '123',
    unit: 'Frascos',
    unitsPerBox: 12,
    weightPerBoxKg: 2.5, // 12 frascos = 2.5kg
    plannedQuantity: 24,
    quantity: 24, // Exact 2 boxes
    ...overrides,
  });

  const createMockPallet = (overrides: Partial<Pallet> = {}): Pallet => ({
    id: 'p1',
    label: 'Paleta 1',
    palletTareWeightKg: 15.5,
    items: [createMockItem()],
    ...overrides,
  });

  describe('calculateItemBoxes', () => {
    it('should calculate correct number of boxes without decimals', () => {
      const item = createMockItem({ quantity: 24, unitsPerBox: 12 });
      expect(calculateItemBoxes(item)).toBe(2);
    });

    it('should floor the boxes count for open boxes according to business rule (though validation should prevent this)', () => {
      const item = createMockItem({ quantity: 50, unitsPerBox: 12 });
      expect(calculateItemBoxes(item)).toBe(4); // 4 full boxes, 2 frascos extra
    });

    it('should return 0 if unitsPerBox is 0', () => {
      const item = createMockItem({ quantity: 12, unitsPerBox: 0 });
      expect(calculateItemBoxes(item)).toBe(0);
    });
  });

  describe('calculateItemNetWeight', () => {
    it('should calculate net weight based on integer boxes count', () => {
      // 24 frascos = 2 boxes. 2 * 2.5kg = 5kg.
      const item = createMockItem({ quantity: 24, unitsPerBox: 12, weightPerBoxKg: 2.5 });
      expect(calculateItemNetWeight(item)).toBe(5);
    });

    it('should return exact calculations avoiding floating point artifacts', () => {
      const item = createMockItem({ quantity: 12, unitsPerBox: 12, weightPerBoxKg: 0.333 });
      expect(calculateItemNetWeight(item)).toBe(0.333); // 1 * 0.333 = 0.333
    });
  });

  describe('calculateComputedPallet', () => {
    it('should aggregate net weight and add tare for gross weight', () => {
      const pallet = createMockPallet({
        palletTareWeightKg: 15.5,
        items: [
          createMockItem({ quantity: 24, unitsPerBox: 12, weightPerBoxKg: 2.5 }), // 5kg
          createMockItem({ id: '2', quantity: 12, unitsPerBox: 12, weightPerBoxKg: 1.2 }), // 1.2kg
        ]
      });

      const computed = calculateComputedPallet(pallet);
      expect(computed.totalNetWeightKg).toBe(6.2); // 5 + 1.2
      expect(computed.totalGrossWeightKg).toBe(21.7); // 6.2 + 15.5
    });
  });

  describe('calculateDocumentTotals', () => {
    it('should calculate grand totals including total boxes across all pallets', () => {
      const pallets: Pallet[] = [
        createMockPallet({
          palletTareWeightKg: 10,
          items: [createMockItem({ quantity: 24, unitsPerBox: 12, weightPerBoxKg: 2.5 })] // 2 boxes, 5kg net
        }),
        createMockPallet({
          palletTareWeightKg: 10,
          items: [createMockItem({ id: '3', quantity: 36, unitsPerBox: 12, weightPerBoxKg: 2.5 })] // 3 boxes, 7.5kg net
        })
      ];

      const totals = calculateDocumentTotals(pallets);
      expect(totals.totalBoxes).toBe(5);
      expect(totals.totalNetWeightKg).toBe(12.5);
      expect(totals.totalGrossWeightKg).toBe(32.5); // 12.5 net + 20 tare
    });
  });
});
