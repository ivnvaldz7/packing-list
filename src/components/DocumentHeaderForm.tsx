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
        Cargá los datos que van impresos arriba de la hoja para que el documento salga como el
        modelo del laboratorio.
      </p>
    </div>

    <div className="grid grid-2">
      <InputField
        label="Laboratorio"
        value={header.laboratoryName}
        error={errors.laboratoryName}
        onChange={(event) => onChange('laboratoryName', event.target.value)}
        placeholder="Laboratorios Aurofarma"
      />
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
      <InputField
        label="Cliente"
        value={header.client}
        error={errors.client}
        onChange={(event) => onChange('client', event.target.value)}
        placeholder="Cliente / importador"
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
      <InputField
        label="Direccion"
        value={header.address}
        error={errors.address}
        onChange={(event) => onChange('address', event.target.value)}
        placeholder="Direccion del cliente o destino de entrega"
      />
    </div>
  </section>
);
