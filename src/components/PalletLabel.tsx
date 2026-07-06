import { useCallback, useEffect, useState } from 'react';
import type { ShipmentDocument } from '../types';

/* ─── Helpers ─── */

const DESTINATARIO_FIJO = 'LABORATORIOS ALE-BET SRL';
const DESTINATARIO_DIRECCION = 'CONDARCO 3073, CIUDAD DE BUENOS AIRES, ARGENTINA';

/* ══════════════════════════════════════════════════
   PalletLabel — preview de UN cartel
   ══════════════════════════════════════════════════ */

type PalletLabelProps = {
  document: ShipmentDocument;
  palletIndex: number;
  totalPallets: number;
};

export const PalletLabel = ({ document, palletIndex, totalPallets }: PalletLabelProps) => {
  const palletNumber = String(palletIndex + 1).padStart(2, '0');
  const totalString = String(totalPallets).padStart(2, '0');
  const fecha = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const hasData = Boolean(document.header.laboratoryName && document.header.country);

  return (
    <div className="aspect-[1.414] w-full max-w-2xl rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="flex h-full flex-col px-6 py-5">
        {/* ─── Header: título + número ─── */}
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-md bg-brand-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
            Mercadería de exportación
          </div>
          <span className="shrink-0 font-mono text-xs font-semibold text-stone-400 dark:text-stone-500">
            {palletNumber}/{totalString}
          </span>
        </div>

        <div className="flex-1" />

        {/* ─── REMITENTE ─── */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Remitente
          </p>
          <p className="mt-1 text-base font-bold uppercase text-stone-800 dark:text-stone-100">
            {hasData ? document.header.laboratoryName : 'Seleccioná un país'}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {hasData ? document.header.address : 'para ver los datos'}
          </p>
        </div>

        <div className="flex-1" />

        {/* ─── Divider ─── */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-stone-300 dark:bg-stone-600" />
          <span className="text-xs uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500">
            Destino
          </span>
          <div className="h-px flex-1 bg-stone-300 dark:bg-stone-600" />
        </div>

        <div className="flex-1" />

        {/* ─── DESTINATARIO ─── */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Destinatario
          </p>
          <p className="mt-1 text-base font-bold uppercase text-stone-800 dark:text-stone-100">
            {DESTINATARIO_FIJO}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">{DESTINATARIO_DIRECCION}</p>
        </div>

        <div className="flex-1" />

        {/* ─── Footer ─── */}
        <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-xs font-mono text-stone-400 dark:border-stone-700 dark:text-stone-500">
          <span>{fecha}</span>
          <span className="font-semibold text-stone-600 dark:text-stone-300">
            {palletNumber}/{totalString}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   PalletLabels — UN preview con stepper
   ══════════════════════════════════════════════════ */

type PalletLabelsProps = {
  document: ShipmentDocument;
  labelCount: number;
  onLabelCountChange: (count: number) => void;
  onPrint?: () => void;
};

export const PalletLabels = ({
  document,
  labelCount,
  onLabelCountChange,
  onPrint,
}: PalletLabelsProps) => {
  const [inputValue, setInputValue] = useState(String(labelCount));
  const [currentIndex, setCurrentIndex] = useState(0);

  const clamp = (n: number) => Math.max(1, Math.min(99, n));

  const handleDecrement = () => {
    const next = clamp(labelCount - 1);
    onLabelCountChange(next);
    setInputValue(String(next));
  };

  const handleIncrement = () => {
    const next = clamp(labelCount + 1);
    onLabelCountChange(next);
    setInputValue(String(next));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    const next = clamp(isNaN(parsed) ? 1 : parsed);
    onLabelCountChange(next);
    setInputValue(String(next));
  };

  // Reset current index si se reduce la cantidad
  useEffect(() => {
    if (currentIndex >= labelCount) {
      requestAnimationFrame(() => {
        setCurrentIndex(Math.max(0, labelCount - 1));
      });
    }
  }, [labelCount, currentIndex]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(labelCount - 1, index)));
    },
    [labelCount],
  );

  const handlePrev = () => goTo(currentIndex - 1);
  const handleNext = () => goTo(currentIndex + 1);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= labelCount - 1;

  return (
    <div className="space-y-4">
      {/* ─── Controls ─── */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="label-count"
            className="text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Cantidad de carteles
          </label>
          <div className="flex items-center overflow-hidden rounded-lg border border-stone-300 dark:border-stone-600">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={labelCount <= 1}
              className="flex h-9 w-9 items-center justify-center text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              −
            </button>
            <input
              id="label-count"
              type="number"
              min="1"
              max="99"
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className="h-9 w-16 border-x border-stone-300 bg-white text-center text-sm font-medium text-stone-800 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={handleIncrement}
              disabled={labelCount >= 99}
              className="flex h-9 w-9 items-center justify-center text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              +
            </button>
          </div>
        </div>

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            disabled={labelCount === 0}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Imprimir carteles
          </button>
        )}
      </div>

      <p className="text-xs text-stone-400 dark:text-stone-500">
        Los carteles usan los datos del país configurado en la sección Preparación
      </p>

      {/* ─── Preview único ─── */}
      <div className="flex flex-col items-center gap-4">
        {/* ─── Navegación ─── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition-all hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Anterior"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="min-w-[6rem] text-center text-sm font-medium text-stone-600 dark:text-stone-300">
            {currentIndex + 1} / {labelCount}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={isLast}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition-all hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Siguiente"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* ─── Cartel con fade al cambiar ─── */}
        <div className="flex w-full justify-center">
          <PalletLabel
            key={`cartel-${currentIndex}`}
            document={document}
            palletIndex={currentIndex}
            totalPallets={labelCount}
          />
        </div>
      </div>

      {/* ─── Dots ─── */}
      {labelCount > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: Math.min(labelCount, 20) }, (_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? 'w-6 bg-brand-500'
                  : 'w-2 bg-stone-300 hover:bg-stone-400 dark:bg-stone-600 dark:hover:bg-stone-500'
              }`}
              aria-label={`Ir al cartel ${i + 1}`}
            />
          ))}
          {labelCount > 20 && (
            <span className="text-xs text-stone-400 dark:text-stone-500">+{labelCount - 20}</span>
          )}
        </div>
      )}
    </div>
  );
};
