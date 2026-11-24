// Service worker : met l'application en cache pour un usage hors ligne.
const CACHE = "vt-enquete-v15";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./roles.js",
  "./scripts_imported.js",
  "./scripts.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];
// Liste des icônes de rôles (réécrite par tools/import_bambi.py).
// ICONS-START
const ICONS = ["alchemist", "alhadikhia", "alsaahir", "amnesiac", "artist", "assassin", "balloonist", "banshee", "barber", "baron", "boffin", "boomdandy", "butler", "cannibal", "cerenovus", "chambermaid", "chef", "clockmaker", "courtier", "damsel", "devilsadvocate", "dreamer", "drunk", "empath", "eviltwin", "exorcist", "fanggu", "fearmonger", "fisherman", "flowergirl", "fool", "fortuneteller", "gambler", "general", "goblin", "godfather", "golem", "goon", "gossip", "grandmother", "highpriestess", "huntsman", "imp", "innkeeper", "investigator", "juggler", "king", "klutz", "knight", "leviathan", "librarian", "lilmonsta", "lunatic", "lycanthrope", "marionette", "mastermind", "mathematician", "mayor", "mezepheles", "minstrel", "monk", "moonchild", "mutant", "nightwatchman", "noble", "nodashii", "oracle", "pacifist", "philosopher", "pithag", "pixie", "plaguedoctor", "po", "poisoner", "politician", "preacher", "princess", "professor", "pukka", "puzzlemaster", "ravenkeeper", "recluse", "sage", "sailor", "saint", "savant", "scarletwoman", "seamstress", "shabaloth", "shugenja", "slayer", "snakecharmer", "snitch", "soldier", "spy", "steward", "sweetheart", "tealady", "tinker", "towncrier", "undertaker", "vigormortis", "virgin", "vortox", "washerwoman", "widow", "witch", "wizard", "wraith", "xaan", "zombuul"];
// ICONS-END
const ASSETS = [...CORE, ...ICONS.map((id) => `./icons/roles/${id}.jpg`)];

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
