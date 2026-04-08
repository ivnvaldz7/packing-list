import type { ShipmentDocument } from '../types';

const DB_NAME = 'export-pallet-organizer';
const DOCUMENTS_STORE = 'documents';
const META_STORE = 'meta';
const DB_VERSION = 2;
const ACTIVE_DOCUMENT_KEY = 'active-document-id';
const LEGACY_DOCUMENT_KEY = 'current-draft';

const openDatabase = async (): Promise<IDBDatabase> =>
  await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = request.result;
      const transaction = request.transaction;
      const oldVersion = event.oldVersion;

      if (!database.objectStoreNames.contains(DOCUMENTS_STORE)) {
        database.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' });
      } else if (oldVersion < 2 && transaction) {
        const legacyStore = transaction.objectStore(DOCUMENTS_STORE);
        const legacyRequest = legacyStore.get(LEGACY_DOCUMENT_KEY);

        legacyRequest.onsuccess = () => {
          const legacyDocument = legacyRequest.result as ShipmentDocument | undefined;

          database.deleteObjectStore(DOCUMENTS_STORE);
          const nextDocumentsStore = database.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' });

          if (legacyDocument) {
            const normalizedLegacyDocument: ShipmentDocument = {
              ...legacyDocument,
              id: legacyDocument.id || crypto.randomUUID(),
              workflowStatus: legacyDocument.workflowStatus ?? 'preparacion',
            };

            nextDocumentsStore.put(normalizedLegacyDocument);

            if (!database.objectStoreNames.contains(META_STORE)) {
              database.createObjectStore(META_STORE);
            }

            const metaStore = transaction.objectStore(META_STORE);
            metaStore.put(normalizedLegacyDocument.id, ACTIVE_DOCUMENT_KEY);
          }
        };
      }

      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB.'));
  });

export const loadDocuments = async (): Promise<ShipmentDocument[]> => {
  const database = await openDatabase();

  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(DOCUMENTS_STORE, 'readonly');
    const store = transaction.objectStore(DOCUMENTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve((request.result as ShipmentDocument[] | undefined) ?? []);
    request.onerror = () => reject(request.error ?? new Error('No se pudieron leer los documentos.'));
  });
};

export const loadDocument = async (documentId: string): Promise<ShipmentDocument | null> => {
  const database = await openDatabase();

  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(DOCUMENTS_STORE, 'readonly');
    const store = transaction.objectStore(DOCUMENTS_STORE);
    const request = store.get(documentId);

    request.onsuccess = () => resolve((request.result as ShipmentDocument | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('No se pudo leer el documento.'));
  });
};

export const saveDocument = async (document: ShipmentDocument): Promise<void> => {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
    const store = transaction.objectStore(DOCUMENTS_STORE);

    store.put(document);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('No se pudo guardar el documento.'));
  });
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
    const store = transaction.objectStore(DOCUMENTS_STORE);

    store.delete(documentId);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('No se pudo eliminar el documento.'));
  });
};

export const getActiveDocumentId = async (): Promise<string | null> => {
  const database = await openDatabase();

  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(META_STORE, 'readonly');
    const store = transaction.objectStore(META_STORE);
    const request = store.get(ACTIVE_DOCUMENT_KEY);

    request.onsuccess = () => resolve((request.result as string | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('No se pudo leer el documento activo.'));
  });
};

export const setActiveDocumentId = async (documentId: string): Promise<void> => {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(META_STORE, 'readwrite');
    const store = transaction.objectStore(META_STORE);

    store.put(documentId, ACTIVE_DOCUMENT_KEY);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('No se pudo guardar el documento activo.'));
  });
};
