import { describe, expect, it } from 'vitest';
import { createEmptyItem, createSplitItem, renumberAutomaticPalletLabels } from './factories';
import type { Pallet, PalletItem } from '../types';

describe('factories', () => {
  describe('createSplitItem', () => {
    it('should preserve planId and plannedQuantity from original item to maintain grouping', () => {
      const originalItem: PalletItem = {
        ...createEmptyItem(),
        id: 'orig-id',
        planId: 'plan-123',
        plannedQuantity: 100,
        quantity: 60,
      };

      const splitQuantity = 40;
      const splitItem = createSplitItem(originalItem, splitQuantity);

      expect(splitItem.id).not.toBe(originalItem.id); // Should be new
      expect(splitItem.planId).toBe(originalItem.planId); // CRITICAL: Must be the same
      expect(splitItem.plannedQuantity).toBe(originalItem.plannedQuantity); // CRITICAL: Must be the same
      expect(splitItem.quantity).toBe(splitQuantity);
    });
  });

  describe('renumberAutomaticPalletLabels', () => {
    it('should renumber automatic labels sequentially', () => {
      const pallets: Partial<Pallet>[] = [
        { label: 'Paleta 1' },
        { label: 'Custom Name' },
        { label: 'Paleta 3' },
      ];

      const result = renumberAutomaticPalletLabels(pallets as Pallet[]);

      expect(result[0].label).toBe('Paleta 1');
      expect(result[1].label).toBe('Custom Name'); // Preserved
      expect(result[2].label).toBe('Paleta 3'); // Renumbered to match its position (index 2 -> Paleta 3)
    });
  });
});
