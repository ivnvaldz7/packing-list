import type { ChangeEvent } from 'react';
import type { ItemValidation, PalletComputed, Product } from '../types';
import { formatWeight, formatWholeWeight } from '../utils/format';
import { InputField } from './Field';

/* ─── Shared input classes ─── */

const fieldCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-center text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100';
const fieldErrCls =
  'w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-sm text-red-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-950 dark:text-red-300';
const readonlyCls = `${fieldCls} cursor-default opacity-70`;

/* ─── Types ─── */

export type PalletCardCargaProps = {
  pallet: PalletComputed;
  products: Product[];
  autoFocusItemId?: string | null;
  itemErrors: Record<string, ItemValidation>;
  index: number;
  canRemove: boolean;
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

/* ─── Helpers ─── */

const parseIntegerInput = (event: ChangeEvent<HTMLInputElement>): number => {
  const sanitized = event.target.value.replace(/[^\d]/g, '');
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
};

/* ══════════════════════════════════════════════════
   PalletCardCarga
   ══════════════════════════════════════════════════ */

export const PalletCardCarga = ({
  pallet,
  products,
  autoFocusItemId,
  itemErrors,
  index,
  canRemove,
  onUpdatePallet,
  onRemovePallet,
  onAddItem,
  onClonePallet,
  onSelectProduct,
  onUpdateItem,
  onRemoveItem,
}: PalletCardCargaProps) => {
  const hasErrors = Object.values(itemErrors).some(
    (err) => err.productId || err.quantity || err.productionNumber,
  );

  return (
    <section
      className={`rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 dark:bg-stone-900 ${
        hasErrors
          ? 'border-red-200 shadow-red-100 dark:border-red-800 dark:shadow-red-950'
          : 'border-stone-200 dark:border-stone-700'
      }`}
    >
      {/* ─── Header ─── */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              hasErrors
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
            }`}
          >
            {`Paleta ${String(index + 1).padStart(2, '0')}`}
          </span>

          <label className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            Peso tarima (kg)
            <input
              type="number"
              min={0}
              value={pallet.palletTareWeightKg}
              onChange={(e) => onUpdatePallet(pallet.id, 'palletTareWeightKg', parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-center text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onAddItem(pallet.id)}
            className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 active:scale-95 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900"
          >
            Agregar item
          </button>
          <button
            type="button"
            onClick={() => onClonePallet(pallet.id)}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Duplicar paleta
          </button>
          <button
            type="button"
            onClick={() => onRemovePallet(pallet.id)}
            disabled={!canRemove}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* ─── Label ─── */}
      <div className="mb-4">
        <InputField
          label="Nombre interno"
          value={pallet.label}
          onChange={(event) => onUpdatePallet(pallet.id, 'label', event.target.value)}
          placeholder={`Paleta ${index + 1}`}
        />
      </div>

      {/* ════════════════ ITEMS EN CARDS ════════════════ */}
      <div className="space-y-3">
        {pallet.items.map((item, itemIndex) => (
          <article
            key={item.id}
            className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50"
          >
            {/* Item header */}
            <div className="mb-3 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {`Item ${itemIndex + 1}`}
                </span>
                <strong className="ml-2 text-sm text-stone-800 dark:text-stone-100">
                  {item.description || 'Seleccionar producto'}
                </strong>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-medium text-stone-500 dark:text-stone-400">
                  {formatWeight(item.netWeightKg)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(pallet.id, item.id)}
                  disabled={pallet.items.length === 1}
                  className="text-xs text-stone-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-stone-500 dark:hover:text-red-400"
                >
                  Quitar
                </button>
              </div>
            </div>

            {/* Item fields */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Producto</span>
                <select
                  value={item.productId}
                  onChange={(event) => onSelectProduct(pallet.id, item.id, event.target.value)}
                  className={itemErrors[item.id]?.productId ? fieldErrCls : `${fieldCls} text-left`}
                  title={itemErrors[item.id]?.productId}
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Prefijo</span>
                <input value={item.lotPrefix} readOnly className={readonlyCls} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">N° lote</span>
                <input
                  autoFocus={autoFocusItemId === item.id}
                  value={item.productionNumber}
                  onChange={(event) =>
                    onUpdateItem(pallet.id, item.id, 'productionNumber', event.target.value)
                  }
                  className={itemErrors[item.id]?.productionNumber ? fieldErrCls : fieldCls}
                  title={itemErrors[item.id]?.productionNumber}
                  placeholder="138"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Frascos</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(event) =>
                    onUpdateItem(pallet.id, item.id, 'quantity', parseIntegerInput(event))
                  }
                  className={itemErrors[item.id]?.quantity ? fieldErrCls : fieldCls}
                  title={itemErrors[item.id]?.quantity}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Cajas</span>
                <input value={item.boxesCount} readOnly className={readonlyCls} />
              </label>
            </div>
          </article>
        ))}
      </div>

      {/* ─── Footer ─── */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-stone-100 pt-3 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
        <span>{`Subtotal neto ${formatWeight(pallet.totalNetWeightKg)}`}</span>
        <span>{`Peso bruto ${formatWeight(pallet.totalGrossWeightKg)}`}</span>
        <span>{`Tarima ${formatWholeWeight(pallet.palletTareWeightKg)}`}</span>
      </div>
    </section>
  );
};
