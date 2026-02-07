const CACHE_NAME = "app-shell-v1";
const API_CACHE = "api-cache-v1";
const IMAGE_CACHE = "image-cache-v1";
const API_BASE = "https://story-api.dicoding.dev/v1";
const REPO_NAME = "/project-xyz";

const APP_SHELL = [
  `${REPO_NAME}/manifest.json`,
  `${REPO_NAME}/images/favicon.png`,
  `${REPO_NAME}/icons/icon-192x192.png`,
  `${REPO_NAME}/icons/icon-512x512.png`,
  `${REPO_NAME}/images/fallback.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            const res = await fetch(url);
            if (res.ok) {
              await cache.put(url, res.clone());
            }
          } catch {}
        }),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![CACHE_NAME, API_CACHE, IMAGE_CACHE].includes(key)) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const res = await fetch(request);
          cache.put(request, res.clone());
          return res;
        } catch {
          return caches.match(`${REPO_NAME}/images/fallback.png`);
        }
      }),
    );
    return;
  }

  if (request.url.startsWith(API_BASE)) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        try {
          const res = await fetch(request);
          cache.put(request, res.clone());
          return res;
        } catch {
          return cache.match(request);
        }
      }),
    );
    return;
  }

  event.respondWith(fetch(request));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.options.body,
      icon: `${REPO_NAME}/icons/icon-192x192.png`,
      data: {
        url: `${REPO_NAME}/#/detail/${data.options.data.id}`,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if ("navigate" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      }),
  );
});
