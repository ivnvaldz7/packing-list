import type { PalletComputed, ShipmentDocument } from '../types';
import { formatWeight } from '../utils/format';
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
      <header className="print-sheet-header">
        <div className="print-sheet-brand">
          <LaboratoryLogo
            className="laboratory-logo laboratory-logo-print"
            laboratoryName={document.header.laboratoryName}
          />
          <div className="print-sheet-title">
            <h1>LISTA DE EMPAQUE</h1>
            <p>Documento logistico de consolidado por paleta</p>
          </div>
        </div>

        <div className="print-sheet-meta">
          <article>
            <span>Empresa</span>
            <strong>{document.header.laboratoryName || '-'}</strong>
          </article>
          <article>
            <span>Factura</span>
            <strong>{document.header.invoiceNumber || '-'}</strong>
          </article>
          <article>
            <span>Pais</span>
            <strong>{document.header.country || '-'}</strong>
          </article>
          <article>
            <span>Direccion</span>
            <strong>{document.header.address || '-'}</strong>
          </article>
          <article>
            <span>Transporte</span>
            <strong>{document.header.transportType || '-'}</strong>
          </article>
        </div>
      </header>

      <table className="print-ledger-table">
        <thead>
          <tr>
            <th>Pallet</th>
            <th>Producto</th>
            <th>Lote</th>
            <th>Fr/Caja</th>
            <th>Frascos</th>
            <th>Cajas</th>
            <th>Kg/Caja</th>
            <th>Peso Neto</th>
            <th>Peso Bruto</th>
          </tr>
        </thead>
        <tbody>
          {pallets.flatMap((pallet, palletIndex) =>
            pallet.items.map((item, itemIndex) => (
              <tr key={item.id}>
                {itemIndex === 0 ? (
                  <td className="print-ledger-pallet" rowSpan={pallet.items.length}>
                    <strong>{pallet.label.trim() || `Paleta ${palletIndex + 1}`}</strong>
                  </td>
                ) : null}
                <td>{item.description || '-'}</td>
                <td>{`${item.lotPrefix || ''}${item.productionNumber || ''}` || '-'}</td>
                <td className="print-num-cell">{item.unitsPerBox || '-'}</td>
                <td className="print-num-cell">{item.quantity || '-'}</td>
                <td className="print-num-cell">{item.boxesCount || '-'}</td>
                <td className="print-num-cell">{formatWeight(item.weightPerBoxKg)}</td>
                <td className="print-num-cell">{formatWeight(item.netWeightKg)}</td>
                {itemIndex === 0 ? (
                  <td className="print-num-cell print-ledger-total" rowSpan={pallet.items.length}>
                    {formatWeight(pallet.totalGrossWeightKg)}
                  </td>
                ) : null}
              </tr>
            )),
          )}
        </tbody>
      </table>

      <footer className="print-sheet-footer">
        <article>
          <span>Total frascos</span>
          <strong>{totalUnits}</strong>
        </article>
        <article>
          <span>Total cajas</span>
          <strong>{totalBoxes}</strong>
        </article>
        <article>
          <span>Peso neto total</span>
          <strong>{formatWeight(totalNetWeightKg)}</strong>
        </article>
        <article>
          <span>Peso bruto total</span>
          <strong>{formatWeight(totalGrossWeightKg)}</strong>
        </article>
      </footer>
    </section>
  );
};
