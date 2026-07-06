import type { DocumentHeader, HeaderValidation } from '../types';
import { getCountryPresetValue, shipmentCountries } from '../data/countries';
import { Field, InputField, SelectField } from './Field';

const INVOICE_PREFIX = 'E-0005-0000';
const getInvoiceSuffix = (value: string): string =>
  value.startsWith(INVOICE_PREFIX)
    ? value.slice(INVOICE_PREFIX.length)
    : value.replace(/\D/g, '').slice(-4);

type DocumentHeaderFormProps = {
  header: DocumentHeader;
  errors: HeaderValidation;
  onChange: <K extends keyof DocumentHeader>(field: K, value: DocumentHeader[K]) => void;
  readOnly?: boolean;
};

export const DocumentHeaderForm = ({
  header,
  errors,
  onChange,
  readOnly = false,
}: DocumentHeaderFormProps) => {
  const selectedCountryPreset = getCountryPresetValue(header);

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-stone-700 dark:bg-stone-900">
      {/* ─── Header ─── */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">
            Paso 1
          </p>
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            Preparación del documento
          </h2>
          <p className="mt-1 max-w-prose text-sm text-stone-500 dark:text-stone-400">
            Esta información define la base de la lista de empaque antes de cargar el contenido real
            de cada paleta.
          </p>
        </div>
      </div>

      {/* ─── Grid 3: Invoice, Country, Transport ─── */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Factura N°" error={errors.invoiceNumber}>
          <div className="flex items-stretch">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-stone-300 bg-stone-50 px-3 text-sm font-semibold tracking-wide text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {INVOICE_PREFIX}
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={getInvoiceSuffix(header.invoiceNumber)}
              onChange={(event) =>
                onChange(
                  'invoiceNumber',
                  `${INVOICE_PREFIX}${event.target.value.replace(/\D/g, '').slice(0, 4)}` as DocumentHeader['invoiceNumber'],
                )
              }
              placeholder="0005"
              aria-invalid={Boolean(errors.invoiceNumber)}
              readOnly={readOnly}
              className={`w-full rounded-r-lg border px-3.5 py-2.5 text-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
                errors.invoiceNumber
                  ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-950 dark:text-red-300'
                  : 'border-stone-300 bg-white text-stone-900 focus:border-brand-500 focus:ring-brand-500/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100'
              } ${readOnly ? 'cursor-default opacity-70' : ''}`}
            />
          </div>
        </Field>

        <SelectField
          label="País"
          value={selectedCountryPreset}
          onChange={(event) => onChange('country', event.target.value as DocumentHeader['country'])}
          options={[{ value: '', label: 'Seleccioná un país...' }, ...shipmentCountries]}
          error={errors.country}
          disabled={readOnly}
        />

        <SelectField
          label="Transporte"
          value={header.transportType}
          onChange={(event) =>
            onChange('transportType', event.target.value as DocumentHeader['transportType'])
          }
          options={[
            { value: 'Maritimo', label: 'Marítimo' },
            { value: 'Aereo', label: 'Aéreo' },
            { value: 'Terrestre', label: 'Terrestre' },
          ]}
          disabled={readOnly}
        />
      </div>

      {/* ─── Grid 2: Fecha de embarque ─── */}
      <div className="mb-4">
        <InputField
          label="Fecha de embarque"
          type="date"
          value={header.shipmentDate}
          onChange={(event) => onChange('shipmentDate', event.target.value)}
          error={errors.shipmentDate}
          readOnly={readOnly}
        />
      </div>

      {/* ─── Grid 3: Laboratory, Address (readonly) ─── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField
          label="Laboratorio autocompletado"
          value={header.laboratoryName}
          onChange={() => undefined}
          readOnly
        />
        <InputField
          label="Dirección autocompletada"
          value={header.address}
          onChange={() => undefined}
          readOnly
        />
      </div>
    </section>
  );
};
