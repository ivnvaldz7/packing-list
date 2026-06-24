import type { PalletComputed, ShipmentDocument } from '../types';
import * as XLSX from 'xlsx';

const sanitizeFileName = (value: string): string =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();

const getFileName = (document: ShipmentDocument): string => {
  const invoiceNumber = sanitizeFileName(document.header.invoiceNumber);
  return invoiceNumber ? `${invoiceNumber}.xlsx` : 'lista-de-empaque.xlsx';
};

export const exportShipmentDocumentXlsx = (
  document: ShipmentDocument,
  pallets: PalletComputed[],
  totals: { totalNetWeightKg: number; totalGrossWeightKg: number },
): void => {
  /* ─── Header rows ─── */
  const headerRows: XLSX.CellObject[][] = [
    [{ t: 's', v: 'LISTA DE EMPAQUE', s: { font: { bold: true, sz: 14 } } }],
    [{ t: 's', v: 'Consolidado por paleta', s: { font: { sz: 10, color: { rgb: '666666' } } } }],
    [],
  ];

  const metaSection: XLSX.CellObject[][] = [
    [
      { t: 's', v: 'Empresa', s: { font: { bold: true } } },
      { t: 's', v: document.header.laboratoryName || '-' },
      { t: 's', v: 'Factura', s: { font: { bold: true } } },
      { t: 's', v: document.header.invoiceNumber || '-' },
    ],
    [
      { t: 's', v: 'País', s: { font: { bold: true } } },
      { t: 's', v: document.header.country || '-' },
      { t: 's', v: 'Transporte', s: { font: { bold: true } } },
      { t: 's', v: document.header.transportType || '-' },
    ],
    [
      { t: 's', v: 'Embarque', s: { font: { bold: true } } },
      { t: 's', v: document.header.shipmentDate || '-' },
      { t: 's', v: 'Dirección', s: { font: { bold: true } } },
      { t: 's', v: document.header.address || '-' },
    ],
  ];

  const separatorRow: XLSX.CellObject[][] = [[]];

  /* ─── Column widths ─── */
  const colWidths = [{ wch: 8 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];

  /* ─── Build sheets ─── */
  const wb = XLSX.utils.book_new();

  // Sheet 1: Consolidated list
  const sheetData: XLSX.CellObject[][] = [
    ...headerRows,
    ...metaSection,
    ...separatorRow,
  ];

  // Pallet sections
  pallets.forEach((pallet, index) => {
    const grossText = `${pallet.totalGrossWeightKg.toFixed(3)} kg`;
    const tareText = `${Math.round(pallet.palletTareWeightKg)} kg`;

    sheetData.push([
      { t: 's', v: `PALLET N° ${index + 1}`, s: { font: { bold: true, sz: 11 } } },
      { t: 's', v: `Bruto: ${grossText}  |  Tarima: ${tareText}`, s: { font: { color: { rgb: '888888' } } } },
    ]);

    // Table header
    sheetData.push([
      { t: 's', v: 'Código', s: { font: { bold: true }, fill: { fgColor: { rgb: 'F0F0F0' } } } },
      { t: 's', v: 'Producto', s: { font: { bold: true }, fill: { fgColor: { rgb: 'F0F0F0' } } } },
      { t: 's', v: 'Lote', s: { font: { bold: true }, fill: { fgColor: { rgb: 'F0F0F0' } } } },
      { t: 's', v: 'Frascos', s: { font: { bold: true }, fill: { fgColor: { rgb: 'F0F0F0' } } } },
      { t: 's', v: 'Cajas', s: { font: { bold: true }, fill: { fgColor: { rgb: 'F0F0F0' } } } },
      { t: 's', v: 'Detalle', s: { font: { bold: true }, fill: { fgColor: { rgb: 'F0F0F0' } } } },
      { t: 's', v: 'P. Neto (kg)', s: { font: { bold: true }, fill: { fgColor: { rgb: 'F0F0F0' } } } },
    ]);

    // Items
    pallet.items.forEach((item) => {
      const detail = `${item.boxesCount} Cj × ${item.unitsPerBox} Fr × ${item.weightPerBoxKg.toFixed(3)} kg/Cj`;
      sheetData.push([
        { t: 's', v: item.sku || '' },
        { t: 's', v: item.description || '' },
        { t: 's', v: `${item.lotPrefix || ''}${item.productionNumber || ''}` },
        { t: 'n', v: item.quantity },
        { t: 'n', v: item.boxesCount },
        { t: 's', v: detail },
        { t: 'n', v: item.netWeightKg },
      ]);
    });

    sheetData.push([]);
  });

  // Totals
  const totalUnits = pallets.reduce(
    (sum, p) => sum + p.items.reduce((s, item) => s + item.quantity, 0),
    0,
  );
  const totalBoxes = pallets.reduce(
    (sum, p) => sum + p.items.reduce((s, item) => s + item.boxesCount, 0),
    0,
  );

  sheetData.push([
    { t: 's', v: 'TOTALES', s: { font: { bold: true, sz: 11 } } },
  ]);
  sheetData.push([
    { t: 's', v: 'Paletas', s: { font: { bold: true } } },
    { t: 'n', v: pallets.length },
  ]);
  sheetData.push([
    { t: 's', v: 'Frascos', s: { font: { bold: true } } },
    { t: 'n', v: totalUnits },
  ]);
  sheetData.push([
    { t: 's', v: 'Cajas', s: { font: { bold: true } } },
    { t: 'n', v: totalBoxes },
  ]);
  sheetData.push([
    { t: 's', v: 'Neto total', s: { font: { bold: true } } },
    { t: 's', v: `${totals.totalNetWeightKg.toFixed(3)} kg` },
  ]);
  sheetData.push([
    { t: 's', v: 'Bruto total', s: { font: { bold: true } } },
    { t: 's', v: `${totals.totalGrossWeightKg.toFixed(3)} kg` },
  ]);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Lista de Empaque');
  XLSX.writeFile(wb, getFileName(document));
};
