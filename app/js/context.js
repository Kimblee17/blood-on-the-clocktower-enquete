// Contexte partagé par tous les modules : état, scénario courant et logique.
// Les données de référence (roles.js, scripts*.js) sont chargées avant, en globales.
import { buildScript, createLogic } from "./logic.js";
import { uid } from "./util.js";

const STORE_KEY = "vt-enquete-v1";

export const newProfile = (name, explore = false) => ({
  id: explore ? "explore" : uid(), name, explore,
  wake: [], choice: [], team: [], excluded: [],
  dead: false, claim: "", notes: "",
  align: "", confirmed: "", // align : "good" | "evil" | "" (inconnu)
  me: false, unreliable: false, // « c'est moi » · « ivre / empoisonné ? »
});

const defaultState = () => ({
  view: "table", // "table" | "grid" | "roles" | "journal"
  scriptId: SCRIPTS[0].id,
  profiles: [newProfile("Exploration", true)],
  current: "explore",
  globalNotes: "",
  hideExcluded: false,
  playerCount: 8,
  // Journal : phases N1, J1, N2, J2… (index pair = nuit, impair = jour).
  journal: { phase: 0, last: 0, events: [] },
  notInPlay: [], // rôles absents de la partie : exclus pour tous les joueurs
  // Conservés d'une partie à l'autre :
  customScripts: [], // scénarios collés en JSON
  archives: [],      // parties archivées : { id, date, name, game }
  compact: false,    // cartes de rôles compactes
  discreet: false,   // mode discret (noms et notes floutés)
});
// Ce qui constitue « une partie » (archivée / restaurée d'un bloc).
export const GAME_KEYS = ["scriptId", "profiles", "current", "globalNotes", "journal", "playerCount", "notInPlay"];

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.profiles) && s.profiles.length) {
        // Anciens ids de rôles (« fortune_teller » → « fortuneteller »).
        const fix = (id) => (id || "").replace(/_/g, "");
        s.profiles.forEach((p) => { p.excluded = (p.excluded || []).map(fix); p.claim = fix(p.claim); });
        return { ...defaultState(), ...s };
      }
    }
  } catch (e) { /* stockage indisponible */ }
  return defaultState();
}

export const app = {
  state: load(),
  script: null, // scénario courant
  roles: [],    // rôles effectifs du scénario
  byId: {},
  COMPOSITION, TEAMS,
  JINXES: typeof JINXES !== "undefined" ? JINXES : [],
  render: () => {}, // remplacé par main.js
};
app.L = createLogic(app);

// Scénarios fournis + scénarios importés par l'utilisateur.
export const allScripts = () => [...SCRIPTS, ...(app.state.customScripts || [])];
// Rôles maison des scénarios importés : ajoutés à la base (sans écraser un rôle connu).
export function registerHomebrew(script) {
  Object.entries(script?.homebrew || {}).forEach(([id, r]) => { if (!ROLES[id]) ROLES[id] = r; });
}
export function useScript(id) {
  (app.state.customScripts || []).forEach(registerHomebrew);
  app.script = allScripts().find((s) => s.id === id) || SCRIPTS[0];
  app.roles = buildScript(app.script, ROLES);
  app.byId = Object.fromEntries(app.roles.map((r) => [r.id, r]));
}
useScript(app.state.scriptId);

let saveTimer;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const ind = document.getElementById("saved-indicator");
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(app.state));
      if (ind) ind.textContent = "Enregistré sur cet appareil";
    } catch (e) {
      if (ind) ind.textContent = "Impossible d'enregistrer (stockage bloqué)";
    }
  }, 250);
}

// Raccourci : enregistrer puis tout redessiner.
export const commit = () => { save(); app.render(); };
