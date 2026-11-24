// Service worker : met l'application en cache pour un usage hors ligne.
const CACHE = "vt-enquete-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./roles.js",
  "./scripts.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/roles/alchemist.jpg",
  "./icons/roles/cannibal.jpg",
  "./icons/roles/chambermaid.jpg",
  "./icons/roles/courtier.jpg",
  "./icons/roles/devils_advocate.jpg",
  "./icons/roles/drunk.jpg",
  "./icons/roles/exorcist.jpg",
  "./icons/roles/fang_gu.jpg",
  "./icons/roles/fortune_teller.jpg",
  "./icons/roles/goblin.jpg",
  "./icons/roles/lunatic.jpg",
  "./icons/roles/lycanthrope.jpg",
  "./icons/roles/mayor.jpg",
  "./icons/roles/monk.jpg",
  "./icons/roles/nightwatchman.jpg",
  "./icons/roles/pacifist.jpg",
  "./icons/roles/pukka.jpg",
  "./icons/roles/recluse.jpg",
  "./icons/roles/sailor.jpg",
  "./icons/roles/scarlet_woman.jpg",
  "./icons/roles/seamstress.jpg",
  "./icons/roles/snake_charmer.jpg",
  "./icons/roles/tinker.jpg",
  "./icons/roles/vigormortis.jpg",
  "./icons/roles/witch.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour récupérer les mises à jour), cache en secours hors ligne.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
