import type { PalletComputed, ShipmentDocument } from '../types';

const sanitizeFileName = (value: string): string =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();

const formatWeightCell = (value: number): string => `${value.toFixed(3)} kg`;

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

  const left = 14;
  let cursorY = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('LISTA DE EMPAQUE', left, cursorY);

  cursorY += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const headerLines = [
    `Laboratorio: ${document.header.laboratoryName || '-'}`,
    `Factura N°: ${document.header.invoiceNumber || '-'}`,
    `Pais: ${document.header.country || '-'}`,
    `Direccion: ${document.header.address || '-'}`,
    `Transporte: ${document.header.transportType || '-'}`,
  ];

  headerLines.forEach((line) => {
    pdf.text(line, left, cursorY);
    cursorY += 5;
  });

  cursorY += 2;

  pallets.forEach((pallet, index) => {
    if (cursorY > 240) {
      pdf.addPage();
      cursorY = 18;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Paleta ${index + 1}`, left, cursorY);

    cursorY += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    if (pallet.label.trim() && pallet.label !== `Paleta ${index + 1}`) {
      pdf.text(`Nombre interno: ${pallet.label}`, left, cursorY);
      cursorY += 4.5;
    }

    pdf.text(`Peso tarima: ${formatWeightCell(pallet.palletTareWeightKg)}`, left, cursorY);
    pdf.text(`Peso neto: ${formatWeightCell(pallet.totalNetWeightKg)}`, 78, cursorY);
    pdf.text(`Peso bruto: ${formatWeightCell(pallet.totalGrossWeightKg)}`, 138, cursorY);
    cursorY += 4;

    autoTable(pdf, {
      startY: cursorY + 2,
      head: [['Item', 'Producto', 'Lote', 'Fr/caja', 'Frascos', 'Cajas', 'Kg/caja', 'Kg item']],
      body: pallet.items.map((item, itemIndex) => [
        String(itemIndex + 1),
        item.description || '-',
        `${item.lotPrefix || ''}${item.productionNumber || ''}` || '-',
        String(item.unitsPerBox),
        String(item.quantity),
        String(item.boxesCount),
        formatWeightCell(item.weightPerBoxKg),
        formatWeightCell(item.netWeightKg),
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [31, 111, 210],
      },
      margin: {
        left,
        right: left,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 56 },
        2: { cellWidth: 20 },
        3: { cellWidth: 18, halign: 'right' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 18, halign: 'right' },
        6: { cellWidth: 22, halign: 'right' },
        7: { cellWidth: 24, halign: 'right' },
      },
    });

    cursorY = (
      pdf as InstanceType<typeof jsPDF> & { lastAutoTable?: { finalY?: number } }
    ).lastAutoTable?.finalY ?? cursorY;
    cursorY += 10;
  });

  if (cursorY > 248) {
    pdf.addPage();
    cursorY = 18;
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Resumen general', left, cursorY);

  cursorY += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Total paletas: ${document.pallets.length}`, left, cursorY);
  cursorY += 5;
  pdf.text(`Peso neto total: ${formatWeightCell(totals.totalNetWeightKg)}`, left, cursorY);
  cursorY += 5;
  pdf.text(`Peso bruto total: ${formatWeightCell(totals.totalGrossWeightKg)}`, left, cursorY);

  pdf.save(getFileName(document));
};
