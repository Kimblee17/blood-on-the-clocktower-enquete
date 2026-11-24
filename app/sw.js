// Service worker : met l'application en cache pour un usage hors ligne.
// La version et la liste des fichiers sont réécrites par tools/publish.py.
// ASSETS-START
const CACHE = "enquete-b3bae7c5c4";
const ASSETS = [
  "./",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/roles/alchemist.jpg",
  "./icons/roles/alhadikhia.jpg",
  "./icons/roles/alsaahir.jpg",
  "./icons/roles/amnesiac.jpg",
  "./icons/roles/artist.jpg",
  "./icons/roles/assassin.jpg",
  "./icons/roles/balloonist.jpg",
  "./icons/roles/banshee.jpg",
  "./icons/roles/barber.jpg",
  "./icons/roles/baron.jpg",
  "./icons/roles/boffin.jpg",
  "./icons/roles/boomdandy.jpg",
  "./icons/roles/butler.jpg",
  "./icons/roles/cannibal.jpg",
  "./icons/roles/cerenovus.jpg",
  "./icons/roles/chambermaid.jpg",
  "./icons/roles/chef.jpg",
  "./icons/roles/clockmaker.jpg",
  "./icons/roles/courtier.jpg",
  "./icons/roles/damsel.jpg",
  "./icons/roles/devilsadvocate.jpg",
  "./icons/roles/dreamer.jpg",
  "./icons/roles/drunk.jpg",
  "./icons/roles/empath.jpg",
  "./icons/roles/eviltwin.jpg",
  "./icons/roles/exorcist.jpg",
  "./icons/roles/fanggu.jpg",
  "./icons/roles/fearmonger.jpg",
  "./icons/roles/fisherman.jpg",
  "./icons/roles/flowergirl.jpg",
  "./icons/roles/fool.jpg",
  "./icons/roles/fortuneteller.jpg",
  "./icons/roles/gambler.jpg",
  "./icons/roles/general.jpg",
  "./icons/roles/goblin.jpg",
  "./icons/roles/godfather.jpg",
  "./icons/roles/golem.jpg",
  "./icons/roles/goon.jpg",
  "./icons/roles/gossip.jpg",
  "./icons/roles/grandmother.jpg",
  "./icons/roles/highpriestess.jpg",
  "./icons/roles/huntsman.jpg",
  "./icons/roles/imp.jpg",
  "./icons/roles/innkeeper.jpg",
  "./icons/roles/investigator.jpg",
  "./icons/roles/juggler.jpg",
  "./icons/roles/king.jpg",
  "./icons/roles/klutz.jpg",
  "./icons/roles/knight.jpg",
  "./icons/roles/leviathan.jpg",
  "./icons/roles/librarian.jpg",
  "./icons/roles/lilmonsta.jpg",
  "./icons/roles/lunatic.jpg",
  "./icons/roles/lycanthrope.jpg",
  "./icons/roles/marionette.jpg",
  "./icons/roles/mastermind.jpg",
  "./icons/roles/mathematician.jpg",
  "./icons/roles/mayor.jpg",
  "./icons/roles/mezepheles.jpg",
  "./icons/roles/minstrel.jpg",
  "./icons/roles/monk.jpg",
  "./icons/roles/moonchild.jpg",
  "./icons/roles/mutant.jpg",
  "./icons/roles/nightwatchman.jpg",
  "./icons/roles/noble.jpg",
  "./icons/roles/nodashii.jpg",
  "./icons/roles/oracle.jpg",
  "./icons/roles/pacifist.jpg",
  "./icons/roles/philosopher.jpg",
  "./icons/roles/pithag.jpg",
  "./icons/roles/pixie.jpg",
  "./icons/roles/plaguedoctor.jpg",
  "./icons/roles/po.jpg",
  "./icons/roles/poisoner.jpg",
  "./icons/roles/politician.jpg",
  "./icons/roles/preacher.jpg",
  "./icons/roles/princess.jpg",
  "./icons/roles/professor.jpg",
  "./icons/roles/pukka.jpg",
  "./icons/roles/puzzlemaster.jpg",
  "./icons/roles/ravenkeeper.jpg",
  "./icons/roles/recluse.jpg",
  "./icons/roles/sage.jpg",
  "./icons/roles/sailor.jpg",
  "./icons/roles/saint.jpg",
  "./icons/roles/savant.jpg",
  "./icons/roles/scarletwoman.jpg",
  "./icons/roles/seamstress.jpg",
  "./icons/roles/shabaloth.jpg",
  "./icons/roles/shugenja.jpg",
  "./icons/roles/slayer.jpg",
  "./icons/roles/snakecharmer.jpg",
  "./icons/roles/snitch.jpg",
  "./icons/roles/soldier.jpg",
  "./icons/roles/spy.jpg",
  "./icons/roles/steward.jpg",
  "./icons/roles/sweetheart.jpg",
  "./icons/roles/tealady.jpg",
  "./icons/roles/tinker.jpg",
  "./icons/roles/towncrier.jpg",
  "./icons/roles/undertaker.jpg",
  "./icons/roles/vigormortis.jpg",
  "./icons/roles/virgin.jpg",
  "./icons/roles/vortox.jpg",
  "./icons/roles/washerwoman.jpg",
  "./icons/roles/widow.jpg",
  "./icons/roles/witch.jpg",
  "./icons/roles/wizard.jpg",
  "./icons/roles/wraith.jpg",
  "./icons/roles/xaan.jpg",
  "./icons/roles/zombuul.jpg",
  "./index.html",
  "./js/actions.js",
  "./js/context.js",
  "./js/dialogs.js",
  "./js/logic.js",
  "./js/main.js",
  "./js/panel.js",
  "./js/util.js",
  "./js/view-grid.js",
  "./js/view-journal.js",
  "./js/view-roles.js",
  "./js/view-table.js",
  "./manifest.webmanifest",
  "./roles.js",
  "./scripts.js",
  "./scripts_imported.js",
  "./styles.css"
];
// ASSETS-END

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
