import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPrintMode, printShipmentDocument, registerPrintCleanup } from '../utils/print';

describe('document printing', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
  });

  afterEach(() => {
    clearPrintMode();
    vi.restoreAllMocks();
  });

  it('prints the DOM document view selected by the print stylesheet', () => {
    printShipmentDocument();

    expect(document.body).toHaveClass('printing-document-only');
    expect(window.print).toHaveBeenCalledOnce();
  });

  it('clears every print mode after the browser finishes printing', () => {
    document.body.classList.add('printing-document-only', 'printing-labels-only');
    const unregister = registerPrintCleanup();

    window.dispatchEvent(new Event('afterprint'));

    expect(document.body).not.toHaveClass('printing-document-only');
    expect(document.body).not.toHaveClass('printing-labels-only');
    unregister();
  });
});
