export type ShipmentCountry = 'PANAMA' | 'COLOMBIA' | 'PARAGUAY' | 'BOLIVIA' | 'ECUADOR';

export type DocumentHeader = {
  laboratoryName: string;
  invoiceNumber: string;
  country: ShipmentCountry;
  address: string;
  transportType: 'Maritimo' | 'Aereo' | 'Terrestre';
};

export type ProductUnit = 'Unidades' | 'Frascos';

export type Product = {
  id: string;
  code: string;
  name: string;
  lotPrefix: string;
  productionNumber: string;
  unit: ProductUnit;
  unitsPerBox: number;
  weightPerBoxKg: number;
};

export type PalletItem = {
  id: string;
  planId: string;
  productId: string;
  sku: string;
  description: string;
  lotPrefix: string;
  productionNumber: string;
  unit: ProductUnit;
  unitsPerBox: number;
  weightPerBoxKg: number;
  plannedQuantity: number;
  quantity: number;
};

export type Pallet = {
  id: string;
  label: string;
  palletTareWeightKg: number;
  items: PalletItem[];
};

export type ShipmentDocument = {
  id: string;
  header: DocumentHeader;
  pallets: Pallet[];
  updatedAt: string;
};

export type HeaderValidation = Partial<Record<keyof DocumentHeader, string>>;

export type ItemValidation = {
  productId?: string;
  productionNumber?: string;
  quantity?: string;
  weightPerBoxKg?: string;
};

export type PalletValidation = {
  palletId: string;
  itemErrors: Record<string, ItemValidation>;
};

export type ShipmentValidation = {
  headerErrors: HeaderValidation;
  palletErrors: PalletValidation[];
  isValid: boolean;
};

export type PalletItemComputed = PalletItem & {
  boxesCount: number;
  netWeightKg: number;
};

export type PalletComputed = Omit<Pallet, 'items'> & {
  items: PalletItemComputed[];
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
};
