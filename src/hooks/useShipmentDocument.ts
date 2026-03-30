import { getCountryPreset } from '../data/countries';
import { useEffect, useMemo, useState } from 'react';
import { productCatalog } from '../data/products';
import { clearDocument, loadDocument, saveDocument } from '../db/indexedDb';
import type { DocumentHeader, Pallet, PalletItem, ShipmentDocument } from '../types';
import {
  createEmptyItem,
  createEmptyPallet,
  createInitialDocument,
  duplicatePallet,
} from '../utils/factories';
import { calculateComputedPallet, calculateDocumentTotals } from '../utils/calculations';
import { normalizeShipmentDocument } from '../utils/document';

type LoadStatus = 'loading' | 'ready' | 'error';

const touch = (document: ShipmentDocument): ShipmentDocument => ({
  ...document,
  updatedAt: new Date().toISOString(),
});

export const useShipmentDocument = () => {
  const [document, setDocument] = useState<ShipmentDocument>(createInitialDocument);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (): Promise<void> => {
      try {
        const stored = await loadDocument();
        if (!mounted) {
          return;
        }

        setDocument(stored ? normalizeShipmentDocument(stored) : createInitialDocument());
        setStatus('ready');
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError('No pudimos recuperar el borrador guardado.');
        setStatus('error');
        console.error(loadError);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    void saveDocument(document).catch((saveError: unknown) => {
      setError('No pudimos guardar los cambios en IndexedDB.');
      console.error(saveError);
    });
  }, [document, status]);

  const updateHeader = <K extends keyof DocumentHeader>(field: K, value: DocumentHeader[K]): void => {
    setDocument((current) => {
      if (field === 'country') {
        const countryValue = value as DocumentHeader['country'];

        return touch({
          ...current,
          header: {
            ...current.header,
            ...getCountryPreset(countryValue),
          },
        });
      }

      return touch({
        ...current,
        header: {
          ...current.header,
          [field]: value,
        },
      });
    });
  };

  const addPallet = (): void => {
    setDocument((current) =>
      touch({
        ...current,
        pallets: [...current.pallets, createEmptyPallet(current.pallets.length + 1)],
      }),
    );
  };

  const updatePallet = <K extends keyof Pallet>(
    palletId: string,
    field: K,
    value: Pallet[K],
  ): void => {
    setDocument((current) =>
      touch({
        ...current,
        pallets: current.pallets.map((pallet) =>
          pallet.id === palletId
            ? {
                ...pallet,
                [field]: value,
              }
            : pallet,
        ),
      }),
    );
  };

  const removePallet = (palletId: string): void => {
    if (!window.confirm('Se va a eliminar esta paleta completa. Queres continuar?')) {
      return;
    }

    setDocument((current) => {
      if (current.pallets.length === 1) {
        return current;
      }

      return touch({
        ...current,
        pallets: current.pallets.filter((pallet) => pallet.id !== palletId),
      });
    });
  };

  const addItem = (palletId: string): void => {
    setDocument((current) =>
      touch({
        ...current,
        pallets: current.pallets.map((pallet) =>
          pallet.id === palletId
            ? {
                ...pallet,
                items: [...pallet.items, createEmptyItem()],
              }
            : pallet,
        ),
      }),
    );
  };

  const clonePallet = (palletId: string): void => {
    setDocument((current) => {
      const sourcePallet = current.pallets.find((pallet) => pallet.id === palletId);
      if (!sourcePallet) {
        return current;
      }

      return touch({
        ...current,
        pallets: [
          ...current.pallets,
          duplicatePallet(sourcePallet, current.pallets.length + 1),
        ],
      });
    });
  };

  const updateItem = <K extends keyof PalletItem>(
    palletId: string,
    itemId: string,
    field: K,
    value: PalletItem[K],
  ): void => {
    setDocument((current) =>
      touch({
        ...current,
        pallets: current.pallets.map((pallet) =>
          pallet.id === palletId
            ? {
                ...pallet,
                items: pallet.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        [field]: value,
                      }
                    : item,
                ),
              }
            : pallet,
        ),
      }),
    );
  };

  const selectProduct = (palletId: string, itemId: string, productId: string): void => {
    const selectedProduct = productCatalog.find((product) => product.id === productId);
    if (!selectedProduct) {
      return;
    }

    setDocument((current) =>
      touch({
        ...current,
        pallets: current.pallets.map((pallet) =>
          pallet.id === palletId
            ? {
                ...pallet,
                items: pallet.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        productId: selectedProduct.id,
                        sku: selectedProduct.code,
                        description: selectedProduct.name,
                        lotPrefix: selectedProduct.lotPrefix,
                        productionNumber: selectedProduct.productionNumber,
                        unit: selectedProduct.unit,
                        unitsPerBox: selectedProduct.unitsPerBox,
                        weightPerBoxKg: selectedProduct.weightPerBoxKg,
                      }
                    : item,
                ),
              }
            : pallet,
        ),
      }),
    );
  };

  const removeItem = (palletId: string, itemId: string): void => {
    if (!window.confirm('Se va a eliminar este item de la paleta. Queres continuar?')) {
      return;
    }

    setDocument((current) =>
      touch({
        ...current,
        pallets: current.pallets.map((pallet) => {
          if (pallet.id !== palletId || pallet.items.length === 1) {
            return pallet;
          }

          return {
            ...pallet,
            items: pallet.items.filter((item) => item.id !== itemId),
          };
        }),
      }),
    );
  };

  const computedPallets = useMemo(
    () => document.pallets.map(calculateComputedPallet),
    [document.pallets],
  );
  const totals = useMemo(() => calculateDocumentTotals(document.pallets), [document.pallets]);

  const resetDocument = async (): Promise<void> => {
    if (!window.confirm('Se va a crear un documento nuevo y se perdera el borrador actual. Queres continuar?')) {
      return;
    }

    const nextDocument = createInitialDocument();

    try {
      await clearDocument();
      setDocument(nextDocument);
      setError(null);
    } catch (resetError) {
      setError('No pudimos reiniciar el borrador local.');
      console.error(resetError);
    }
  };

  return {
    document,
    computedPallets,
    totals,
    products: productCatalog,
    status,
    error,
    updateHeader,
    addPallet,
    updatePallet,
    removePallet,
    addItem,
    clonePallet,
    resetDocument,
    selectProduct,
    updateItem,
    removeItem,
  };
};
