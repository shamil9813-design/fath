const CACHE = 'fath-v8';
const NAV_OLD = 'font-size:14px;padding:9px 14px;border-radius:16px';
const NAV_NEW = 'font-size:15.5px;padding:12px 16px;border-radius:16px';
const NAV_PAD_OLD = 'padding:8px 10px calc(8px + env(safe-area-inset-bottom))';
const NAV_PAD_NEW = 'padding:10px 10px calc(10px + env(safe-area-inset-bottom))';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['manifest.json','icon-192.png','icon-512.png'])));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function patchNav(t) {
  if (t.indexOf(NAV_OLD) === -1) return t;
  return t.replace(NAV_OLD, NAV_NEW).replace(NAV_PAD_OLD, NAV_PAD_NEW);
}

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.mode === 'navigate' || u.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).then(r => r.text().then(t => {
        const resp = new Response(patchNav(t), { status: 200, headers: {'Content-Type': 'text/html; charset=utf-8'} });
        caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        return resp;
      })).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(h => h || fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return r;
    }))
  );
});
