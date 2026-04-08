import { useEffect, useMemo, useState } from 'react';
import { getCountryPreset } from '../data/countries';
import { productCatalog } from '../data/products';
import {
  deleteDocument,
  getActiveDocumentId,
  loadDocument,
  loadDocuments,
  saveDocument,
  setActiveDocumentId,
} from '../db/indexedDb';
import type {
  DocumentHeader,
  Pallet,
  PalletItem,
  ShipmentDocument,
  ShipmentWorkflowStatus,
  StoredDocumentSummary,
} from '../types';
import { calculateComputedPallet, calculateDocumentTotals } from '../utils/calculations';
import { normalizeShipmentDocument } from '../utils/document';
import {
  createEmptyItem,
  createEmptyPallet,
  createInitialDocument,
  createSplitItem,
  duplicatePallet,
  renumberAutomaticPalletLabels,
} from '../utils/factories';

type LoadStatus = 'loading' | 'ready' | 'error';

const touch = (document: ShipmentDocument): ShipmentDocument => ({
  ...document,
  updatedAt: new Date().toISOString(),
});

const summarizeDocument = (document: ShipmentDocument): StoredDocumentSummary => ({
  id: document.id,
  invoiceNumber: document.header.invoiceNumber,
  country: document.header.country,
  laboratoryName: document.header.laboratoryName,
  address: document.header.address,
  transportType: document.header.transportType,
  workflowStatus: document.workflowStatus,
  updatedAt: document.updatedAt,
  palletCount: document.pallets.length,
});

const sortByUpdatedAt = (documents: ShipmentDocument[]): ShipmentDocument[] =>
  [...documents].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

export const useShipmentDocument = () => {
  const [document, setDocument] = useState<ShipmentDocument>(createInitialDocument);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedItemId, setLastCreatedItemId] = useState<string | null>(null);
  const [library, setLibrary] = useState<StoredDocumentSummary[]>([]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (): Promise<void> => {
      try {
        const storedDocuments = sortByUpdatedAt(
          (await loadDocuments()).map((storedDocument) => normalizeShipmentDocument(storedDocument)),
        );

        if (!mounted) {
          return;
        }

        if (storedDocuments.length === 0) {
          const initialDocument = createInitialDocument();
          await saveDocument(initialDocument);
          await setActiveDocumentId(initialDocument.id);

          if (!mounted) {
            return;
          }

          setDocument(initialDocument);
          setLibrary([summarizeDocument(initialDocument)]);
          setStatus('ready');
          return;
        }

        const activeDocumentId = await getActiveDocumentId();
        const nextDocument =
          storedDocuments.find((storedDocument) => storedDocument.id === activeDocumentId) ??
          storedDocuments[0];

        setDocument(nextDocument);
        setLibrary(storedDocuments.map(summarizeDocument));
        setStatus('ready');
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError('No pudimos recuperar las listas guardadas.');
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

    void saveDocument(document)
      .then(() => setActiveDocumentId(document.id))
      .then(() =>
        setLibrary((currentLibrary) => {
          const nextSummary = summarizeDocument(document);
          const nextLibrary = currentLibrary.some((entry) => entry.id === document.id)
            ? currentLibrary.map((entry) => (entry.id === document.id ? nextSummary : entry))
            : [nextSummary, ...currentLibrary];

          return [...nextLibrary].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
        }),
      )
      .catch((saveError: unknown) => {
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

  const updateWorkflowStatus = (workflowStatus: ShipmentWorkflowStatus): void => {
    setDocument((current) => touch({ ...current, workflowStatus }));
  };

  const createNewDocument = (): void => {
    const nextDocument = createInitialDocument();
    setDocument(nextDocument);
    setLastCreatedItemId(null);
    setError(null);
  };

  const openStoredDocument = async (documentId: string): Promise<void> => {
    try {
      const storedDocument = await loadDocument(documentId);
      if (!storedDocument) {
        setError('No encontramos la lista seleccionada.');
        return;
      }

      setDocument(normalizeShipmentDocument(storedDocument));
      setLastCreatedItemId(null);
      setError(null);
    } catch (loadError) {
      setError('No pudimos abrir la lista seleccionada.');
      console.error(loadError);
    }
  };

  const deleteStoredDocument = async (documentId: string): Promise<void> => {
    try {
      await deleteDocument(documentId);

      setLibrary((currentLibrary) => currentLibrary.filter((entry) => entry.id !== documentId));

      if (document.id !== documentId) {
        return;
      }

      const remainingDocuments = sortByUpdatedAt(
        (await loadDocuments()).map((storedDocument) => normalizeShipmentDocument(storedDocument)),
      );

      const nextDocument = remainingDocuments[0] ?? createInitialDocument();

      if (remainingDocuments.length === 0) {
        await saveDocument(nextDocument);
      }

      setDocument(nextDocument);
      setLastCreatedItemId(null);
    } catch (deleteError) {
      setError('No pudimos eliminar la lista seleccionada.');
      console.error(deleteError);
    }
  };

  const addPallet = (): void => {
    setDocument((current) =>
      touch({
        ...current,
        pallets: renumberAutomaticPalletLabels([
          ...current.pallets,
          createEmptyPallet(current.pallets.length + 1),
        ]),
      }),
    );
  };

  const updatePallet = <K extends keyof Pallet>(palletId: string, field: K, value: Pallet[K]): void => {
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
    setDocument((current) => {
      if (current.pallets.length === 1) {
        return current;
      }

      return touch({
        ...current,
        pallets: renumberAutomaticPalletLabels(
          current.pallets.filter((pallet) => pallet.id !== palletId),
        ),
      });
    });
  };

  const addItem = (palletId: string, mode: 'preparacion' | 'carga'): void => {
    let nextFocusedItemId: string | null = null;

    setDocument((current) =>
      touch({
        ...current,
        pallets: current.pallets.map((pallet) => {
          if (pallet.id !== palletId) {
            return pallet;
          }

          if (mode === 'carga') {
            const planSummaries = pallet.items.reduce<
              Record<string, { plannedQuantity: number; actualQuantity: number; lastItem: PalletItem }>
            >((accumulator, item) => {
              if (!item.productId) {
                return accumulator;
              }

              const currentSummary = accumulator[item.planId] ?? {
                plannedQuantity: item.plannedQuantity,
                actualQuantity: 0,
                lastItem: item,
              };

              accumulator[item.planId] = {
                plannedQuantity: item.plannedQuantity,
                actualQuantity: currentSummary.actualQuantity + item.quantity,
                lastItem: item,
              };

              return accumulator;
            }, {});

            let incompleteSummary: {
              plannedQuantity: number;
              actualQuantity: number;
              lastItem: PalletItem;
            } | null = null;

            for (let index = pallet.items.length - 1; index >= 0; index -= 1) {
              const item = pallet.items[index];
              if (!item.productId) {
                continue;
              }

              const summary = planSummaries[item.planId];
              if (summary && summary.actualQuantity < summary.plannedQuantity) {
                incompleteSummary = summary;
                break;
              }
            }

            if (incompleteSummary) {
              const remainingQuantity = Math.max(
                incompleteSummary.plannedQuantity - incompleteSummary.actualQuantity,
                0,
              );
              const nextItem = createSplitItem(incompleteSummary.lastItem, remainingQuantity);
              nextFocusedItemId = nextItem.id;

              return {
                ...pallet,
                items: [...pallet.items, nextItem],
              };
            }
          }

          const nextItem = createEmptyItem();
          nextFocusedItemId = nextItem.id;

          return {
            ...pallet,
            items: [...pallet.items, nextItem],
          };
        }),
      }),
    );

    setLastCreatedItemId(nextFocusedItemId);
  };

  const clonePallet = (palletId: string): void => {
    setDocument((current) => {
      const sourceIndex = current.pallets.findIndex((pallet) => pallet.id === palletId);
      if (sourceIndex === -1) {
        return current;
      }

      const sourcePallet = current.pallets[sourceIndex];
      const duplicatedPallet = duplicatePallet(sourcePallet, sourceIndex + 2);
      const nextPallets = [...current.pallets];
      nextPallets.splice(sourceIndex + 1, 0, duplicatedPallet);

      return touch({
        ...current,
        pallets: renumberAutomaticPalletLabels(nextPallets),
      });
    });
  };

  const updateItem = <K extends keyof PalletItem>(
    mode: 'preparacion' | 'carga',
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
                        ...(mode === 'preparacion' && field === 'quantity'
                          ? { plannedQuantity: value as number }
                          : {}),
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
                        plannedQuantity: item.quantity,
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

  const computedPallets = useMemo(() => document.pallets.map(calculateComputedPallet), [document.pallets]);
  const totals = useMemo(() => calculateDocumentTotals(document.pallets), [document.pallets]);

  return {
    document,
    documentLibrary: library,
    computedPallets,
    totals,
    products: productCatalog,
    lastCreatedItemId,
    status,
    error,
    updateHeader,
    updateWorkflowStatus,
    createNewDocument,
    openStoredDocument,
    deleteStoredDocument,
    addPallet,
    updatePallet,
    removePallet,
    addItem,
    clonePallet,
    selectProduct,
    updateItem,
    removeItem,
  };
};
