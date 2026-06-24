/**
 * Tests for useShipmentDocument hook.
 * IndexedDB is fully mocked; all operations happen in-memory.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useShipmentDocument } from '../hooks/useShipmentDocument';
import { createMockDocument, createMockHeader, createMockProduct } from './test-utils';
import type { ShipmentDocument } from '../types';

/* ══════════════════════════════════════════
   IndexedDB mock
   ══════════════════════════════════════════ */

const mockDb = vi.hoisted(() => ({
  saveDocument: vi.fn<[ShipmentDocument], Promise<void>>().mockResolvedValue(undefined),
  loadDocuments: vi.fn<[], Promise<ShipmentDocument[]>>().mockResolvedValue([]),
  loadDocument: vi.fn<[string], Promise<ShipmentDocument | null>>().mockResolvedValue(null),
  deleteDocument: vi.fn<[string], Promise<void>>().mockResolvedValue(undefined),
  getActiveDocumentId: vi.fn<[], Promise<string | null>>().mockResolvedValue(null),
  setActiveDocumentId: vi.fn<[string], Promise<void>>().mockResolvedValue(undefined),
}));

vi.mock('../db/indexedDb', () => mockDb);

/* ══════════════════════════════════════════
   Shared test data
   ══════════════════════════════════════════ */

const storedDocument = createMockDocument(undefined, { id: 'stored-1', updatedAt: '2026-06-23T10:00:00.000Z' });
const secondDocument = createMockDocument(undefined, { id: 'stored-2', updatedAt: '2026-06-22T10:00:00.000Z' });

/* ══════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════ */

const renderHookWithReady = async () => {
  mockDb.loadDocuments.mockResolvedValue([storedDocument]);
  mockDb.getActiveDocumentId.mockResolvedValue('stored-1');

  const result = renderHook(() => useShipmentDocument());
  await waitFor(() => expect(result.result.current.status).toBe('ready'));
  return result;
};

describe('useShipmentDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ─── Initial load ─── */

  describe('initial load', () => {
    it('starts in loading status', () => {
      mockDb.loadDocuments.mockReturnValue(new Promise(() => {})); // never resolves
      const { result } = renderHook(() => useShipmentDocument());
      expect(result.current.status).toBe('loading');
    });

    it('creates an initial document when no stored documents exist', async () => {
      mockDb.loadDocuments.mockResolvedValue([]);
      mockDb.saveDocument.mockResolvedValue(undefined);
      mockDb.setActiveDocumentId.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShipmentDocument());
      await waitFor(() => expect(result.current.status).toBe('ready'));

      expect(mockDb.saveDocument).toHaveBeenCalledTimes(1);
      expect(mockDb.setActiveDocumentId).toHaveBeenCalledTimes(1);
      expect(result.current.document.id).toBeTruthy();
      expect(result.current.document.pallets.length).toBe(1);
      expect(result.current.documentLibrary.length).toBe(1);
    });

    it('loads stored documents and selects the active one', async () => {
      const { result } = await renderHookWithReady();

      expect(result.current.document.id).toBe('stored-1');
      expect(result.current.documentLibrary).toHaveLength(1);
      expect(result.current.documentLibrary[0].id).toBe('stored-1');
    });
  });

  /* ─── Document management ─── */

  describe('document management', () => {
    it('createNewDocument resets to a fresh document', async () => {
      const { result } = await renderHookWithReady();

      act(() => result.current.createNewDocument());

      expect(result.current.document.id).not.toBe('stored-1');
      expect(result.current.document.pallets).toHaveLength(1);
      expect(result.current.document.workflowStatus).toBe('preparacion');
      expect(result.current.error).toBeNull();
    });

    it('openStoredDocument loads a document by id', async () => {
      mockDb.loadDocument.mockResolvedValue(secondDocument);
      const { result } = await renderHookWithReady();

      await act(async () => result.current.openStoredDocument('stored-2'));

      expect(result.current.document.id).toBe('stored-2');
      expect(result.current.error).toBeNull();
    });

    it('openStoredDocument sets error when document is not found', async () => {
      mockDb.loadDocument.mockResolvedValue(null);
      const { result } = await renderHookWithReady();

      await act(async () => result.current.openStoredDocument('nonexistent'));

      expect(result.current.error).toBe('No encontramos la lista seleccionada.');
    });

    it('deleteStoredDocument removes a non-active document from library', async () => {
      const { result } = await renderHookWithReady();

      await act(async () => result.current.deleteStoredDocument('stored-2'));

      expect(result.current.documentLibrary).toHaveLength(1);
      expect(result.current.documentLibrary[0].id).toBe('stored-1');
      expect(result.current.document.id).toBe('stored-1'); // unchanged
    });

    it('deleteStoredDocument switches to next document when deleting active', async () => {
      const { result } = await renderHookWithReady();

      mockDb.loadDocuments.mockResolvedValue([secondDocument]); // only second survives
      await act(async () => result.current.deleteStoredDocument('stored-1'));

      expect(result.current.document.id).toBe('stored-2');
    });
  });

  /* ─── Pallets ─── */

  describe('pallet operations', () => {
    it('addPallet adds an empty pallet', async () => {
      const { result } = await renderHookWithReady();
      const initialCount = result.current.document.pallets.length;

      act(() => result.current.addPallet());

      expect(result.current.document.pallets).toHaveLength(initialCount + 1);
    });

    it('removes a pallet when there are at least 2', async () => {
      const docWithTwoPallets = createMockDocument(undefined, {
        id: 'multi',
        pallets: [
          { id: 'p1', label: 'Paleta 01', palletTareWeightKg: 15, items: [] },
          { id: 'p2', label: 'Paleta 02', palletTareWeightKg: 15, items: [] },
        ] as any,
      });
      mockDb.loadDocuments.mockResolvedValue([docWithTwoPallets]);
      mockDb.getActiveDocumentId.mockResolvedValue('multi');
      const { result } = renderHook(() => useShipmentDocument());
      await waitFor(() => expect(result.current.status).toBe('ready'));

      act(() => result.current.removePallet('p1'));
      expect(result.current.document.pallets).toHaveLength(1);
      expect(result.current.document.pallets[0].id).toBe('p2');
    });

    it('does not remove the last pallet', async () => {
      const { result } = await renderHookWithReady();

      act(() => result.current.removePallet(result.current.document.pallets[0].id));
      expect(result.current.document.pallets).toHaveLength(1); // unchanged
    });

    it('updatePallet updates a pallet field', async () => {
      const { result } = await renderHookWithReady();
      const palletId = result.current.document.pallets[0].id;

      act(() => result.current.updatePallet(palletId, 'label', 'Custom label'));

      const updated = result.current.document.pallets.find((p) => p.id === palletId);
      expect(updated?.label).toBe('Custom label');
    });

    it('clonePallet duplicates a pallet', async () => {
      mockDb.loadDocuments.mockResolvedValue([storedDocument]);
      mockDb.getActiveDocumentId.mockResolvedValue('stored-1');
      const { result } = renderHook(() => useShipmentDocument());
      await waitFor(() => expect(result.current.status).toBe('ready'));
      const initialCount = result.current.document.pallets.length;

      act(() => result.current.clonePallet(result.current.document.pallets[0].id));

      expect(result.current.document.pallets).toHaveLength(initialCount + 1);
    });
  });

  /* ─── Items ─── */

  describe('item operations', () => {
    it('addItem adds an item in preparacion mode', async () => {
      const { result } = await renderHookWithReady();
      const palletId = result.current.document.pallets[0].id;
      const initialItems = result.current.document.pallets[0].items.length;

      act(() => result.current.addItem(palletId, 'preparacion'));

      const pallet = result.current.document.pallets.find((p) => p.id === palletId);
      expect(pallet?.items).toHaveLength(initialItems + 1);
    });

    it('removeItem removes an item when there are at least 2', async () => {
      const { result } = await renderHookWithReady();
      const palletId = result.current.document.pallets[0].id;

      // Add a second item first
      act(() => result.current.addItem(palletId, 'preparacion'));
      const itemsAfterAdd = result.current.document.pallets.find((p) => p.id === palletId)!.items;
      expect(itemsAfterAdd).toHaveLength(2);

      // Remove the first item
      act(() => result.current.removeItem(palletId, itemsAfterAdd[0].id));
      const pallet = result.current.document.pallets.find((p) => p.id === palletId);
      expect(pallet?.items).toHaveLength(1);
    });

    it('does not remove the last item', async () => {
      const { result } = await renderHookWithReady();
      const palletId = result.current.document.pallets[0].id;
      const itemId = result.current.document.pallets[0].items[0].id;

      act(() => result.current.removeItem(palletId, itemId));
      const pallet = result.current.document.pallets.find((p) => p.id === palletId);
      expect(pallet?.items).toHaveLength(1); // unchanged
    });

    it('updateItem updates quantity in preparacion mode and sets plannedQuantity', async () => {
      const { result } = await renderHookWithReady();
      const palletId = result.current.document.pallets[0].id;
      const itemId = result.current.document.pallets[0].items[0].id;

      act(() => result.current.updateItem('preparacion', palletId, itemId, 'quantity', 50));

      const item = result.current.document.pallets
        .find((p) => p.id === palletId)!.items
        .find((i) => i.id === itemId);
      expect(item?.quantity).toBe(50);
      expect(item?.plannedQuantity).toBe(50);
    });
  });

  /* ─── Header ─── */

  describe('header operations', () => {
    it('updateHeader updates a header field', async () => {
      const { result } = await renderHookWithReady();

      act(() => result.current.updateHeader('invoiceNumber', 'E-0005-0099'));

      expect(result.current.document.header.invoiceNumber).toBe('E-0005-0099');
    });

    it('updateHeader updates country and presets', async () => {
      const { result } = await renderHookWithReady();

      act(() => result.current.updateHeader('country', 'COLOMBIA' as any));

      expect(result.current.document.header.country).toBe('COLOMBIA');
      expect(result.current.document.header.laboratoryName).toBe('LABORATORIOS AUROFARMA SAS');
    });

    it('updateWorkflowStatus changes the workflow status', async () => {
      const { result } = await renderHookWithReady();

      act(() => result.current.updateWorkflowStatus('finalizada'));

      expect(result.current.document.workflowStatus).toBe('finalizada');
    });
  });

  /* ─── Products ─── */

  describe('product selection', () => {
    it('selectProduct fills item fields from the product catalog', async () => {
      const { result } = await renderHookWithReady();
      const palletId = result.current.document.pallets[0].id;
      const itemId = result.current.document.pallets[0].items[0].id;

      act(() => result.current.selectProduct(palletId, itemId, 'am0138-amantina-250-ml'));

      const item = result.current.document.pallets
        .find((p) => p.id === palletId)!.items
        .find((i) => i.id === itemId);
      expect(item?.sku).toBe('AM0138');
      expect(item?.description).toBe('AMANTINA 250 ML');
      expect(item?.unitsPerBox).toBe(15);
    });

    it('selectProduct does nothing for an unknown product id', async () => {
      const { result } = await renderHookWithReady();
      const palletId = result.current.document.pallets[0].id;
      const itemId = result.current.document.pallets[0].items[0].id;

      act(() => result.current.selectProduct(palletId, itemId, 'nonexistent'));

      // Item should remain unchanged (still the mock item with sku 'P001')
      const item = result.current.document.pallets
        .find((p) => p.id === palletId)!.items
        .find((i) => i.id === itemId);
      expect(item?.sku).toBe('P001');
    });
  });

  /* ─── Computed values ─── */

  describe('computed values', () => {
    it('computedPallets derives from document.pallets', async () => {
      const { result } = await renderHookWithReady();

      expect(result.current.computedPallets).toHaveLength(result.current.document.pallets.length);
      expect(result.current.computedPallets[0].totalNetWeightKg).toBeGreaterThan(0);
      expect(result.current.computedPallets[0].totalGrossWeightKg).toBeGreaterThan(0);
    });

    it('totals aggregates across all pallets', async () => {
      const { result } = await renderHookWithReady();

      expect(result.current.totals.totalNetWeightKg).toBeGreaterThan(0);
      expect(result.current.totals.totalGrossWeightKg).toBeGreaterThan(0);
    });

    it('products returns the full catalog', async () => {
      const { result } = await renderHookWithReady();

      expect(result.current.products.length).toBeGreaterThan(40);
    });
  });
});
