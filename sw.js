
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const c = r.clone();
      caches.open('fath-v1').then(cache => cache.put(e.request, c));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
