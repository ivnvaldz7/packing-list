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
    <section className="summary-layout">
      <article className="notes-panel">
        <h3>Notas de exportacion</h3>
        <p>
          El documento se completa en dos etapas: primero se prepara la estructura del embarque y
          despues el encargado carga digitalmente los productos, lotes y cantidades reales de cada
          paleta.
        </p>
        <div className="notes-signatures">
          <div>
            <span />
            <p>Firma responsable logistica</p>
          </div>
          <div>
            <span />
            <p>Sello institucional Ale-Bet</p>
          </div>
        </div>
      </article>

      <article className="manifest-summary-card">
        <h3>Resumen consolidado de carga</h3>
        <div className="manifest-summary-row">
          <span>Total paletas</span>
          <strong>{String(document.pallets.length).padStart(2, '0')}</strong>
        </div>
        <div className="manifest-summary-row">
          <span>Items cargados</span>
          <strong>{String(totalItems).padStart(2, '0')}</strong>
        </div>
        <div className="manifest-summary-row">
          <span>Total unidades</span>
          <strong>{totalUnits}</strong>
        </div>
        <div className="manifest-summary-row">
          <span>Peso neto total</span>
          <strong>{formatWeight(totalNetWeightKg)}</strong>
        </div>
        <div className="manifest-summary-row">
          <span>Peso bruto estimado</span>
          <strong>{formatWeight(totalGrossWeightKg)}</strong>
        </div>
        <div className="manifest-status-row">
          <span>Estado</span>
          <strong className={`manifest-status-chip ${isValid ? 'manifest-status-valid' : 'manifest-status-warning'}`}>
            {isValid ? 'Borrador validado' : 'Revision pendiente'}
          </strong>
        </div>
      </article>
    </section>
  );
};
