import type {
  DocumentHeader,
  HeaderValidation,
  ItemValidation,
  Pallet,
  PalletValidation,
  ShipmentDocument,
  ShipmentValidation,
} from '../types';

const isBlank = (value: string): boolean => value.trim().length === 0;

const validateHeader = (header: DocumentHeader): HeaderValidation => {
  const errors: HeaderValidation = {};

  if (isBlank(header.invoiceNumber)) {
    errors.invoiceNumber = 'Completá el numero de factura.';
  }
  if (isBlank(header.country)) {
    errors.country = 'Seleccioná el pais.';
  }

  return errors;
};

const validatePallet = (pallet: Pallet, mode: 'preparacion' | 'carga'): PalletValidation => {
  const itemErrors = pallet.items.reduce<Record<string, ItemValidation>>((accumulator, item) => {
    const errors: ItemValidation = {};

    if (isBlank(item.productId)) {
      errors.productId = 'Seleccioná un producto.';
    }
    if (item.quantity <= 0) {
      errors.quantity = 'La cantidad debe ser mayor a 0.';
    }
    if (item.unitsPerBox > 0 && item.quantity > 0 && item.quantity % item.unitsPerBox !== 0) {
      errors.quantity = `Caja cerrada x${item.unitsPerBox}.`;
    }
    if (item.weightPerBoxKg < 0) {
      errors.weightPerBoxKg = 'El peso por caja no puede ser negativo.';
    }
    if (mode === 'carga' && !isBlank(item.productId) && isBlank(item.productionNumber)) {
      errors.productionNumber = 'Completá lote.';
    }

    if (Object.keys(errors).length > 0) {
      accumulator[item.id] = errors;
    }

    return accumulator;
  }, {});

  if (mode === 'carga') {
    const groupedItems = pallet.items.reduce<Record<string, Pallet['items']>>((accumulator, item) => {
      if (isBlank(item.productId)) {
        return accumulator;
      }

      accumulator[item.planId] = [...(accumulator[item.planId] ?? []), item];
      return accumulator;
    }, {});

    Object.values(groupedItems).forEach((group) => {
      const plannedQuantity = group[0]?.plannedQuantity ?? 0;
      const actualQuantity = group.reduce((sum, item) => sum + item.quantity, 0);
      const difference = plannedQuantity - actualQuantity;

      if (difference === 0) {
        return;
      }

      const message =
        difference > 0 ? `Faltan ${difference} frascos.` : `Sobran ${Math.abs(difference)} frascos.`;

      group.forEach((item) => {
        itemErrors[item.id] = {
          ...(itemErrors[item.id] ?? {}),
          quantity: message,
        };
      });
    });
  }

  return {
    palletId: pallet.id,
    itemErrors,
  };
};

export const validateShipmentDocument = (
  document: ShipmentDocument,
  mode: 'preparacion' | 'carga',
): ShipmentValidation => {
  const headerErrors = validateHeader(document.header);
  const palletErrors = document.pallets.map((pallet) => validatePallet(pallet, mode));
  const hasItemErrors = palletErrors.some((pallet) => Object.keys(pallet.itemErrors).length > 0);

  return {
    headerErrors,
    palletErrors,
    isValid: Object.keys(headerErrors).length === 0 && !hasItemErrors,
  };
};
