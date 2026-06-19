import type { DocumentHeader, ShipmentCountry } from '../types';

export type CountryPresetValue = ShipmentCountry | 'PARAGUAY_GENETYX';

export type CountryPreset = {
  value: CountryPresetValue;
  country: ShipmentCountry;
  label: string;
  laboratoryName: string;
  address: string;
};

export const countryPresets: CountryPreset[] = [
  {
    value: 'PANAMA',
    country: 'PANAMA',
    label: 'PANAMA',
    laboratoryName: 'IMPORTACIONES UNIVERSO ZONA LIBRE S.A',
    address: 'FREE ZONE, COLON - PANAMA',
  },
  {
    value: 'COLOMBIA',
    country: 'COLOMBIA',
    label: 'COLOMBIA',
    laboratoryName: 'LABORATORIOS AUROFARMA SAS',
    address: 'KM 13 VIA OCCIDENTE FUNZA BODEGAS ITALCOL, CUNDINAMARCA-COLOMBIA',
  },
  {
    value: 'PARAGUAY',
    country: 'PARAGUAY',
    label: 'PARAGUAY · AGRO VETERINARIA TOTAL SRL',
    laboratoryName: 'AGRO VETERINARIA TOTAL SRL',
    address: 'LUIS ALBERTO HERRERA 477, ASUNCION-PARAGUAY',
  },
  {
    value: 'PARAGUAY_GENETYX',
    country: 'PARAGUAY',
    label: 'PARAGUAY · GENETYX',
    laboratoryName: 'GENETYX',
    address: 'BERNARDINO CABALLERO 1515, MARIANO ROQUE ALONSO-PARAGUAY',
  },
  {
    value: 'BOLIVIA',
    country: 'BOLIVIA',
    label: 'BOLIVIA',
    laboratoryName: 'VETERQUIMICA BOLIVIANA SRL',
    address: 'AVENIDA PIRAY 493, SANTA CRUZ DE LA SIERRA - BOLIVIA',
  },
  {
    value: 'ECUADOR',
    country: 'ECUADOR',
    label: 'ECUADOR',
    laboratoryName: 'QUIMICA SUIZA INDUSTRIAL DEL ECUADOR',
    address: 'AV. GALO PLAZA LASSO 10640 Y MANUEL ZAMBRANO, QUITO-ECUADOR',
  },
];

export const shipmentCountries = countryPresets.map(({ value, label }) => ({ value, label }));

const findCountryPreset = (
  valueOrCountry: string,
  header?: Pick<DocumentHeader, 'country' | 'laboratoryName' | 'address'>,
): CountryPreset | undefined => {
  if (header && header.country !== '') {
    const presetFromHeader = countryPresets.find(
      (entry) =>
        entry.country === header.country &&
        entry.laboratoryName === header.laboratoryName &&
        entry.address === header.address,
    );

    if (presetFromHeader) {
      return presetFromHeader;
    }
  }

  return (
    countryPresets.find((entry) => entry.value === valueOrCountry) ??
    countryPresets.find((entry) => entry.country === valueOrCountry)
  );
};

export const getCountryPreset = (
  countryPresetValue: string,
): Pick<DocumentHeader, 'country' | 'laboratoryName' | 'address'> => {
  if (countryPresetValue === '') {
    return {
      country: '',
      laboratoryName: '',
      address: '',
    };
  }

  const preset = findCountryPreset(countryPresetValue) ?? countryPresets[0];

  return {
    country: preset.country,
    laboratoryName: preset.laboratoryName,
    address: preset.address,
  };
};

export const getCountryPresetValue = (
  header: Pick<DocumentHeader, 'country' | 'laboratoryName' | 'address'>,
): CountryPresetValue | '' => {
  if (header.country === '') {
    return '';
  }

  const preset =
    findCountryPreset(header.country, header) ??
    countryPresets.find((entry) => entry.country === header.country);

  return preset?.value ?? header.country;
};
