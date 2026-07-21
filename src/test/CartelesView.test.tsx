import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadLabelCountPreferences, saveLabelCountPreference } from '../App';
import { CartelesView } from '../views/CartelesView';
import { createMockDocument } from './test-utils';

describe('CartelesView', () => {
  it('groups only country and pallet quantity in configuration and keeps preview separate', () => {
    render(
      <CartelesView
        document={createMockDocument()}
        labelCount={3}
        onLabelCountChange={vi.fn()}
        onCountryChange={vi.fn()}
        onPrint={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('País')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad de pallets')).toHaveValue(3);
    expect(screen.getByText('Vista previa')).toBeInTheDocument();
  });

  it('clamps manual pallet quantity to 1-99', async () => {
    const onChange = vi.fn();
    render(
      <CartelesView
        document={createMockDocument()}
        labelCount={3}
        onLabelCountChange={onChange}
        onCountryChange={vi.fn()}
        onPrint={vi.fn()}
      />,
    );
    const input = screen.getByLabelText('Cantidad de pallets');
    fireEvent.change(input, { target: { value: '120' } });
    expect(onChange).toHaveBeenLastCalledWith(99);
  });

  it('keeps quantity editable while a save is in progress and updates preview immediately', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CartelesView
        document={createMockDocument()}
        labelCount={1}
        onLabelCountChange={onChange}
        onCountryChange={vi.fn()}
        onPrint={vi.fn()}
        disabled
      />,
    );
    const input = screen.getByLabelText('Cantidad de pallets');
    expect(input).toBeEnabled();
    fireEvent.change(input, { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith(4);
    rerender(
      <CartelesView
        document={createMockDocument()}
        labelCount={4}
        onLabelCountChange={onChange}
        onCountryChange={vi.fn()}
        onPrint={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Siguiente')).toBeEnabled();
  });

  it.each(['PARAGUAY', 'PARAGUAY_GENETYX'])('emits the exact %s preset key', async (preset) => {
    const onCountryChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CartelesView
        document={createMockDocument()}
        labelCount={1}
        onLabelCountChange={vi.fn()}
        onCountryChange={onCountryChange}
        onPrint={vi.fn()}
      />,
    );
    await user.selectOptions(screen.getByLabelText('País'), preset);
    expect(onCountryChange).toHaveBeenLastCalledWith(preset);
  });

  it('locks country for finalized documents while retaining print', () => {
    const document = createMockDocument(undefined, { workflowStatus: 'finalizada' });
    render(
      <CartelesView
        document={document}
        labelCount={1}
        onLabelCountChange={vi.fn()}
        onCountryChange={vi.fn()}
        onPrint={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('País')).toBeDisabled();
    expect(screen.getByText('Imprimir carteles')).toBeEnabled();
  });
});

describe('label count preferences', () => {
  beforeEach(() => localStorage.clear());

  it('survives remount/reload and stays isolated by document id', () => {
    saveLabelCountPreference('document-a', 7);
    saveLabelCountPreference('document-b', 9);
    expect(loadLabelCountPreferences()).toEqual({ 'document-a': 7, 'document-b': 9 });
  });

  it('ignores corrupt storage', () => {
    localStorage.setItem('shipment-label-counts', '{broken');
    expect(loadLabelCountPreferences()).toEqual({});
  });
});
