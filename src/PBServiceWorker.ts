// [Working example](/serviceworker-cookbook/offline-status/).

let CACHE_NAME = 'EarTraining-cache';

// Files required to make this app work offline
let REQUIRED_FILES = [
    '../basic.css',
    '../index.html',
    '../built/PBConst.js'
];

console.log('Inside PBServiceWorker.js');

self.addEventListener('install', (event) => {
    // Perform install step:  loading each required file into cache
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Add all offline dependencies to the cache
                console.log('[install] Caches opened, adding all core components to cache');
                return cache.addAll(REQUIRED_FILES);
            })
            .then(() => {
                console.log('[install] All required resources have been cached: we\'re good!');
                return self.skipWaiting();
            }).catch((typeError) => {
                let x = 5;
                console.log('[install] Error: ' + typeError + '  ' + x)})
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                    // Cache hit - return the response from the cached version
                    if (response) {
                        console.log('[fetch] Returning from ServiceWorker cache: ', event.request.url);
                        return response;
                    }

                    // Not in cache - return the result from the live server
                    // `fetch` is essentially a "fallback"
                    console.log('[fetch] Returning from server: ', event.request.url);
                    return fetch(event.request);
                }
            )
    );
});

self.addEventListener('activate', (event) => {
    console.log('[activate] Activating ServiceWorker!');

    // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
    console.log('[activate] Claiming this ServiceWorker!');
    event.waitUntil(self.clients.claim());
});
