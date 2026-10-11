// Guarda la app en el celular para que abra rápido y sin internet.
const CACHE = 'apuntes-v2';
const APP = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png',
  'marked.min.js',
  'purify.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || /groq\.com|anthropic\.com/.test(url.host)) return; // las APIs siempre por red
  // primero la red (para recibir actualizaciones), si no hay internet usa lo guardado
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
