import { getCountryPreset } from '../data/countries';
import type { Pallet, PalletItem, ShipmentDocument } from '../types';
import { FIXED_PALLET_TARE_WEIGHT_KG } from './constants';

const DEFAULT_INVOICE_PREFIX = 'E-0005-0000';

export const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

export const createEmptyItem = (): PalletItem => ({
  id: createId(),
  planId: createId(),
  productId: '',
  sku: '',
  description: '',
  lotPrefix: '',
  productionNumber: '',
  unit: 'Frascos',
  unitsPerBox: 0,
  weightPerBoxKg: 0,
  plannedQuantity: 0,
  quantity: 0,
});

export const createEmptyPallet = (index: number): Pallet => ({
  id: createId(),
  label: `Paleta ${index}`,
  palletTareWeightKg: FIXED_PALLET_TARE_WEIGHT_KG,
  items: [createEmptyItem()],
});

export const createInitialDocument = (): ShipmentDocument => ({
  id: createId(),
  header: {
    ...getCountryPreset('PANAMA'),
    invoiceNumber: DEFAULT_INVOICE_PREFIX,
    transportType: 'Maritimo',
  },
  pallets: [createEmptyPallet(1)],
  workflowStatus: 'preparacion',
  updatedAt: new Date().toISOString(),
});

export const duplicatePallet = (pallet: Pallet, index: number): Pallet => ({
  ...pallet,
  id: createId(),
  label: `Paleta ${index}`,
  items: pallet.items.map(
    (item): PalletItem => ({
      ...item,
      id: createId(),
      planId: createId(),
    }),
  ),
});

const isAutomaticPalletLabel = (label: string): boolean => /^Paleta \d+$/i.test(label.trim());

export const renumberAutomaticPalletLabels = (pallets: Pallet[]): Pallet[] =>
  pallets.map((pallet, index) =>
    isAutomaticPalletLabel(pallet.label)
      ? {
          ...pallet,
          label: `Paleta ${index + 1}`,
        }
      : pallet,
  );

export const createSplitItem = (item: PalletItem, quantity: number): PalletItem => ({
  ...item,
  id: createId(),
  productionNumber: '',
  quantity,
});
