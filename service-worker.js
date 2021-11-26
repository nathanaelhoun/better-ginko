const cacheName = "GinkoBusCache";
const contentToCache = [
  "icons/icon-32.png",
  "icons/icon-64.png",
  "icons/icon-96.png",
  "icons/icon-128.png",
  "icons/icon-168.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-256.png",
  "icons/icon-512.png",
  "icons/maskable_icon.png",
  "index.html",
  "app.js",
  "manifest.json",
  "style.css",
];

self.addEventListener("install", (e) => {
  console.log("[SW] Install");

  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[SW] Caching all initial content");
      await cache.addAll(contentToCache);
    })()
  );
});

const cachedFileExtensions = ["html", "css", "ico", "png", "json"];

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      /** @type {FetchEvent} e */
      console.log(`[SW] Fetching resource: ${e.request.url}`);
      const ext = e.request.url.split(".").pop();

      if (cachedFileExtensions.includes(ext)) {
        const res = await caches.match(e.request);
        if (res) {
          console.log("[SW] Found in cache !");
          return res;
        }
      }

      console.log("[SW] Request server !");

      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[SW] Caching new resource: ${e.request.url}`);
      await cache.put(e.request, response.clone());
      return response;
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        })
      );
    })
  );
});
