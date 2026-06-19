import type { ChangeEvent } from 'react';
import type { ItemValidation, PalletComputed, Product } from '../types';
import { formatWholeWeight } from '../utils/format';
import { InputField } from './Field';

/* ─── Shared input classes ─── */

const fieldCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-center text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100';
const fieldErrCls =
  'w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-sm text-red-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-950 dark:text-red-300';
const readonlyCls = `${fieldCls} cursor-default opacity-70`;

/* ─── Types ─── */

export type PalletCardPreparacionProps = {
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
    field: 'quantity',
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
   PalletCardPreparacion
   ══════════════════════════════════════════════════ */

export const PalletCardPreparacion = ({
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
}: PalletCardPreparacionProps) => {
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
            Agregar producto
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

      {/* ════════════════ TABLA DE PRODUCTOS ════════════════ */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Producto
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Und.
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Frascos/caja
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Peso/caja
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Frascos
              </th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {pallet.items.map((item) => (
              <tr key={item.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                <td className="px-3 py-2">
                  <select
                    value={item.productId}
                    onChange={(event) => onSelectProduct(pallet.id, item.id, event.target.value)}
                    className={itemErrors[item.id]?.productId ? fieldErrCls : fieldCls}
                    title={itemErrors[item.id]?.productId}
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input value={item.unit} readOnly className={readonlyCls} />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.unitsPerBox || ''}
                    readOnly
                    className={readonlyCls}
                    placeholder="Auto"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.weightPerBoxKg === 0 ? '' : item.weightPerBoxKg}
                    readOnly
                    className={readonlyCls}
                    placeholder="Auto"
                  />
                </td>
                <td className="px-3 py-2">
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
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(pallet.id, item.id)}
                    disabled={pallet.items.length === 1}
                    className="text-xs text-stone-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-stone-500 dark:hover:text-red-400"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Footer ─── */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-stone-100 pt-3 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
        <span>{`${pallet.items.length} producto${pallet.items.length === 1 ? '' : 's'} previstos`}</span>
        <span>{`Tarima ${formatWholeWeight(pallet.palletTareWeightKg)}`}</span>
      </div>
    </section>
  );
};
