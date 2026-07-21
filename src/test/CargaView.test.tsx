import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { CargaView } from '../views/CargaView';
import { calculateComputedPallet } from '../utils/calculations';
import { createMockDocument } from './test-utils';

it('does not show the duplicated top add-pallet action', () => {
  const document = createMockDocument();
  render(
    <CargaView
      document={document}
      computedPallets={document.pallets.map(calculateComputedPallet)}
      products={[]}
      lastCreatedItemId={null}
      activePalletId={null}
      validation={{ isValid: true, headerErrors: {}, palletErrors: [] }}
      onSetActivePallet={vi.fn()}
      onAddPallet={vi.fn()}
      onUpdatePallet={vi.fn()}
      onRemovePallet={vi.fn()}
      onAddItem={vi.fn()}
      onClonePallet={vi.fn()}
      onSelectProduct={vi.fn()}
      onUpdateItem={vi.fn()}
      onRemoveItem={vi.fn()}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Añadir paleta' })).not.toBeInTheDocument();
});
