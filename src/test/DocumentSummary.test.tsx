/**
 * Integration tests for DocumentSummary
 *
 * Verifies:
 * - Displays total pallets, boxes, units, weights
 * - Shows workflow status label
 * - Shows validation status (valid/invalid)
 *
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentSummary } from '../components/DocumentSummary';
import { createMockDocument } from './test-utils';

describe('DocumentSummary', () => {
  const defaultProps = {
    document: createMockDocument(),
    totalNetWeightKg: 15.5,
    totalGrossWeightKg: 46.5,
    totalBoxes: 2,
    isValid: true,
  };

  it('renders section title', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('Resumen consolidado de carga')).toBeInTheDocument();
  });

  it('displays total pallets', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('01')).toBeInTheDocument(); // padStart(2, '0')
  });

  it('displays total boxes', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays total units', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  it('displays net weight', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('15.500 kg')).toBeInTheDocument();
  });

  it('displays gross weight', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('46.500 kg')).toBeInTheDocument();
  });

  it('shows valid status as "Borrador validado"', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('Borrador validado')).toBeInTheDocument();
  });

  it('shows invalid status as "Revisión pendiente"', () => {
    render(<DocumentSummary {...defaultProps} isValid={false} />);
    expect(screen.getByText('Revisión pendiente')).toBeInTheDocument();
  });

  it('displays workflow status as "En preparación"', () => {
    render(<DocumentSummary {...defaultProps} />);
    expect(screen.getByText('En preparación')).toBeInTheDocument();
  });

  it('displays workflow status as "En carga final" for carga stage', () => {
    const doc = createMockDocument(undefined, { workflowStatus: 'carga' });
    render(<DocumentSummary {...defaultProps} document={doc} />);
    expect(screen.getByText('En carga final')).toBeInTheDocument();
  });

  it('displays workflow as "Finalizada"', () => {
    const doc = createMockDocument(undefined, { workflowStatus: 'finalizada' });
    render(<DocumentSummary {...defaultProps} document={doc} />);
    expect(screen.getByText('Finalizada')).toBeInTheDocument();
  });
});
