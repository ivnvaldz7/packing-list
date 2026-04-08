import type { StoredDocumentSummary } from '../types';

type DocumentLibraryProps = {
  documents: StoredDocumentSummary[];
  activeDocumentId: string;
  onClose: () => void;
  onCreate: () => void;
  onOpen: (documentId: string) => void;
  onDelete: (documentId: string) => void;
};

const statusLabelMap: Record<StoredDocumentSummary['workflowStatus'], string> = {
  preparacion: 'Preparacion',
  carga: 'En carga final',
  finalizada: 'Finalizada',
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
  <div className="document-library-overlay" role="dialog" aria-modal="true">
    <button type="button" className="document-library-backdrop" aria-label="Cerrar biblioteca" onClick={onClose} />
    <section className="panel document-library">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2>Listas guardadas</h2>
        </div>
        <div className="document-library-header-actions">
          <p className="panel-copy">
            Cada packing list se guarda como un documento independiente para que el diseñador y el armador
            puedan trabajar distintas listas sin pisarse entre si.
          </p>
          <button type="button" className="ghost-button small-button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      <div className="document-library-actions">
        <button type="button" className="primary-button" onClick={onCreate}>
          Nueva lista
        </button>
      </div>

      <div className="document-library-list">
        {documents.map((entry) => {
          const isActive = entry.id === activeDocumentId;

          return (
            <article
              key={entry.id}
              className={isActive ? 'document-library-card document-library-card-active' : 'document-library-card'}
            >
              <div className="document-library-card-main">
                <div className="document-library-card-top">
                  <strong>{entry.invoiceNumber || 'Sin factura'}</strong>
                  <span className={`document-library-status document-library-status-${entry.workflowStatus}`}>
                    {statusLabelMap[entry.workflowStatus]}
                  </span>
                </div>
                <p>{entry.laboratoryName}</p>
                <p>{entry.address}</p>
                <div className="document-library-meta">
                  <span>{entry.country}</span>
                  <span>{entry.transportType}</span>
                  <span>{`${entry.palletCount} paleta${entry.palletCount === 1 ? '' : 's'}`}</span>
                  <span>{formatDateTime(entry.updatedAt)}</span>
                </div>
              </div>

              <div className="document-library-card-actions">
                <button type="button" className="secondary-button small-button" onClick={() => onOpen(entry.id)}>
                  Abrir
                </button>
                <button
                  type="button"
                  className="ghost-button small-button"
                  onClick={() => onDelete(entry.id)}
                  disabled={documents.length === 1}
                >
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  </div>
);
