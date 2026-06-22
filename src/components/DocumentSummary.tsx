import type { ShipmentDocument } from '../types';
import { formatWeight } from '../utils/format';

type DocumentSummaryProps = {
  document: ShipmentDocument;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
  totalBoxes: number;
  isValid: boolean;
};

export const DocumentSummary = ({
  document,
  totalNetWeightKg,
  totalGrossWeightKg,
  totalBoxes,
  isValid,
}: DocumentSummaryProps) => {
  const totalUnits = document.pallets.reduce(
    (sum, pallet) => sum + pallet.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const workflowLabel =
    document.workflowStatus === 'preparacion'
      ? 'En preparación'
      : document.workflowStatus === 'carga'
        ? 'En carga final'
        : 'Finalizada';

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
      <h3 className="mb-4 text-base font-semibold text-stone-800 dark:text-stone-100">
        Resumen consolidado de carga
      </h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
        <SummaryRow label="Total paletas" value={String(document.pallets.length).padStart(2, '0')} />
        <SummaryRow label="Total cajas" value={String(totalBoxes)} />
        <SummaryRow label="Total unidades" value={String(totalUnits)} />
        <SummaryRow label="Peso neto total" value={formatWeight(totalNetWeightKg)} />
        <SummaryRow label="Peso bruto estimado" value={formatWeight(totalGrossWeightKg)} />

        <div className="col-span-2 flex items-center justify-between border-b border-stone-100 pb-2 md:col-span-3 dark:border-stone-800">
          <span className="text-sm text-stone-500 dark:text-stone-400">Validación</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isValid
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800'
            }`}
          >
            {isValid ? 'Borrador validado' : 'Revisión pendiente'}
          </span>
        </div>

        <div className="col-span-2 flex items-center justify-between border-b border-stone-100 pb-2 md:col-span-3 dark:border-stone-800">
          <span className="text-sm text-stone-500 dark:text-stone-400">Flujo</span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700">
            {workflowLabel}
          </span>
        </div>
      </div>
    </article>
  );
};

/* ─── Summary row helper ─── */

type SummaryRowProps = {
  label: string;
  value: string;
};

const SummaryRow = ({ label, value }: SummaryRowProps) => (
  <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
    <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
    <strong className="font-mono text-sm font-semibold text-stone-800 dark:text-stone-100">{value}</strong>
  </div>
);
