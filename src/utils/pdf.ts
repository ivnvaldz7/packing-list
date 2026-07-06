import type { PalletComputed, ShipmentDocument } from '../types';

const sanitizeFileName = (value: string): string =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();

const formatWeightCell = (value: number): string => `${value.toFixed(3)} kg`;
const formatWholeWeightCell = (value: number): string => `${Math.round(value)} kg`;

const getFileName = (document: ShipmentDocument): string => {
  const invoiceNumber = sanitizeFileName(document.header.invoiceNumber);
  return invoiceNumber ? `${invoiceNumber}.pdf` : 'lista-de-empaque.pdf';
};

export const exportShipmentDocumentPdf = async (
  document: ShipmentDocument,
  pallets: PalletComputed[],
  totals: { totalNetWeightKg: number; totalGrossWeightKg: number },
): Promise<void> => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 14;
  const contentWidth = 210 - margin * 2;

  // ─── Title ───
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LISTA DE EMPAQUE', margin, margin + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text('Consolidado por paleta', margin, margin + 9);
  pdf.setTextColor(0);

  pdf.setDrawColor(180);
  pdf.setLineWidth(0.4);
  pdf.line(margin, margin + 12, margin + contentWidth, margin + 12);

  // ─── Meta ───
  const metaY = margin + 18;
  const rowH = 7;

  const metaRow = (label: string, value: string, x: number, y: number, w: number) => {
    pdf.setFillColor(247, 247, 247);
    pdf.rect(x, y, 18, rowH, 'F');
    pdf.setDrawColor(200);
    pdf.rect(x, y, 18, rowH, 'S');
    pdf.setTextColor(120);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text(label, x + 1, y + 4);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0);
    pdf.rect(x + 18, y, w - 18, rowH, 'S');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(value, x + 20, y + 4);
    pdf.setFontSize(7);
  };

  const halfW = contentWidth / 2;
  metaRow('Empresa', document.header.laboratoryName || '-', margin, metaY, halfW);
  metaRow('Factura', document.header.invoiceNumber || '-', margin + halfW, metaY, halfW);
  metaRow('País', document.header.country || '-', margin, metaY + rowH, halfW);
  metaRow('Transporte', document.header.transportType || '-', margin + halfW, metaY + rowH, halfW);
  metaRow('Embarque', document.header.shipmentDate || '-', margin, metaY + rowH * 2, halfW);
  metaRow('Dirección', document.header.address || '-', margin + halfW, metaY + rowH * 2, halfW);

  let cursorY = metaY + rowH * 3 + 8;
  const totalUnits = pallets.reduce(
    (sum, p) => sum + p.items.reduce((s, item) => s + item.quantity, 0),
    0,
  );
  const totalBoxes = pallets.reduce(
    (sum, p) => sum + p.items.reduce((s, item) => s + item.boxesCount, 0),
    0,
  );

  // ─── Tables por pallet ───
  pallets.forEach((pallet, index) => {
    if (cursorY > 235) {
      pdf.addPage();
      cursorY = margin + 4;
    }

    // Pallet section header
    const grossText = formatWeightCell(pallet.totalGrossWeightKg);
    const tareText = formatWholeWeightCell(pallet.palletTareWeightKg);

    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, cursorY, contentWidth, 6, 'F');
    pdf.setDrawColor(200);
    pdf.rect(margin, cursorY, contentWidth, 6, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(`PALLET N° ${index + 1}`, margin + 2, cursorY + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(130);
    pdf.text(`Bruto: ${grossText}  |  Tarima: ${tareText}`, margin + 42, cursorY + 4);
    pdf.setTextColor(0);

    cursorY += 9;

    autoTable(pdf, {
      startY: cursorY,
      head: [['Producto', 'Lote', 'Detalle', 'P. Neto']],
      body: pallet.items.map((item) => [
        item.description || '-',
        `${item.lotPrefix || ''}${item.productionNumber || ''}` || '-',
        `${item.boxesCount} Cj × ${item.unitsPerBox} Fr × ${formatWeightCell(item.weightPerBoxKg)}/Cj`,
        formatWeightCell(item.netWeightKg),
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 1.5,
        overflow: 'linebreak',
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [50, 50, 50],
        fontSize: 7,
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 26, halign: 'right' },
      },
    });

    cursorY =
      (pdf as InstanceType<typeof jsPDF> & { lastAutoTable?: { finalY?: number } }).lastAutoTable
        ?.finalY ?? cursorY;
    cursorY += 6;
  });

  // ─── Totals ───
  if (cursorY > 250) {
    pdf.addPage();
    cursorY = margin + 4;
  }

  pdf.setDrawColor(180);
  pdf.setLineWidth(0.4);
  pdf.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 4;

  const totalsTableW = contentWidth / 5;
  const totalsData = [
    { label: 'Paletas', value: String(pallets.length) },
    { label: 'Frascos', value: String(totalUnits) },
    { label: 'Cajas', value: String(totalBoxes) },
    { label: 'Neto total', value: formatWeightCell(totals.totalNetWeightKg) },
    { label: 'Bruto total', value: formatWeightCell(totals.totalGrossWeightKg) },
  ];

  totalsData.forEach((item, i) => {
    const x = margin + totalsTableW * i;
    pdf.setDrawColor(220);
    pdf.rect(x, cursorY, totalsTableW, 10, 'S');
    pdf.setTextColor(130);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.text(item.label, x + totalsTableW / 2, cursorY + 3, { align: 'center' });
    pdf.setTextColor(0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(item.value, x + totalsTableW / 2, cursorY + 8, { align: 'center' });
  });

  // Footer
  pdf.setTextColor(170);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.text(
    `${new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    margin + contentWidth,
    282,
    { align: 'right' },
  );
  pdf.setTextColor(0);

  pdf.save(getFileName(document));
};
