import type { ShipmentDocument } from '../types';
import {
  getCountryPresetValue,
  shipmentCountries,
  type CountryPresetValue,
} from '../data/countries';
import { SelectField } from '../components/Field';
import { PalletLabels } from '../components/PalletLabel';

type CartelesViewProps = {
  document: ShipmentDocument;
  labelCount: number;
  onLabelCountChange: (count: number) => void;
  onCountryChange: (countryPreset: CountryPresetValue | '') => void;
  onPrint: () => Promise<void>;
  disabled?: boolean;
};

export const CartelesView = ({
  document,
  labelCount,
  onLabelCountChange,
  onCountryChange,
  onPrint,
  disabled = false,
}: CartelesViewProps) => {
  const clamp = (value: number) => Math.max(1, Math.min(99, value));
  const readOnly = document.workflowStatus === 'finalizada';
  return (
    <section className="mb-8 animate-stage-in space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Carteles para pallets</h2>
        <p className="mt-1 text-sm text-stone-500">
          Configurá y revisá los carteles de exportación.
        </p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="País"
            value={getCountryPresetValue(document.header)}
            onChange={(event) => onCountryChange(event.target.value as CountryPresetValue | '')}
            options={[{ value: '', label: 'Seleccioná un país...' }, ...shipmentCountries]}
            disabled={readOnly}
          />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Cantidad de pallets
            <input
              aria-label="Cantidad de pallets"
              type="number"
              min="1"
              max="99"
              value={labelCount}
              onChange={(event) => onLabelCountChange(clamp(Number(event.target.value) || 1))}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 dark:border-stone-600 dark:bg-stone-900"
            />
          </label>
        </div>
      </div>
      <PalletLabels
        document={document}
        labelCount={labelCount}
        onPrint={onPrint}
        disabled={disabled}
      />
    </section>
  );
};
