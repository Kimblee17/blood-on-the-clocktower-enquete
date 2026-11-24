// Scénarios écrits à la main, et compléments aux scénarios importés
// (app/scripts_imported.js, généré par tools/import_bambi.py).
//
// Une entrée dont l'id existe déjà dans les scénarios importés les complète
// (ordre de nuit, notes…) ; sinon c'est un nouveau scénario.
//
// Champs :
//   id, name, author  — identité du scénario
//   roles             — ids des rôles du scénario (voir roles.js)
//   roleNotes         — notes propres à ce scénario, ajoutées sur la carte du rôle
//   rules             — Légendaires / Loric / règles maison : [{ name, text }]
//   setupNote         — remarque sur la répartition
//   L'ordre de nuit est calculé automatiquement à partir des numéros d'ordre des rôles
//   (roles.js, champ night). Options :
//   nightExtras       — étapes en plus : { first: [{ order, label, text }], other: [...] }
//                       (order = numéro, décimal possible pour s'intercaler entre deux rôles)
//   hideNightSpecials — true pour masquer « Info des Sbires / du Démon »

const SCRIPTS_MANUAL = [
  {
    id: "veiled_threats",
    name: "Veiled Threats",
    author: "Urban Minotaur",
    roles: [
      "sailor", "chambermaid", "snakecharmer", "fortuneteller", "monk", "exorcist", "lycanthrope",
      "nightwatchman", "courtier", "seamstress", "alchemist", "cannibal", "mayor", "pacifist",
      "lunatic", "drunk", "tinker", "recluse",
      "devilsadvocate", "witch", "goblin", "scarletwoman",
      "pukka", "fanggu", "vigormortis",
    ],
    roleNotes: {
      fortuneteller: "Règle maison : reçoit 0, 1 ou 2 selon le nombre de joueurs choisis perçus comme Démon.",
    },
    rules: [
      { name: "Djinn", text: "Si deux Démons devaient coexister, l'un étant la Femme écarlate, la Femme écarlate reste Femme écarlate." },
      { name: "Tor", text: "Les joueurs ne connaissent ni leur personnage ni leur alignement. Ils les apprennent à leur mort. (Pas d'info Sbires / Démon la 1re nuit.)" },
      { name: "Contrebandier", text: "La Voyante reçoit 0, 1 ou 2 selon le nombre de joueurs choisis perçus comme Démon." },
      { name: "Contrebandier", text: "Un joueur qui choisit un joueur qu'il ne pourrait normalement pas choisir (ex. l'Exorciste qui choisit deux fois la même personne) est ivre cette nuit-là." },
    ],
    setupNote: "Fang Gu : +1 Marginal. Vigormortis : −1 Marginal.",
    // Tor : pas d'info Sbires / Démon, et étape « joueur mort » chaque nuit.
    hideNightSpecials: true,
    nightExtras: {
      first: [{ order: 19.5, label: "Tor", text: "Pas d'info Sbires ni Démon." }],
      other: [{ order: 71.5, label: "Tor", text: "Un joueur mort cette nuit apprend son personnage." }],
    },
  },
  {
    id: "trouble_brewing",
    setupNote: "Baron : +2 Marginaux.",
  },
  { id: "bad_moon_rising", setupNote: "Parrain : −1 ou +1 Marginal." },
  { id: "sects_and_violets", setupNote: "Fang Gu : +1 Marginal. Vigormortis : −1 Marginal." },
];

// Fusion : scénarios écrits à la main d'abord, puis les importés (complétés).
const SCRIPTS = (() => {
  const imported = typeof SCRIPTS_IMPORTED !== "undefined" ? SCRIPTS_IMPORTED : [];
  const byId = Object.fromEntries(SCRIPTS_MANUAL.map((s) => [s.id, s]));
  const merged = imported.map((s) => (byId[s.id] ? { ...s, ...byId[s.id] } : s));
  const own = SCRIPTS_MANUAL.filter((s) => !imported.some((i) => i.id === s.id));
  return [...own, ...merged];
})();
