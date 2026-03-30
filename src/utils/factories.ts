import { getCountryPreset } from '../data/countries';
import type { Pallet, PalletItem, ShipmentDocument } from '../types';

export const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

export const createEmptyItem = (): PalletItem => ({
  id: createId(),
  productId: '',
  sku: '',
  description: '',
  lotPrefix: '',
  productionNumber: '',
  unit: 'Frascos',
  unitsPerBox: 0,
  weightPerBoxKg: 0,
  quantity: 1,
});

export const createEmptyPallet = (index: number): Pallet => ({
  id: createId(),
  label: `Paleta ${index}`,
  palletTareWeightKg: 26,
  items: [createEmptyItem()],
});

export const createInitialDocument = (): ShipmentDocument => ({
  id: 'draft-export-pallets',
  header: {
    ...getCountryPreset('PANAMA'),
    invoiceNumber: '',
    transportType: 'Maritimo',
  },
  pallets: [createEmptyPallet(1)],
  updatedAt: new Date().toISOString(),
});

export const duplicatePallet = (pallet: Pallet, index: number): Pallet => ({
  ...pallet,
  id: createId(),
  label: pallet.label.trim() ? `${pallet.label} copia` : `Paleta ${index}`,
  items: pallet.items.map(
    (item): PalletItem => ({
      ...item,
      id: createId(),
    }),
  ),
});
