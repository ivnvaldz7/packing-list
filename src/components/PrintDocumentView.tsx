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
}: PrintDocumentViewProps) => (
  <section className="print-only print-document">
    <header className="print-header">
      <div className="print-heading">
        <LaboratoryLogo
          className="laboratory-logo laboratory-logo-print"
          laboratoryName={document.header.laboratoryName}
        />
        <div className="print-title-block">
          <h1>Lista de empaque</h1>
        </div>
      </div>
      <div className="print-header-frame">
        <div className="print-header-topline">
          <div className="print-party-block">
            <strong>{document.header.laboratoryName || '-'}</strong>
          </div>
          <div className="print-invoice-block">
            <span>Factura N°:</span>
            <strong>{document.header.invoiceNumber || '-'}</strong>
          </div>
        </div>
        <div className="print-header-details">
          <p>
            <span>Pais:</span>
            <strong>{document.header.country || '-'}</strong>
          </p>
          <p>
            <span>Cliente:</span>
            <strong>{document.header.client || '-'}</strong>
          </p>
          <p>
            <span>Direccion:</span>
            <strong>{document.header.address || '-'}</strong>
          </p>
        </div>
        <div className="print-transport-bar">
          <span>Transporte {document.header.transportType}</span>
        </div>
      </div>
      <div className="print-header-grid print-table-head">
        <article>
          <strong>Cantidad</strong>
        </article>
        <article>
          <strong>Unidad</strong>
        </article>
        <article>
          <strong>Descripcion</strong>
        </article>
      </div>
    </header>

    {pallets.map((pallet, index) => (
      <section key={pallet.id} className="print-pallet">
        <div className="print-pallet-header">
          <div>
            <h2>{`Paleta ${index + 1}`}</h2>
            {pallet.label.trim() && pallet.label !== `Paleta ${index + 1}` ? (
              <p>{pallet.label}</p>
            ) : null}
          </div>
          <div className="print-pallet-metrics">
            <span>{`Peso tarima: ${formatWeight(pallet.palletTareWeightKg)}`}</span>
            <span>{`Peso neto: ${formatWeight(pallet.totalNetWeightKg)}`}</span>
            <span>{`Peso bruto: ${formatWeight(pallet.totalGrossWeightKg)}`}</span>
          </div>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Producto</th>
              <th>SKU</th>
              <th>Lote</th>
              <th>Unidad</th>
              <th>Cantidad</th>
              <th>Kg unit.</th>
              <th>Kg item</th>
            </tr>
          </thead>
          <tbody>
            {pallet.items.map((item, itemIndex) => (
              <tr key={item.id}>
                <td>{itemIndex + 1}</td>
                <td>{item.description || '-'}</td>
                <td>{item.sku || '-'}</td>
                <td>{item.lotPrefix || '-'}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{formatWeight(item.unitNetWeightKg)}</td>
                <td>{formatWeight(item.netWeightKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    ))}

    <footer className="print-footer">
      <article>
        <span>Total paletas</span>
        <strong>{document.pallets.length}</strong>
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
