// Keeps the citizen app's page available offline, so the call button still works without data.
const CACHE = 'report-v1';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/app', '/app.webmanifest', '/icon.svg']))));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).pathname !== '/app') return;
  e.respondWith(fetch(e.request).catch(() => caches.match('/app')));
});
