import type { ShipmentDocument } from '../types';

const DB_NAME = 'export-pallet-organizer';
const STORE_NAME = 'documents';
const DB_VERSION = 1;
const DOCUMENT_KEY = 'current-draft';

const openDatabase = async (): Promise<IDBDatabase> =>
  await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB.'));
  });

export const loadDocument = async (): Promise<ShipmentDocument | null> => {
  const database = await openDatabase();

  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(DOCUMENT_KEY);

    request.onsuccess = () => resolve((request.result as ShipmentDocument | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('No se pudo leer el documento.'));
  });
};

export const saveDocument = async (document: ShipmentDocument): Promise<void> => {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.put(document, DOCUMENT_KEY);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('No se pudo guardar el documento.'));
  });
};

export const clearDocument = async (): Promise<void> => {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.delete(DOCUMENT_KEY);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('No se pudo limpiar el documento guardado.'));
  });
};
