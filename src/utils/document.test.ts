import { describe, expect, it } from 'vitest';
import { normalizeShipmentDocument } from './document';
import { FIXED_PALLET_TARE_WEIGHT_KG } from './constants';
import type { Pallet, ShipmentDocument } from '../types';

describe('document normalizer', () => {
  it('should preserve custom pallet tare weight instead of overwriting with constant', () => {
    const customWeight = 22.5;
    const document: Partial<ShipmentDocument> = {
      pallets: [
        {
          id: 'p1',
          label: 'Test',
          palletTareWeightKg: customWeight,
          items: [],
        },
      ],
    };

    const normalized = normalizeShipmentDocument(document as ShipmentDocument);
    expect(normalized.pallets[0].palletTareWeightKg).toBe(customWeight);
  });

  it('should fallback to FIXED_PALLET_TARE_WEIGHT_KG if missing', () => {
    const document: Partial<ShipmentDocument> = {
      pallets: [
        {
          id: 'p1',
          label: 'Test',
          items: [],
        } as unknown as Pallet,
      ],
    };

    const normalized = normalizeShipmentDocument(document as ShipmentDocument);
    expect(normalized.pallets[0].palletTareWeightKg).toBe(FIXED_PALLET_TARE_WEIGHT_KG);
  });

  it('should ensure there is at least one pallet and one item', () => {
    const document: Partial<ShipmentDocument> = {
      pallets: [],
    };

    const normalized = normalizeShipmentDocument(document as ShipmentDocument);
    expect(normalized.pallets.length).toBeGreaterThan(0);
    expect(normalized.pallets[0].items.length).toBeGreaterThan(0);
  });
});
