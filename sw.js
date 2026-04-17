const CACHE_BUILD_ID =
  new URL(self.location.href).searchParams.get('v') ||
  self.__CACHE_BUILD_ID__ ||
  'dev';

const CACHE_PREFIXES = ['app-core::', 'ai-runtime::', 'ai-model::'];

const cacheNames = {
  appCore: `app-core::${CACHE_BUILD_ID}`,
  runtime: `ai-runtime::${CACHE_BUILD_ID}`,
  model: `ai-model::${CACHE_BUILD_ID}`
};

const runtimeAssets = ['libs/tf.min.js', 'libs/coco-ssd.min.js'];

const isRuntimeAsset = url => runtimeAssets.some(path => url.pathname.endsWith(path));

const isModelAsset = url => url.pathname.includes('/models/coco-ssd/');

const withCacheParam = url => {
  const next = new URL(url.toString());
  next.searchParams.set('v', CACHE_BUILD_ID);
  return next;
};

const cleanupCaches = async () => {
  const keys = await caches.keys();
  const stale = keys.filter(key => {
    if (!CACHE_PREFIXES.some(prefix => key.startsWith(prefix))) return false;
    return !key.endsWith(`::${CACHE_BUILD_ID}`);
  });
  await Promise.all(stale.map(key => caches.delete(key)));
};

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheNames.appCore));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      await cleanupCaches();
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!isRuntimeAsset(url) && !isModelAsset(url)) return;
  const cacheName = isRuntimeAsset(url) ? cacheNames.runtime : cacheNames.model;
  event.respondWith(
    (async () => {
      const cacheKey = new Request(withCacheParam(url), request);
      const cache = await caches.open(cacheName);
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
      const response = await fetch(cacheKey);
      if (response.ok) {
        await cache.put(cacheKey, response.clone());
      }
      return response;
    })()
  );
});
