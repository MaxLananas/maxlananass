const CACHE_NAME = 'maxlananas-v1';
const PRECACHE = [
    '/',
    '/style-index.css',
    '/script-index.js',
    '/manifest.json',
    '/FFFlauta-200.otf'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(PRECACHE);
        })
    );
});

self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(function (cached) {
            return cached || fetch(e.request).then(function (response) {
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            });
        }).catch(function () {
            return caches.match('/');
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (name) { return name !== CACHE_NAME; })
                     .map(function (name) { return caches.delete(name); })
            );
        })
    );
});
