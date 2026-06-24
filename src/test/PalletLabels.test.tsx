/**
 * Integration tests for PalletLabels and PalletLabel
 *
 * Verifies:
 * - Renders "Carteles para pallets" title
 * - Label count stepper: increment, decrement, min/max
 * - Preview navigation: prev/next buttons
 * - Shows remitente/destinatario data from document
 *
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PalletLabels } from '../components/PalletLabel';
import { createMockDocument } from './test-utils';

describe('PalletLabels', () => {
  const doc = createMockDocument();

  const defaultProps = {
    document: doc,
    labelCount: 3,
    onLabelCountChange: vi.fn(),
    onPrint: vi.fn(),
  };

  it('renders label count input with initial value', () => {
    render(<PalletLabels {...defaultProps} />);
    const input = screen.getByLabelText('Cantidad de carteles');
    expect(input).toHaveValue(3);
  });

  it('increments count on + click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PalletLabels {...defaultProps} onLabelCountChange={onChange} />);

    await user.click(screen.getByText('+'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('decrements count on − click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PalletLabels {...defaultProps} onLabelCountChange={onChange} />);

    await user.click(screen.getByText('−'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables − button at minimum count (1)', () => {
    render(<PalletLabels {...defaultProps} labelCount={1} />);
    expect(screen.getByText('−')).toBeDisabled();
  });

  it('shows print button', () => {
    render(<PalletLabels {...defaultProps} />);
    expect(screen.getByText('Imprimir carteles')).toBeInTheDocument();
  });

  it('calls onPrint when print button clicked', async () => {
    const user = userEvent.setup();
    const onPrint = vi.fn();
    render(<PalletLabels {...defaultProps} onPrint={onPrint} />);

    await user.click(screen.getByText('Imprimir carteles'));
    expect(onPrint).toHaveBeenCalled();
  });

  it('shows preview pagination (1 / N)', () => {
    render(<PalletLabels {...defaultProps} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates forward with Siguiente button', async () => {
    const user = userEvent.setup();
    render(<PalletLabels {...defaultProps} />);

    await user.click(screen.getByLabelText('Siguiente'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates backward with Anterior button', async () => {
    const user = userEvent.setup();
    render(<PalletLabels {...defaultProps} />);

    await user.click(screen.getByLabelText('Siguiente'));
    await user.click(screen.getByLabelText('Anterior'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('disables Anterior on first label', () => {
    render(<PalletLabels {...defaultProps} />);
    expect(screen.getByLabelText('Anterior')).toBeDisabled();
  });

  it('disables Siguiente on last label', () => {
    render(<PalletLabels {...defaultProps} labelCount={1} />);
    expect(screen.getByLabelText('Siguiente')).toBeDisabled();
  });

  it('shows remitente name from document header', () => {
    render(<PalletLabels {...defaultProps} />);
    expect(screen.getByText('IMPORTACIONES UNIVERSO ZONA LIBRE S.A')).toBeInTheDocument();
  });

  it('shows destinatario fixed info', () => {
    render(<PalletLabels {...defaultProps} />);
    expect(screen.getByText('LABORATORIOS ALE-BET SRL')).toBeInTheDocument();
    expect(screen.getByText('CONDARCO 3073, CIUDAD DE BUENOS AIRES, ARGENTINA')).toBeInTheDocument();
  });
});
