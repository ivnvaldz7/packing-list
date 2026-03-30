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

const validatePallet = (pallet: Pallet): PalletValidation => {
  const itemErrors = pallet.items.reduce<Record<string, ItemValidation>>((accumulator, item) => {
    const errors: ItemValidation = {};

    if (isBlank(item.productId)) {
      errors.productId = 'Seleccioná un producto.';
    }
    if (item.quantity <= 0) {
      errors.quantity = 'La cantidad debe ser mayor a 0.';
    }

    if (Object.keys(errors).length > 0) {
      accumulator[item.id] = errors;
    }

    return accumulator;
  }, {});

  return {
    palletId: pallet.id,
    itemErrors,
  };
};

export const validateShipmentDocument = (document: ShipmentDocument): ShipmentValidation => {
  const headerErrors = validateHeader(document.header);
  const palletErrors = document.pallets.map(validatePallet);
  const hasItemErrors = palletErrors.some((pallet) => Object.keys(pallet.itemErrors).length > 0);

  return {
    headerErrors,
    palletErrors,
    isValid: Object.keys(headerErrors).length === 0 && !hasItemErrors,
  };
};
