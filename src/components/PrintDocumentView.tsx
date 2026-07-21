import type { PalletComputed, ShipmentDocument } from '../types';
import { formatWeight, formatWholeWeight } from '../utils/format';
import { LaboratoryLogo } from './LaboratoryLogo';

type PrintDocumentViewProps = {
  document: ShipmentDocument;
  pallets: PalletComputed[];
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
};

const displayValue = (value: string) => value || '-';

export const PrintDocumentView = ({
  document,
  pallets,
  totalNetWeightKg,
  totalGrossWeightKg,
}: PrintDocumentViewProps) => {
  const totalUnits = pallets.reduce(
    (sum, pallet) => sum + pallet.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const totalBoxes = pallets.reduce(
    (sum, pallet) => sum + pallet.items.reduce((itemSum, item) => itemSum + item.boxesCount, 0),
    0,
  );
  const generatedOn = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="print-only print-document">
      <header className="print-hdr">
        <LaboratoryLogo
          className="laboratory-logo laboratory-logo-print"
          laboratoryName={document.header.laboratoryName}
        />
        <div className="print-hdr-titles">
          <p className="print-hdr-kicker">Documento de expedición</p>
          <h1 className="print-hdr-title">Lista de empaque</h1>
          <p className="print-hdr-subtitle">Consolidado por pallet</p>
        </div>
      </header>

      <div className="print-primary-meta" data-testid="print-primary-meta">
        <div className="print-primary-field">
          <span className="print-primary-label">Factura</span>
          <strong className="print-primary-value">
            {displayValue(document.header.invoiceNumber)}
          </strong>
        </div>
        <div className="print-primary-field">
          <span className="print-primary-label">Destino</span>
          <strong className="print-primary-value">{displayValue(document.header.country)}</strong>
        </div>
      </div>

      <dl className="print-meta">
        <div className="print-meta-field print-meta-field--wide">
          <dt>Cliente</dt>
          <dd>{displayValue(document.header.laboratoryName)}</dd>
        </div>
        <div className="print-meta-field">
          <dt>Transporte</dt>
          <dd>{displayValue(document.header.transportType)}</dd>
        </div>
        <div className="print-meta-field">
          <dt>Fecha de embarque</dt>
          <dd>{displayValue(document.header.shipmentDate)}</dd>
        </div>
        <div className="print-meta-field print-meta-field--full">
          <dt>Dirección</dt>
          <dd>{displayValue(document.header.address)}</dd>
        </div>
      </dl>

      <main className="print-pallet-list">
        {pallets.map((pallet, palletIndex) => (
          <section key={pallet.id} className="print-section" data-testid="print-pallet">
            <div className="print-section-hdr">
              <div>
                <span className="print-section-index">
                  {String(palletIndex + 1).padStart(2, '0')}
                </span>
                <strong>Pallet {palletIndex + 1}</strong>
              </div>
              <div className="print-section-hdr-meta">
                <span>
                  Tarima <strong>{formatWholeWeight(pallet.palletTareWeightKg)}</strong>
                </span>
                <span>
                  Peso bruto <strong>{formatWeight(pallet.totalGrossWeightKg)}</strong>
                </span>
              </div>
            </div>

            <table className="print-tbl">
              <thead>
                <tr>
                  <th className="print-tbl-th">Producto</th>
                  <th className="print-tbl-th">Lote</th>
                  <th className="print-tbl-th">Detalle</th>
                  <th className="print-tbl-th print-tbl-th--num">Peso neto</th>
                </tr>
              </thead>
              <tbody>
                {pallet.items.map((item) => (
                  <tr key={item.id}>
                    <td className="print-tbl-cell">{displayValue(item.description)}</td>
                    <td className="print-tbl-cell print-tbl-cell--mono">
                      {`${item.lotPrefix || ''}${item.productionNumber || ''}` || '-'}
                    </td>
                    <td className="print-tbl-cell print-tbl-cell--sum">
                      {item.boxesCount} Cj x {item.unitsPerBox} Fr x{' '}
                      {formatWeight(item.weightPerBoxKg)}/Cj
                    </td>
                    <td className="print-tbl-cell print-tbl-cell--num">
                      {formatWeight(item.netWeightKg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </main>

      <section className="print-totals" aria-label="Resumen del embarque">
        <div className="print-totals-counts">
          <div>
            <span>Paletas</span>
            <strong>{pallets.length}</strong>
          </div>
          <div>
            <span>Frascos</span>
            <strong>{totalUnits}</strong>
          </div>
          <div>
            <span>Cajas</span>
            <strong>{totalBoxes}</strong>
          </div>
        </div>
        <div className="print-weight-summary" data-testid="print-weight-summary">
          <div>
            <span>Neto total</span>
            <strong>{formatWeight(totalNetWeightKg)}</strong>
          </div>
          <div className="print-weight-primary">
            <span>Bruto total</span>
            <strong>{formatWeight(totalGrossWeightKg)}</strong>
          </div>
        </div>
      </section>

      <footer className="print-document-footer" data-testid="print-document-footer">
        <span>Referencia: {displayValue(document.header.invoiceNumber)}</span>
        <span>Generado: {generatedOn}</span>
      </footer>
    </section>
  );
};
