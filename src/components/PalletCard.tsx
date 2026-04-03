import type { ChangeEvent } from 'react';
import type { ItemValidation, PalletComputed, Product } from '../types';
import { formatWeight, formatWholeWeight } from '../utils/format';
import { InputField } from './Field';

type PalletCardProps = {
  mode: 'preparacion' | 'carga';
  pallet: PalletComputed;
  products: Product[];
  autoFocusItemId?: string | null;
  itemErrors: Record<string, ItemValidation>;
  index: number;
  canRemove: boolean;
  onUpdatePallet: (palletId: string, field: 'label', value: string) => void;
  onRemovePallet: (palletId: string) => void;
  onAddItem: (palletId: string, mode: 'preparacion' | 'carga') => void;
  onClonePallet: (palletId: string) => void;
  onSelectProduct: (palletId: string, itemId: string, productId: string) => void;
  onUpdateItem: (
    mode: 'preparacion' | 'carga',
    palletId: string,
    itemId: string,
    field: 'productionNumber' | 'quantity',
    value: string | number,
  ) => void;
  onRemoveItem: (palletId: string, itemId: string) => void;
};

const parseIntegerInput = (event: ChangeEvent<HTMLInputElement>): number => {
  const sanitized = event.target.value.replace(/[^\d]/g, '');
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const PalletCard = ({
  mode,
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
}: PalletCardProps) => {
  const isPreparation = mode === 'preparacion';

  return (
    <section className="manifest-pallet">
      <div className="manifest-pallet-head">
        <div className="manifest-pallet-head-left">
          <span className="manifest-pallet-badge">{`Paleta ${String(index + 1).padStart(2, '0')}`}</span>
          <div className="manifest-pallet-tare">
            <label>Peso tarima (kg)</label>
            <input value={Math.round(pallet.palletTareWeightKg)} readOnly className="readonly-input center-input" />
          </div>
        </div>
        <div className="panel-actions">
          <button type="button" className="secondary-button manifest-button" onClick={() => onAddItem(pallet.id, mode)}>
            {isPreparation ? 'Agregar producto' : 'Agregar item'}
          </button>
          <button type="button" className="secondary-button manifest-button" onClick={() => onClonePallet(pallet.id)}>
            Duplicar paleta
          </button>
          <button
            type="button"
            className="ghost-button manifest-button"
            onClick={() => onRemovePallet(pallet.id)}
            disabled={!canRemove}
          >
            Eliminar paleta
          </button>
        </div>
      </div>

      <div className="grid grid-1 manifest-pallet-meta">
        <InputField
          label="Nombre interno"
          value={pallet.label}
          onChange={(event) => onUpdatePallet(pallet.id, 'label', event.target.value)}
          placeholder={`Paleta ${index + 1}`}
        />
      </div>

      {isPreparation ? (
        <div className="table-shell">
          <table className="manifest-table manifest-table-preparation">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Und.</th>
                <th>Frascos/caja</th>
                <th>Peso/caja</th>
                <th>Frascos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pallet.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <select
                      className={itemErrors[item.id]?.productId ? 'input-error' : ''}
                      title={itemErrors[item.id]?.productId}
                      value={item.productId}
                      onChange={(event) => onSelectProduct(pallet.id, item.id, event.target.value)}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input value={item.unit} readOnly className="readonly-input center-input" />
                  </td>
                  <td>
                    <input
                      value={item.unitsPerBox || ''}
                      readOnly
                      className="readonly-input center-input"
                      placeholder="Auto"
                    />
                  </td>
                  <td>
                    <input
                      value={item.weightPerBoxKg === 0 ? '' : item.weightPerBoxKg}
                      readOnly
                      className="readonly-input center-input"
                      placeholder="Auto"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={itemErrors[item.id]?.quantity ? 'input-error center-input' : 'center-input'}
                      title={itemErrors[item.id]?.quantity}
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(event) =>
                        onUpdateItem(mode, pallet.id, item.id, 'quantity', parseIntegerInput(event))
                      }
                    />
                  </td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="ghost-button small-button manifest-button"
                      onClick={() => onRemoveItem(pallet.id, item.id)}
                      disabled={pallet.items.length === 1}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="manifest-carga-list">
          {pallet.items.map((item, itemIndex) => (
            <article key={item.id} className="manifest-carga-item">
              <div className="manifest-carga-item-header">
                <div>
                  <span className="manifest-carga-index">{`Item ${itemIndex + 1}`}</span>
                  <strong>{item.description || 'Seleccionar producto'}</strong>
                </div>
                <div className="manifest-carga-header-actions">
                  <span className="manifest-carga-weight">{formatWeight(item.netWeightKg)}</span>
                  <button
                    type="button"
                    className="ghost-button small-button manifest-button"
                    onClick={() => onRemoveItem(pallet.id, item.id)}
                    disabled={pallet.items.length === 1}
                  >
                    Quitar
                  </button>
                </div>
              </div>

              <div className="manifest-carga-grid">
                <label className="manifest-carga-field manifest-carga-product">
                  <span>Producto</span>
                  <select
                    className={itemErrors[item.id]?.productId ? 'input-error' : ''}
                    title={itemErrors[item.id]?.productId}
                    value={item.productId}
                    onChange={(event) => onSelectProduct(pallet.id, item.id, event.target.value)}
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="manifest-carga-field">
                  <span>Prefijo</span>
                  <input value={item.lotPrefix} readOnly className="readonly-input center-input" />
                </label>

                <label className="manifest-carga-field">
                  <span>N° lote</span>
                  <input
                    autoFocus={autoFocusItemId === item.id}
                    value={item.productionNumber}
                    onChange={(event) =>
                      onUpdateItem(mode, pallet.id, item.id, 'productionNumber', event.target.value)
                    }
                    className={itemErrors[item.id]?.productionNumber ? 'input-error center-input' : 'center-input'}
                    title={itemErrors[item.id]?.productionNumber}
                    placeholder="138"
                  />
                </label>

                <label className="manifest-carga-field">
                  <span>Frascos</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={itemErrors[item.id]?.quantity ? 'input-error center-input' : 'center-input'}
                    title={itemErrors[item.id]?.quantity}
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(event) =>
                      onUpdateItem(mode, pallet.id, item.id, 'quantity', parseIntegerInput(event))
                    }
                  />
                </label>

                <label className="manifest-carga-field">
                  <span>Cajas</span>
                  <input value={item.boxesCount} readOnly className="readonly-input center-input" />
                </label>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="manifest-pallet-footer">
        {isPreparation ? (
          <span>{`${pallet.items.length} producto${pallet.items.length === 1 ? '' : 's'} previstos`}</span>
        ) : (
          <span>{`Subtotal neto ${formatWeight(pallet.totalNetWeightKg)}`}</span>
        )}
        {isPreparation ? null : <span>{`Peso bruto ${formatWeight(pallet.totalGrossWeightKg)}`}</span>}
        <span>{`Tarima ${formatWholeWeight(pallet.palletTareWeightKg)}`}</span>
      </div>
    </section>
  );
};
