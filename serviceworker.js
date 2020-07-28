// Hola! This is a ServiceWorker for a digital library PWA template.
// HTML files: try the network first, then the cache.
// Other files: try the cache first, then the network.
// Both: cache a fresh version if possible.
// (beware: the cache will grow and grow; there's no cleanup)

const version = 'diglib-pwa-v1::';
const cacheName = version + 'static';
const offlinePage = './offline.html';

const coreAssets = [
  './',
  './about.html',
  './browse.html',
  './index.html',
  './item.html',
  './search.html',
  './offline.html',  
  './app.js', 
  './styles.css', 
  './items.json', 
  //'./scripts/search.js',
  './manifest.json'
];

addEventListener('install', installEvent => {
  skipWaiting();
  installEvent.waitUntil(
    caches.open(cacheName)
    .then( cache => {
      //return cache.add(offlinePage);
      return cache.addAll(coreAssets);
    })
  );
});

addEventListener('activate', activateEvent => {
  clients.claim();
});

addEventListener('fetch',  fetchEvent => {
  const request = fetchEvent.request;
  if (request.method !== 'GET') {
    return;
  }
  fetchEvent.respondWith(async function() {
    const responseFromFetch = fetch(request);
    fetchEvent.waitUntil(async function() {
      const responseCopy = (await responseFromFetch).clone();
      const myCache = await caches.open(cacheName);
      await myCache.put(request, responseCopy);
    }());
    if (request.headers.get('Accept').includes('text/html')) {
      try {
        return await responseFromFetch;
      }
      catch(error) {
        const responseFromCache = await caches.match(request);
        return responseFromCache || caches.match(offlinePage);
      }
    } else {
      const responseFromCache = await caches.match(request);
      return responseFromCache || responseFromFetch;
    }
  }());
});
