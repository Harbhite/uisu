
// Simple wrapper around IndexedDB for storing large blobs (files)
// We use this because LocalStorage has a 5MB limit, and sql.js is in-memory.

const DB_NAME = 'uisu_files_db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

export interface StoredFile {
  id: string;
  file: Blob;
  name: string;
  type: string;
  created_at: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Error opening file database');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const fileStorage = {
  saveFile: async (file: File | Blob, id: string = crypto.randomUUID()): Promise<string> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const fileData: StoredFile = {
        id,
        file,
        name: (file as File).name || 'untitled',
        type: file.type,
        created_at: Date.now()
      };

      const request = store.put(fileData);

      request.onsuccess = () => {
        resolve(id);
      };

      request.onerror = () => {
        reject('Error saving file');
      };
    });
  },

  getFile: async (id: string): Promise<StoredFile | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject('Error getting file');
      };
    });
  },

  getFileUrl: async (id: string): Promise<string | null> => {
    // If the content is an external URL (http/https), return it directly
    if (id.startsWith('http')) return id;

    const data = await fileStorage.getFile(id);
    if (!data) return null;
    return URL.createObjectURL(data.file);
  },

  deleteFile: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject('Error deleting file');
      };
    });
  }
};
