/**
 * Shared test utilities: mock factories, render helpers.
 */
import type {
  DocumentHeader,
  Pallet,
  PalletComputed,
  PalletItem,
  Product,
  ShipmentDocument,
} from '../types';

/* ─── Factory helpers ─── */

export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  code: 'P001',
  name: 'Producto de prueba',
  lotPrefix: 'L',
  productionNumber: '001',
  unit: 'Frascos',
  unitsPerBox: 12,
  weightPerBoxKg: 2.5,
  ...overrides,
});

export const createMockItem = (overrides: Partial<PalletItem> = {}): PalletItem => ({
  id: 'item-1',
  planId: 'plan-1',
  productId: 'prod-1',
  sku: 'P001',
  description: 'Producto de prueba',
  lotPrefix: 'L',
  productionNumber: '123',
  unit: 'Frascos',
  unitsPerBox: 12,
  weightPerBoxKg: 2.5,
  plannedQuantity: 24,
  quantity: 24,
  ...overrides,
});

export const createMockPallet = (items: PalletItem[] = [createMockItem()]): Pallet => ({
  id: 'pallet-1',
  label: 'Paleta 01',
  palletTareWeightKg: 15.5,
  items,
});

export const createMockComputedPallet = (
  items: PalletItem[] = [createMockItem()],
  overrides: Partial<PalletComputed> = {},
): PalletComputed => {
  const base = createMockPallet(items);
  return {
    ...base,
    items: items.map((item) => ({
      ...item,
      boxesCount: Math.floor(item.quantity / item.unitsPerBox),
      netWeightKg: Math.floor(item.quantity / item.unitsPerBox) * item.weightPerBoxKg,
    })),
    totalNetWeightKg: 5,
    totalGrossWeightKg: 20.5,
    ...overrides,
  };
};

export const createMockHeader = (overrides: Partial<DocumentHeader> = {}): DocumentHeader => ({
  country: 'PANAMA',
  laboratoryName: 'IMPORTACIONES UNIVERSO ZONA LIBRE S.A',
  address: 'FREE ZONE, COLON - PANAMA',
  invoiceNumber: 'E-0005-0001',
  transportType: 'Maritimo',
  shipmentDate: new Date().toISOString().slice(0, 10),
  ...overrides,
});

export const createMockDocument = (
  pallets: Pallet[] = [createMockPallet()],
  overrides: Partial<ShipmentDocument> = {},
): ShipmentDocument => ({
  id: 'doc-1',
  header: createMockHeader(),
  pallets,
  workflowStatus: 'preparacion',
  updatedAt: new Date().toISOString(),
  ...overrides,
});
