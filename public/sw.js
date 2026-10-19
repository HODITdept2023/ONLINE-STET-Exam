// studeezone Production Service Worker - Powered by Google Workbox 7
// ============================================================================

// Try loading local Workbox bundle first; fallback to Google CDN if needed
try {
  importScripts('/workbox/workbox-sw.js');
} catch (e) {
  try {
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
  } catch (cdnErr) {
    console.error('[SW] Failed to load Workbox from both local path and CDN:', cdnErr);
  }
}

if (typeof workbox !== 'undefined') {
  // Configure local module resolution and disable verbose dev logging
  workbox.setConfig({
    modulePathPrefix: '/workbox/',
    debug: false,
  });

  const { core, routing, strategies, precaching, expiration, cacheableResponse, backgroundSync } = workbox;
  const { registerRoute, setCatchHandler, setDefaultHandler } = routing;
  const { NetworkFirst, StaleWhileRevalidate, CacheFirst, NetworkOnly } = strategies;
  const { ExpirationPlugin } = expiration;
  const { CacheableResponsePlugin } = cacheableResponse;
  const { BackgroundSyncPlugin } = backgroundSync;

  // Immediately take control of all clients and skip waiting
  core.skipWaiting();
  core.clientsClaim();

  const CACHE_PREFIX = 'studeezone-v3';

  // 1. Precache Critical App Shell Assets
  // --------------------------------------------------------------------------
  const PRECACHE_ASSETS = [
    { url: '/', revision: '20261018-01' },
    { url: '/index.html', revision: '20261018-01' },
    { url: '/manifest.webmanifest', revision: '20261018-01' },
    { url: '/favicon.svg', revision: '20261018-01' },
    { url: '/studeezone-icon.svg', revision: '20261018-01' },
    { url: '/pwa-192x192.png', revision: '20261018-01' },
    { url: '/pwa-512x512.png', revision: '20261018-01' },
    { url: '/pwa-maskable-512x512.png', revision: '20261018-01' },
    { url: '/apple-touch-icon.png', revision: '20261018-01' },
    { url: '/STET_APP_CORRECTIONS_AND_REBUILD_BLUEPRINT.md', revision: '20261018-01' },
  ];

  precaching.precacheAndRoute(PRECACHE_ASSETS);

  // 2. Navigation Routes (HTML App Shell)
  // --------------------------------------------------------------------------
  // NetworkFirst with 3s timeout: always fresh when online, cached shell when offline
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
      cacheName: `${CACHE_PREFIX}-pages`,
      networkTimeoutSeconds: 3,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    })
  );

  // 3. Static Assets: JS and CSS Bundles (Vite chunks)
  // --------------------------------------------------------------------------
  // StaleWhileRevalidate: instant load from local disk cache, background revalidation
  registerRoute(
    ({ request, url }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css'),
    new StaleWhileRevalidate({
      cacheName: `${CACHE_PREFIX}-static-resources`,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 120,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // 4. Image & Icon Assets (SVG, PNG, ICO, WebP)
  // --------------------------------------------------------------------------
  registerRoute(
    ({ request, url }) =>
      request.destination === 'image' ||
      url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/i),
    new CacheFirst({
      cacheName: `${CACHE_PREFIX}-images`,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 80,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
        }),
      ],
    })
  );

  // 5. Google Web Fonts & Typography Assets
  // --------------------------------------------------------------------------
  // Google Fonts stylesheets (fonts.googleapis.com)
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
      cacheName: `${CACHE_PREFIX}-google-fonts-stylesheets`,
    })
  );

  // Google Fonts webfont files (fonts.gstatic.com)
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: `${CACHE_PREFIX}-google-fonts-webfonts`,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
      ],
    })
  );

  // 6. Critical API Endpoints (Read: Clients, Users, Advisory, Health)
  // --------------------------------------------------------------------------
  // NetworkFirst strategy: ensures cross-device sync when connected, preserves local cache offline
  registerRoute(
    ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
    new NetworkFirst({
      cacheName: `${CACHE_PREFIX}-api-data`,
      networkTimeoutSeconds: 3,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // 7. Background Sync Queue for Mutating Offline Actions (POST /api/...)
  // --------------------------------------------------------------------------
  let bgSyncPlugin;
  try {
    bgSyncPlugin = new BackgroundSyncPlugin('studeezone-mutation-queue', {
      maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
    });

    registerRoute(
      ({ url, request }) =>
        (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') &&
        url.pathname.startsWith('/api/'),
      new NetworkOnly({
        plugins: [bgSyncPlugin],
      }),
      'POST'
    );
  } catch (syncErr) {
    console.warn('[SW] Background sync plugin unavailable in this browser environment:', syncErr);
  }

  // 8. Catch Handler for Offline Failures
  // --------------------------------------------------------------------------
  setCatchHandler(async ({ event, request }) => {
    // If navigation request fails, serve cached index.html
    if (request.mode === 'navigate') {
      const cached = await caches.match('/index.html') || await caches.match('/');
      if (cached) return cached;
    }

    // If API GET request fails, serve structured offline JSON
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          cachedAt: new Date().toISOString(),
          message: 'Operating in offline cache mode. Changes will synchronize with cloud when connection resumes.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Default fallback
    return Response.error();
  });

  // 9. Inter-Process Messages (Client <-> Service Worker)
  // --------------------------------------------------------------------------
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      core.skipWaiting();
    }

    // Cache critical user profile and clients state into dedicated API cache
    if (event.data && event.data.type === 'CACHE_USER_STATE') {
      const { key, data } = event.data;
      caches.open(`${CACHE_PREFIX}-api-data`).then((cache) => {
        const mockReq = new Request(`/api/offline-state/${key}`);
        const mockRes = new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'X-Studeezone-Offline': 'true',
          },
        });
        cache.put(mockReq, mockRes);
      });
    }
  });

  console.log('[SW] Google Workbox Service Worker initialized successfully.');
} else {
  console.warn('[SW] Workbox not loaded; standard browser fallback.');
}
