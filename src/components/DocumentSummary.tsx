import type { ShipmentDocument } from '../types';
import { formatWeight } from '../utils/format';

type DocumentSummaryProps = {
  document: ShipmentDocument;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
  isValid: boolean;
};

export const DocumentSummary = ({
  document,
  totalNetWeightKg,
  totalGrossWeightKg,
  isValid,
}: DocumentSummaryProps) => {
  const totalItems = document.pallets.reduce((sum, pallet) => sum + pallet.items.length, 0);
  const totalUnits = document.pallets.reduce(
    (sum, pallet) => sum + pallet.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Resumen</p>
          <h2>Resumen general del documento</h2>
        </div>
        <p className={`status-badge ${isValid ? 'status-valid' : 'status-warning'}`}>
          {isValid ? 'Listo para seguir' : 'Faltan datos mínimos'}
        </p>
      </div>

      <div className="summary-row summary-row-5">
        <article className="summary-card">
          <span>Paletas</span>
          <strong>{document.pallets.length}</strong>
        </article>
        <article className="summary-card">
          <span>Ítems cargados</span>
          <strong>{totalItems}</strong>
        </article>
        <article className="summary-card">
          <span>Total de unidades</span>
          <strong>{totalUnits}</strong>
        </article>
        <article className="summary-card">
          <span>Peso neto total</span>
          <strong>{formatWeight(totalNetWeightKg)}</strong>
        </article>
        <article className="summary-card">
          <span>Peso bruto total</span>
          <strong>{formatWeight(totalGrossWeightKg)}</strong>
        </article>
      </div>
    </section>
  );
};
