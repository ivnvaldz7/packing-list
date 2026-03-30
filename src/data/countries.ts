import type { DocumentHeader, ShipmentCountry } from '../types';

export type CountryPreset = {
  value: ShipmentCountry;
  label: string;
  laboratoryName: string;
  address: string;
};

export const countryPresets: CountryPreset[] = [
  {
    value: 'PANAMA',
    label: 'PANAMA',
    laboratoryName: 'Laboratorios Aurofarma',
    address: 'PANAMA',
  },
  {
    value: 'COLOMBIA',
    label: 'COLOMBIA',
    laboratoryName: 'Laboratorios Aurofarma',
    address: 'COLOMBIA',
  },
  {
    value: 'PARAGUAY',
    label: 'PARAGUAY',
    laboratoryName: 'Laboratorios Aurofarma',
    address: 'PARAGUAY',
  },
  {
    value: 'BOLIVIA',
    label: 'BOLIVIA',
    laboratoryName: 'Laboratorios Aurofarma',
    address: 'BOLIVIA',
  },
  {
    value: 'ECUADOR',
    label: 'ECUADOR',
    laboratoryName: 'Laboratorios Aurofarma',
    address: 'ECUADOR',
  },
];

export const shipmentCountries = countryPresets.map(({ value, label }) => ({ value, label }));

export const getCountryPreset = (
  country: ShipmentCountry,
): Pick<DocumentHeader, 'country' | 'laboratoryName' | 'address'> => {
  const preset = countryPresets.find((entry) => entry.value === country) ?? countryPresets[0];

  return {
    country: preset.value,
    laboratoryName: preset.laboratoryName,
    address: preset.address,
  };
};
