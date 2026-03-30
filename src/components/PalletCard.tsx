import type { ChangeEvent } from 'react';
import type { ItemValidation, PalletComputed, Product } from '../types';
import { formatWeight } from '../utils/format';
import { InputField } from './Field';

type PalletCardProps = {
  pallet: PalletComputed;
  products: Product[];
  itemErrors: Record<string, ItemValidation>;
  index: number;
  canRemove: boolean;
  onUpdatePallet: (palletId: string, field: 'label' | 'palletTareWeightKg', value: string | number) => void;
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

const parseNumber = (event: ChangeEvent<HTMLInputElement>): number => {
  const parsed = Number(event.target.value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const PalletCard = ({
  pallet,
  products,
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
}: PalletCardProps) => (
  <section className="manifest-pallet">
    <div className="manifest-pallet-head">
      <div className="manifest-pallet-head-left">
        <span className="manifest-pallet-badge">{`Paleta ${String(index + 1).padStart(2, '0')}`}</span>
        <div className="manifest-pallet-tare">
          <label>Peso tarima (kg)</label>
          <input
            type="number"
            min={0}
            step={0.001}
            value={pallet.palletTareWeightKg}
            onChange={(event) => onUpdatePallet(pallet.id, 'palletTareWeightKg', parseNumber(event))}
          />
        </div>
      </div>
      <div className="panel-actions">
        <button type="button" className="secondary-button manifest-button" onClick={() => onAddItem(pallet.id)}>
          Agregar item
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

    <div className="table-shell">
      <table className="manifest-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Prefijo</th>
            <th>Prod.</th>
            <th>Und.</th>
            <th>Frascos/caja</th>
            <th>Frascos</th>
            <th>Cajas</th>
            <th>Peso/caja</th>
            <th>Peso total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pallet.items.map((item) => (
            <tr key={item.id}>
              <td>
                <select
                  className={itemErrors[item.id]?.productId ? 'input-error' : ''}
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
                {itemErrors[item.id]?.productId ? (
                  <small className="table-error">{itemErrors[item.id]?.productId}</small>
                ) : null}
              </td>
              <td>
                <input value={item.lotPrefix} readOnly className="readonly-input center-input" />
              </td>
              <td>
                <input
                  value={item.productionNumber}
                  onChange={(event) =>
                    onUpdateItem(pallet.id, item.id, 'productionNumber', event.target.value)
                  }
                  className="center-input"
                  placeholder="138"
                />
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
                  type="number"
                  min={0}
                  step={1}
                  className={itemErrors[item.id]?.quantity ? 'input-error center-input' : 'center-input'}
                  value={item.quantity}
                  onChange={(event) =>
                    onUpdateItem(pallet.id, item.id, 'quantity', parseNumber(event))
                  }
                />
                {itemErrors[item.id]?.quantity ? (
                  <small className="table-error">{itemErrors[item.id]?.quantity}</small>
                ) : null}
              </td>
              <td>
                <input value={item.boxesCount} readOnly className="readonly-input center-input" />
              </td>
              <td>
                <input value={item.weightPerBoxKg} readOnly className="readonly-input center-input" />
              </td>
              <td className="metric-cell">{formatWeight(item.netWeightKg)}</td>
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

    <div className="manifest-pallet-footer">
      <span>{`Subtotal neto ${formatWeight(pallet.totalNetWeightKg)}`}</span>
      <span>{`Peso bruto ${formatWeight(pallet.totalGrossWeightKg)}`}</span>
      <span>{`Tarima ${formatWeight(pallet.palletTareWeightKg)}`}</span>
    </div>
  </section>
);
