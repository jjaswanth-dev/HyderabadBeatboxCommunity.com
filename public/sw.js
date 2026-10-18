// Minimal pass-through service worker for PWA installability without offline caching
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Always fetch directly from network (online web surfing)
  event.respondWith(fetch(event.request));
});
