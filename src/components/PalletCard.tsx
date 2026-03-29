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
    field: 'lotPrefix' | 'quantity' | 'unitNetWeightKg',
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
  <section className="panel pallet-card">
    <div className="panel-header">
      <div>
        <p className="eyebrow">Paso 2 y 3</p>
        <h2>{`Paleta ${index + 1}`}</h2>
        {pallet.label.trim() && pallet.label !== `Paleta ${index + 1}` ? (
          <p className="panel-copy">Nombre interno: {pallet.label}</p>
        ) : null}
      </div>
      <div className="panel-actions">
        <button type="button" className="secondary-button" onClick={() => onAddItem(pallet.id)}>
          Agregar ítem
        </button>
        <button type="button" className="secondary-button" onClick={() => onClonePallet(pallet.id)}>
          Duplicar paleta
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onRemovePallet(pallet.id)}
          disabled={!canRemove}
        >
          Eliminar paleta
        </button>
      </div>
    </div>

    <div className="grid grid-2">
      <InputField
        label="Nombre de paleta"
        value={pallet.label}
        onChange={(event) => onUpdatePallet(pallet.id, 'label', event.target.value)}
        placeholder={`Paleta ${index + 1}`}
      />
      <InputField
        label="Peso tarima (kg)"
        type="number"
        min={0}
        step={0.001}
        value={pallet.palletTareWeightKg}
        onChange={(event) => onUpdatePallet(pallet.id, 'palletTareWeightKg', parseNumber(event))}
      />
    </div>

    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Ítem</th>
            <th>Producto</th>
            <th>SKU</th>
            <th>Prefijo lote</th>
            <th>Unidad</th>
            <th>Por caja</th>
            <th>Cantidad</th>
            <th>Kg netos unit.</th>
            <th>Kg netos ítem</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pallet.items.map((item, itemIndex) => (
            <tr key={item.id}>
              <td className="item-index-cell">{itemIndex + 1}</td>
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
                <input value={item.sku} readOnly className="readonly-input" placeholder="Auto" />
              </td>
              <td>
                <input
                  value={item.lotPrefix}
                  onChange={(event) =>
                    onUpdateItem(pallet.id, item.id, 'lotPrefix', event.target.value)
                  }
                  placeholder="Prefijo lote"
                />
              </td>
              <td>
                <input value={item.unit} readOnly className="readonly-input" />
              </td>
              <td>
                <input
                  value={item.unitsPerBox || ''}
                  readOnly
                  className="readonly-input"
                  placeholder="Auto"
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className={itemErrors[item.id]?.quantity ? 'input-error' : ''}
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
                <input
                  type="number"
                  min={0}
                  step={0.001}
                  className={itemErrors[item.id]?.unitNetWeightKg ? 'input-error' : ''}
                  value={item.unitNetWeightKg}
                  onChange={(event) =>
                    onUpdateItem(pallet.id, item.id, 'unitNetWeightKg', parseNumber(event))
                  }
                />
                {itemErrors[item.id]?.unitNetWeightKg ? (
                  <small className="table-error">{itemErrors[item.id]?.unitNetWeightKg}</small>
                ) : null}
              </td>
              <td className="metric-cell">{formatWeight(item.netWeightKg)}</td>
              <td className="actions-cell">
                <button
                  type="button"
                  className="ghost-button small-button"
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

    <div className="summary-row">
      <article className="summary-card">
        <span>Peso neto total</span>
        <strong>{formatWeight(pallet.totalNetWeightKg)}</strong>
      </article>
      <article className="summary-card">
        <span>Peso bruto total</span>
        <strong>{formatWeight(pallet.totalGrossWeightKg)}</strong>
      </article>
      <article className="summary-card">
        <span>Peso tarima</span>
        <strong>{formatWeight(pallet.palletTareWeightKg)}</strong>
      </article>
    </div>
  </section>
);
