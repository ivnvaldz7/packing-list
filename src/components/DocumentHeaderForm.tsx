import type { DocumentHeader, HeaderValidation } from '../types';
import { shipmentCountries } from '../data/countries';
import { Field, InputField, SelectField } from './Field';

const INVOICE_PREFIX = 'E-0005-0000';
const getInvoiceSuffix = (value: string): string =>
  value.startsWith(INVOICE_PREFIX) ? value.slice(INVOICE_PREFIX.length) : value.replace(/\D/g, '').slice(-4);

type DocumentHeaderFormProps = {
  header: DocumentHeader;
  errors: HeaderValidation;
  onChange: <K extends keyof DocumentHeader>(field: K, value: DocumentHeader[K]) => void;
};

export const DocumentHeaderForm = ({ header, errors, onChange }: DocumentHeaderFormProps) => (
  <section className="panel">
    <div className="panel-header">
      <div>
        <p className="eyebrow">Paso 1</p>
        <h2>Preparacion del documento</h2>
      </div>
      <p className="panel-copy">
        Esta informacion define la base de la lista de empaque antes de cargar el contenido real
        de cada paleta.
      </p>
    </div>

    <div className="grid grid-3">
      <Field label="Factura N°" error={errors.invoiceNumber}>
        <div className="invoice-field">
          <span className="invoice-prefix">{INVOICE_PREFIX}</span>
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
            className="invoice-suffix-input"
          />
        </div>
      </Field>
      <SelectField
        label="Pais"
        value={header.country}
        onChange={(event) => onChange('country', event.target.value as DocumentHeader['country'])}
        options={shipmentCountries}
        error={errors.country}
      />
      <SelectField
        label="Transporte"
        value={header.transportType}
        onChange={(event) =>
          onChange('transportType', event.target.value as DocumentHeader['transportType'])
        }
        options={[
          { value: 'Maritimo', label: 'Maritimo' },
          { value: 'Aereo', label: 'Aereo' },
          { value: 'Terrestre', label: 'Terrestre' },
        ]}
      />
    </div>

    <div className="grid grid-2 header-autofill-grid">
      <InputField
        label="Laboratorio autocompletado"
        value={header.laboratoryName}
        onChange={() => undefined}
        readOnly
        className="readonly-input"
      />
      <InputField
        label="Direccion autocompletada"
        value={header.address}
        onChange={() => undefined}
        readOnly
        className="readonly-input"
      />
    </div>
  </section>
);
