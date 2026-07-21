import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PrintDocumentView } from '../components/PrintDocumentView';
import {
  createMockComputedPallet,
  createMockDocument,
  createMockHeader,
  createMockItem,
} from './test-utils';

describe('PrintDocumentView', () => {
  it('prioritizes the invoice and destination in the institutional header', () => {
    const document = createMockDocument([], {
      header: createMockHeader({ invoiceNumber: 'E-0005-00000314', country: 'PANAMA' }),
    });

    render(
      <PrintDocumentView
        document={document}
        pallets={[]}
        totalNetWeightKg={0}
        totalGrossWeightKg={0}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Lista de empaque' })).toBeInTheDocument();
    expect(screen.getByTestId('print-primary-meta')).toHaveTextContent('E-0005-00000314');
    expect(screen.getByTestId('print-primary-meta')).toHaveTextContent('PANAMA');
  });

  it('renders differentiated pallets and a final weight summary', () => {
    const pallets = [
      createMockComputedPallet([createMockItem()], { id: 'pallet-1' }),
      createMockComputedPallet([createMockItem({ id: 'item-2' })], {
        id: 'pallet-2',
        totalGrossWeightKg: 22,
      }),
    ];

    render(
      <PrintDocumentView
        document={createMockDocument()}
        pallets={pallets}
        totalNetWeightKg={10}
        totalGrossWeightKg={42.5}
      />,
    );

    expect(screen.getAllByTestId('print-pallet')).toHaveLength(2);
    const summary = screen.getByTestId('print-weight-summary');
    expect(within(summary).getByText('Neto total')).toBeInTheDocument();
    expect(within(summary).getByText('Bruto total')).toBeInTheDocument();
    expect(summary).toHaveTextContent('10.000 kg');
    expect(summary).toHaveTextContent('42.500 kg');
  });

  it('adds a discreet footer with generation date and invoice reference', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-21T12:00:00Z'));

    render(
      <PrintDocumentView
        document={createMockDocument([], {
          header: createMockHeader({ invoiceNumber: 'E-0005-00000314' }),
        })}
        pallets={[]}
        totalNetWeightKg={0}
        totalGrossWeightKg={0}
      />,
    );

    const footer = screen.getByTestId('print-document-footer');
    expect(footer).toHaveTextContent('Referencia: E-0005-00000314');
    expect(footer).toHaveTextContent('Generado: 21 de julio de 2026');
    vi.useRealTimers();
  });
});
