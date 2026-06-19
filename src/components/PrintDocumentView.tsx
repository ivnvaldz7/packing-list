import type { PalletComputed, ShipmentDocument } from '../types';
import { formatWeight, formatWholeWeight } from '../utils/format';
import { LaboratoryLogo } from './LaboratoryLogo';

type PrintDocumentViewProps = {
  document: ShipmentDocument;
  pallets: PalletComputed[];
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
};

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

  return (
    <section className="print-only print-document">
      {/* ─── Encabezado ─── */}
      <div className="print-hdr">
        <LaboratoryLogo
          className="laboratory-logo laboratory-logo-print"
          laboratoryName={document.header.laboratoryName}
        />
        <div className="print-hdr-titles">
          <h1 className="print-hdr-title">LISTA DE EMPAQUE</h1>
          <p className="print-hdr-subtitle">Consolidado por paleta</p>
        </div>
      </div>

      <table className="print-meta">
        <tbody>
          <tr>
            <td className="print-meta-lbl">Empresa</td>
            <td className="print-meta-val">{document.header.laboratoryName || '-'}</td>
            <td className="print-meta-lbl">Factura</td>
            <td className="print-meta-val">{document.header.invoiceNumber || '-'}</td>
          </tr>
          <tr>
            <td className="print-meta-lbl">País</td>
            <td className="print-meta-val">{document.header.country || '-'}</td>
            <td className="print-meta-lbl">Transporte</td>
            <td className="print-meta-val">{document.header.transportType || '-'}</td>
          </tr>
          <tr>
            <td className="print-meta-lbl">Dirección</td>
            <td className="print-meta-val" colSpan={3}>{document.header.address || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* ─── Pallet sections ─── */}
      {pallets.map((pallet, palletIndex) => (
        <div key={pallet.id} className="print-section">
          <div className="print-section-hdr">
            <strong>PALLET N° {palletIndex + 1}</strong>
            <span className="print-section-hdr-meta">
              Bruto: {formatWeight(pallet.totalGrossWeightKg)}
              {' | '}Tarima: {formatWholeWeight(pallet.palletTareWeightKg)}
            </span>
          </div>

          <table className="print-tbl">
            <thead>
              <tr>
                <th className="print-tbl-th">Producto</th>
                <th className="print-tbl-th">Lote</th>
                <th className="print-tbl-th">Detalle</th>
                <th className="print-tbl-th print-tbl-th--num">P. Neto</th>
              </tr>
            </thead>
            <tbody>
              {pallet.items.map((item) => (
                <tr key={item.id}>
                  <td className="print-tbl-cell">{item.description || '-'}</td>
                  <td className="print-tbl-cell print-tbl-cell--mono">
                    {`${item.lotPrefix || ''}${item.productionNumber || ''}` || '-'}
                  </td>
                  <td className="print-tbl-cell print-tbl-cell--sum">
                    {item.boxesCount} Cj × {item.unitsPerBox} Fr × {formatWeight(item.weightPerBoxKg)}/Cj
                  </td>
                  <td className="print-tbl-cell print-tbl-cell--num">{formatWeight(item.netWeightKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* ─── Totales ─── */}
      <div className="print-totals">
        <table className="print-totals-tbl">
          <tbody>
            <tr>
              <td className="print-totals-item">
                <span className="print-totals-label">Paletas</span>
                <strong className="print-totals-value">{pallets.length}</strong>
              </td>
              <td className="print-totals-item">
                <span className="print-totals-label">Frascos</span>
                <strong className="print-totals-value">{totalUnits}</strong>
              </td>
              <td className="print-totals-item">
                <span className="print-totals-label">Cajas</span>
                <strong className="print-totals-value">{totalBoxes}</strong>
              </td>
              <td className="print-totals-item">
                <span className="print-totals-label">Neto total</span>
                <strong className="print-totals-value">{formatWeight(totalNetWeightKg)}</strong>
              </td>
              <td className="print-totals-item">
                <span className="print-totals-label">Bruto total</span>
                <strong className="print-totals-value">{formatWeight(totalGrossWeightKg)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="print-totals-ts">
          {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </section>
  );
};
