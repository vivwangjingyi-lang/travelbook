// IndexedDB utility for travel book storage

const DB_NAME = 'TravelBookDB';
const DB_VERSION = 1;
const STORE_NAME = 'travelbooks';

interface IDBInitParams {
  name: string;
  version: number;
  storeName: string;
}

// Open database connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Save data to IndexedDB
export const saveToIndexedDB = <T>(data: T[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing data
      await new Promise<void>((clearResolve, clearReject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => clearResolve();
        clearRequest.onerror = () => clearReject(clearRequest.error);
      });
      
      // Save new data
      for (const item of data) {
        await new Promise<void>((putResolve, putReject) => {
          const putRequest = store.put(item);
          putRequest.onsuccess = () => putResolve();
          putRequest.onerror = () => putReject(putRequest.error);
        });
      }
      
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
      
      db.close();
    } catch (error) {
      reject(error);
    }
  });
};

// Load data from IndexedDB
export const loadFromIndexedDB = <T>(): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
        db.close();
      };
      
      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Save single item to IndexedDB
export const saveSingleToIndexedDB = <T>(item: T): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const putRequest = store.put(item);
      
      putRequest.onsuccess = () => {
        resolve();
        db.close();
      };
      
      putRequest.onerror = () => {
        reject(putRequest.error);
        db.close();
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Delete item from IndexedDB
export const deleteFromIndexedDB = (id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
        db.close();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
        db.close();
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Check if IndexedDB is supported
export const isIndexedDBSupported = (): boolean => {
  return 'indexedDB' in window;
};
