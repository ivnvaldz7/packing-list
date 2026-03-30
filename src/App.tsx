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
    return <main className="loading-state">Cargando borrador local...</main>;
  }

  return (
    <>
      <PrintDocumentView
        document={document}
        pallets={computedPallets}
        totalNetWeightKg={totals.totalNetWeightKg}
        totalGrossWeightKg={totals.totalGrossWeightKg}
      />
      <main className="workspace screen-only">
        <aside className="workspace-sidebar">
          <div className="sidebar-brand">
            <LaboratoryLogo
              className="laboratory-logo laboratory-logo-sidebar"
              laboratoryName={document.header.laboratoryName || 'Laboratorios Aurofarma'}
            />
            <p className="sidebar-copy">Institutional export manifest</p>
          </div>
          <nav className="sidebar-nav">
            <a className="sidebar-link sidebar-link-active" href="#header-section">
              Pallet details
            </a>
            <a className="sidebar-link" href="#summary-section">
              Summary
            </a>
            <a className="sidebar-link" href="#header-section">
              Shipping metadata
            </a>
            <a className="sidebar-link" href="#summary-section">
              Validation
            </a>
          </nav>
          <div className="sidebar-actions">
            <button type="button" className="primary-button sidebar-primary" onClick={() => window.print()}>
              Finalize shipment
            </button>
            <p className="sidebar-footnote">Weight logs</p>
            <p className="sidebar-footnote">Audit trail</p>
          </div>
        </aside>

        <section className="workspace-main">
          <header className="topbar">
            <div className="topbar-title-group">
              <strong className="topbar-title">Lista de empaque</strong>
              <nav className="topbar-nav">
                <span>Drafts</span>
                <span className="topbar-nav-active">Completed</span>
                <span>Archive</span>
              </nav>
            </div>
            <div className="topbar-actions">
              <button
                type="button"
                className="ghost-button toolbar-button"
                onClick={() => void exportShipmentDocumentPdf(document, computedPallets, totals)}
              >
                Print PDF
              </button>
              <button type="button" className="ghost-button toolbar-button" onClick={() => void resetDocument()}>
                Reset
              </button>
              <button type="button" className="primary-button toolbar-primary" onClick={() => window.print()}>
                Finalize
              </button>
            </div>
          </header>

          <div className="document-canvas">
            <section className="document-header-shell">
              <div className="document-branding">
                <LaboratoryLogo
                  className="laboratory-logo laboratory-logo-document"
                  laboratoryName={document.header.laboratoryName || 'Laboratorios Aurofarma'}
                />
                <div className="document-brand-copy">
                  <p>{document.header.laboratoryName || 'Laboratorios Aurofarma'}</p>
                  <p>{document.header.address || document.header.country}</p>
                  <p>Ale-Bet export logistics sheet</p>
                </div>
              </div>
              <div className="document-title-box">
                <h1>Packing list</h1>
                <div className="document-code-box">
                  <span>Document no.</span>
                  <strong>{document.header.invoiceNumber || 'Sin factura'}</strong>
                </div>
              </div>
            </section>

            {error ? <p className="error-banner">{error}</p> : null}

            <section id="header-section">
              <DocumentHeaderForm
                header={document.header}
                errors={validation.headerErrors}
                onChange={updateHeader}
              />
            </section>

            <section className="manifest-section-heading">
              <div>
                <h2>Carga de paletas</h2>
                <p>
                  Carga operativa del embarque. Cada registro conserva SKU, lote, unidades por caja y
                  recalculo de pesos.
                </p>
              </div>
              <button type="button" className="manifest-add-button" onClick={addPallet}>
                Anadir paleta
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

            <section id="summary-section">
              <DocumentSummary
                document={document}
                totalNetWeightKg={totals.totalNetWeightKg}
                totalGrossWeightKg={totals.totalGrossWeightKg}
                isValid={validation.isValid}
              />
            </section>

            <footer className="document-footer">
              <span>{`Paletas: ${document.pallets.length}`}</span>
              <span>{`Peso neto total: ${formatWeight(totals.totalNetWeightKg)}`}</span>
              <span>{`Peso bruto total: ${formatWeight(totals.totalGrossWeightKg)}`}</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
};

export default App;
