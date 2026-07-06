import { motion } from 'framer-motion';
import type { StoredDocumentSummary } from '../types';
import { backdrop, modalPanel, staggerContainer, staggerItem } from '../utils/animations';

type DocumentLibraryProps = {
  documents: StoredDocumentSummary[];
  activeDocumentId: string;
  onClose: () => void;
  onCreate: () => void;
  onOpen: (documentId: string) => void;
  onDelete: (documentId: string) => void;
};

const statusBadge: Record<StoredDocumentSummary['workflowStatus'], { label: string; cls: string }> =
  {
    preparacion: {
      label: 'Preparación',
      cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800',
    },
    carga: {
      label: 'En carga final',
      cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-800',
    },
    finalizada: {
      label: 'Finalizada',
      cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800',
    },
  };

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

export const DocumentLibrary = ({
  documents,
  activeDocumentId,
  onClose,
  onCreate,
  onOpen,
  onDelete,
}: DocumentLibraryProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    {/* ─── Backdrop ─── */}
    <motion.button
      type="button"
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      aria-label="Cerrar biblioteca"
      onClick={onClose}
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
    />

    {/* ─── Modal ─── */}
    <motion.section
      className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900"
      variants={modalPanel}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-5 dark:border-stone-800">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">
            Biblioteca
          </p>
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            Listas guardadas
          </h2>
          <p className="mt-1 max-w-prose text-sm text-stone-500 dark:text-stone-400">
            Cada packing list se guarda como un documento independiente para que el diseñador y el
            armador puedan trabajar distintas listas sin pisarse entre sí.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>

      {/* ─── New button ─── */}
      <div className="border-b border-stone-100 px-5 py-3 dark:border-stone-800">
        <motion.button
          type="button"
          onClick={onCreate}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          + Nueva lista
        </motion.button>
      </div>

      {/* ─── List ─── */}
      <div className="flex-1 overflow-y-auto p-5">
        {documents.length === 0 ? (
          <motion.p
            className="py-8 text-center text-sm text-stone-400 dark:text-stone-500"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            No hay listas guardadas todavía.
          </motion.p>
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {documents.map((entry) => {
              const isActive = entry.id === activeDocumentId;
              const badge = statusBadge[entry.workflowStatus];

              return (
                <motion.article
                  key={entry.id}
                  variants={staggerItem}
                  className={`rounded-xl border bg-white p-4 transition-shadow hover:shadow-md dark:bg-stone-900 ${
                    isActive
                      ? 'border-brand-300 ring-1 ring-brand-200 dark:border-brand-700 dark:ring-brand-800'
                      : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-stone-800 dark:text-stone-100">
                          {entry.invoiceNumber || 'Sin factura'}
                        </strong>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {entry.laboratoryName}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">{entry.address}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400 dark:text-stone-500">
                        <span>{entry.country || '—'}</span>
                        <span>{entry.transportType}</span>
                        <span>{`${entry.palletCount} paleta${entry.palletCount === 1 ? '' : 's'}`}</span>
                        <span>{formatDateTime(entry.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <motion.button
                        type="button"
                        onClick={() => onOpen(entry.id)}
                        className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Abrir
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        disabled={documents.length === 1}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-400 dark:hover:bg-red-950 dark:hover:text-red-400"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Eliminar
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.section>
  </div>
);
