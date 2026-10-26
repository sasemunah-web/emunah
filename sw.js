/* Guarda la app (y las librerías de Google) para que abra aunque no haya internet.
   Los datos de pedidos, clientes y productos los guarda Firebase en el celular. */
const V = "emunah-v7";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
const CDN = ["www.gstatic.com", "cdnjs.cloudflare.com"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
const guardar = (r, res) => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; };
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (CDN.includes(u.hostname) && /\.js(\?|$)/.test(u.pathname)) {
    /* Librerías: primero lo guardado (no cambian), si no está se descarga y se guarda */
    e.respondWith(caches.match(r).then(x => x || fetch(r).then(res => guardar(r, res))));
    return;
  }
  if (u.origin !== location.origin) return;
  /* Archivos de la app: primero internet (última versión, máx. 4 s); si falla, lo guardado */
  const red = new Promise((ok, mal) => { const t = setTimeout(() => mal(new Error("lento")), 4000); fetch(r).then(res => { clearTimeout(t); ok(res); }, er => { clearTimeout(t); mal(er); }); });
  e.respondWith(red.then(res => guardar(r, res)).catch(() => caches.match(r).then(x => x || caches.match("./index.html"))));
});
