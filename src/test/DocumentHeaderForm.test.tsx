/**
 * Integration tests for DocumentHeaderForm
 *
 * Verifies:
 * - Renders invoice number with prefix + editable suffix
 * - Country selector triggers onChange with country value
 * - Country selection auto-fills laboratory + address (via parent handler)
 * - Transport selector renders all options
 * - Shows validation errors
 *
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DocumentHeaderForm } from '../components/DocumentHeaderForm';
import { createMockHeader } from './test-utils';

describe('DocumentHeaderForm', () => {
  const defaultProps = {
    header: createMockHeader(),
    errors: {},
    onChange: vi.fn(),
  };

  it('renders the section title', () => {
    render(<DocumentHeaderForm {...defaultProps} />);
    expect(screen.getByText('Preparación del documento')).toBeInTheDocument();
  });

  it('renders invoice prefix as a non-editable label', () => {
    render(<DocumentHeaderForm {...defaultProps} />);
    expect(screen.getByText('E-0005-0000')).toBeInTheDocument();
  });

  it('calls onChange when invoice suffix is typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const header = createMockHeader({ invoiceNumber: 'E-0005-0000' });
    render(<DocumentHeaderForm {...defaultProps} header={header} onChange={onChange} />);

    const invoiceInput = screen.getByPlaceholderText('0005');
    await user.type(invoiceInput, '2');

    expect(onChange).toHaveBeenCalledWith('invoiceNumber', expect.stringContaining('00002'));
  });

  it('renders country selector with default option', () => {
    render(<DocumentHeaderForm {...defaultProps} />);
    expect(screen.getByText('Seleccioná un país...')).toBeInTheDocument();
  });

  it('renders all country options', () => {
    render(<DocumentHeaderForm {...defaultProps} />);
    expect(screen.getByText('PANAMA')).toBeInTheDocument();
    expect(screen.getByText('COLOMBIA')).toBeInTheDocument();
    expect(screen.getByText('BOLIVIA')).toBeInTheDocument();
    expect(screen.getByText('ECUADOR')).toBeInTheDocument();
  });

  it('calls onChange with country when user selects one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const header = createMockHeader({ country: '', laboratoryName: '', address: '' });
    render(<DocumentHeaderForm {...defaultProps} header={header} onChange={onChange} />);

    const countrySelect = screen.getByLabelText('País');
    await user.selectOptions(countrySelect, 'COLOMBIA');

    expect(onChange).toHaveBeenCalledWith('country', 'COLOMBIA');
  });

  it('renders transport options', () => {
    render(<DocumentHeaderForm {...defaultProps} />);
    expect(screen.getByText('Marítimo')).toBeInTheDocument();
    expect(screen.getByText('Aéreo')).toBeInTheDocument();
    expect(screen.getByText('Terrestre')).toBeInTheDocument();
  });

  it('calls onChange when transport changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DocumentHeaderForm {...defaultProps} onChange={onChange} />);

    const transportSelect = screen.getByLabelText('Transporte');
    await user.selectOptions(transportSelect, 'Aereo');

    expect(onChange).toHaveBeenCalledWith('transportType', 'Aereo');
  });

  it('shows laboratory and address as read-only fields', () => {
    render(<DocumentHeaderForm {...defaultProps} />);
    const labInput = screen.getByDisplayValue('IMPORTACIONES UNIVERSO ZONA LIBRE S.A');
    expect(labInput).toHaveAttribute('readOnly');
  });

  it('displays validation error for invoice number', () => {
    const errors = { invoiceNumber: 'Factura requerida' };
    render(<DocumentHeaderForm {...defaultProps} errors={errors} />);

    expect(screen.getByText('Factura requerida')).toBeInTheDocument();
  });
});
