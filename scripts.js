// Scénarios (scripts). Chaque scénario liste les ids de ses rôles (voir roles.js).
//
// Champs :
//   id, name, author  — identité du scénario
//   roles             — ids des rôles du scénario
//   roleNotes         — notes propres à ce scénario, ajoutées sur la carte du rôle
//   rules             — Fabuleux / règles maison : [{ name, text }]
//   setupNote         — remarque sur la répartition (rôles qui modifient le nombre d'Étrangers…)
//   nightOrder        — { first: [...], other: [...] } ; chaque entrée est
//                       ["id_du_role", "texte"] ou [{ label: "Tor" }, "texte"] pour une étape spéciale.

const SCRIPTS = [
  {
    id: "veiled_threats",
    name: "Veiled Threats",
    author: "Urban Minotaur",
    roles: [
      "sailor", "chambermaid", "snake_charmer", "fortune_teller", "monk", "exorcist", "lycanthrope",
      "nightwatchman", "courtier", "seamstress", "alchemist", "cannibal", "mayor", "pacifist",
      "lunatic", "drunk", "tinker", "recluse",
      "devils_advocate", "witch", "goblin", "scarlet_woman",
      "pukka", "fang_gu", "vigormortis",
    ],
    roleNotes: {
      fortune_teller: "Règle maison : reçoit 0, 1 ou 2 selon le nombre de joueurs choisis perçus comme Démon.",
    },
    rules: [
      { name: "Djinn", text: "Si deux Démons devaient coexister, l'un étant la Femme écarlate, la Femme écarlate reste Femme écarlate." },
      { name: "Tor", text: "Les joueurs ne connaissent ni leur personnage ni leur alignement. Ils les apprennent à leur mort. (Pas d'info Sbires / Démon la 1re nuit.)" },
      { name: "Bootlegger", text: "La Diseuse de bonne aventure reçoit 0, 1 ou 2 selon le nombre de joueurs choisis perçus comme Démon." },
      { name: "Bootlegger", text: "Un joueur qui choisit un joueur qu'il ne pourrait normalement pas choisir (ex. l'Exorciste qui choisit deux fois la même personne) est ivre cette nuit-là." },
    ],
    setupNote: "Fang Gu : +1 Étranger. Vigormortis : −1 Étranger.",
    nightOrder: {
      first: [
        [{ label: "Tor" }, "Pas d'info Sbires ni Démon."],
        ["alchemist", "Reçoit son pouvoir de Sbire."],
        ["lunatic", "Croit recevoir l'info du Démon (7+ joueurs)."],
        ["sailor", "Choisit un joueur vivant."],
        ["courtier", "Peut choisir un personnage."],
        ["snake_charmer", "Choisit un joueur."],
        ["devils_advocate", "Choisit un joueur vivant."],
        ["witch", "Choisit un joueur."],
        ["pukka", "Choisit un joueur."],
        ["fortune_teller", "Choisit 2 joueurs."],
        ["seamstress", "Peut choisir 2 joueurs."],
        ["nightwatchman", "Peut choisir un joueur."],
        ["chambermaid", "Choisit 2 joueurs vivants."],
      ],
      other: [
        ["sailor", "Choisit un joueur vivant."],
        ["courtier", "Peut choisir un personnage."],
        ["snake_charmer", "Choisit un joueur."],
        ["monk", "Choisit un joueur."],
        ["devils_advocate", "Choisit un joueur vivant."],
        ["witch", "Choisit un joueur."],
        ["scarlet_woman", "Apprend qu'elle est devenue le Démon."],
        ["lunatic", "Simule l'action du Démon."],
        ["exorcist", "Choisit un joueur."],
        ["lycanthrope", "Choisit un joueur."],
        ["pukka", "Choisit un joueur ; l'empoisonné précédent meurt."],
        ["fang_gu", "Choisit un joueur."],
        ["vigormortis", "Choisit un joueur."],
        ["tinker", "Peut mourir (sans réveil)."],
        [{ label: "Tor" }, "Un joueur mort apprend son personnage."],
        ["fortune_teller", "Choisit 2 joueurs."],
        ["seamstress", "Peut choisir 2 joueurs."],
        ["nightwatchman", "Peut choisir un joueur."],
        ["chambermaid", "Choisit 2 joueurs vivants."],
      ],
    },
  },
  {
    id: "trouble_brewing",
    name: "Trouble Brewing",
    author: "Steven Medway",
    roles: [
      "washerwoman", "librarian", "investigator", "chef", "empath", "fortune_teller", "undertaker",
      "monk", "ravenkeeper", "virgin", "slayer", "soldier", "mayor",
      "butler", "drunk", "recluse", "saint",
      "poisoner", "spy", "scarlet_woman", "baron",
      "imp",
    ],
    roleNotes: {
      fortune_teller: "Un joueur bon choisi par le Conteur est perçu comme Démon (leurre).",
    },
    rules: [],
    setupNote: "Baron : +2 Étrangers.",
    nightOrder: {
      first: [
        [{ label: "Info des Sbires" }, "Les Sbires apprennent qui est le Démon (7+ joueurs)."],
        [{ label: "Info du Démon" }, "Le Démon apprend ses Sbires et 3 rôles absents (7+ joueurs)."],
        ["poisoner", "Choisit un joueur."],
        ["washerwoman", "Apprend qu'un de 2 joueurs est un Habitant précis."],
        ["librarian", "Apprend qu'un de 2 joueurs est un Étranger précis."],
        ["investigator", "Apprend qu'un de 2 joueurs est un Sbire précis."],
        ["chef", "Apprend le nombre de paires mauvaises."],
        ["empath", "Apprend combien de voisins sont mauvais."],
        ["fortune_teller", "Choisit 2 joueurs."],
        ["butler", "Choisit son maître."],
        ["spy", "Regarde le Grimoire."],
      ],
      other: [
        ["poisoner", "Choisit un joueur."],
        ["monk", "Choisit un joueur."],
        ["scarlet_woman", "Apprend qu'elle est devenue le Démon."],
        ["imp", "Choisit un joueur."],
        ["ravenkeeper", "S'il est mort cette nuit, choisit un joueur."],
        ["empath", "Apprend combien de voisins sont mauvais."],
        ["fortune_teller", "Choisit 2 joueurs."],
        ["undertaker", "Apprend le personnage exécuté aujourd'hui."],
        ["butler", "Choisit son maître."],
        ["spy", "Regarde le Grimoire."],
      ],
    },
  },
];
