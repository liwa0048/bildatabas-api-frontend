var CACHE_STATIC_NAME = "static-v3";
var CACHE_DYNAMIC_NAME = "dynamic-v2";

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installerar Service Worker", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[Service Worker] Pre-cachear Appskalet");
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/favicon.ico",
        "/icon-72.png",
        "/icon-96.png",
        "/icon-128.png",
        "/icon-144.png",
        "/icon-192.png",
        "/icon-256.png",
        "/icon-384.png",
        "/icon-512.png",
      ]);
    }),
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Aktiverar Service Worker", event);
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Tar bort gammal cache", key);
            return caches.delete(key);
          }
        }),
      );
    }),
  );
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.pathname.includes("/bilar")) {
    event.respondWith(
      (async function () {
        try {
          const res = await fetch(event.request);

          const cache = await caches.open(CACHE_DYNAMIC_NAME);
          cache.put(event.request, res.clone());

          return res;
        } catch (error) {
          const cached = await caches.match(event.request, {
            ignoreSearch: true,
          });
          if (cached) return cached;

          return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" },
          });
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async function () {
      const cachedResponse = await caches.match(event.request, {
        ignoreSearch: true,
      });
      if (cachedResponse) return cachedResponse;

      try {
        const res = await fetch(event.request);

        const cache = await caches.open(CACHE_DYNAMIC_NAME);
        cache.put(event.request, res.clone());

        return res;
      } catch (error) {
        return Response.error();
      }
    })(),
  );
});
