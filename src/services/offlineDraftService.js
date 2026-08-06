// IndexedDB Offline Draft Storage Service for ARAM Legal Aid Platform

const DB_NAME = "aram_offline_db";
const DB_VERSION = 2; // Incremented database version to trigger upgradeneeded for new store
const STORE_NAME = "complaint_drafts";
const QUEUE_STORE = "offline_submissions";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "queueId", autoIncrement: true });
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

  // Queue complaint for offline outbox submission
  queueSubmission: async (complaintData) => {
    try {
      const db = await openDB();
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      const store = tx.objectStore(QUEUE_STORE);
      const record = {
        queuedAt: new Date().toISOString(),
        ...complaintData
      };
      store.add(record);
      return new Promise((res) => {
        tx.oncomplete = () => res(true);
        tx.onerror = () => res(false);
      });
    } catch (err) {
      console.error("Failed to queue offline submission:", err);
      return false;
    }
  },

  // Fetch all queued submissions
  getQueuedSubmissions: async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(QUEUE_STORE, "readonly");
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (err) {
      console.error("Failed to retrieve queued submissions:", err);
      return [];
    }
  },

  // Remove submission from queue after successful upload
  removeQueuedSubmission: async (queueId) => {
    try {
      const db = await openDB();
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      const store = tx.objectStore(QUEUE_STORE);
      store.delete(queueId);
      return new Promise((res) => {
        tx.oncomplete = () => res(true);
        tx.onerror = () => res(false);
      });
    } catch (err) {
      console.error("Failed to remove queued submission:", err);
      return false;
    }
  }
};
