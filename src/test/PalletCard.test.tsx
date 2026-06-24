/**
 * Integration tests for PalletCard
 *
 * Verifies:
 * - Renders pallet header with index and tare weight
 * - Shows items in preparacion mode (table layout)
 * - Shows items in carga mode (card layout)
 * - Add item button text changes per mode
 * - Can remove items
 * - Displays item errors
 * - Displays footer totals in carga mode
 *
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PalletCard } from '../components/PalletCard';
import { createMockComputedPallet, createMockItem, createMockProduct } from './test-utils';
import type { PalletComputed } from '../types';

/* ─── Fixtures ─── */

const mockProduct = createMockProduct();

const computedPallet: PalletComputed = createMockComputedPallet(
  [createMockItem({ id: 'item-1', productionNumber: '123' })],
  { id: 'pallet-1', label: 'Paleta 01', palletTareWeightKg: 15.5 },
);

const defaultProps = {
  mode: 'preparacion' as const,
  pallet: computedPallet,
  products: [mockProduct],
  autoFocusItemId: null,
  itemErrors: {} as Record<string, Record<string, string>>,
  index: 0,
  canRemove: true,
  onUpdatePallet: vi.fn(),
  onRemovePallet: vi.fn(),
  onAddItem: vi.fn(),
  onClonePallet: vi.fn(),
  onSelectProduct: vi.fn(),
  onUpdateItem: vi.fn(),
  onRemoveItem: vi.fn(),
};

describe('PalletCard — preparacion mode', () => {
  it('renders pallet header with index', () => {
    render(<PalletCard {...defaultProps} />);
    expect(screen.getByText('Paleta 01')).toBeInTheDocument();
  });

  it('renders tare weight input', () => {
    render(<PalletCard {...defaultProps} />);
    const tareInput = screen.getByDisplayValue('15.5');
    expect(tareInput).toBeInTheDocument();
  });

  it('shows "Agregar producto" button in preparacion mode', () => {
    render(<PalletCard {...defaultProps} />);
    expect(screen.getByText('Agregar producto')).toBeInTheDocument();
  });

  it('calls onAddItem when add button clicked', async () => {
    const user = userEvent.setup();
    const onAddItem = vi.fn();
    render(<PalletCard {...defaultProps} onAddItem={onAddItem} />);

    await user.click(screen.getByText('Agregar producto'));
    expect(onAddItem).toHaveBeenCalledWith('pallet-1');
  });

  it('renders table headers in preparacion mode', () => {
    render(<PalletCard {...defaultProps} />);
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Und.')).toBeInTheDocument();
    expect(screen.getByText('Frascos/caja')).toBeInTheDocument();
    expect(screen.getByText('Peso/caja')).toBeInTheDocument();
    expect(screen.getByText('Frascos')).toBeInTheDocument();
  });

  it('renders product select with options', () => {
    render(<PalletCard {...defaultProps} />);
    expect(screen.getByText('Seleccionar producto')).toBeInTheDocument();
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  });

  it('shows delete button enabled when canRemove is true', () => {
    render(<PalletCard {...defaultProps} canRemove={true} />);
    const deleteBtn = screen.getByText('Eliminar');
    expect(deleteBtn).not.toBeDisabled();
  });

  it('disables delete when canRemove is false', () => {
    render(<PalletCard {...defaultProps} canRemove={false} />);
    const deleteBtn = screen.getByText('Eliminar');
    expect(deleteBtn).toBeDisabled();
  });

  it('calls onRemovePallet when delete clicked', async () => {
    const user = userEvent.setup();
    const onRemovePallet = vi.fn();
    render(<PalletCard {...defaultProps} onRemovePallet={onRemovePallet} />);

    await user.click(screen.getByText('Eliminar'));
    expect(onRemovePallet).toHaveBeenCalledWith('pallet-1');
  });
});

describe('PalletCard — carga mode', () => {
  it('shows "Agregar item" button in carga mode', () => {
    render(<PalletCard {...defaultProps} mode="carga" />);
    expect(screen.getByText('Agregar item')).toBeInTheDocument();
  });

  it('renders item cards with lot number input', () => {
    render(<PalletCard {...defaultProps} mode="carga" />);
    expect(screen.getByText('N° lote')).toBeInTheDocument();
    const lotInput = screen.getByPlaceholderText('138');
    expect(lotInput).toHaveValue('123');
  });

  it('renders computed fields: boxes count', () => {
    render(<PalletCard {...defaultProps} mode="carga" />);
    const boxesInput = screen.getByDisplayValue('2');
    expect(boxesInput).toBeInTheDocument();
  });

  it('shows footer totals in carga mode', () => {
    render(<PalletCard {...defaultProps} mode="carga" />);
    expect(screen.getByText(/Subtotal neto/)).toBeInTheDocument();
    expect(screen.getByText(/Peso bruto/)).toBeInTheDocument();
  });
});

describe('PalletCard — item errors', () => {
  it('renders item with error title', () => {
    const itemErrors = {
      'item-1': { quantity: 'Caja cerrada x12.' },
    };
    render(<PalletCard {...defaultProps} itemErrors={itemErrors} />);

    const quantityInput = screen.getAllByTitle('Caja cerrada x12.');
    expect(quantityInput.length).toBeGreaterThanOrEqual(1);
  });

  it('highlights pallet card red when errors exist', () => {
    const itemErrors = {
      'item-1': { quantity: 'Caja cerrada x12.' },
    };
    const { container } = render(<PalletCard {...defaultProps} itemErrors={itemErrors} />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('border-red-200');
  });
});
