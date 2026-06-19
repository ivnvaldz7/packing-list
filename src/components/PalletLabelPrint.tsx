import type { ShipmentDocument } from '../types';

type PalletLabelPrintProps = {
  document: ShipmentDocument;
  labelCount: number;
};

const DESTINATARIO_FIJO = 'LABORATORIOS ALE-BET SRL';
const DESTINATARIO_DIRECCION = 'CONDARCO 3073, CIUDAD DE BUENOS AIRES, ARGENTINA';

export const PalletLabelPrint = ({ document, labelCount }: PalletLabelPrintProps) => {
  if (labelCount === 0) {
    return null;
  }

  return (
    <div className="print-only print-pallet-labels">
      {Array.from({ length: labelCount }, (_, index) => {
        const palletNumber = String(index + 1).padStart(2, '0');
        const totalString = String(labelCount).padStart(2, '0');

        return (
          <div key={`print-label-${index}`} className="print-pallet-label-page">
            <div className="print-pallet-label-content">
              {/* ─── Title ─── */}
              <div className="print-pallet-label-header">
                <span className="print-pallet-label-badge">MERCADERÍA DE EXPORTACIÓN</span>
              </div>

              {/* ─── Remitente ─── */}
              <div className="print-pallet-label-block">
                <p className="print-pallet-label-subtitle">Remitente</p>
                <p className="print-pallet-label-value">
                  {document.header.laboratoryName}
                </p>
                <p className="print-pallet-label-detail">{document.header.address}</p>
              </div>

              {/* ─── Divider ─── */}
              <div className="print-pallet-label-divider" />

              {/* ─── Destinatario ─── */}
              <div className="print-pallet-label-block">
                <p className="print-pallet-label-subtitle">Destinatario</p>
                <p className="print-pallet-label-value">{DESTINATARIO_FIJO}</p>
                <p className="print-pallet-label-detail">{DESTINATARIO_DIRECCION}</p>
              </div>

              {/* ─── Footer ─── */}
              <div className="print-pallet-label-footer">
                <span className="print-pallet-label-number">
                  {palletNumber}/{totalString}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
