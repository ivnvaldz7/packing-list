import { useEffect, useState } from 'react';
import { DocumentLibrary } from './components/DocumentLibrary';
import { DocumentHeaderForm } from './components/DocumentHeaderForm';
import { DocumentSummary } from './components/DocumentSummary';
import { Layout } from './components/layout/Layout';
import { PalletLabelPrint } from './components/PalletLabelPrint';
import { PrintDocumentView } from './components/PrintDocumentView';
import { useShipmentDocument } from './hooks/useShipmentDocument';
import { formatWeight } from './utils/format';
import { exportShipmentDocumentPdf } from './utils/pdf';
import { validateShipmentDocument } from './utils/validation';
import { CartelesView } from './views/CartelesView';
import { CargaView } from './views/CargaView';
import { PreparacionView } from './views/PreparacionView';

const App = () => {
  const [activeStage, setActiveStage] = useState<'carteles' | 'preparacion' | 'carga'>('carteles');
  const [activePalletId, setActivePalletId] = useState<string | null>(null);
  const [labelCount, setLabelCount] = useState(1);
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
  const validation = validateShipmentDocument(document, activeStage === 'carteles' ? 'preparacion' : activeStage);

  useEffect(() => {
    window.document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('shipment-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleAfterPrint = () => {
      window.document.body.classList.remove('printing-labels-only');
      window.document.body.classList.remove('printing-document-only');
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    if (document.workflowStatus === 'carga' || document.workflowStatus === 'finalizada') {
      setActiveStage('carga');
      return;
    }

    if (document.workflowStatus === 'preparacion') {
      setActiveStage('preparacion');
    }
  }, [document.id, document.workflowStatus]);

  const handleStageChange = (nextStage: 'carteles' | 'preparacion' | 'carga') => {
    setActiveStage(nextStage);
    if (nextStage === 'preparacion') {
      updateWorkflowStatus('preparacion');
    } else if (nextStage === 'carga') {
      updateWorkflowStatus('carga');
    }
    // 'carteles' no cambia el workflow status
  };

  const handleNavigateToCarga = (palletId: string) => {
    handleStageChange('carga');
    setActivePalletId(palletId);
  };

  const handleFinalize = () => {
    updateWorkflowStatus('finalizada');
    window.document.body.classList.add('printing-document-only');
    window.print();
  };

  const handlePrintPdf = () => {
    void exportShipmentDocumentPdf(document, computedPallets, totals);
  };

  const handleSummaryClick = () => {
    window.document.getElementById('summary-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 font-sans text-stone-600 dark:bg-stone-950 dark:text-stone-400">
        Cargando borrador local...
      </main>
    );
  }

  return (
    <>
      <PrintDocumentView
        document={document}
        pallets={computedPallets}
        totalNetWeightKg={totals.totalNetWeightKg}
        totalGrossWeightKg={totals.totalGrossWeightKg}
      />
      <PalletLabelPrint document={document} labelCount={labelCount} />
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

      <Layout
        activeStage={activeStage}
        onStageChange={handleStageChange}
        onFinalize={validation.isValid ? handleFinalize : undefined}
        onSummaryClick={handleSummaryClick}
        title="Lista de empaque"
        subtitle={document.header.invoiceNumber || 'Sin factura'}
        onPrint={handlePrintPdf}
        onNew={createNewDocument}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
      >
        {/* ─── Error banner ─── */}
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {/* ─── Carteles stage ─── */}
        {activeStage === 'carteles' ? (
          <CartelesView
            document={document}
            labelCount={labelCount}
            onLabelCountChange={setLabelCount}
          />
        ) : null}

        {/* ─── Header form (siempre visible) ─── */}
        <section id="header-section" className="mb-8">
          <DocumentHeaderForm
            header={document.header}
            errors={validation.headerErrors}
            onChange={updateHeader}
          />
        </section>

        {/* ─── Preparacion stage ─── */}
        {activeStage === 'preparacion' ? (
          <PreparacionView
            document={document}
            computedPallets={computedPallets}
            products={products}
            lastCreatedItemId={lastCreatedItemId}
            validation={validation}
            onAddPallet={addPallet}
            onUpdatePallet={updatePallet}
            onRemovePallet={removePallet}
            onAddItem={(palletId) => addItem(palletId, 'preparacion')}
            onClonePallet={clonePallet}
            onSelectProduct={selectProduct}
            onUpdateItem={(palletId, itemId, field, value) =>
              updateItem('preparacion', palletId, itemId, field, value as never)
            }
            onRemoveItem={removeItem}
            onNavigateToCarga={handleNavigateToCarga}
          />
        ) : (
          /* ─── Carga stage ─── */
          <CargaView
            document={document}
            computedPallets={computedPallets}
            products={products}
            lastCreatedItemId={lastCreatedItemId}
            activePalletId={activePalletId}
            validation={validation}
            onSetActivePallet={setActivePalletId}
            onAddPallet={addPallet}
            onUpdatePallet={updatePallet}
            onRemovePallet={removePallet}
            onAddItem={(palletId) => addItem(palletId, 'carga')}
            onClonePallet={clonePallet}
            onSelectProduct={selectProduct}
            onUpdateItem={(palletId, itemId, field, value) =>
              updateItem('carga', palletId, itemId, field, value as never)
            }
            onRemoveItem={removeItem}
          />
        )}

        {/* ─── Summary ─── */}
        <section id="summary-section" className="mb-8">
          <DocumentSummary
            document={document}
            totalNetWeightKg={totals.totalNetWeightKg}
            totalGrossWeightKg={totals.totalGrossWeightKg}
            isValid={validation.isValid}
          />
        </section>

        {/* ─── Footer ─── */}
        <footer className="flex items-center justify-between border-t border-stone-200 pt-4 text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">
          <span>{`Paletas: ${document.pallets.length}`}</span>
          <span>{`Peso neto total: ${formatWeight(totals.totalNetWeightKg)}`}</span>
          <span>{`Peso bruto total: ${formatWeight(totals.totalGrossWeightKg)}`}</span>
        </footer>
      </Layout>
    </>
  );
};

export default App;
