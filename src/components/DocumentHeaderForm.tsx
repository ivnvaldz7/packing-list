import type { DocumentHeader, HeaderValidation } from '../types';
import { shipmentCountries } from '../data/countries';
import { InputField, SelectField } from './Field';

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
        <h2>Cabecera de la lista de empaque</h2>
      </div>
      <p className="panel-copy">
        El pais aplica una configuracion fija para la cabecera. Solo quedan variables el numero
        de factura y el tipo de transporte.
      </p>
    </div>

    <div className="grid grid-2">
      <InputField
        label="Factura N°"
        value={header.invoiceNumber}
        error={errors.invoiceNumber}
        onChange={(event) => onChange('invoiceNumber', event.target.value)}
        placeholder="E-0005-00000306"
      />
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
