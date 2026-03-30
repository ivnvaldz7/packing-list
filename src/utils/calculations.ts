import type { Pallet, PalletComputed, PalletItem, PalletItemComputed } from '../types';

const roundTo3 = (value: number): number => Math.round(value * 1000) / 1000;

export const calculateItemBoxes = (item: PalletItem): number =>
  item.unitsPerBox > 0 ? roundTo3(item.quantity / item.unitsPerBox) : 0;

export const calculateItemNetWeight = (item: PalletItem): number =>
  roundTo3(calculateItemBoxes(item) * item.weightPerBoxKg);

export const calculateComputedItem = (item: PalletItem): PalletItemComputed => ({
  ...item,
  boxesCount: calculateItemBoxes(item),
  netWeightKg: calculateItemNetWeight(item),
});

export const calculateComputedPallet = (pallet: Pallet): PalletComputed => {
  const computedItems = pallet.items.map(calculateComputedItem);
  const totalNetWeightKg = roundTo3(
    computedItems.reduce((sum, item) => sum + item.netWeightKg, 0),
  );
  const totalGrossWeightKg = roundTo3(totalNetWeightKg + pallet.palletTareWeightKg);

  return {
    ...pallet,
    items: computedItems,
    totalNetWeightKg,
    totalGrossWeightKg,
  };
};

export const calculateDocumentTotals = (pallets: Pallet[]): {
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
} => {
  const computedPallets = pallets.map(calculateComputedPallet);

  return {
    totalNetWeightKg: roundTo3(
      computedPallets.reduce((sum, pallet) => sum + pallet.totalNetWeightKg, 0),
    ),
    totalGrossWeightKg: roundTo3(
      computedPallets.reduce((sum, pallet) => sum + pallet.totalGrossWeightKg, 0),
    ),
  };
};
