import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DocumentLibrary } from './components/DocumentLibrary';
import { DocumentHeaderForm } from './components/DocumentHeaderForm';
import { DocumentSummary } from './components/DocumentSummary';
import { Layout } from './components/layout/Layout';
import { PalletLabelPrint } from './components/PalletLabelPrint';
import { PrintDocumentView } from './components/PrintDocumentView';
import { useShipmentDocument } from './hooks/useShipmentDocument';
import { fadeSlideUp, slideHorizontal } from './utils/animations';
import { formatWeight } from './utils/format';
import { exportShipmentDocumentXlsx } from './utils/excel';
import { printShipmentDocument, registerPrintCleanup } from './utils/print';
import { validateShipmentDocument } from './utils/validation';
import { CartelesView } from './views/CartelesView';
import { CargaView } from './views/CargaView';
import { PreparacionView } from './views/PreparacionView';

const stageOrder: Record<string, number> = {
  carteles: 0,
  preparacion: 1,
  carga: 2,
};

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
    isSaving,
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
  const validation = validateShipmentDocument(
    document,
    activeStage === 'carteles' ? 'preparacion' : activeStage,
  );

  useEffect(() => {
    window.document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('shipment-theme', theme);
  }, [theme]);

  useEffect(() => {
    return registerPrintCleanup();
  }, []);

  const [prevStage, setPrevStage] = useState(activeStage);
  const stageDirection =
    stageOrder[activeStage] - (stageOrder[prevStage] ?? stageOrder[activeStage]);

  const handleCreateNew = (): void => {
    createNewDocument();
    setActiveStage('preparacion');
    setPrevStage('carteles');
  };

  const handleOpenDocument = async (documentId: string): Promise<void> => {
    const workflowStatus = await openStoredDocument(documentId);
    if (workflowStatus) {
      if (workflowStatus === 'finalizada' || workflowStatus === 'carga') {
        setActiveStage('carga');
      } else {
        setActiveStage(workflowStatus);
      }
      setPrevStage('carteles');
    }
  };

  const handleStageChange = (nextStage: 'carteles' | 'preparacion' | 'carga') => {
    setPrevStage(activeStage);
    setActiveStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!window.confirm('¿Finalizar la lista de empaque? Una vez finalizada no se puede editar.')) {
      return;
    }

    updateWorkflowStatus('finalizada');
    printShipmentDocument();
  };

  const isReadOnly = document.workflowStatus === 'finalizada';

  const handleExportExcel = () => {
    exportShipmentDocumentXlsx(document, computedPallets, totals);
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
      <AnimatePresence>
        {isLibraryOpen && (
          <DocumentLibrary
            documents={documentLibrary}
            activeDocumentId={document.id}
            onClose={() => setIsLibraryOpen(false)}
            onCreate={() => {
              handleCreateNew();
              setIsLibraryOpen(false);
            }}
            onOpen={async (documentId) => {
              await handleOpenDocument(documentId);
              setIsLibraryOpen(false);
            }}
            onDelete={(documentId) => void deleteStoredDocument(documentId)}
          />
        )}
      </AnimatePresence>

      <Layout
        activeStage={activeStage}
        onStageChange={handleStageChange}
        onFinalize={!isReadOnly && validation.isValid ? handleFinalize : undefined}
        onSummaryClick={handleSummaryClick}
        title="Lista de empaque"
        subtitle={document.header.invoiceNumber || 'Sin factura'}
        isSaving={isSaving}
        onPrint={printShipmentDocument}
        onExportExcel={handleExportExcel}
        onNew={handleCreateNew}
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

        {/* ─── Stage views with AnimatePresence ─── */}
        <AnimatePresence mode="wait" custom={stageDirection}>
          <motion.div
            key={activeStage}
            custom={stageDirection}
            variants={slideHorizontal}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {activeStage === 'carteles' && (
              <CartelesView
                document={document}
                labelCount={labelCount}
                onLabelCountChange={setLabelCount}
              />
            )}

            {activeStage === 'preparacion' && (
              <PreparacionView
                document={document}
                computedPallets={computedPallets}
                products={products}
                lastCreatedItemId={lastCreatedItemId}
                validation={validation}
                readOnly={isReadOnly}
                onAddPallet={addPallet}
                onUpdatePallet={updatePallet}
                onRemovePallet={removePallet}
                onAddItem={(palletId) => addItem(palletId, 'preparacion')}
                onClonePallet={clonePallet}
                onSelectProduct={selectProduct}
                onUpdateItem={(palletId, itemId, field, value) =>
                  updateItem('preparacion', palletId, itemId, field, value)
                }
                onRemoveItem={removeItem}
                onNavigateToCarga={handleNavigateToCarga}
              />
            )}

            {activeStage === 'carga' && (
              <CargaView
                document={document}
                computedPallets={computedPallets}
                products={products}
                lastCreatedItemId={lastCreatedItemId}
                activePalletId={activePalletId}
                validation={validation}
                readOnly={isReadOnly}
                onSetActivePallet={setActivePalletId}
                onAddPallet={addPallet}
                onUpdatePallet={updatePallet}
                onRemovePallet={removePallet}
                onAddItem={(palletId) => addItem(palletId, 'carga')}
                onClonePallet={clonePallet}
                onSelectProduct={selectProduct}
                onUpdateItem={(palletId, itemId, field, value) =>
                  updateItem('carga', palletId, itemId, field, value)
                }
                onRemoveItem={removeItem}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Header form (siempre visible) ─── */}
        <motion.section
          id="header-section"
          className="mb-8"
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
        >
          <DocumentHeaderForm
            header={document.header}
            errors={validation.headerErrors}
            onChange={updateHeader}
            readOnly={isReadOnly}
          />
        </motion.section>

        {/* ─── Summary ─── */}
        <motion.section
          id="summary-section"
          className="mb-8"
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
        >
          <DocumentSummary
            document={document}
            totalNetWeightKg={totals.totalNetWeightKg}
            totalGrossWeightKg={totals.totalGrossWeightKg}
            totalBoxes={totals.totalBoxes}
            isValid={validation.isValid}
          />
        </motion.section>

        {/* ─── Footer ─── */}
        <motion.footer
          className="flex items-center justify-between border-t border-stone-200 pt-4 text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400"
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
        >
          <span>{`Paletas: ${document.pallets.length}`}</span>
          <span>{`Cajas: ${totals.totalBoxes}`}</span>
          <span>{`Peso neto total: ${formatWeight(totals.totalNetWeightKg)}`}</span>
          <span>{`Peso bruto total: ${formatWeight(totals.totalGrossWeightKg)}`}</span>
        </motion.footer>
      </Layout>
    </>
  );
};

export default App;
