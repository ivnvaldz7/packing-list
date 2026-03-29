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
  unit: 'Frascos',
  unitsPerBox: 0,
  quantity: 1,
  unitNetWeightKg: 0,
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
    laboratoryName: 'Laboratorios Aurofarma',
    invoiceNumber: '',
    country: 'PANAMA',
    client: '',
    address: '',
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
