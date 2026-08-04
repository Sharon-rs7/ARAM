// IndexedDB Offline Draft Storage Service for ARAM Legal Aid Platform

const DB_NAME = "aram_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "complaint_drafts";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject("IndexedDB open failed: " + e.target.error);
  });
};

export const offlineDraftService = {
  saveDraft: async (draftData) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: "active_citizen_draft",
        updatedAt: new Date().toISOString(),
        ...draftData,
      };
      store.put(record);
      return new Promise((res) => {
        tx.oncomplete = () => res(true);
        tx.onerror = () => res(false);
      });
    } catch (err) {
      console.error("IndexedDB saveDraft error:", err);
      // Fallback to localStorage
      try {
        localStorage.setItem("aram_active_draft_fallback", JSON.stringify(draftData));
      } catch (e) {}
      return false;
    }
  },

  getDraft: async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get("active_citizen_draft");

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (err) {
      console.error("IndexedDB getDraft error:", err);
      try {
        const fallback = localStorage.getItem("aram_active_draft_fallback");
        return fallback ? JSON.parse(fallback) : null;
      } catch (e) {
        return null;
      }
    }
  },

  clearDraft: async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete("active_citizen_draft");
      localStorage.removeItem("aram_active_draft_fallback");
      return new Promise((res) => {
        tx.oncomplete = () => res(true);
        tx.onerror = () => res(false);
      });
    } catch (err) {
      localStorage.removeItem("aram_active_draft_fallback");
      return false;
    }
  },
};
