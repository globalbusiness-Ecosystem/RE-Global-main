// RE Platform service worker.
// - Caches the offline fallback page and map tiles only.
// - Never caches /api/* or Firestore traffic: those responses are per-user
//   (authenticated) and must not be replayed stale or to another user.
const CACHE_NAME = 're-platform-v3';
const TILE_CACHE = 're-tiles-v1';
const OFFLINE_URL = '/offline.html';
const TILE_PATTERN = /^https:\/\/[a-z0-9.-]*tile\.openstreetmap\.(org|de)\//;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .catch((e) => console.error('Cache install error:', e))
  );
});

self.addEventListener('activate', (event) => {
  const keep = [CACHE_NAME, TILE_CACHE];
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !keep.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Map tiles: cache-first.
  if (TILE_PATTERN.test(request.url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(TILE_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          if (res && res.status === 200) cache.put(request, res.clone());
          return res;
        } catch {
          return new Response('Tile unavailable', { status: 404 });
        }
      })()
    );
    return;
  }

  // Page navigations: network first, offline page when the network is down.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(OFFLINE_URL)) || new Response('Offline', { status: 503 });
      })
    );
  }
  // Everything else (including /api/*): default browser handling, no caching.
});
