import type { PalletComputed, Product, ShipmentDocument, ShipmentValidation } from '../types';
import { PalletCard } from '../components/PalletCard';

type PreparacionViewProps = {
  document: ShipmentDocument;
  computedPallets: PalletComputed[];
  products: Product[];
  lastCreatedItemId: string | null;
  validation: ShipmentValidation;
  readOnly?: boolean;
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
  onNavigateToCarga: (palletId: string) => void;
};

export const PreparacionView = ({
  document,
  computedPallets,
  products,
  lastCreatedItemId,
  validation,
  readOnly = false,
  onAddPallet,
  onUpdatePallet,
  onRemovePallet,
  onAddItem,
  onClonePallet,
  onSelectProduct,
  onUpdateItem,
  onRemoveItem,
  onNavigateToCarga,
}: PreparacionViewProps) => {
  const hasPallets = computedPallets.length > 0;

  return (
    <section className="mb-8 animate-stage-in">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            Preparación del embarque
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            En esta etapa se define la estructura del documento y los productos previstos por
            paleta. Los lotes y cantidades reales se completan después.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600 active:scale-95"
            onClick={onAddPallet}
          >
            Añadir paleta
          </button>
        )}
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Total paletas
          </span>
          <strong className="mt-1 block text-2xl text-stone-800 dark:text-stone-100">
            {String(document.pallets.length).padStart(2, '0')}
          </strong>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            País
          </span>
          <strong className="mt-1 block text-2xl text-stone-800 dark:text-stone-100">
            {document.header.country || '—'}
          </strong>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Factura
          </span>
          <strong className="mt-1 block text-2xl text-stone-800 dark:text-stone-100">
            {document.header.invoiceNumber || 'Pendiente'}
          </strong>
        </div>
      </div>

      {/* Pallet cards or empty state */}
      {!hasPallets ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white/50 px-6 py-16 text-center dark:border-stone-600 dark:bg-stone-900/50">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <svg
              className="h-6 w-6 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-stone-600 dark:text-stone-300">
            No hay paletas todavía
          </h3>
          <p className="mb-4 max-w-sm text-sm text-stone-400 dark:text-stone-500">
            Empezá agregando tu primera paleta con los productos previstos para el embarque.
          </p>
          <button
            type="button"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            onClick={onAddPallet}
          >
            Crear primera paleta
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {computedPallets.map((pallet, index) => (
              <div key={pallet.id}>
                <PalletCard
                  mode="preparacion"
                  pallet={pallet}
                  products={products}
                  autoFocusItemId={lastCreatedItemId}
                  itemErrors={
                    validation.palletErrors.find((entry) => entry.palletId === pallet.id)
                      ?.itemErrors ?? {}
                  }
                  index={index}
                  canRemove={computedPallets.length > 1}
                  readOnly={readOnly}
                  onUpdatePallet={onUpdatePallet}
                  onRemovePallet={onRemovePallet}
                  onAddItem={onAddItem}
                  onClonePallet={onClonePallet}
                  onSelectProduct={onSelectProduct}
                  onUpdateItem={onUpdateItem}
                  onRemoveItem={onRemoveItem}
                />
                {!readOnly && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      onClick={() => onNavigateToCarga(pallet.id)}
                    >
                      Pasar a carga final →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <div className="mt-6">
              <button
                type="button"
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:bg-stone-100 active:scale-95 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                onClick={onAddPallet}
              >
                Añadir otra paleta
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
