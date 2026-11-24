// Base de données des rôles, partagée par tous les scénarios.
// Pour ajouter un rôle : une entrée ici (+ une icône icons/roles/<id>.jpg, facultative).
//
// wake   : moments de réveil possibles  -> each | notfirst | once | none
// choice : ce que le rôle choisit        -> one | two | char | none
// derive : le comportement dépend d'autres rôles du scénario
//          ("minion" = Sbires du scénario, "demon" = Démons, "townsfolk" = Habitants).
//          wake / choice sont alors calculés automatiquement pour chaque scénario.

const WAKE_OPTIONS = [
  { id: "each", label: "Se réveille chaque nuit" },
  { id: "notfirst", label: "Chaque nuit sauf la première" },
  { id: "once", label: "Se réveille une fois" },
  { id: "none", label: "Ne se réveille pas" },
];

const CHOICE_OPTIONS = [
  { id: "one", label: "Choisit un joueur" },
  { id: "two", label: "Choisit deux joueurs" },
  { id: "char", label: "Choisit un personnage" },
  { id: "none", label: "Ne choisit pas de joueur" },
];

const TEAMS = [
  { id: "townsfolk", label: "Habitants" },
  { id: "outsider", label: "Étrangers" },
  { id: "minion", label: "Sbires" },
  { id: "demon", label: "Démons" },
];

// Répartition standard selon le nombre de joueurs : [habitants, étrangers, sbires, démons]
const COMPOSITION = {
  5: [3, 0, 1, 1], 6: [3, 1, 1, 1], 7: [5, 0, 1, 1], 8: [5, 1, 1, 1],
  9: [5, 2, 1, 1], 10: [7, 0, 2, 1], 11: [7, 1, 2, 1], 12: [7, 2, 2, 1],
  13: [9, 0, 3, 1], 14: [9, 1, 3, 1], 15: [9, 2, 3, 1],
};

const ROLES = {
  // ---------- HABITANTS ----------
  sailor: {
    name: "Marin", en: "Sailor", team: "townsfolk",
    ability: "Chaque nuit, choisis un joueur vivant : toi ou lui êtes ivres jusqu'au crépuscule. Tu ne peux pas mourir.",
    wake: ["each"], choice: ["one"],
  },
  chambermaid: {
    name: "Femme de chambre", en: "Chambermaid", team: "townsfolk",
    ability: "Chaque nuit, choisis 2 joueurs vivants (pas toi) : tu apprends combien se sont réveillés cette nuit à cause de leur capacité.",
    wake: ["each"], choice: ["two"],
  },
  snake_charmer: {
    name: "Charmeur de serpents", en: "Snake Charmer", team: "townsfolk",
    ability: "Chaque nuit, choisis un joueur vivant : si c'est le Démon, vous échangez personnages et alignements, puis il est empoisonné.",
    wake: ["each"], choice: ["one"],
  },
  fortune_teller: {
    name: "Diseuse de bonne aventure", en: "Fortune Teller", team: "townsfolk",
    ability: "Chaque nuit, choisis 2 joueurs : tu apprends si l'un d'eux est un Démon. Un joueur bon est perçu comme Démon (leurre).",
    wake: ["each"], choice: ["two"],
  },
  monk: {
    name: "Moine", en: "Monk", team: "townsfolk",
    ability: "Chaque nuit*, choisis un joueur (pas toi) : il est protégé du Démon cette nuit.",
    wake: ["notfirst"], choice: ["one"],
  },
  exorcist: {
    name: "Exorciste", en: "Exorcist", team: "townsfolk",
    ability: "Chaque nuit*, choisis un joueur (différent de la nuit précédente) : le Démon, s'il est choisi, apprend qui tu es et ne se réveille pas cette nuit.",
    wake: ["notfirst"], choice: ["one"],
  },
  lycanthrope: {
    name: "Lycanthrope", en: "Lycanthrope", team: "townsfolk",
    ability: "Chaque nuit*, choisis un joueur vivant : s'il est bon, il meurt et le Démon ne tue pas cette nuit. Un joueur bon est perçu comme mauvais.",
    wake: ["notfirst"], choice: ["one"],
  },
  nightwatchman: {
    name: "Veilleur de nuit", en: "Nightwatchman", team: "townsfolk",
    ability: "Une fois par partie, la nuit, choisis un joueur : il apprend que tu es le Veilleur de nuit.",
    wake: ["once"], choice: ["one"],
    note: "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
  },
  courtier: {
    name: "Courtisan", en: "Courtier", team: "townsfolk",
    ability: "Une fois par partie, la nuit, choisis un personnage : il est ivre pendant 3 nuits et 3 jours.",
    wake: ["once"], choice: ["char"],
    note: "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
  },
  seamstress: {
    name: "Couturière", en: "Seamstress", team: "townsfolk",
    ability: "Une fois par partie, la nuit, choisis 2 joueurs (pas toi) : tu apprends s'ils ont le même alignement.",
    wake: ["once"], choice: ["two"],
    note: "Réveillée chaque nuit jusqu'à ce qu'elle utilise sa capacité.",
  },
  alchemist: {
    name: "Alchimiste", en: "Alchemist", team: "townsfolk",
    ability: "Tu as la capacité d'un Sbire. Quand tu l'utilises, le Conteur peut te demander de choisir autrement.",
    derive: "minion",
    note: "Se comporte comme le Sbire copié.",
  },
  cannibal: {
    name: "Cannibale", en: "Cannibal", team: "townsfolk",
    ability: "Tu as la capacité du dernier exécuté. S'il est mauvais, tu es empoisonné jusqu'à ce qu'un joueur bon meure par exécution.",
    wake: ["notfirst", "once", "none"], choice: ["one", "two", "char", "none"],
    note: "Comportement variable selon le dernier exécuté. Jamais réveillé la première nuit.",
  },
  mayor: {
    name: "Maire", en: "Mayor", team: "townsfolk",
    ability: "S'il ne reste que 3 joueurs vivants et qu'aucune exécution n'a lieu, ton équipe gagne. Si tu meurs la nuit, un autre joueur peut mourir à ta place.",
    wake: ["none"], choice: ["none"],
  },
  pacifist: {
    name: "Pacifiste", en: "Pacifist", team: "townsfolk",
    ability: "Les joueurs bons exécutés peuvent ne pas mourir.",
    wake: ["none"], choice: ["none"],
  },

  // ---------- ÉTRANGERS ----------
  lunatic: {
    name: "Lunatique", en: "Lunatic", team: "outsider",
    ability: "Tu crois être un Démon, mais tu ne l'es pas. Le Démon sait qui tu es et qui tu choisis la nuit.",
    derive: "demon",
    note: "Se comporte comme le Démon qu'il croit être.",
  },
  drunk: {
    name: "Ivrogne", en: "Drunk", team: "outsider",
    ability: "Tu ne sais pas que tu es l'Ivrogne. Tu crois être un Habitant, mais ce n'est pas le cas.",
    derive: "townsfolk",
    note: "Peut se comporter comme n'importe quel Habitant du scénario.",
  },
  tinker: {
    name: "Bricoleur", en: "Tinker", team: "outsider",
    ability: "Tu peux mourir à tout moment.",
    wake: ["none"], choice: ["none"],
  },
  recluse: {
    name: "Reclus", en: "Recluse", team: "outsider",
    ability: "Tu peux être perçu comme mauvais, Sbire ou Démon, même mort.",
    wake: ["none"], choice: ["none"],
  },

  // ---------- SBIRES ----------
  devils_advocate: {
    name: "Avocat du diable", en: "Devil's Advocate", team: "minion",
    ability: "Chaque nuit, choisis un joueur vivant (différent de la nuit précédente) : s'il est exécuté demain, il ne meurt pas.",
    wake: ["each"], choice: ["one"],
  },
  witch: {
    name: "Sorcière", en: "Witch", team: "minion",
    ability: "Chaque nuit, choisis un joueur : s'il nomine demain, il meurt. S'il ne reste que 3 joueurs vivants, tu perds ta capacité.",
    wake: ["each"], choice: ["one"],
  },
  goblin: {
    name: "Gobelin", en: "Goblin", team: "minion",
    ability: "Si tu annonces publiquement être le Gobelin quand tu es nominé et que tu es exécuté ce jour-là, ton équipe gagne.",
    wake: ["none"], choice: ["none"],
  },
  scarlet_woman: {
    name: "Femme écarlate", en: "Scarlet Woman", team: "minion",
    ability: "S'il reste 5 joueurs vivants ou plus et que le Démon meurt, tu deviens le Démon (les Voyageurs ne comptent pas).",
    wake: ["none", "notfirst"], choice: ["none", "one"],
    note: "Ne se réveille que si elle devient le Démon, puis agit comme lui.",
  },

  // ---------- DÉMONS ----------
  pukka: {
    name: "Pukka", en: "Pukka", team: "demon",
    ability: "Chaque nuit, choisis un joueur : il est empoisonné. Le joueur empoisonné précédemment meurt puis redevient sain.",
    wake: ["each"], choice: ["one"],
  },
  fang_gu: {
    name: "Fang Gu", en: "Fang Gu", team: "demon",
    ability: "Chaque nuit*, choisis un joueur : il meurt. Le 1er Étranger tué ainsi devient un Fang Gu maléfique et tu meurs à sa place. [+1 Étranger]",
    wake: ["notfirst"], choice: ["one"],
  },
  vigormortis: {
    name: "Vigormortis", en: "Vigormortis", team: "demon",
    ability: "Chaque nuit*, choisis un joueur : il meurt. Les Sbires que tu tues gardent leur capacité et empoisonnent 1 Habitant voisin. [-1 Étranger]",
    wake: ["notfirst"], choice: ["one"],
  },
};
