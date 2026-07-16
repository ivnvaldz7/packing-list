import type { ChangeEvent } from 'react';
import type { ItemValidation, PalletComputed, Product } from '../types';
import { formatWeight, formatWholeWeight } from '../utils/format';
import { InputField } from './Field';
import { ProductCombobox } from './ProductCombobox';
import { IconPackage, IconTrash } from './layout/Icons';

/* ─── Shared input classes ─── */

const fieldCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-center text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100';
const fieldErrCls =
  'w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-sm text-red-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-950 dark:text-red-300';
const readonlyCls = `${fieldCls} cursor-default opacity-70`;
const autoFieldCls =
  'w-full cursor-default rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-center text-sm text-stone-500 shadow-inner shadow-stone-100/50 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-400 dark:shadow-none';

/* ─── Types ─── */

export type PalletCardProps = {
  mode: 'preparacion' | 'carga';
  pallet: PalletComputed;
  products: Product[];
  autoFocusItemId?: string | null;
  itemErrors: Record<string, ItemValidation>;
  index: number;
  canRemove: boolean;
  readOnly?: boolean;
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
   PalletCard
   ══════════════════════════════════════════════════ */

export const PalletCard = ({
  mode,
  pallet,
  products,
  autoFocusItemId,
  itemErrors,
  index,
  canRemove,
  readOnly = false,
  onUpdatePallet,
  onRemovePallet,
  onAddItem,
  onClonePallet,
  onSelectProduct,
  onUpdateItem,
  onRemoveItem,
}: PalletCardProps) => {
  const hasErrors = Object.values(itemErrors).some(
    (err) => err.productId || err.quantity || err.productionNumber,
  );

  return (
    <section
      className={`rounded-2xl border bg-white p-4 shadow-sm shadow-stone-200/60 transition-all duration-200 dark:bg-stone-900 dark:shadow-black/10 sm:p-5 ${
        hasErrors
          ? 'border-red-200 shadow-red-100 dark:border-red-800 dark:shadow-red-950'
          : 'border-stone-200 dark:border-stone-700'
      }`}
    >
      {/* ─── Header ─── */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-h-9 items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
              hasErrors
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
            }`}
          >
            {`PALETA ${String(index + 1).padStart(2, '0')}`}
          </span>

          {mode === 'carga' && (
            <label className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              Peso tarima (kg)
              <input
                type="number"
                min={0}
                value={pallet.palletTareWeightKg}
                onChange={(e) =>
                  onUpdatePallet(pallet.id, 'palletTareWeightKg', parseFloat(e.target.value) || 0)
                }
                readOnly={readOnly}
                className={readOnly ? readonlyCls : fieldCls}
              />
            </label>
          )}
        </div>

        {!readOnly && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onAddItem(pallet.id)}
              className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              Agregar {mode === 'carga' ? 'item' : 'producto'}
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
        )}
      </div>

      {/* ─── Label ─── */}
      <div className="mb-5">
        <InputField
          label="Nombre interno"
          value={pallet.label}
          onChange={(event) => onUpdatePallet(pallet.id, 'label', event.target.value)}
          placeholder={`Paleta ${index + 1}`}
          readOnly={readOnly}
        />
      </div>

      {/* ════════════════ ITEMS ════════════════ */}
      {mode === 'preparacion' ? (
        <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-stone-800">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-800/50">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Producto
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Frascos
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Unidad
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Frascos por caja
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Peso por caja
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {pallet.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-stone-100 last:border-0 dark:border-stone-800"
                >
                  <td className="w-[42%] px-3 py-2 align-top">
                    <ProductCombobox
                      products={products}
                      value={item.productId}
                      onChange={(productId) => onSelectProduct(pallet.id, item.id, productId)}
                      className={
                        itemErrors[item.id]?.productId ? fieldErrCls : `${fieldCls} text-left`
                      }
                      title={itemErrors[item.id]?.productId}
                      disabled={readOnly}
                      label="Producto"
                    />
                  </td>
                  <td className="w-28 px-3 py-2 align-top">
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Frascos"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(event) =>
                        onUpdateItem(pallet.id, item.id, 'quantity', parseIntegerInput(event))
                      }
                      className={itemErrors[item.id]?.quantity ? fieldErrCls : fieldCls}
                      title={itemErrors[item.id]?.quantity}
                      readOnly={readOnly}
                    />
                  </td>
                  <td className="w-28 px-3 py-2 align-top">
                    <input
                      aria-label="Unidad"
                      value={item.unit}
                      readOnly
                      tabIndex={-1}
                      className={autoFieldCls}
                    />
                  </td>
                  <td className="w-36 px-3 py-2 align-top">
                    <input
                      aria-label="Frascos por caja"
                      value={item.unitsPerBox || ''}
                      readOnly
                      tabIndex={-1}
                      className={autoFieldCls}
                      placeholder="Auto"
                    />
                  </td>
                  <td className="w-32 px-3 py-2 align-top">
                    <input
                      aria-label="Peso por caja"
                      value={item.weightPerBoxKg === 0 ? '' : item.weightPerBoxKg}
                      readOnly
                      tabIndex={-1}
                      className={autoFieldCls}
                      placeholder="Auto"
                    />
                  </td>
                  <td className="w-12 px-3 py-2 text-right align-top">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(pallet.id, item.id)}
                      disabled={pallet.items.length === 1 || readOnly}
                      title="Eliminar item"
                      className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-stone-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {pallet.items.map((item, itemIndex) => (
            <article
              key={item.id}
              className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {`Item ${itemIndex + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(pallet.id, item.id)}
                  disabled={pallet.items.length === 1 || readOnly}
                  title="Eliminar item"
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-stone-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Producto
                  </span>
                  <ProductCombobox
                    products={products}
                    value={item.productId}
                    onChange={(productId) => onSelectProduct(pallet.id, item.id, productId)}
                    className={
                      itemErrors[item.id]?.productId ? fieldErrCls : `${fieldCls} text-left`
                    }
                    title={itemErrors[item.id]?.productId}
                    disabled={readOnly}
                    label="Producto"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Prefijo
                  </span>
                  <input value={item.lotPrefix} readOnly tabIndex={-1} className={readonlyCls} />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    N° lote
                  </span>
                  <input
                    autoFocus={autoFocusItemId === item.id}
                    value={item.productionNumber}
                    onChange={(event) =>
                      onUpdateItem(pallet.id, item.id, 'productionNumber', event.target.value)
                    }
                    className={itemErrors[item.id]?.productionNumber ? fieldErrCls : fieldCls}
                    title={itemErrors[item.id]?.productionNumber}
                    placeholder="138"
                    readOnly={readOnly}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Frascos
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(event) =>
                      onUpdateItem(pallet.id, item.id, 'quantity', parseIntegerInput(event))
                    }
                    className={itemErrors[item.id]?.quantity ? fieldErrCls : fieldCls}
                    title={itemErrors[item.id]?.quantity}
                    readOnly={readOnly}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Cajas
                  </span>
                  <input value={item.boxesCount} readOnly tabIndex={-1} className={readonlyCls} />
                </label>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ─── Footer ─── */}
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
        {mode === 'preparacion' ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <IconPackage className="h-4 w-4 text-brand-500" />
              {`${pallet.items.length} producto${pallet.items.length === 1 ? '' : 's'} previstos`}
            </span>
            <span aria-hidden="true" className="h-4 w-px bg-stone-200 dark:bg-stone-700" />
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-brand-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v18" />
                <path d="M5 8h14" />
                <path d="M6 8l-3 7h6L6 8z" />
                <path d="M18 8l-3 7h6l-3-7z" />
              </svg>
              {`Tarima ${formatWholeWeight(pallet.palletTareWeightKg)}`}
            </span>
          </>
        ) : (
          <>
            <span>{`Subtotal neto ${formatWeight(pallet.totalNetWeightKg)}`}</span>
            <span>{`Peso bruto ${formatWeight(pallet.totalGrossWeightKg)}`}</span>
            <span>{`Tarima ${formatWholeWeight(pallet.palletTareWeightKg)}`}</span>
          </>
        )}
      </div>
    </section>
  );
};
