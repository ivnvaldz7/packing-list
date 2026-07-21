export const clearPrintMode = (): void => {
  window.document.body.classList.remove('printing-labels-only');
  window.document.body.classList.remove('printing-document-only');
};

export const printShipmentDocument = (): void => {
  window.document.body.classList.add('printing-document-only');
  window.print();
};

export const registerPrintCleanup = (): (() => void) => {
  window.addEventListener('afterprint', clearPrintMode);
  return () => window.removeEventListener('afterprint', clearPrintMode);
};
