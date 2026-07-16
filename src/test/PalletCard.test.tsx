/**
 * Integration tests for PalletCard
 *
 * Verifies:
 * - Renders pallet header with index
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
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PalletCard } from '../components/PalletCard';
import { createMockComputedPallet, createMockItem, createMockProduct } from './test-utils';
import type { PalletComputed } from '../types';

/* ─── Fixtures ─── */

const mockProduct = createMockProduct();
const amantina250 = createMockProduct({
  id: 'amantina-250',
  code: 'AM0138',
  name: 'AMANTINA 250 ML',
});
const olivitasan500 = createMockProduct({
  id: 'olivitasan-500',
  code: 'OL0908',
  name: 'OLIVITASAN 500 ML',
});

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
    expect(screen.getByText(/paleta 01/i)).toBeInTheDocument();
  });

  it('does not render tare weight input in the preparacion header', () => {
    render(<PalletCard {...defaultProps} />);

    expect(screen.queryByLabelText(/peso tarima/i)).toBeNull();
    expect(screen.getByText('Tarima 16 kg')).toBeInTheDocument();
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
    expect(screen.getByText('Unidad')).toBeInTheDocument();
    expect(screen.getByText('Frascos por caja')).toBeInTheDocument();
    expect(screen.getByText('Peso por caja')).toBeInTheDocument();
    expect(screen.getByText('Frascos')).toBeInTheDocument();
  });

  it('renders product combobox with the selected product', () => {
    render(<PalletCard {...defaultProps} />);
    expect(screen.getByRole('combobox', { name: /producto/i })).toHaveValue('Producto de prueba');
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

  it('renders tare weight input in carga mode', () => {
    render(<PalletCard {...defaultProps} mode="carga" />);
    const tareInput = screen.getByLabelText(/peso tarima/i);
    expect(tareInput).toHaveValue(15.5);
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

describe('PalletCard — reusable product combobox', () => {
  const products = [mockProduct, amantina250, olivitasan500];

  it('renders an accessible product combobox in preparacion mode', () => {
    render(<PalletCard {...defaultProps} products={[mockProduct, amantina250]} />);

    expect(screen.getByRole('combobox', { name: /producto/i })).toHaveValue('Producto de prueba');
  });

  it('does not render a second "Buscar producto" textbox in the dropdown', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    await user.click(screen.getByRole('combobox', { name: /producto/i }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /buscar producto/i })).toBeNull();
  });

  it('shows an empty product field with placeholder when productId is empty', () => {
    const palletWithoutProduct = createMockComputedPallet(
      [createMockItem({ id: 'empty-item', productId: '' })],
      { id: 'pallet-1', label: 'Paleta 01', palletTareWeightKg: 15.5 },
    );

    render(<PalletCard {...defaultProps} pallet={palletWithoutProduct} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    expect(productInput).toHaveValue('');
    expect(productInput).toHaveAttribute('placeholder', 'Seleccionar producto');
  });

  it('does not render product options when opening the dropdown with an empty product field', async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    const palletWithoutProduct = createMockComputedPallet(
      [createMockItem({ id: 'empty-item', productId: '' })],
      { id: 'pallet-1', label: 'Paleta 01', palletTareWeightKg: 15.5 },
    );

    render(
      <PalletCard
        {...defaultProps}
        pallet={palletWithoutProduct}
        products={products}
        onSelectProduct={onSelectProduct}
      />,
    );

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);

    expect(screen.getByRole('listbox')).toHaveTextContent('Escribi para buscar');
    expect(screen.queryByRole('option')).toBeNull();
    expect(productInput).toHaveValue('');
    expect(productInput).not.toHaveAttribute('aria-activedescendant');
    expect(onSelectProduct).not.toHaveBeenCalled();
  });

  it('does not render the full catalog when opening the dropdown with a selected product', async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    render(<PalletCard {...defaultProps} products={products} onSelectProduct={onSelectProduct} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);

    expect(screen.getByRole('listbox')).toHaveTextContent('Escribi para buscar');
    expect(screen.queryByRole('option')).toBeNull();
    expect(productInput).toHaveValue('Producto de prueba');
    expect(onSelectProduct).not.toHaveBeenCalled();
  });

  it('does not select anything when pressing Enter without options', async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    const palletWithoutProduct = createMockComputedPallet(
      [createMockItem({ id: 'empty-item', productId: '' })],
      { id: 'pallet-1', label: 'Paleta 01', palletTareWeightKg: 15.5 },
    );

    render(
      <PalletCard
        {...defaultProps}
        pallet={palletWithoutProduct}
        products={products}
        onSelectProduct={onSelectProduct}
      />,
    );

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.keyboard('{Enter}');

    expect(onSelectProduct).not.toHaveBeenCalled();
    expect(productInput).toHaveValue('');
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('filters product options by code in the visible product field', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AM0138');

    expect(productInput).toHaveFocus();
    expect(screen.getByRole('option', { name: /AMANTINA 250 ML/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /OLIVITASAN 500 ML/i })).toBeNull();
  });

  it('filters product options by name in the visible product field', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');

    expect(screen.getByRole('option', { name: /AMANTINA 250 ML/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /OLIVITASAN 500 ML/i })).toBeNull();
  });

  it('renders dropdown options with only the product name visible', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');

    const option = screen.getByRole('option', { name: 'AMANTINA 250 ML' });
    expect(option).toHaveTextContent('AMANTINA 250 ML');
    expect(option.textContent).not.toContain('AM0138');
    expect(option.children).toHaveLength(0);
  });

  it('does not expose product code in option accessible names or visible text', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');

    expect(screen.getByRole('option', { name: 'AMANTINA 250 ML' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /AM0138/i })).toBeNull();
    expect(screen.getByRole('listbox')).not.toHaveTextContent('AM0138');
  });

  it('does not use horizontal scroll, nowrap, truncate, or ellipsis classes in the dropdown', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');

    const listbox = screen.getByRole('listbox');
    const option = screen.getByRole('option', { name: 'AMANTINA 250 ML' });
    const dropdownMarkup = `${listbox.className} ${option.className} ${listbox.getAttribute('style') ?? ''} ${option.getAttribute('style') ?? ''}`;

    expect(listbox).toHaveClass('overflow-x-hidden');
    expect(option).toHaveClass('whitespace-normal');
    expect(dropdownMarkup).not.toMatch(
      /overflow-x-auto|overflow-auto|whitespace-nowrap|min-w-max|truncate|text-overflow|ellipsis/,
    );
  });

  it('supports ArrowDown/ArrowUp navigation and Enter selection', async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    render(<PalletCard {...defaultProps} products={products} onSelectProduct={onSelectProduct} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');
    await user.keyboard('{ArrowDown}{ArrowUp}{Enter}');

    expect(onSelectProduct).toHaveBeenCalledWith('pallet-1', 'item-1', 'amantina-250');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes on Escape and restores the selected product label', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');

    expect(productInput).toHaveValue('AMANTINA');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(productInput).toHaveValue('Producto de prueba');
    expect(productInput).toHaveAttribute('aria-expanded', 'false');
  });

  it('restores the selected product label when tabbing away from an unconfirmed search', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');

    expect(productInput).toHaveValue('AMANTINA');

    await user.tab();

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(productInput).toHaveValue('Producto de prueba');
  });

  it('moves from Producto to Frascos with Tab in preparacion mode', async () => {
    const user = userEvent.setup();

    const StatefulPalletCard = () => {
      const [pallet, setPallet] = useState(defaultProps.pallet);

      return (
        <PalletCard
          {...defaultProps}
          pallet={pallet}
          products={products}
          onSelectProduct={(_palletId, itemId, productId) => {
            const selectedProduct = products.find((product) => product.id === productId);

            if (!selectedProduct) {
              return;
            }

            setPallet((currentPallet) => ({
              ...currentPallet,
              items: currentPallet.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      productId: selectedProduct.id,
                      sku: selectedProduct.code,
                      description: selectedProduct.name,
                      lotPrefix: selectedProduct.lotPrefix,
                      productionNumber: selectedProduct.productionNumber,
                      unit: selectedProduct.unit,
                      unitsPerBox: selectedProduct.unitsPerBox,
                      weightPerBoxKg: selectedProduct.weightPerBoxKg,
                    }
                  : item,
              ),
            }));
          }}
        />
      );
    };

    render(<StatefulPalletCard />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');
    await user.keyboard('{Enter}');
    await user.tab();

    expect(screen.getByRole('textbox', { name: /^frascos$/i })).toHaveFocus();
  });

  it('keeps automatic preparacion fields out of the Tab order', () => {
    render(<PalletCard {...defaultProps} products={products} />);

    expect(screen.getByRole('textbox', { name: /unidad/i })).toHaveAttribute('tabIndex', '-1');
    expect(screen.getByRole('textbox', { name: /frascos por caja/i })).toHaveAttribute(
      'tabIndex',
      '-1',
    );
    expect(screen.getByRole('textbox', { name: /peso por caja/i })).toHaveAttribute(
      'tabIndex',
      '-1',
    );
  });

  it('calls onSelectProduct with an empty product id when clearing the selection', async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    render(<PalletCard {...defaultProps} onSelectProduct={onSelectProduct} />);

    await user.click(screen.getByRole('button', { name: /limpiar producto/i }));

    expect(onSelectProduct).toHaveBeenCalledWith('pallet-1', 'item-1', '');
  });

  it('clears the selected product from the product field without adding another tab stop', async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    render(<PalletCard {...defaultProps} onSelectProduct={onSelectProduct} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    const clearButton = screen.getByRole('button', { name: /limpiar producto/i });

    expect(clearButton).toHaveAttribute('tabIndex', '-1');

    await user.click(productInput);
    await user.clear(productInput);

    expect(onSelectProduct).toHaveBeenCalledWith('pallet-1', 'item-1', '');
  });

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])(
    'calls onSelectProduct with an empty product id when clearing the selection with %s',
    async (_keyName, key) => {
      const user = userEvent.setup();
      const onSelectProduct = vi.fn();
      render(<PalletCard {...defaultProps} onSelectProduct={onSelectProduct} />);

      const clearButton = screen.getByRole('button', { name: /limpiar producto/i });
      clearButton.focus();

      expect(clearButton).toHaveFocus();

      await user.keyboard(key);

      expect(onSelectProduct).toHaveBeenCalledWith('pallet-1', 'item-1', '');
    },
  );

  it('closes the product listbox on outside click', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} products={products} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByText(/paleta 01/i));

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(productInput).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onSelectProduct with product id when selecting a combobox option and closes', async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    render(<PalletCard {...defaultProps} products={products} onSelectProduct={onSelectProduct} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    await user.click(productInput);
    await user.type(productInput, 'AMANTINA');
    await user.click(screen.getByRole('option', { name: /AMANTINA 250 ML/i }));

    expect(onSelectProduct).toHaveBeenCalledWith('pallet-1', 'item-1', 'amantina-250');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('disables the product combobox in readOnly mode and does not open it', async () => {
    const user = userEvent.setup();
    render(<PalletCard {...defaultProps} readOnly products={[mockProduct, amantina250]} />);

    const productInput = screen.getByRole('combobox', { name: /producto/i });
    expect(productInput).toBeDisabled();

    await user.click(productInput);

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(productInput).toHaveAttribute('aria-expanded', 'false');
  });
});
