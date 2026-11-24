// Généré par tools/import_bambi.py — ne pas modifier à la main (modifier le script d'import).
// Noms et capacités : wiki BotC FR de BambiPotato (CC BY 4.0), parfois corrigés.
//
// wake   : moments de réveil possibles  -> each | notfirst | once | none
// choice : ce que le rôle choisit        -> one | two | three | char | none
// derive : le comportement dépend d'autres rôles du scénario
//          ("minion" = Sbires du scénario, "demon" = Démons, "townsfolk" = Villageois).

const WAKE_OPTIONS = [
  { id: "each", label: "Se réveille chaque nuit" },
  { id: "notfirst", label: "Chaque nuit sauf la première" },
  { id: "once", label: "Se réveille une fois" },
  { id: "none", label: "Ne se réveille pas" },
];

const CHOICE_OPTIONS = [
  { id: "one", label: "Choisit un joueur" },
  { id: "two", label: "Choisit deux joueurs" },
  { id: "three", label: "Choisit trois joueurs" },
  { id: "char", label: "Choisit un personnage" },
  { id: "none", label: "Ne choisit pas de joueur" },
];

const TEAMS = [
  { id: "townsfolk", label: "Villageois" },
  { id: "outsider", label: "Marginaux" },
  { id: "minion", label: "Sbires" },
  { id: "demon", label: "Démons" },
];

// Répartition standard selon le nombre de joueurs : [villageois, marginaux, sbires, démons]
const COMPOSITION = {
  5: [3, 0, 1, 1], 6: [3, 1, 1, 1], 7: [5, 0, 1, 1], 8: [5, 1, 1, 1],
  9: [5, 2, 1, 1], 10: [7, 0, 2, 1], 11: [7, 1, 2, 1], 12: [7, 2, 2, 1],
  13: [9, 0, 3, 1], 14: [9, 1, 3, 1], 15: [9, 2, 3, 1],
};

