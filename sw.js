// Fyrfly CRM Service Worker
// Caches the app shell for offline use and queues activity logs when offline.

const CACHE_NAME = 'fyrfly-crm-v1';
const OFFLINE_QUEUE_KEY = 'fyrfly-offline-queue';

// App shell — these files are cached on install and served offline
const APP_SHELL = [
  '/crm.html',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
];

// External resources to cache on first fetch
const CACHE_EXTERNAL = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
];

// ── INSTALL ──
// Cache the app shell immediately
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
});

// ── ACTIVATE ──
// Clean up old caches from previous versions
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── FETCH ──
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // Pass through non-GET requests (POST/PATCH to Supabase/Worker)
  // EXCEPT: intercept Supabase activity POSTs to queue offline
  if (event.request.method !== 'GET') {
    // Intercept Supabase activity inserts for offline queuing
    if (
      event.request.method === 'POST' &&
      url.hostname.includes('supabase.co') &&
      url.pathname.includes('/activities')
    ) {
      event.respondWith(handleOfflineActivity(event.request));
    }
    return;
  }

  // App shell: cache-first
  if (APP_SHELL.some(function(path) { return url.pathname === path || url.href === path; })) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
          }
          return response;
        });
      })
    );
    return;
  }

  // External CDN resources: cache-first, then network
  if (CACHE_EXTERNAL.some(function(ext) { return event.request.url.startsWith(ext.split('/').slice(0,3).join('/')); })) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
          }
          return response;
        });
      })
    );
    return;
  }

  // Supabase data reads: network-first, cache fallback
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request.clone()).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Cloudflare Worker calls: network-first, graceful offline response
  if (url.hostname.includes('workers.dev')) {
    event.respondWith(
      fetch(event.request.clone()).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Everything else: network with cache fallback
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

// ── OFFLINE ACTIVITY QUEUE ──
// When a Supabase activity POST fails offline, store it and notify the page
async function handleOfflineActivity(request) {
  try {
    // Try network first
    const response = await fetch(request.clone());
    return response;
  } catch (err) {
    // Offline — read the body and queue it
    try {
      const body = await request.clone().json();
      // Store in a simple queue via postMessage to clients
      // (we use IndexedDB via the client page for simplicity)
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach(function(client) {
        client.postMessage({
          type: 'QUEUE_ACTIVITY',
          payload: body,
          timestamp: new Date().toISOString()
        });
      });
      // Return a fake success so the page doesn't throw
      return new Response(JSON.stringify([{ id: 'offline-' + Date.now() }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

// ── BACKGROUND SYNC ──
// When connectivity is restored, flush any queued activities
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SYNC_QUEUE') {
    // Client tells us it's online and wants to flush
    // The client handles the actual API calls — we just relay the signal
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ type: 'FLUSH_QUEUE' });
      });
    });
  }
});
