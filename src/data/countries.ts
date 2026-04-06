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
    laboratoryName: 'IMPORTACIONES UNIVERSO ZONA LIBRE S.A',
    address: 'FREE ZONE, COLON - PANAMA',
  },
  {
    value: 'COLOMBIA',
    label: 'COLOMBIA',
    laboratoryName: 'LABORATORIOS AUROFARMA SAS',
    address: 'KM 13 VIA OCCIDENTE FUNZA BODEGAS ITALCOL, CUNDINAMARCA-COLOMBIA',
  },
  {
    value: 'PARAGUAY',
    label: 'PARAGUAY',
    laboratoryName: 'AGRO VETERINARIA TOTAL SRL',
    address: 'LUIS ALBERTO HERRERA 477, ASUNCION-PARAGUAY',
  },
  {
    value: 'BOLIVIA',
    label: 'BOLIVIA',
    laboratoryName: 'VETERQUIMICA BOLIVIANA SRL',
    address: 'AVENIDA PIRAY 493, SANTA CRUZ DE LA SIERRA - BOLIVIA',
  },
  {
    value: 'ECUADOR',
    label: 'ECUADOR',
    laboratoryName: 'QUIMICA SUIZA INDUSTRIAL DEL ECUADOR',
    address: 'AV. GALO PLAZA LASSO 10640 Y MANUEL ZAMBRANO, QUITO-ECUADOR',
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
