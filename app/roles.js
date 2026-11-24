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

const ROLES = {
  "alchemist": {
    "name": "Alchimiste",
    "en": "Alchemist",
    "team": "townsfolk",
    "ability": "Vous avez la capacité d'un Sbire. Lorsque vous l'utilisez, le Conteur peut vous demander de choisir différemment.",
    "derive": "minion",
    "note": "Se comporte comme le Sbire copié."
  },
  "alhadikhia": {
    "name": "Al-Hadikhia",
    "en": "Al-Hadikhia",
    "team": "demon",
    "ability": "Chaque nuit*, vous pouvez choisir 3 joueurs (le Conteur les annonce) : chacun choisit en secret la vie ou la mort, mais s'ils vivent tous, tous meurent.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "three"
    ]
  },
  "alsaahir": {
    "name": "Alsaahir",
    "en": "Alsaahir",
    "team": "townsfolk",
    "ability": "Chaque jour, si vous devinez publiquement qui sont des Sbires et qui sont des Démons, le Bien gagne.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "amnesiac": {
    "name": "Amnésique",
    "en": "Amnesiac",
    "team": "townsfolk",
    "ability": "Vous ne connaissez pas votre capacité. Chaque jour, devinez-la en privé : vous apprenez à quel point vous chauffez.",
    "wake": [
      "each",
      "notfirst",
      "once",
      "none"
    ],
    "choice": [
      "one",
      "two",
      "three",
      "char",
      "none"
    ],
    "note": "Capacité inconnue : comportement libre."
  },
  "artist": {
    "name": "Artiste",
    "en": "Artist",
    "team": "townsfolk",
    "ability": "Une fois par partie, dans la journée, posez en privé une question fermée (oui/non) au Conteur.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "assassin": {
    "name": "Assassin",
    "en": "Assassin",
    "team": "minion",
    "ability": "Une fois par partie, la nuit*, choisissez un joueur : il meurt, même s'il ne peut normalement pas mourir.",
    "wake": [
      "once"
    ],
    "choice": [
      "one"
    ],
    "note": "Réveillé chaque nuit* jusqu'à ce qu'il utilise sa capacité."
  },
  "balloonist": {
    "name": "Aéronaute",
    "en": "Balloonist",
    "team": "townsfolk",
    "ability": "Chaque nuit, vous apprenez un joueur d'un type de rôle différent de la nuit précédente. [+0 ou +1 Marginal]",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ]
  },
  "banshee": {
    "name": "Banshee",
    "en": "Banshee",
    "team": "townsfolk",
    "ability": "Si le Démon vous tue, tous les joueurs l'apprennent. Désormais, vous pouvez voter 2 fois par nomination et nommer 2 fois par jour.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "barber": {
    "name": "Barbier",
    "en": "Barber",
    "team": "outsider",
    "ability": "Si vous êtes mort dans la journée ou cette nuit, le Démon peut choisir 2 joueurs (mais pas un autre Démon) qui échangent alors leur rôle.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "baron": {
    "name": "Baron",
    "en": "Baron",
    "team": "minion",
    "ability": "Il y a deux Marginaux supplémentaires en jeu.[+2  Marginaux]",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "boffin": {
    "name": "Laborantin",
    "en": "Boffin",
    "team": "minion",
    "ability": "Le Démon (même ivre ou empoisonné) a la capacité d'un rôle bon pas en jeu. Vous savez tous les deux lequel.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "boomdandy": {
    "name": "Boumdandy",
    "en": "Boomdandy",
    "team": "minion",
    "ability": "Si vous êtes exécuté, tous, sauf 3, meurent. Après un décompte de 10 à 0, le joueur le plus désigné par les joueurs meurt.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "butler": {
    "name": "Majordome",
    "en": "Butler",
    "team": "outsider",
    "ability": "Chaque nuit, choisissez un joueur (sauf vous-même). Le lendemain, vous pouvez voter uniquement si ce joueur vote.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "cannibal": {
    "name": "Cannibale",
    "en": "Cannibal",
    "team": "townsfolk",
    "ability": "Vous avez la capacité du dernier mort exécuté. S'il est maléfique, vous êtes empoisonné jusqu'à ce qu'un joueur bon meure exécuté.",
    "wake": [
      "notfirst",
      "once",
      "none"
    ],
    "choice": [
      "one",
      "two",
      "three",
      "char",
      "none"
    ],
    "note": "Comportement variable selon le dernier exécuté. Jamais réveillé la première nuit."
  },
  "cerenovus": {
    "name": "Cerenovus",
    "en": "Cerenovus",
    "team": "minion",
    "ability": "Chaque nuit, choisissez un joueur et un rôle bon : le lendemain, il doit être «fou» d'être ce rôle. Sinon, il pourrait être exécuté.",
    "wake": [
      "each"
    ],
    "choice": [
      "one",
      "char"
    ],
    "note": "Choisit un joueur et un rôle bon."
  },
  "chambermaid": {
    "name": "Femme de chambre",
    "en": "Chambermaid",
    "team": "townsfolk",
    "ability": "Chaque nuit, choisissez 2 joueurs en vie (sauf vous-même) : vous apprenez combien d'entre eux se sont réveillés cette nuit à cause de leur capacité.",
    "wake": [
      "each"
    ],
    "choice": [
      "two"
    ]
  },
  "chef": {
    "name": "Cuisinier",
    "en": "Chef",
    "team": "townsfolk",
    "ability": "Lors de votre première nuit, vous apprenez le nombre de paires de joueurs maléfiques.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "clockmaker": {
    "name": "Horloger",
    "en": "Clockmaker",
    "team": "townsfolk",
    "ability": "Lors de votre première nuit, vous apprenez à combien de places du Démon est assis son Sbire le plus proche.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "courtier": {
    "name": "Courtisan",
    "en": "Courtier",
    "team": "townsfolk",
    "ability": "Une fois par partie, la nuit, choisissez un rôle : il est ivre pendant 3 nuits et 3 jours.",
    "wake": [
      "once"
    ],
    "choice": [
      "char"
    ],
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité."
  },
  "damsel": {
    "name": "Demoiselle",
    "en": "Damsel",
    "team": "outsider",
    "ability": "Tous les Sbires savent qu'une Demoiselle est en jeu. Si un Sbire devine publiquement votre rôle (1 essai), votre équipe perd.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "devilsadvocate": {
    "name": "Avocat du Diable",
    "en": "Devil's Advocate",
    "team": "minion",
    "ability": "Chaque nuit, choisissez un joueur en vie (différent de la nuit précédente) : s'il est exécuté le lendemain, il ne meurt pas.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "dreamer": {
    "name": "Rêveur",
    "en": "Dreamer",
    "team": "townsfolk",
    "ability": "Chaque nuit, choisissez un joueur (sauf vous-même ni les voyageurs) : vous apprenez 1 rôle bon et 1 rôle maléfique, dont 1 est correct.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "drunk": {
    "name": "Ivrogne",
    "en": "Drunk",
    "team": "outsider",
    "ability": "Vous ne savez pas que vous êtes l'Ivrogne. Vous pensez que vous êtes un Villageois.",
    "derive": "townsfolk",
    "note": "Peut se comporter comme n'importe quel Villageois du scénario."
  },
  "empath": {
    "name": "Empathe",
    "en": "Empath",
    "team": "townsfolk",
    "ability": "Chaque nuit, vous apprenez combien de vos 2 voisins en vie sont maléfiques.",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ]
  },
  "eviltwin": {
    "name": "Jumelle Maléfique",
    "en": "Evil Twin",
    "team": "minion",
    "ability": "Vous et un joueur adverse vous connaissez mutuellement. Si le joueur bon est exécuté, le Mal gagne. Le Bien ne peut pas gagner si vous restez tous les deux en vie.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "exorcist": {
    "name": "Exorciste",
    "en": "Exorcist",
    "team": "townsfolk",
    "ability": "Chaque nuit*, choisissez un joueur (différent de la nuit précédente) : si c'est le Démon, il apprend qui vous êtes puis ne se réveille pas cette nuit.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "fanggu": {
    "name": "Fang Gu",
    "en": "Fang Gu",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt. Le premier Marginal tué ainsi devient un Fang Gu maléfique et vous mourez à sa place. [+1 Marginal]",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "fearmonger": {
    "name": "Tourmenteur",
    "en": "Fearmonger",
    "team": "minion",
    "ability": "Chaque nuit, choisissez un joueur : si vous le nommez et l'exécutez, son équipe perd. Tous les joueurs savent si vous choisissez un nouveau joueur.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "fisherman": {
    "name": "Pêcheur",
    "en": "Fisherman",
    "team": "townsfolk",
    "ability": "Une fois par partie, dans la journée, demandez conseil au Conteur pour aider votre équipe à gagner.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "flowergirl": {
    "name": "Fleuriste",
    "en": "Flowergirl",
    "team": "townsfolk",
    "ability": "Chaque nuit*, vous apprenez si un Démon a voté dans la journée.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "none"
    ]
  },
  "fool": {
    "name": "Fou du roi",
    "en": "Fool",
    "team": "townsfolk",
    "ability": "La première fois que vous mourez, vous ne mourez pas.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "fortuneteller": {
    "name": "Voyante",
    "en": "Fortune Teller",
    "team": "townsfolk",
    "ability": "Chaque nuit, choisissez 2 joueurs et apprenez si un Démon est parmi eux. Un des joueurs bons vous apparaît comme un Démon.",
    "wake": [
      "each"
    ],
    "choice": [
      "two"
    ]
  },
  "gambler": {
    "name": "Parieur",
    "en": "Gambler",
    "team": "townsfolk",
    "ability": "Chaque nuit*, choisissez un joueur et devinez son rôle. Si vous vous trompez, vous mourez.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one",
      "char"
    ],
    "note": "Choisit un joueur et devine son rôle."
  },
  "general": {
    "name": "Général",
    "en": "General",
    "team": "townsfolk",
    "ability": "Chaque nuit, vous apprenez quel alignement est en train de gagner selon le Conteur : bon, maléfique, ou aucun.",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ]
  },
  "goblin": {
    "name": "Gobelin",
    "en": "Goblin",
    "team": "minion",
    "ability": "Si vous affirmez publiquement être le Gobelin quand vous êtes nommé puis, êtes exécuté ce jour-là, votre équipe gagne.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "godfather": {
    "name": "Parrain",
    "en": "Godfather",
    "team": "minion",
    "ability": "Lors de votre première nuit, vous apprenez quels Marginaux sont en jeu. Si un Marginal meurt dans la journée, choisissez un joueur cette nuit : il meurt. [-1 ou +1 Marginal]",
    "wake": [
      "once",
      "notfirst"
    ],
    "choice": [
      "none",
      "one"
    ],
    "note": "Info la 1re nuit, puis choisit une victime si un Marginal est mort dans la journée."
  },
  "golem": {
    "name": "Golem",
    "en": "Golem",
    "team": "outsider",
    "ability": "Vous pouvez faire une seule nomination dans la partie. Quand vous le faites, si le nommé n'est pas le Démon, il meurt.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "goon": {
    "name": "Gros Bras",
    "en": "Goon",
    "team": "outsider",
    "ability": "Chaque nuit, le premier joueur à vous choisir avec sa capacité est ivre jusqu'au crépuscule. Vous devenez de son alignement.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "gossip": {
    "name": "Commère",
    "en": "Gossip",
    "team": "townsfolk",
    "ability": "Chaque jour, vous pouvez faire une annonce publiquement. Cette nuit, si votre annonce était vraie, un joueur meurt.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "grandmother": {
    "name": "Grand-mère",
    "en": "Grandmother",
    "team": "townsfolk",
    "ability": "Lors de votre première nuit, vous apprenez un joueur bon et son rôle. Si le Démon tue ce joueur, vous mourez également.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "highpriestess": {
    "name": "Grande Prêtresse",
    "en": "High Priestess",
    "team": "townsfolk",
    "ability": "Chaque nuit, apprenez à quel joueur vous devriez parler en priorité, selon le Conteur.",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ]
  },
  "huntsman": {
    "name": "Chasseur",
    "en": "Huntsman",
    "team": "townsfolk",
    "ability": "Une fois par partie, la nuit, choisissez un joueur en vie : si c'est la Demoiselle, elle devient un Villageois pas en jeu. [+la Demoiselle]",
    "wake": [
      "once"
    ],
    "choice": [
      "one"
    ],
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité."
  },
  "imp": {
    "name": "Diablotin",
    "en": "Imp",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt. Si vous vous tuez de cette façon, un Sbire devient le Diablotin.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "innkeeper": {
    "name": "Aubergiste",
    "en": "Innkeeper",
    "team": "townsfolk",
    "ability": "Chaque nuit*, choisissez 2 joueurs : ils ne peuvent pas mourir cette nuit mais l'un d'eux est ivre jusqu'au crépuscule.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "two"
    ]
  },
  "investigator": {
    "name": "Détective",
    "en": "Investigator",
    "team": "townsfolk",
    "ability": "Lors de votre première nuit, vous apprenez un rôle de Sbire en jeu parmi 2 joueurs.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "juggler": {
    "name": "Jongleur",
    "en": "Juggler",
    "team": "townsfolk",
    "ability": "Lors de votre premier jour, devinez publiquement jusqu'à 5 rôles de joueurs. Cette nuit, vous apprenez combien étaient corrects.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ],
    "note": "Devine de jour ; apprend le résultat la nuit suivante."
  },
  "king": {
    "name": "Roi",
    "en": "King",
    "team": "townsfolk",
    "ability": "Chaque nuit, s'il y a au moins autant de morts que de vivants, vous apprenez 1 rôle en vie. Le Démon sait que vous êtes le Roi.",
    "wake": [
      "notfirst",
      "none"
    ],
    "choice": [
      "none"
    ],
    "note": "Réveillé seulement quand il y a autant de morts que de vivants."
  },
  "klutz": {
    "name": "Maladroit",
    "en": "Klutz",
    "team": "outsider",
    "ability": "Lorsque vous apprenez que vous êtes mort, choisissez publiquement 1 joueur en vie. S'il est maléfique, votre équipe perd.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "knight": {
    "name": "Chevalier",
    "en": "Knight",
    "team": "townsfolk",
    "ability": "Lors de votre 1re nuit, vous apprenez 2 joueurs qui ne sont pas le Démon.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "leviathan": {
    "name": "Léviathan",
    "en": "Leviathan",
    "team": "demon",
    "ability": "Si plus d'un joueur bon est exécuté, le Mal gagne. Tous les joueurs savent que vous êtes en jeu. Après le jour 5, le Mal gagne.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "librarian": {
    "name": "Archiviste",
    "en": "Librarian",
    "team": "townsfolk",
    "ability": "Lors de votre première nuit, vous apprenez un rôle de Marginal en jeu parmi 2 joueurs (ou qu'aucun Marginal n'est en jeu).",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "lilmonsta": {
    "name": "Timonstre",
    "en": "Lil'Monsta",
    "team": "demon",
    "ability": "Chaque nuit, les Sbires choisissent qui garde le Timonstre et « est le Démon ». Chaque nuit*, un joueur pourrait mourir. [+1 Sbire]",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ],
    "note": "Les Sbires se réveillent pour désigner le gardien."
  },
  "lunatic": {
    "name": "Lunatique",
    "en": "Lunatic",
    "team": "outsider",
    "ability": "Vous pensez que vous êtes un Démon. Le Démon sait qui vous êtes et qui vous choisissez la nuit.",
    "derive": "demon",
    "note": "Se comporte comme le Démon qu'il croit être."
  },
  "lycanthrope": {
    "name": "Lycanthrope",
    "en": "Lycanthrope",
    "team": "townsfolk",
    "ability": "Chaque nuit*, choisissez un joueur en vie. S'il est bon, il meurt et le Démon ne tue pas cette nuit. Un joueur bon apparaît comme maléfique.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "marionette": {
    "name": "Marionnette",
    "en": "Marionette",
    "team": "minion",
    "ability": "Vous pensez que vous êtes un rôle bon. Le Démon sait qui vous êtes. [Vous êtes voisin du Démon]",
    "derive": "townsfolk",
    "note": "Croit être un rôle bon et se comporte comme lui."
  },
  "mastermind": {
    "name": "Conspirateur",
    "en": "Mastermind",
    "team": "minion",
    "ability": "Si le Démon meurt par exécution (mettant fin à la partie), vous jouez 1 jour de plus. Si un joueur est exécuté ce jour-là, son équipe perd.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "mathematician": {
    "name": "Mathématicien",
    "en": "Mathematician",
    "team": "townsfolk",
    "ability": "Chaque nuit, vous apprenez combien de joueurs ont vu leur capacité dysfonctionner (depuis l'aube) à cause de la capacité d'un autre rôle.",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ]
  },
  "mayor": {
    "name": "Maire",
    "en": "Mayor",
    "team": "townsfolk",
    "ability": "S'il n'y a que 3 joueurs en vie et pas d'exécution, votre équipe gagne. Si vous mourez la nuit, un autre joueur pourrait mourir à votre place.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "mezepheles": {
    "name": "Mezepheles",
    "en": "Mezepheles",
    "team": "minion",
    "ability": "Lors de votre 1re nuit, vous apprenez un mot secret. Le 1er joueur bon qui dit ce mot devient maléfique cette nuit.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "minstrel": {
    "name": "Menestrel",
    "en": "Minstrel",
    "team": "townsfolk",
    "ability": "Lorsqu'un Sbire meurt par exécution, tous les autres joueurs (sauf les Voyageurs) sont ivres jusqu'au crépuscule du lendemain.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "monk": {
    "name": "Moine",
    "en": "Monk",
    "team": "townsfolk",
    "ability": "Chaque nuit*, choisissez un joueur (sauf vous-même) : il est protégé du Démon cette nuit.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "moonchild": {
    "name": "Sélénite",
    "en": "Moonchild",
    "team": "outsider",
    "ability": "Lorsque vous apprenez que vous êtes morte, choisissez publiquement un joueur en vie. Cette nuit, si c'était un joueur bon, il meurt.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "mutant": {
    "name": "Bête de foire",
    "en": "Mutant",
    "team": "outsider",
    "ability": "Si vous vous montrez « fou » d'être un Marginal, vous pourriez être exécuté.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "nightwatchman": {
    "name": "Veilleur De Nuit",
    "en": "Nightwatchman",
    "team": "townsfolk",
    "ability": "Une fois par partie, la nuit, choisissez un joueur : il apprend que vous êtes le Veilleur de nuit.",
    "wake": [
      "once"
    ],
    "choice": [
      "one"
    ],
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité."
  },
  "noble": {
    "name": "Noble",
    "en": "Noble",
    "team": "townsfolk",
    "ability": "Lors de votre 1re nuit, vous apprenez 3 joueurs, dont 1 uniquement est maléfique.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "nodashii": {
    "name": "No Dashii",
    "en": "No Dashii",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt.Vos 2 voisins Villageois sont empoisonnés.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "oracle": {
    "name": "Oracle",
    "en": "Oracle",
    "team": "townsfolk",
    "ability": "Chaque nuit*, vous apprenez combien de joueurs morts sont maléfiques.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "none"
    ]
  },
  "pacifist": {
    "name": "Pacifiste",
    "en": "Pacifist",
    "team": "townsfolk",
    "ability": "Les joueurs bons exécutés pourraient ne pas mourir.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "philosopher": {
    "name": "Philosophe",
    "en": "Philosopher",
    "team": "townsfolk",
    "ability": "Une fois par partie, la nuit, choisissez un rôle bon : gagnez cette capacité. Si ce rôle est en jeu, il est ivre.",
    "wake": [
      "once"
    ],
    "choice": [
      "char"
    ],
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité."
  },
  "pithag": {
    "name": "Guenaude",
    "en": "Pit-Hag",
    "team": "minion",
    "ability": "Chaque nuit*, choisissez un joueur et le rôle qu'il devient (s'il n'est pas en jeu). Si un Démon nait de cette façon, les morts de cette nuit sont arbitraires.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one",
      "char"
    ],
    "note": "Choisit un joueur et un rôle."
  },
  "pixie": {
    "name": "Pixie",
    "en": "Pixie",
    "team": "townsfolk",
    "ability": "Lors de votre 1re nuit, vous apprenez un rôle de Villageois en jeu. Si vous étiez fou d'être ce rôle, vous gagnez sa capacité à sa mort.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "plaguedoctor": {
    "name": "Docteur De Peste",
    "en": "Plague Doctor",
    "team": "outsider",
    "ability": "Lorsque vous mourez, le Conteur gagne une capacité de Sbire.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "po": {
    "name": "Po",
    "en": "Po",
    "team": "demon",
    "ability": "Chaque nuit*, vous pouvez choisir un joueur : il meurt. Si votre dernier choix était « personne », choisissez 3 joueurs cette nuit.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one",
      "three",
      "none"
    ],
    "note": "Peut choisir personne, puis 3 joueurs la nuit suivante."
  },
  "poisoner": {
    "name": "Empoisonneur",
    "en": "Poisoner",
    "team": "minion",
    "ability": "Chaque nuit, choisissez un joueur : il est empoisonné cette nuit et le jour suivant.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "politician": {
    "name": "Politicien",
    "en": "Politician",
    "team": "outsider",
    "ability": "Si vous êtes le plus responsable de la défaite de votre équipe, changez d'alignement et gagnez (même mort).",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "preacher": {
    "name": "Prédicateur",
    "en": "Preacher",
    "team": "townsfolk",
    "ability": "Chaque nuit, choisissez un joueur : si c'est un Sbire, il l'apprend. Tous les Sbires choisis n'ont aucune capacité.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "princess": {
    "name": "Princesse",
    "en": "Princess",
    "team": "townsfolk",
    "ability": "Lors de votre 1er jour, si vous avez nommé et exécuté un joueur, le Démon ne tue pas cette nuit.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "professor": {
    "name": "Professeur",
    "en": "Professor",
    "team": "townsfolk",
    "ability": "Une fois par partie, la nuit*, choisissez un joueur mort : si c'est un Villageois, il est ressuscité.",
    "wake": [
      "once"
    ],
    "choice": [
      "one"
    ],
    "note": "Réveillé chaque nuit* jusqu'à ce qu'il utilise sa capacité."
  },
  "pukka": {
    "name": "Pukka",
    "en": "Pukka",
    "team": "demon",
    "ability": "Chaque nuit, choisissez un joueur : il est empoisonné. Le joueur précédemment empoisonné meurt puis redevient sain.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "puzzlemaster": {
    "name": "Maître Des Puzzles",
    "en": "Puzzlemaster",
    "team": "outsider",
    "ability": "1 joueur est ivre, même si vous mourez. Si vous devinez (1 essai) qui c'est, vous apprenez quel joueur est le Démon, si vous vous trompez, vous recevez une fausse info.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "ravenkeeper": {
    "name": "Corneille",
    "en": "Ravenkeeper",
    "team": "townsfolk",
    "ability": "Si vous mourez la nuit, vous êtes réveillée pour choisir un joueur et apprendre son rôle.",
    "wake": [
      "once"
    ],
    "choice": [
      "one"
    ],
    "note": "Ne se réveille que la nuit de sa mort."
  },
  "recluse": {
    "name": "Recluse",
    "en": "Recluse",
    "team": "outsider",
    "ability": "Vous pourriez apparaître comme maléfique et comme Sbire ou Démon, même morte.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "sage": {
    "name": "Sage",
    "en": "Sage",
    "team": "townsfolk",
    "ability": "Si le Démon vous tue, vous apprenez qu'il est parmi 2 joueurs.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ],
    "note": "Ne se réveille que la nuit où le Démon le tue."
  },
  "sailor": {
    "name": "Marin",
    "en": "Sailor",
    "team": "townsfolk",
    "ability": "Chaque nuit, choisissez un joueur en vie : lui ou vous êtes ivre jusqu'au crépuscule. Vous ne pouvez pas mourir.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "saint": {
    "name": "Saint",
    "en": "Saint",
    "team": "outsider",
    "ability": "Si vous mourez par exécution, votre équipe perd.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "savant": {
    "name": "Savant",
    "en": "Savant",
    "team": "townsfolk",
    "ability": "Chaque jour, vous pouvez rendre visite au Conteur pour apprendre 2 informations en privé : l'une est vraie et l'autre est fausse.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "scarletwoman": {
    "name": "Femme écarlate",
    "en": "Scarlet Woman",
    "team": "minion",
    "ability": "S'il y a au moins 5 joueurs en vie et que le Démon meurt, vous devenez le Démon. (Les Voyageurs ne comptent pas.)",
    "wake": [
      "none",
      "notfirst"
    ],
    "choice": [
      "none",
      "one"
    ],
    "note": "Ne se réveille que si elle devient le Démon, puis agit comme lui."
  },
  "seamstress": {
    "name": "Couturière",
    "en": "Seamstress",
    "team": "townsfolk",
    "ability": "Une fois par partie, la nuit, choisissez 2 joueurs (sauf vous-même) : vous apprenez s'ils sont du même alignement.",
    "wake": [
      "once"
    ],
    "choice": [
      "two"
    ],
    "note": "Réveillée chaque nuit jusqu'à ce qu'elle utilise sa capacité."
  },
  "shabaloth": {
    "name": "Shabaloth",
    "en": "Shabaloth",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez 2 joueurs : ils meurent. Un joueur mort que vous avez choisi lors de la nuit précédente pourrait être recraché.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "two"
    ]
  },
  "shugenja": {
    "name": "Shugenja",
    "en": "Shugenja",
    "team": "townsfolk",
    "ability": "Lors de votre 1re nuit, vous apprenez si votre joueur maléfique le plus proche est dans le sens horaire ou anti-horaire. S'ils sont à égale distance, l'info est arbitraire.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "slayer": {
    "name": "Pourfendeuse",
    "en": "Slayer",
    "team": "townsfolk",
    "ability": "Une fois par partie, dans la journée, choisissez publiquement un joueur : s'il est le Démon, il meurt.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ],
    "note": "Capacité de jour : choisit un joueur publiquement."
  },
  "snakecharmer": {
    "name": "Charmeur de Serpents",
    "en": "Snake Charmer",
    "team": "townsfolk",
    "ability": "Chaque nuit, choisissez un joueur en vie : si c'est un Démon, il échange de rôle et d'alignement avec vous, puis est empoisonné.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "snitch": {
    "name": "Balance",
    "en": "Snitch",
    "team": "outsider",
    "ability": "Chaque Sbire reçoit 3 bluffs.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "soldier": {
    "name": "Soldat",
    "en": "Soldier",
    "team": "townsfolk",
    "ability": "Vous êtes protégé du Démon.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "spy": {
    "name": "Espionne",
    "en": "Spy",
    "team": "minion",
    "ability": "Chaque nuit, vous voyez le Grimoire. Vous pourriez apparaître comme bonne et comme Villageois ou Marginal, même morte.",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ]
  },
  "steward": {
    "name": "Intendante",
    "en": "Steward",
    "team": "townsfolk",
    "ability": "Lors de votre 1re nuit, vous apprenez 1 joueur bon.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "sweetheart": {
    "name": "Dulcinée",
    "en": "Sweetheart",
    "team": "outsider",
    "ability": "Lorsque vous mourez, 1 joueur est désormais ivre.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "tealady": {
    "name": "Tisanière",
    "en": "Tea Lady",
    "team": "townsfolk",
    "ability": "Si vos deux voisins en vie sont bons, ils ne peuvent pas mourir.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "tinker": {
    "name": "Bricoleur",
    "en": "Tinker",
    "team": "outsider",
    "ability": "Vous pourriez mourir à tout moment.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "towncrier": {
    "name": "Crieur public",
    "en": "Town Crier",
    "team": "townsfolk",
    "ability": "Chaque nuit*, vous apprenez si un Sbire a nommé quelqu'un dans la journée.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "none"
    ]
  },
  "undertaker": {
    "name": "Fossoyeur",
    "en": "Undertaker",
    "team": "townsfolk",
    "ability": "Chaque nuit*, vous apprenez quel rôle est mort par exécution dans la journée.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "none"
    ],
    "note": "Réveillé seulement si quelqu'un a été exécuté dans la journée."
  },
  "vigormortis": {
    "name": "Vigormortis",
    "en": "Vigormortis",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt. Les Sbires que vous tuez gardent leur capacité et empoisonnent 1 Villageois voisin. [-1 Marginal]",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "virgin": {
    "name": "Immaculée",
    "en": "Virgin",
    "team": "townsfolk",
    "ability": "La première fois qu'un joueur vous nomme, il est exécuté immédiatement s'il s'agit d'un Villageois.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "vortox": {
    "name": "Vortox",
    "en": "Vortox",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt. Les capacités des Villageois donnent de fausses informations. Chaque jour, si personne n'est exécuté, le Mal gagne.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  },
  "washerwoman": {
    "name": "Lavandière",
    "en": "Washerwoman",
    "team": "townsfolk",
    "ability": "Lors de votre première nuit, vous apprenez un rôle de Villageois en jeu parmi 2 joueurs.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ]
  },
  "widow": {
    "name": "Veuve",
    "en": "Widow",
    "team": "minion",
    "ability": "Lors de votre 1ʳᵉ nuit, regardez le Grimoire et choisissez un joueur : il est empoisonné. 1 joueur bon sait qu'une Veuve est en jeu.",
    "wake": [
      "once"
    ],
    "choice": [
      "one"
    ]
  },
  "witch": {
    "name": "Sorcière",
    "en": "Witch",
    "team": "minion",
    "ability": "Chaque nuit, choisissez un joueur : s'il nomme quelqu'un le lendemain, il meurt. S'il ne reste que 3 joueurs en vie, vous perdez cette capacité.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ]
  },
  "wizard": {
    "name": "Mage",
    "en": "Wizard",
    "team": "minion",
    "ability": "Une fois par partie, choisissez de faire un vœu. S'il est exaucé, il pourrait avoir un prix et laisser un indice sur sa nature.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ],
    "note": "Réveillé jusqu'à ce qu'il fasse son vœu."
  },
  "wraith": {
    "name": "Spectre",
    "en": "Wraith",
    "team": "minion",
    "ability": "Vous pouvez choisir d'ouvrir les yeux la nuit. Vous vous réveillez en même temps que les autres joueurs maléfiques.",
    "wake": [
      "each",
      "none"
    ],
    "choice": [
      "none"
    ],
    "note": "Peut ouvrir les yeux quand les joueurs maléfiques se réveillent."
  },
  "xaan": {
    "name": "Xaan",
    "en": "Xaan",
    "team": "minion",
    "ability": "La nuit X, tous les Villageois sont empoisonnés jusqu'au crépuscule. [X Marginaux]",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "zombuul": {
    "name": "Zombuul",
    "en": "Zombuul",
    "team": "demon",
    "ability": "Chaque nuit*, si personne n'est mort dans la journée, choisissez un joueur : il meurt. La première fois que vous mourez, vous restez en vie, mais apparaissez comme mort.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ]
  }
};
