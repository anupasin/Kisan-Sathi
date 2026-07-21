/* Kisan Sathi service worker.
 * Strategy:
 *  - static assets (/_next/static, fonts, icons): cache-first
 *  - page navigations: network-first, fall back to cached page, then /offline
 *  - data API GETs (weather/soil/market/geo): stale-while-revalidate
 *  - everything else (scan/ask/billing/me/auth): network only, never cached
 * Bump VERSION on breaking cache-shape changes.
 */
const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const API_CACHE = `api-${VERSION}`;
const ALL_CACHES = [STATIC_CACHE, PAGES_CACHE, API_CACHE];

const PRECACHE_URLS = [
  "/offline",
  "/calculator",
  "/icon-192.png",
  "/icon-512.png",
  "/icon.svg",
];

const CACHEABLE_API = /^\/api\/(weather|soil|market|geo\/)/;
const NEVER_CACHE_API = /^\/api\/(scan|ask|billing|me|push|cron)/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !ALL_CACHES.includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function markFromCache(response) {
  if (!response) return response;
  const headers = new Headers(response.headers);
  headers.set("X-From-SW-Cache", "1");
  return response
    .blob()
    .then(
      (body) =>
        new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        }),
    );
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) {
    // Serve cached immediately; refresh in background.
    network.catch(() => {});
    return markFromCache(cached);
  }
  const fresh = await network;
  if (fresh) return fresh;
  return Response.json(
    { ok: false, data: null, source: "offline", fallbackUsed: true, error: "offline" },
    { status: 503 },
  );
}

async function pageNetworkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const offline = await cache.match("/offline");
    if (offline) return offline;
    return new Response("Offline", { status: 503 });
  }
}

async function staticCacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (NEVER_CACHE_API.test(url.pathname)) return;

  if (CACHEABLE_API.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|svg|ico|woff2?)$/)
  ) {
    event.respondWith(staticCacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(pageNetworkFirst(request));
  }
});

/* Web Push (wired up fully in the alerts milestone). */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Kisan Sathi", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "Kisan Sathi", {
      body: payload.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
