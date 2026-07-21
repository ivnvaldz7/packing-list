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
  onPrint?: () => void | Promise<void>;
  disabled?: boolean;
};

export const PalletLabels = ({
  document,
  labelCount,
  onPrint,
  disabled = false,
}: PalletLabelsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= labelCount) {
      requestAnimationFrame(() => setCurrentIndex(Math.max(0, labelCount - 1)));
    }
  }, [labelCount, currentIndex]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(labelCount - 1, index)));
    },
    [labelCount],
  );

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">Vista previa</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Revisá cada cartel antes de imprimir.
          </p>
        </div>
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            disabled={disabled}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Imprimir carteles
          </button>
        )}
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 disabled:opacity-30"
            aria-label="Anterior"
          >
            ←
          </button>
          <span className="min-w-[6rem] text-center text-sm font-medium">
            {currentIndex + 1} / {labelCount}
          </span>
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex >= labelCount - 1}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 disabled:opacity-30"
            aria-label="Siguiente"
          >
            →
          </button>
        </div>
        <div className="flex w-full justify-center">
          <PalletLabel
            key={`cartel-${currentIndex}`}
            document={document}
            palletIndex={currentIndex}
            totalPallets={labelCount}
          />
        </div>
      </div>
    </div>
  );
};
