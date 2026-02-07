const STORIES_DB_NAME = "stories-db";
const STORIES_STORE_NAME = "stories";
const DB_VERSION = 3;
const STORY_QUEUE_STORE_NAME = "story-queue";
const FAVORITE_STORE_NAME = "favorites";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORIES_DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", event.target.error);
      reject("Error opening database");
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORIES_STORE_NAME)) {
        db.createObjectStore(STORIES_STORE_NAME, { keyPath: "id" });
        console.log("Created stories store");
      }

      if (!db.objectStoreNames.contains(STORY_QUEUE_STORE_NAME)) {
        db.createObjectStore(STORY_QUEUE_STORE_NAME, {
          keyPath: "queueId",
          autoIncrement: true,
        });
        console.log("Created queue store");
      }

      if (!db.objectStoreNames.contains(FAVORITE_STORE_NAME)) {
        db.createObjectStore(FAVORITE_STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

const saveStories = async (stories) => {
  if (!stories || !Array.isArray(stories) || stories.length === 0) {
    console.warn("No stories to save");
    return false;
  }

  try {
    const db = await openDB();
    const transaction = db.transaction(STORIES_STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORIES_STORE_NAME);

    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = (err) => reject(err);
    });

    for (const story of stories) {
      await new Promise((resolve, reject) => {
        const request = store.add(story);
        request.onsuccess = () => resolve();
        request.onerror = (err) => {
          console.error("Error adding story:", err, story);
          reject(err);
        };
      });
    }

    return true;
  } catch (error) {
    console.error("Error saving stories to IndexedDB:", error);
    return false;
  }
};

const getStoriesFromDB = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORIES_STORE_NAME, "readonly");
    const store = transaction.objectStore(STORIES_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (err) => {
        console.error("Error getting stories:", err);
        reject(err);
      };
    });
  } catch (error) {
    console.error("Error getting stories from IndexedDB:", error);
    return [];
  }
};

const clearStories = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORIES_STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORIES_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = (err) => {
        console.error("Error clearing stories:", err);
        reject(err);
      };
    });
  } catch (error) {
    console.error("Error clearing stories from IndexedDB:", error);
    return false;
  }
};

const syncStoriesWhenOnline = (token, getStoriesFunction) => {
  const sync = async () => {
    try {
      console.log("Melakukan sinkronisasi data dengan server...");
      const res = await getStoriesFunction(token);
      if (res && res.listStory) {
        const success = await saveStories(res.listStory);
        if (success) {
          console.log("Data berhasil disinkronkan");

          window.dispatchEvent(
            new CustomEvent("stories-synced", {
              detail: { stories: res.listStory },
            }),
          );
        } else {
          console.error("Gagal menyimpan data sinkronisasi");
        }
      }
    } catch (error) {
      console.error("Gagal sinkronisasi:", error);
    }
  };

  if (navigator.onLine) {
    sync();
  }

  window.addEventListener("online", () => {
    console.log("Koneksi internet tersedia. Memulai sinkronisasi...");
    sync();
  });
};

const getStoriesFromQueue = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORY_QUEUE_STORE_NAME, "readonly");
    const store = transaction.objectStore(STORY_QUEUE_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (err) => {
        console.error("Error getting queued stories:", err);
        reject(err);
      };
    });
  } catch (error) {
    console.error("Error retrieving from queue:", error);
    return [];
  }
};

const addToStoryQueue = async (storyData) => {
  try {
    console.log("Menyimpan cerita ke queue...");
    const db = await openDB();
    const transaction = db.transaction(STORY_QUEUE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORY_QUEUE_STORE_NAME);

    const queueItem = {
      ...storyData,
      isDraft: true,
      queuedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => {
        console.log("Cerita berhasil ditambahkan ke queue:", request.result);
        resolve({ success: true, id: request.result });
      };
      request.onerror = (err) => {
        console.error("Error adding to queue:", err);
        resolve({
          success: false,
          error: err.target.error?.message || "Unknown error",
        });
      };
    });
  } catch (error) {
    console.error("Error pada addToStoryQueue:", error);
    return { success: false, error: error.message };
  }
};

const getAllStories = async () => {
  try {
    const serverStories = await getStoriesFromDB();
    const queuedStories = await getStoriesFromQueue();

    console.log("Server stories:", serverStories.length);
    console.log("Queued stories:", queuedStories.length);

    const formattedQueueStories = [];

    for (const item of queuedStories) {
      try {
        if (!item.photo || !item.photo.data) {
          console.warn("Invalid photo data in queue item:", item);
          continue;
        }

        const blob = new Blob([item.photo.data], {
          type: item.photo.type || "image/jpeg",
        });
        const photoUrl = URL.createObjectURL(blob);

        formattedQueueStories.push({
          id: `local-${item.queueId}`,
          name: "Cerita Lokal",
          description: item.description,
          photoUrl: photoUrl,
          createdAt: item.queuedAt,
          lat: item.lat,
          lon: item.lon,
          isOffline: true,
        });
      } catch (err) {
        console.error("Error formatting queue item:", err);
      }
    }

    const combined = [...serverStories, ...formattedQueueStories];
    console.log("Combined stories total:", combined.length);
    return combined;
  } catch (error) {
    console.error("Error getting all stories:", error);
    return [];
  }
};

const debugIndexedDB = async () => {
  try {
    const db = await openDB();

    const objectStoreNames = Array.from(db.objectStoreNames);
    console.log("Database name:", db.name);
    console.log("Object stores:", objectStoreNames);
    console.log("Database version:", db.version);

    const queuedStories = await getStoriesFromQueue();
    const stories = await getStoriesFromDB();
    console.log("Queued stories:", queuedStories);
    console.log("Server stories:", stories);

    return {
      dbInfo: {
        name: db.name,
        version: db.version,
        stores: objectStoreNames,
      },
      queueCount: queuedStories.length,
      storiesCount: stories.length,
      queuedItems: queuedStories.map((item) => ({
        queueId: item.queueId,
        description: item.description?.substring(0, 20) + "...",
        hasPhoto: !!item.photo,
        photoSize: item.photo?.data?.byteLength || 0,
      })),
    };
  } catch (error) {
    console.error("Debug error:", error);
    return { error: error.message };
  }
};

const processStoryQueue = async (token, addStoryFunction) => {
  if (!navigator.onLine) return;

  try {
    const db = await openDB();
    const transaction = db.transaction(STORY_QUEUE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORY_QUEUE_STORE_NAME);
    const queuedStories = await getStoriesFromQueue();

    console.log(`Processing ${queuedStories.length} queued stories`);

    for (const item of queuedStories) {
      try {
        if (!item.photo || !item.photo.data) {
          console.warn("Invalid photo data in queue item - skipping:", item);
          continue;
        }

        const { description, photo, lat, lon } = item;

        const blob = new Blob([photo.data], {
          type: photo.type || "image/jpeg",
        });
        const file = new File([blob], photo.name || "photo.jpg", {
          type: photo.type || "image/jpeg",
          lastModified: photo.lastModified || Date.now(),
        });

        const result = await addStoryFunction(token, {
          description,
          photo: file,
          lat,
          lon,
        });

        if (!result.error) {
          await new Promise((resolve, reject) => {
            const request = store.delete(item.queueId);
            request.onsuccess = () => {
              console.log(
                `Story from queue successfully sent: ${item.queueId}`,
              );
              resolve();
            };
            request.onerror = (err) => reject(err);
          });

          window.dispatchEvent(
            new CustomEvent("queued-story-processed", {
              detail: { success: true, queueId: item.queueId },
            }),
          );
        } else {
          console.error(
            `Failed to send queued story: ${item.queueId}`,
            result.message,
          );
        }
      } catch (err) {
        console.error(`Error processing queue item ${item.queueId}:`, err);
      }
    }
  } catch (error) {
    console.error("Error processing story queue:", error);
  }
};

const saveFavoriteStory = async (story) => {
  const db = await openDB();
  const tx = db.transaction(FAVORITE_STORE_NAME, "readwrite");
  const store = tx.objectStore(FAVORITE_STORE_NAME);
  store.put(story);
};

const getFavoriteStories = async () => {
  const db = await openDB();
  const tx = db.transaction(FAVORITE_STORE_NAME, "readonly");
  const store = tx.objectStore(FAVORITE_STORE_NAME);

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
};

const deleteFavoriteStory = async (id) => {
  const db = await openDB();
  const tx = db.transaction(FAVORITE_STORE_NAME, "readwrite");
  const store = tx.objectStore(FAVORITE_STORE_NAME);
  store.delete(id);
};

const isStoryFavorited = async (id) => {
  const db = await openDB();
  const tx = db.transaction(FAVORITE_STORE_NAME, "readonly");
  const store = tx.objectStore(FAVORITE_STORE_NAME);

  return new Promise((resolve) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(!!req.result);
  });
};

export {
  saveStories,
  getStoriesFromDB,
  clearStories,
  syncStoriesWhenOnline,
  addToStoryQueue,
  processStoryQueue,
  getAllStories,
  getStoriesFromQueue,
  debugIndexedDB,
  saveFavoriteStory,
  getFavoriteStories,
  deleteFavoriteStory,
  isStoryFavorited,
};
