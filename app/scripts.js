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
//   nightOrder        — { first: [...], other: [...] } ; chaque entrée est
//                       ["id_du_role", "texte"] ou [{ label: "Tor" }, "texte"] pour une étape spéciale.

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
    nightOrder: {
      first: [
        [{ label: "Tor" }, "Pas d'info Sbires ni Démon."],
        ["alchemist", "Reçoit son pouvoir de Sbire."],
        ["lunatic", "Croit recevoir l'info du Démon (7+ joueurs)."],
        ["sailor", "Choisit un joueur vivant."],
        ["courtier", "Peut choisir un personnage."],
        ["snakecharmer", "Choisit un joueur."],
        ["devilsadvocate", "Choisit un joueur vivant."],
        ["witch", "Choisit un joueur."],
        ["pukka", "Choisit un joueur."],
        ["fortuneteller", "Choisit 2 joueurs."],
        ["seamstress", "Peut choisir 2 joueurs."],
        ["nightwatchman", "Peut choisir un joueur."],
        ["chambermaid", "Choisit 2 joueurs vivants."],
      ],
      other: [
        ["sailor", "Choisit un joueur vivant."],
        ["courtier", "Peut choisir un personnage."],
        ["snakecharmer", "Choisit un joueur."],
        ["monk", "Choisit un joueur."],
        ["devilsadvocate", "Choisit un joueur vivant."],
        ["witch", "Choisit un joueur."],
        ["scarletwoman", "Apprend qu'elle est devenue le Démon."],
        ["lunatic", "Simule l'action du Démon."],
        ["exorcist", "Choisit un joueur."],
        ["lycanthrope", "Choisit un joueur."],
        ["pukka", "Choisit un joueur ; l'empoisonné précédent meurt."],
        ["fanggu", "Choisit un joueur."],
        ["vigormortis", "Choisit un joueur."],
        ["tinker", "Peut mourir (sans réveil)."],
        [{ label: "Tor" }, "Un joueur mort apprend son personnage."],
        ["fortuneteller", "Choisit 2 joueurs."],
        ["seamstress", "Peut choisir 2 joueurs."],
        ["nightwatchman", "Peut choisir un joueur."],
        ["chambermaid", "Choisit 2 joueurs vivants."],
      ],
    },
  },
  {
    id: "trouble_brewing",
    setupNote: "Baron : +2 Marginaux.",
    nightOrder: {
      first: [
        [{ label: "Info des Sbires" }, "Les Sbires apprennent qui est le Démon (7+ joueurs)."],
        [{ label: "Info du Démon" }, "Le Démon apprend ses Sbires et 3 rôles absents (7+ joueurs)."],
        ["poisoner", "Choisit un joueur."],
        ["washerwoman", "Apprend qu'un de 2 joueurs est un Villageois précis."],
        ["librarian", "Apprend qu'un de 2 joueurs est un Marginal précis."],
        ["investigator", "Apprend qu'un de 2 joueurs est un Sbire précis."],
        ["chef", "Apprend le nombre de paires maléfiques."],
        ["empath", "Apprend combien de voisins sont maléfiques."],
        ["fortuneteller", "Choisit 2 joueurs."],
        ["butler", "Choisit son maître."],
        ["spy", "Regarde le Grimoire."],
      ],
      other: [
        ["poisoner", "Choisit un joueur."],
        ["monk", "Choisit un joueur."],
        ["scarletwoman", "Apprend qu'elle est devenue le Démon."],
        ["imp", "Choisit un joueur."],
        ["ravenkeeper", "Si elle est morte cette nuit, choisit un joueur."],
        ["empath", "Apprend combien de voisins sont maléfiques."],
        ["fortuneteller", "Choisit 2 joueurs."],
        ["undertaker", "Apprend le rôle exécuté aujourd'hui."],
        ["butler", "Choisit son maître."],
        ["spy", "Regarde le Grimoire."],
      ],
    },
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
