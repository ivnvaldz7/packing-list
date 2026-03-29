import { DocumentHeaderForm } from './components/DocumentHeaderForm';
import { DocumentSummary } from './components/DocumentSummary';
import { LaboratoryLogo } from './components/LaboratoryLogo';
import { PalletCard } from './components/PalletCard';
import { PrintDocumentView } from './components/PrintDocumentView';
import { useShipmentDocument } from './hooks/useShipmentDocument';
import { formatWeight } from './utils/format';
import { exportShipmentDocumentPdf } from './utils/pdf';
import { validateShipmentDocument } from './utils/validation';

const App = () => {
  const {
    document,
    computedPallets,
    totals,
    products,
    status,
    error,
    updateHeader,
    addPallet,
    updatePallet,
    removePallet,
    addItem,
    clonePallet,
    resetDocument,
    selectProduct,
    updateItem,
    removeItem,
  } = useShipmentDocument();
  const validation = validateShipmentDocument(document);

  if (status === 'loading') {
    return <main className="app-shell loading-state">Cargando borrador local...</main>;
  }

  return (
    <>
      <PrintDocumentView
        document={document}
        pallets={computedPallets}
        totalNetWeightKg={totals.totalNetWeightKg}
        totalGrossWeightKg={totals.totalGrossWeightKg}
      />
      <main className="app-shell screen-only">
      <header className="hero">
        <div className="hero-brand">
          <LaboratoryLogo
            className="laboratory-logo"
            laboratoryName={document.header.laboratoryName || 'Laboratorios Aurofarma'}
          />
          <p className="eyebrow">MVP</p>
          <h1>Lista de empaque</h1>
          <p className="hero-copy">
            Cabecera adaptada al formato del laboratorio para cargar factura, cliente, direccion
            y tipo de transporte antes de armar las paletas.
          </p>
        </div>
        <div className="hero-side">
          <button
            type="button"
            className="primary-button"
            onClick={() => void exportShipmentDocumentPdf(document, computedPallets, totals)}
          >
            Exportar PDF
          </button>
          <button type="button" className="primary-button" onClick={() => window.print()}>
            Imprimir
          </button>
          <button type="button" className="ghost-button reset-button" onClick={() => void resetDocument()}>
            Nuevo documento
          </button>
          <article className="hero-metric">
            <span>Paletas</span>
            <strong>{document.pallets.length}</strong>
          </article>
          <article className="hero-metric">
            <span>Neto total</span>
            <strong>{formatWeight(totals.totalNetWeightKg)}</strong>
          </article>
          <article className="hero-metric">
            <span>Bruto total</span>
            <strong>{formatWeight(totals.totalGrossWeightKg)}</strong>
          </article>
        </div>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      <DocumentHeaderForm
        header={document.header}
        errors={validation.headerErrors}
        onChange={updateHeader}
      />

      <section className="section-heading">
        <div>
          <p className="eyebrow">Paso 4</p>
          <h2>Paletas e ítems</h2>
          <p className="section-copy">
            Cada cambio recalcula los pesos en línea y queda persistido localmente en IndexedDB.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={addPallet}>
          Crear nueva paleta
        </button>
      </section>

      <div className="pallet-list">
        {computedPallets.map((pallet, index) => (
          <PalletCard
            key={pallet.id}
            pallet={pallet}
            products={products}
            itemErrors={
              validation.palletErrors.find((entry) => entry.palletId === pallet.id)?.itemErrors ?? {}
            }
            index={index}
            canRemove={computedPallets.length > 1}
            onUpdatePallet={updatePallet}
            onRemovePallet={removePallet}
            onAddItem={addItem}
            onClonePallet={clonePallet}
            onSelectProduct={selectProduct}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        ))}
      </div>

      <DocumentSummary
        document={document}
        totalNetWeightKg={totals.totalNetWeightKg}
        totalGrossWeightKg={totals.totalGrossWeightKg}
        isValid={validation.isValid}
      />
      </main>
    </>
  );
};

export default App;
