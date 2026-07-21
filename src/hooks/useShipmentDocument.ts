import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCountryPreset, type CountryPresetValue } from '../data/countries';
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
  createId,
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

const clearItemProduct = (item: PalletItem): PalletItem => ({
  ...item,
  productId: '',
  sku: '',
  description: '',
  lotPrefix: '',
  productionNumber: '',
  unit: 'Frascos',
  unitsPerBox: 0,
  weightPerBoxKg: 0,
  plannedQuantity: 0,
  planId: createId(),
});

export const useShipmentDocument = () => {
  const [document, setDocument] = useState<ShipmentDocument>(createInitialDocument);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedItemId, setLastCreatedItemId] = useState<string | null>(null);
  const [library, setLibrary] = useState<StoredDocumentSummary[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const pendingSaves = useRef(0);
  const latestSaveRevision = useRef(0);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (): Promise<void> => {
      try {
        const storedDocuments = sortByUpdatedAt(
          (await loadDocuments()).map((storedDocument) =>
            normalizeShipmentDocument(storedDocument),
          ),
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

  const persistDocument = useCallback(
    (documentToSave: ShipmentDocument, applyToState: boolean): Promise<void> => {
      const revision = ++latestSaveRevision.current;
      pendingSaves.current += 1;
      setIsSaving(true);

      const run = async (): Promise<void> => {
        try {
          await saveDocument(documentToSave);
          await setActiveDocumentId(documentToSave.id);
          if (revision === latestSaveRevision.current) {
            setError(null);
            if (applyToState) setDocument(documentToSave);
            setLibrary((currentLibrary) => {
              const nextSummary = summarizeDocument(documentToSave);
              return [
                nextSummary,
                ...currentLibrary.filter((entry) => entry.id !== documentToSave.id),
              ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
            });
          }
        } catch (saveError) {
          if (revision === latestSaveRevision.current) {
            setError('No pudimos guardar los cambios en IndexedDB. Reintentá la acción.');
          }
          console.error(saveError);
          throw saveError;
        } finally {
          pendingSaves.current -= 1;
          if (pendingSaves.current === 0) setIsSaving(false);
        }
      };

      const queued = saveQueue.current.then(run, run);
      saveQueue.current = queued.catch(() => undefined);
      return queued;
    },
    [],
  );

  const saveCurrentDocument = useCallback(
    (nextDocument?: ShipmentDocument): Promise<void> =>
      persistDocument(nextDocument ?? document, Boolean(nextDocument)),
    [document, persistDocument],
  );

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const timeoutId = setTimeout(() => {
      void persistDocument(document, false).catch(() => undefined);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [document, status, persistDocument]);

  const updateHeader = <K extends keyof DocumentHeader>(
    field: K,
    value: DocumentHeader[K],
  ): void => {
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

  const updateCountryPreset = (countryPresetValue: CountryPresetValue | ''): void => {
    setDocument((current) =>
      touch({
        ...current,
        header: {
          ...current.header,
          ...getCountryPreset(countryPresetValue),
        },
      }),
    );
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

  const openStoredDocument = async (
    documentId: string,
  ): Promise<ShipmentWorkflowStatus | undefined> => {
    try {
      const storedDocument = await loadDocument(documentId);
      if (!storedDocument) {
        setError('No encontramos la lista seleccionada.');
        return undefined;
      }

      const normalized = normalizeShipmentDocument(storedDocument);
      setDocument(normalized);
      setLastCreatedItemId(null);
      setError(null);
      return normalized.workflowStatus;
    } catch (loadError) {
      setError('No pudimos abrir la lista seleccionada.');
      console.error(loadError);
      return undefined;
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
              Record<
                string,
                { plannedQuantity: number; actualQuantity: number; lastItem: PalletItem }
              >
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

  const updateItem = (
    mode: 'preparacion' | 'carga',
    palletId: string,
    itemId: string,
    field: 'productionNumber' | 'quantity',
    value: string | number,
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
    if (productId === '') {
      setDocument((current) =>
        touch({
          ...current,
          pallets: current.pallets.map((pallet) =>
            pallet.id === palletId
              ? {
                  ...pallet,
                  items: pallet.items.map((item) =>
                    item.id === itemId ? clearItemProduct(item) : item,
                  ),
                }
              : pallet,
          ),
        }),
      );
      return;
    }

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
                        planId: createId(),
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

  const computedPallets = useMemo(
    () => document.pallets.map(calculateComputedPallet),
    [document.pallets],
  );
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
    isSaving,
    saveCurrentDocument,
    updateHeader,
    updateCountryPreset,
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
