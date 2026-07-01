// Fyrfly CRM Service Worker — safe minimal version
// Only caches the app shell for offline loading.
// Never intercepts API calls, auth requests, or Supabase traffic.

const CACHE_NAME = 'fyrfly-crm-v2';

const APP_SHELL = [
  '/crm.html',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
];

// Install — cache app shell only
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Cache each file individually so one failure doesn't break install
      return Promise.allSettled(
        APP_SHELL.map(function(url) { return cache.add(url); })
      );
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch — ONLY serve app shell from cache when offline
// Everything else (API calls, Supabase, Workers, CDNs) goes straight to network
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Only handle GET requests for local files
  if (event.request.method !== 'GET') return;
  if (url.hostname !== self.location.hostname) return;

  // Cache-first for app shell files only
  var isShell = APP_SHELL.some(function(path) {
    return url.pathname === path;
  });

  if (!isShell) return; // Let browser handle normally

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      // Try network first, fall back to cache
      return fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
        }
        return response;
      }).catch(function() {
        return cached || new Response('Offline', { status: 503 });
      });
    })
  );
});

// Message handler — for future use
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
