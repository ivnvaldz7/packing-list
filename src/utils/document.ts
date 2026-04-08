import { getCountryPreset } from '../data/countries';
import type {
  DocumentHeader,
  Pallet,
  PalletItem,
  ProductUnit,
  ShipmentDocument,
  ShipmentWorkflowStatus,
} from '../types';
import { FIXED_PALLET_TARE_WEIGHT_KG } from './constants';

const DEFAULT_UNIT: ProductUnit = 'Frascos';

const normalizeItem = (item: Partial<PalletItem>): PalletItem => ({
  id: item.id ?? crypto.randomUUID(),
  planId: item.planId ?? item.id ?? crypto.randomUUID(),
  productId: item.productId ?? '',
  sku: item.sku ?? '',
  description: item.description ?? '',
  lotPrefix: item.lotPrefix ?? '',
  productionNumber: item.productionNumber ?? '',
  unit: item.unit ?? DEFAULT_UNIT,
  unitsPerBox: typeof item.unitsPerBox === 'number' ? item.unitsPerBox : 0,
  weightPerBoxKg: typeof item.weightPerBoxKg === 'number' ? item.weightPerBoxKg : 0,
  plannedQuantity:
    typeof item.plannedQuantity === 'number'
      ? item.plannedQuantity
      : typeof item.quantity === 'number'
        ? item.quantity
        : 0,
  quantity: typeof item.quantity === 'number' ? item.quantity : 0,
});

const normalizePallet = (pallet: Partial<Pallet>): Pallet => ({
  id: pallet.id ?? crypto.randomUUID(),
  label: pallet.label ?? 'Paleta',
  palletTareWeightKg: FIXED_PALLET_TARE_WEIGHT_KG,
  items:
    pallet.items && pallet.items.length > 0
      ? pallet.items.map((item) => normalizeItem(item))
      : [normalizeItem({})],
});

const normalizeHeader = (header?: Partial<DocumentHeader> & Record<string, unknown>): DocumentHeader => ({
  ...getCountryPreset(
    header?.country === 'PANAMA' ||
      header?.country === 'COLOMBIA' ||
      header?.country === 'PARAGUAY' ||
      header?.country === 'BOLIVIA' ||
      header?.country === 'ECUADOR'
      ? header.country
      : 'PANAMA',
  ),
  invoiceNumber:
    typeof header?.invoiceNumber === 'string'
      ? header.invoiceNumber
      : typeof header?.documentCode === 'string'
        ? header.documentCode
        : '',
  transportType:
    header?.transportType === 'Aereo' ||
    header?.transportType === 'Terrestre' ||
    header?.transportType === 'Maritimo'
      ? header.transportType
      : 'Maritimo',
});

const normalizeWorkflowStatus = (value: unknown): ShipmentWorkflowStatus =>
  value === 'carga' || value === 'finalizada' || value === 'preparacion' ? value : 'preparacion';

export const normalizeShipmentDocument = (document: ShipmentDocument): ShipmentDocument => ({
  ...document,
  header: normalizeHeader(document.header as Partial<DocumentHeader> & Record<string, unknown>),
  pallets:
    document.pallets.length > 0
      ? document.pallets.map((pallet) => normalizePallet(pallet))
      : [normalizePallet({ label: 'Paleta 1' })],
  workflowStatus: normalizeWorkflowStatus((document as ShipmentDocument & Record<string, unknown>).workflowStatus),
});
