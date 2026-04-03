export const formatWeight = (value: number): string => `${value.toFixed(3)} kg`;

export const formatWholeWeight = (value: number): string => `${Math.round(value)} kg`;
