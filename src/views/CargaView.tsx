import { useEffect, useRef } from 'react';
import type { ItemValidation, PalletComputed, Product, ShipmentDocument, ShipmentValidation } from '../types';
import { formatWeight } from '../utils/format';
import { PalletCardCarga } from '../components/PalletCardCarga';

type CargaViewProps = {
  document: ShipmentDocument;
  computedPallets: PalletComputed[];
  products: Product[];
  lastCreatedItemId: string | null;
  activePalletId: string | null;
  validation: ShipmentValidation;
  onSetActivePallet: (palletId: string | null) => void;
  onAddPallet: () => void;
  onUpdatePallet: {
    (palletId: string, field: 'label', value: string): void;
    (palletId: string, field: 'palletTareWeightKg', value: number): void;
  };
  onRemovePallet: (palletId: string) => void;
  onAddItem: (palletId: string) => void;
  onClonePallet: (palletId: string) => void;
  onSelectProduct: (palletId: string, itemId: string, productId: string) => void;
  onUpdateItem: (
    palletId: string,
    itemId: string,
    field: 'productionNumber' | 'quantity',
    value: string | number,
  ) => void;
  onRemoveItem: (palletId: string, itemId: string) => void;
};

export const CargaView = ({
  document,
  computedPallets,
  products,
  lastCreatedItemId,
  activePalletId,
  validation,
  onSetActivePallet,
  onAddPallet,
  onUpdatePallet,
  onRemovePallet,
  onAddItem,
  onClonePallet,
  onSelectProduct,
  onUpdateItem,
  onRemoveItem,
}: CargaViewProps) => {
  const lastPalletRef = useRef<HTMLDivElement | null>(null);
  const previousPalletCountRef = useRef(0);

  // Scroll to new pallet when added
  useEffect(() => {
    if (computedPallets.length > previousPalletCountRef.current) {
      requestAnimationFrame(() => {
        lastPalletRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    previousPalletCountRef.current = computedPallets.length;
  }, [computedPallets.length]);

  // Auto-select active pallet
  useEffect(() => {
    if (!computedPallets.length) {
      onSetActivePallet(null);
      return;
    }

    if (activePalletId === null) {
      return;
    }

    const hasActivePallet = computedPallets.some((pallet) => pallet.id === activePalletId);
    if (!hasActivePallet) {
      onSetActivePallet(computedPallets[0].id);
    }
  }, [activePalletId, computedPallets, onSetActivePallet]);

  const hasPallets = computedPallets.length > 0;

  return (
    <section className="mb-8 animate-stage-in">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            Carga final por paleta
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Esta vista está pensada para el encargado que conoce el contenido real final. Carga
            una paleta por vez con sus productos, lotes y cantidades definitivas.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600 active:scale-95"
          onClick={onAddPallet}
        >
          Añadir paleta
        </button>
      </div>

      {!hasPallets ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white/50 px-6 py-16 text-center dark:border-stone-600 dark:bg-stone-900/50">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <svg className="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-stone-600 dark:text-stone-300">
            No hay paletas para cargar
          </h3>
          <p className="mb-4 max-w-sm text-sm text-stone-400 dark:text-stone-500">
            Primero prepará las paletas en la sección Preparación, o agregá una nueva desde acá.
          </p>
          <button
            type="button"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            onClick={onAddPallet}
          >
            Crear paleta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {computedPallets.map((pallet, index) => {
            const isActive = pallet.id === activePalletId;

            return (
              <div
                key={pallet.id}
                ref={index === computedPallets.length - 1 ? lastPalletRef : null}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
              >
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                  onClick={() => onSetActivePallet(isActive ? null : pallet.id)}
                >
                  <div className="flex items-center gap-3">
                    <strong className="text-stone-800 dark:text-stone-100">{`Paleta ${index + 1}`}</strong>
                    <span className="text-sm text-stone-500 dark:text-stone-400">
                      {pallet.items.length > 0
                        ? `${pallet.items.length} item${pallet.items.length === 1 ? '' : 's'}`
                        : 'Vacía'}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium text-stone-600 dark:text-stone-300">
                    {formatWeight(pallet.totalGrossWeightKg)}
                  </span>
                </button>

                {isActive && (
                  <div className="border-t border-stone-200 p-5 dark:border-stone-700">
                    <PalletCardCarga
                      pallet={pallet}
                      products={products}
                      autoFocusItemId={lastCreatedItemId}
                      itemErrors={
                        validation.palletErrors.find((entry) => entry.palletId === pallet.id)?.itemErrors ?? {}
                      }
                      index={index}
                      canRemove={computedPallets.length > 1}
                      onUpdatePallet={onUpdatePallet}
                      onRemovePallet={onRemovePallet}
                      onAddItem={onAddItem}
                      onClonePallet={onClonePallet}
                      onSelectProduct={onSelectProduct}
                      onUpdateItem={onUpdateItem}
                      onRemoveItem={onRemoveItem}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
