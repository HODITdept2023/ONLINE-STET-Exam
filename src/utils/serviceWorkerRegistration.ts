/**
 * Workbox Service Worker Registration and State Synchronization Engine
 * Handles client-side Workbox registration, update prompt lifecycle,
 * offline status detection, and background cache synchronization.
 */

import { Workbox } from 'workbox-window';

let wbInstance: Workbox | null = null;
let isInitialized = false;

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || isInitialized) {
    return;
  }
  isInitialized = true;

  // Initialize Workbox client with scope
  const wb = new Workbox('/sw.js', { scope: '/' });
  wbInstance = wb;

  // Workbox Lifecycle Events
  wb.addEventListener('installed', (event) => {
    if (event.isUpdate) {
      console.log('[Workbox] New service worker version installed! Preparing activation...');
      wb.messageSkipWaiting();
    } else {
      console.log('[Workbox] Service worker installed for the first time. Critical assets precached.');
    }
  });

  wb.addEventListener('controlling', () => {
    console.log('[Workbox] Service worker is now controlling the page. Cache active.');
  });

  wb.addEventListener('activated', (event) => {
    if (event.isUpdate) {
      console.log('[Workbox] Service worker updated to latest version.');
    }
  });

  // Register the service worker
  wb.register().catch((err) => {
    console.warn('[Workbox] Registration failed:', err);
  });

  // Listen to network status changes across browser sessions
  window.addEventListener('online', () => {
    console.log('[Workbox] Device reconnected to internet. Broadcasting online sync...');
    window.dispatchEvent(new CustomEvent('studeezone_network_status', { detail: { online: true } }));
    triggerBackgroundSync();
  });

  window.addEventListener('offline', () => {
    console.log('[Workbox] Device disconnected. Operating under Workbox local offline cache.');
    window.dispatchEvent(new CustomEvent('studeezone_network_status', { detail: { online: false } }));
  });
}

/**
 * Checks whether the browser is currently offline
 */
export function isBrowserOffline(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !navigator.onLine;
}

/**
 * Caches critical user profile and candidate directories into Workbox API Cache
 */
export function cacheCriticalStateToSW(key: string, data: any): void {
  if (typeof window === 'undefined') return;

  if (wbInstance && navigator.serviceWorker && navigator.serviceWorker.controller) {
    wbInstance.messageSW({
      type: 'CACHE_USER_STATE',
      key,
      data,
    }).catch(() => {});
  } else if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_USER_STATE',
      key,
      data,
    });
  }
}

/**
 * Triggers background sync event via BackgroundSync API or CustomEvent
 */
export function triggerBackgroundSync(): void {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg: any) => {
      if ('sync' in reg) {
        reg.sync.register('studeezone-mutation-queue').catch(() => {});
      }
    }).catch(() => {});
  }
}
