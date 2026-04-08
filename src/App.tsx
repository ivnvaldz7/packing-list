import { useEffect, useRef, useState } from 'react';
import { DocumentLibrary } from './components/DocumentLibrary';
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
  const lastPalletRef = useRef<HTMLDivElement | null>(null);
  const previousPalletCountRef = useRef(0);
  const [activeStage, setActiveStage] = useState<'preparacion' | 'carga'>('preparacion');
  const [activePalletId, setActivePalletId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const savedTheme = window.localStorage.getItem('shipment-theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });
  const {
    document,
    documentLibrary,
    computedPallets,
    totals,
    products,
    lastCreatedItemId,
    status,
    error,
    updateHeader,
    updateWorkflowStatus,
    createNewDocument,
    openStoredDocument,
    deleteStoredDocument,
    addPallet,
    updatePallet,
    removePallet,
    addItem,
    clonePallet,
    selectProduct,
    updateItem,
    removeItem,
  } = useShipmentDocument();
  const validation = validateShipmentDocument(document, activeStage);
  useEffect(() => {
    window.document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('shipment-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (computedPallets.length > previousPalletCountRef.current) {
      requestAnimationFrame(() => {
        lastPalletRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    previousPalletCountRef.current = computedPallets.length;
  }, [computedPallets.length]);

  useEffect(() => {
    if (!computedPallets.length) {
      setActivePalletId(null);
      return;
    }

    if (activePalletId === null) {
      return;
    }

    const hasActivePallet = computedPallets.some((pallet) => pallet.id === activePalletId);
    if (!hasActivePallet) {
      setActivePalletId(computedPallets[0].id);
    }
  }, [activePalletId, computedPallets]);

  useEffect(() => {
    if (document.workflowStatus === 'carga' || document.workflowStatus === 'finalizada') {
      setActiveStage('carga');
      return;
    }

    setActiveStage('preparacion');
  }, [document.id, document.workflowStatus]);

  const handleStageChange = (nextStage: 'preparacion' | 'carga') => {
    setActiveStage(nextStage);
    updateWorkflowStatus(nextStage);
  };

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
      {isLibraryOpen ? (
        <DocumentLibrary
          documents={documentLibrary}
          activeDocumentId={document.id}
          onClose={() => setIsLibraryOpen(false)}
          onCreate={() => {
            createNewDocument();
            setIsLibraryOpen(false);
          }}
          onOpen={(documentId) => {
            void openStoredDocument(documentId);
            setIsLibraryOpen(false);
          }}
          onDelete={(documentId) => void deleteStoredDocument(documentId)}
        />
      ) : null}
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
            <button
              type="button"
              className={`sidebar-link ${activeStage === 'preparacion' ? 'sidebar-link-active' : ''}`}
              onClick={() => handleStageChange('preparacion')}
            >
              Preparacion
            </button>
            <button
              type="button"
              className={`sidebar-link ${activeStage === 'carga' ? 'sidebar-link-active' : ''}`}
              onClick={() => handleStageChange('carga')}
            >
              Carga final
            </button>
            <a className="sidebar-link" href="#summary-section">
              Resumen
            </a>
          </nav>
          <div className="sidebar-actions">
            <button
              type="button"
              className="primary-button sidebar-primary"
              onClick={() => {
                updateWorkflowStatus('finalizada');
                window.print();
              }}
            >
              Finalizar lista
            </button>
            <p className="sidebar-footnote">{document.workflowStatus === 'finalizada' ? 'Lista cerrada' : 'Lista activa'}</p>
            <p className="sidebar-footnote">{document.header.invoiceNumber || 'Sin factura'}</p>
          </div>
        </aside>

        <section className="workspace-main">
          <header className="topbar">
            <div className="topbar-title-group">
              <strong className="topbar-title">Lista de empaque</strong>
              <nav className="topbar-nav">
                <button
                  type="button"
                  className={activeStage === 'preparacion' ? 'topbar-nav-link topbar-nav-active' : 'topbar-nav-link'}
                  onClick={() => handleStageChange('preparacion')}
                >
                  Preparacion
                </button>
                <button
                  type="button"
                  className={activeStage === 'carga' ? 'topbar-nav-link topbar-nav-active' : 'topbar-nav-link'}
                  onClick={() => handleStageChange('carga')}
                >
                  Carga final
                </button>
                <button
                  type="button"
                  className="topbar-nav-link"
                  onClick={() => {
                    window.document.getElementById('summary-section')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  Resumen
                </button>
              </nav>
            </div>
            <div className="topbar-actions">
              <button
                type="button"
                className="ghost-button toolbar-button theme-toggle theme-icon-button"
                onClick={() => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))}
                aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              >
                <span
                  aria-hidden="true"
                  className={theme === 'light' ? 'theme-glyph theme-glyph-moon' : 'theme-glyph theme-glyph-sun'}
                />
              </button>
              <div className="stage-switcher">
                <button
                  type="button"
                  className={activeStage === 'preparacion' ? 'stage-chip stage-chip-active' : 'stage-chip'}
                  onClick={() => handleStageChange('preparacion')}
                >
                  Preparacion
                </button>
                <button
                  type="button"
                  className={activeStage === 'carga' ? 'stage-chip stage-chip-active' : 'stage-chip'}
                  onClick={() => handleStageChange('carga')}
                >
                  Carga final
                </button>
              </div>
              <button
                type="button"
                className="ghost-button toolbar-button"
                onClick={() => setIsLibraryOpen(true)}
              >
                Listas
              </button>
              <button
                type="button"
                className="ghost-button toolbar-button"
                onClick={() => void exportShipmentDocumentPdf(document, computedPallets, totals)}
              >
                Print PDF
              </button>
              <button type="button" className="ghost-button toolbar-button" onClick={createNewDocument}>
                Nueva lista
              </button>
              <button
                type="button"
                className="primary-button toolbar-primary"
                onClick={() => {
                  updateWorkflowStatus('finalizada');
                  window.print();
                }}
              >
                Finalizar
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
                  <small className="document-status-inline">
                    {document.workflowStatus === 'preparacion'
                      ? 'Preparacion'
                      : document.workflowStatus === 'carga'
                        ? 'En carga final'
                        : 'Finalizada'}
                  </small>
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

            {activeStage === 'preparacion' ? (
              <div key="preparacion" className="stage-panel">
                <section className="manifest-section-heading">
                  <div>
                    <h2>Preparacion del embarque</h2>
                    <p>
                      En esta etapa se define la estructura del documento y los productos previstos por
                      paleta. Los lotes y cantidades reales se completan despues.
                    </p>
                  </div>
                  <button type="button" className="manifest-add-button" onClick={addPallet}>
                    Anadir paleta
                  </button>
                </section>

                <section className="preparation-layout">
                  <article className="panel preparation-overview">
                    <div className="panel-header">
                      <div>
                        <p className="eyebrow">Paso 2</p>
                        <h2>Estructura del embarque</h2>
                      </div>
                      <p className="panel-copy">
                        Defini la cantidad de paletas y los productos base antes de que el encargado cargue
                        el contenido real.
                      </p>
                    </div>
                    <div className="preparation-stats">
                      <div className="preparation-stat-card">
                        <span>Total paletas</span>
                        <strong>{String(document.pallets.length).padStart(2, '0')}</strong>
                      </div>
                      <div className="preparation-stat-card">
                        <span>Pais</span>
                        <strong>{document.header.country}</strong>
                      </div>
                      <div className="preparation-stat-card">
                        <span>Factura</span>
                        <strong>{document.header.invoiceNumber || 'Pendiente'}</strong>
                      </div>
                    </div>
                  </article>

                  <article className="panel">
                    <div className="panel-header">
                      <div>
                        <p className="eyebrow">Paso 3</p>
                        <h2>Productos previstos por paleta</h2>
                      </div>
                      <p className="panel-copy">
                        Aca podes dejar armada cada paleta con sus productos previstos. Luego, en carga final,
                        el encargado completa lotes y cantidades reales.
                      </p>
                    </div>
                    <div className="pallet-list">
                      {computedPallets.map((pallet, index) => (
                        <div key={pallet.id} className="pallet-anchor">
                          <PalletCard
                            mode="preparacion"
                            pallet={pallet}
                            products={products}
                            autoFocusItemId={lastCreatedItemId}
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
                          <div className="preparation-pallet-actions">
                            <button
                              type="button"
                              className="ghost-button small-button"
                              onClick={() => {
                                handleStageChange('carga');
                                setActivePalletId(pallet.id);
                              }}
                            >
                              Pasar a carga final
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="manifest-bottom-actions">
                      <button type="button" className="secondary-button" onClick={addPallet}>
                        Anadir otra paleta
                      </button>
                    </div>
                  </article>
                </section>
              </div>
            ) : (
              <div key="carga" className="stage-panel">
                <section className="manifest-section-heading">
                  <div>
                    <h2>Carga final por paleta</h2>
                    <p>
                      Esta vista esta pensada para el encargado que conoce el contenido real final. Carga
                      una paleta por vez con sus productos, lotes y cantidades definitivas.
                    </p>
                  </div>
                  <button type="button" className="manifest-add-button" onClick={addPallet}>
                    Anadir paleta
                  </button>
                </section>

                <section className="panel pallet-selector-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Carga final</p>
                      <h2>Seleccion de paleta</h2>
                    </div>
                    <p className="panel-copy">Toca una paleta para desplegar y editarla en el mismo bloque.</p>
                  </div>
                  <div className="pallet-toggle-list">
                    {computedPallets.map((pallet, index) => {
                      const isActive = pallet.id === activePalletId;

                      return (
                        <div
                          key={pallet.id}
                          ref={index === computedPallets.length - 1 ? lastPalletRef : null}
                          className="pallet-toggle-item"
                        >
                          <button
                            type="button"
                            className={isActive ? 'pallet-nav-card pallet-nav-card-active' : 'pallet-nav-card'}
                            onClick={() => setActivePalletId((currentId) => (currentId === pallet.id ? null : pallet.id))}
                          >
                            <div>
                              <strong>{`Paleta ${index + 1}`}</strong>
                              <span>{`${pallet.items.length} item${pallet.items.length === 1 ? '' : 's'}`}</span>
                            </div>
                            <span>{formatWeight(pallet.totalGrossWeightKg)}</span>
                          </button>

                          {isActive ? (
                            <div className="pallet-toggle-editor">
                              <PalletCard
                                mode="carga"
                                pallet={pallet}
                                products={products}
                                autoFocusItemId={lastCreatedItemId}
                                itemErrors={
                                  validation.palletErrors.find((entry) => entry.palletId === pallet.id)?.itemErrors ?? {}
                                }
                                index={index}
                                canRemove={computedPallets.length > 1}
                                onUpdatePallet={updatePallet}
                                onRemovePallet={(palletId) => {
                                  removePallet(palletId);
                                }}
                                onAddItem={addItem}
                                onClonePallet={(palletId) => {
                                  clonePallet(palletId);
                                }}
                                onSelectProduct={selectProduct}
                                onUpdateItem={updateItem}
                                onRemoveItem={removeItem}
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

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
