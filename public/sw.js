const CACHE = "paaniwala-v1";
const ASSETS = ["/", "/home", "/icon-192.png", "/icon-512.png", "/pagdi-final.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
