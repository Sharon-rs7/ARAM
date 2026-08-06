import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock IndexedDB for jsdom environment
const mockIndexedDB = {
  open: () => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      transaction: () => ({
        objectStore: () => ({
          get: () => ({ onsuccess: null }),
          put: () => ({ onsuccess: null }),
          delete: () => ({ onsuccess: null })
        })
      })
    }
  })
};

if (typeof window !== 'undefined' && !window.indexedDB) {
  window.indexedDB = mockIndexedDB;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
