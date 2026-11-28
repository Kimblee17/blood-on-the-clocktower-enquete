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

// Étapes de nuit qui ne sont pas des rôles, avec leur numéro d'ordre.
const NIGHT_SPECIALS = {
  "first": [
    {
      "order": 20,
      "label": "Info des Sbires",
      "text": "Les Sbires apprennent qui est le Démon (7+ joueurs)."
    },
    {
      "order": 24,
      "label": "Info du Démon",
      "text": "Le Démon apprend ses Sbires et 3 rôles absents (7+ joueurs)."
    }
  ]
};

// night.first / night.other : numéro d'ordre de réveil (feuille de nuit officielle).
const ROLES = {
  "acrobat": {
    "name": "Acrobate",
    "en": "Acrobat",
    "team": "townsfolk",
    "ability": "Chaque nuit*, choisissez un joueur : s'il est ou devient ivre ou empoisonné cette nuit, vous mourez.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ],
    "night": {
      "other": 22
    }
  },
  "alchemist": {
    "name": "Alchimiste",
    "en": "Alchemist",
    "team": "townsfolk",
    "ability": "Vous avez la capacité d'un Sbire. Lorsque vous l'utilisez, le Conteur peut vous demander de choisir différemment.",
    "derive": "minion",
    "note": "Se comporte comme le Sbire copié.",
    "nightText": "Apprend son pouvoir de Sbire / l'utilise.",
    "night": {
      "first": 15
    }
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
    ],
    "night": {
      "other": 51
    }
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
    "note": "Capacité inconnue : comportement libre.",
    "night": {
      "first": 51,
      "other": 69
    }
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
    "note": "Réveillé chaque nuit* jusqu'à ce qu'il utilise sa capacité.",
    "night": {
      "other": 56
    }
  },
  "atheist": {
    "name": "Athée",
    "en": "Atheist",
    "team": "townsfolk",
    "ability": "Le Conteur peut enfreindre les règles. S'il est exécuté, le Bien gagne, même si vous êtes mort. [Aucun rôle maléfique]",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
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
    ],
    "nightText": "Apprend un joueur d'un type différent.",
    "night": {
      "first": 66,
      "other": 85
    }
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
    ],
    "night": {
      "other": 64
    }
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
    ],
    "night": {
      "other": 60
    }
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
    ],
    "night": {
      "first": 13
    }
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
  "bountyhunter": {
    "name": "Chasseur De Primes",
    "en": "Bounty Hunter",
    "team": "townsfolk",
    "ability": "Lors de votre 1re nuit, vous apprenez 1 joueur maléfique. Si le joueur maléfique meurt, vous en apprenez un autre cette nuit, et ainsi de suite. [1 Villageois est maléfique]",
    "wake": [
      "once",
      "notfirst"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "first": 69,
      "other": 88
    }
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
    ],
    "nightText": "Choisit son maître.",
    "night": {
      "first": 58,
      "other": 91
    }
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
    "note": "Choisit un joueur et un rôle bon.",
    "night": {
      "first": 43,
      "other": 28
    }
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
    ],
    "night": {
      "first": 76,
      "other": 95
    }
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
    ],
    "nightText": "Apprend le nombre de paires maléfiques.",
    "night": {
      "first": 55
    }
  },
  "choirboy": {
    "name": "Choriste",
    "en": "Choirboy",
    "team": "townsfolk",
    "ability": "Si le Démon tue le Roi, vous apprenez quel joueur est le Démon. [+ Roi]",
    "wake": [
      "notfirst",
      "none"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "other": 66
    }
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
    ],
    "nightText": "Apprend la distance Démon / Sbire le plus proche.",
    "night": {
      "first": 60
    }
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
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "nightText": "Peut choisir un personnage.",
    "night": {
      "first": 35,
      "other": 18
    }
  },
  "cultleader": {
    "name": "Chef De Secte",
    "en": "Cult Leader",
    "team": "townsfolk",
    "ability": "Chaque nuit, vous devenez de l'alignement d'un voisin en vie. Si tous les joueurs bons rejoignent votre secte, votre équipe gagne.",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "first": 71,
      "other": 90
    }
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
    ],
    "night": {
      "first": 50,
      "other": 68
    }
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
    ],
    "night": {
      "first": 40,
      "other": 26
    }
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
    ],
    "night": {
      "first": 61,
      "other": 79
    }
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
    ],
    "nightText": "Apprend combien de voisins sont maléfiques.",
    "night": {
      "first": 56,
      "other": 76
    }
  },
  "engineer": {
    "name": "Ingénieur",
    "en": "Engineer",
    "team": "townsfolk",
    "ability": "Une fois par partie, la nuit, choisissez quel Démon ou quels Sbires sont en jeu.",
    "wake": [
      "once",
      "none"
    ],
    "choice": [
      "char",
      "none"
    ],
    "night": {
      "first": 28,
      "other": 14
    }
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
    ],
    "nightText": "Les jumeaux se découvrent.",
    "night": {
      "first": 41
    }
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
    ],
    "night": {
      "other": 36
    }
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
    ],
    "night": {
      "other": 45
    }
  },
  "farmer": {
    "name": "Fermière",
    "en": "Farmer",
    "team": "townsfolk",
    "ability": "Si vous mourez la nuit, un joueur bon en vie devient une Fermière.",
    "wake": [
      "notfirst",
      "none"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "other": 70
    }
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
    ],
    "night": {
      "first": 44,
      "other": 30
    }
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
    ],
    "nightText": "Apprend si un Démon a voté.",
    "night": {
      "other": 80
    }
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
    ],
    "night": {
      "first": 57,
      "other": 77
    }
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
    "note": "Choisit un joueur et devine son rôle.",
    "night": {
      "other": 21
    }
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
    ],
    "nightText": "Apprend quelle équipe gagne.",
    "night": {
      "first": 75,
      "other": 94
    }
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
    "note": "Info la 1re nuit, puis choisit une victime si un Marginal est mort dans la journée.",
    "nightText": "1re nuit : apprend les Marginaux. Ensuite : peut tuer.",
    "night": {
      "first": 38,
      "other": 57
    }
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
    ],
    "night": {
      "other": 58
    }
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
    ],
    "nightText": "Apprend un joueur bon et son rôle.",
    "night": {
      "first": 59,
      "other": 73
    }
  },
  "harpy": {
    "name": "Harpie",
    "en": "Harpy",
    "team": "minion",
    "ability": "Chaque nuit, choisissez 2 joueurs : le lendemain, le 1er joueur est fou que le 2e est maléfique, ou l'un des deux ou les deux pourraient mourir.",
    "wake": [
      "each"
    ],
    "choice": [
      "two"
    ],
    "night": {
      "first": 45,
      "other": 31
    }
  },
  "hatter": {
    "name": "Chapelier",
    "en": "Hatter",
    "team": "outsider",
    "ability": "Si vous êtes mort ce jour ou cette nuit, les Sbires et Démons peuvent choisir de nouveaux rôles de Sbire et Démon.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "other": 59
    }
  },
  "heretic": {
    "name": "Hérétique",
    "en": "Heretic",
    "team": "outsider",
    "ability": "Quiconque gagne, perd, et quiconque perd, gagne, même si vous êtes mort.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
  },
  "hermit": {
    "name": "Ermite",
    "en": "Hermit",
    "team": "outsider",
    "ability": "Vous avez les capacités de tous les Marginaux. [-0 ou -1 Marginal]",
    "derive": "outsider"
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
    ],
    "nightText": "Apprend à qui parler.",
    "night": {
      "first": 74,
      "other": 93
    }
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
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "night": {
      "first": 49,
      "other": 67
    }
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
    ],
    "night": {
      "other": 40
    }
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
    ],
    "night": {
      "other": 19
    }
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
    ],
    "nightText": "Apprend qu'un de 2 joueurs est un Sbire précis.",
    "night": {
      "first": 54
    }
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
    "note": "Devine de jour ; apprend le résultat la nuit suivante.",
    "nightText": "Apprend combien de ses suppositions étaient justes.",
    "night": {
      "other": 84
    }
  },
  "kazali": {
    "name": "Kazali",
    "en": "Kazali",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt. [Vous choisissez quels joueurs sont quels Sbires. -? à +? Marginaux]",
    "wake": [
      "each"
    ],
    "choice": [
      "one",
      "none"
    ],
    "night": {
      "first": 8,
      "other": 55
    }
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
    "note": "Réveillé seulement quand il y a autant de morts que de vivants.",
    "nightText": "Si autant de morts que de vivants, apprend un rôle en vie.",
    "night": {
      "first": 25,
      "other": 87
    }
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
    ],
    "nightText": "Apprend 2 joueurs qui ne sont pas le Démon.",
    "night": {
      "first": 64
    }
  },
  "legion": {
    "name": "Légion",
    "en": "Legion",
    "team": "demon",
    "ability": "Chaque nuit*, un joueur pourrait mourir. Toute exécution échoue si seul le Mal a voté. Vous apparaissez aussi comme Sbire.[La majorité des joueurs sont Légion]",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "other": 39
    }
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
    ],
    "night": {
      "first": 79,
      "other": 99
    }
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
    ],
    "nightText": "Apprend qu'un de 2 joueurs est un Marginal précis.",
    "night": {
      "first": 53
    }
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
    "note": "Les Sbires se réveillent pour désigner le gardien.",
    "night": {
      "first": 30,
      "other": 53
    }
  },
  "lleech": {
    "name": "Parasyte",
    "en": "Lleech",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt. Lors de votre 1re nuit, choisissez un joueur : il est empoisonné. Vous mourez si et seulement si ce joueur est mort.",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ],
    "night": {
      "first": 31,
      "other": 52
    }
  },
  "lordoftyphon": {
    "name": "Seigneur De Typhon",
    "en": "The Lord of Typhon",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un joueur : il meurt. [Les maléfiques forment une ligne. Vous êtes au milieu. +1 Sbire. -? à +? Marginaux]",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "one"
    ],
    "night": {
      "first": 7,
      "other": 48
    }
  },
  "lunatic": {
    "name": "Lunatique",
    "en": "Lunatic",
    "team": "outsider",
    "ability": "Vous pensez que vous êtes un Démon. Le Démon sait qui vous êtes et qui vous choisissez la nuit.",
    "derive": "demon",
    "note": "Se comporte comme le Démon qu'il croit être.",
    "nightText": "Agit comme le Démon qu'il croit être.",
    "night": {
      "first": 22,
      "other": 35
    }
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
    ],
    "night": {
      "other": 37
    }
  },
  "magician": {
    "name": "Magicien",
    "en": "Magician",
    "team": "townsfolk",
    "ability": "Le Démon pense que vous êtes un Sbire. Les Sbires pensent que vous êtes un Démon.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "first": 18
    }
  },
  "marionette": {
    "name": "Marionnette",
    "en": "Marionette",
    "team": "minion",
    "ability": "Vous pensez que vous êtes un rôle bon. Le Démon sait qui vous êtes. [Vous êtes voisin du Démon]",
    "derive": "townsfolk",
    "note": "Croit être un rôle bon et se comporte comme lui.",
    "night": {
      "first": 27
    }
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
    ],
    "nightText": "Apprend combien de capacités ont dysfonctionné.",
    "night": {
      "first": 77,
      "other": 96
    }
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
    ],
    "nightText": "Apprend son mot secret.",
    "night": {
      "first": 46,
      "other": 32
    }
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
    ],
    "night": {
      "other": 24
    }
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
    ],
    "night": {
      "other": 72
    }
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
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "nightText": "Peut choisir un joueur.",
    "night": {
      "first": 70,
      "other": 89
    }
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
    ],
    "nightText": "Apprend 3 joueurs dont 1 seul maléfique.",
    "night": {
      "first": 65
    }
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
    ],
    "night": {
      "other": 46
    }
  },
  "ogre": {
    "name": "Ogre",
    "en": "Ogre",
    "team": "outsider",
    "ability": "Lors de votre 1re nuit, choisissez un joueur (sauf vous-même) : vous devenez de son alignement (sans le connaître) même ivre ou empoisonné.",
    "wake": [
      "once"
    ],
    "choice": [
      "one"
    ],
    "night": {
      "first": 73
    }
  },
  "ojo": {
    "name": "Ojo",
    "en": "Ojo",
    "team": "demon",
    "ability": "Chaque nuit*, choisissez un rôle : il meurt. S'il n'est pas en jeu, le Conteur choisit qui meurt.",
    "wake": [
      "notfirst"
    ],
    "choice": [
      "char"
    ],
    "night": {
      "other": 50
    }
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
    ],
    "nightText": "Apprend combien de morts sont maléfiques.",
    "night": {
      "other": 82
    }
  },
  "organgrinder": {
    "name": "Organiste De Rue",
    "en": "Organ Grinder",
    "team": "minion",
    "ability": "Tous les joueurs gardent les yeux fermés lors des votes et leur décompte est secret. Chaque nuit, choisissez si vous êtes ivre jusqu'au crépuscule.",
    "wake": [
      "each"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "first": 39,
      "other": 25
    }
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
    "note": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "nightText": "Peut choisir un rôle bon.",
    "night": {
      "first": 14,
      "other": 11
    }
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
    "note": "Choisit un joueur et un rôle.",
    "night": {
      "other": 29
    }
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
    ],
    "nightText": "Apprend un Villageois en jeu.",
    "night": {
      "first": 48
    }
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
    ],
    "night": {
      "other": 62
    }
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
    "note": "Peut choisir personne, puis 3 joueurs la nuit suivante.",
    "night": {
      "other": 44
    }
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
    ],
    "night": {
      "first": 33,
      "other": 17
    }
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
  "poppygrower": {
    "name": "Planteur De Pavot",
    "en": "Poppy Grower",
    "team": "townsfolk",
    "ability": "Sbires et Démons ne se connaissent pas. Si vous mourez, ils apprennent qui ils sont cette nuit.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "first": 16,
      "other": 12
    }
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
    ],
    "night": {
      "first": 29,
      "other": 15
    }
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
    ],
    "night": {
      "other": 38
    }
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
    "note": "Réveillé chaque nuit* jusqu'à ce qu'il utilise sa capacité.",
    "night": {
      "other": 65
    }
  },
  "psychopath": {
    "name": "Psychopathe",
    "en": "Psychopath",
    "team": "minion",
    "ability": "Chaque jour, avant les nominations, vous pouvez choisir publiquement un joueur : il meurt. Si vous êtes exécuté, vous mourez uniquement si vous perdez au chifoumi.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ]
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
    ],
    "nightText": "Choisit un joueur ; l'empoisonné précédent meurt.",
    "night": {
      "first": 47,
      "other": 42
    }
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
    "note": "Ne se réveille que la nuit de sa mort.",
    "nightText": "Si mort cette nuit, choisit un joueur et apprend son rôle.",
    "night": {
      "other": 75
    }
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
  "riot": {
    "name": "Émeute",
    "en": "Riot",
    "team": "demon",
    "ability": "Le jour 3, les Sbires deviennent Émeute et les nommés meurent mais nomment immédiatement un joueur en vie. Ceci doit avoir lieu.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "other": 97
    }
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
    "note": "Ne se réveille que la nuit où le Démon le tue.",
    "nightText": "Si tué par le Démon, apprend 2 joueurs dont le Démon.",
    "night": {
      "other": 63
    }
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
    ],
    "night": {
      "first": 26,
      "other": 13
    }
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
    "note": "Ne se réveille que si elle devient le Démon, puis agit comme lui.",
    "nightText": "Apprend qu'elle est devenue le Démon.",
    "night": {
      "other": 33
    }
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
    "note": "Réveillée chaque nuit jusqu'à ce qu'elle utilise sa capacité.",
    "nightText": "Peut choisir 2 joueurs.",
    "night": {
      "first": 62,
      "other": 83
    }
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
    ],
    "night": {
      "other": 43
    }
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
    ],
    "nightText": "Apprend de quel côté est le joueur maléfique le plus proche.",
    "night": {
      "first": 67
    }
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
    ],
    "night": {
      "first": 37,
      "other": 23
    }
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
    ],
    "night": {
      "first": 21
    }
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
    ],
    "nightText": "Regarde le Grimoire.",
    "night": {
      "first": 72,
      "other": 92
    }
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
    ],
    "nightText": "Apprend 1 joueur bon.",
    "night": {
      "first": 63
    }
  },
  "summoner": {
    "name": "Invocatrice",
    "en": "Summoner",
    "team": "minion",
    "ability": "Recevez 3 bluffs. La 3ᵉ nuit, choisissez qui devient un Démon maléfique de votre choix. [Aucun Démon]",
    "wake": [
      "once",
      "notfirst"
    ],
    "choice": [
      "none",
      "one",
      "char"
    ],
    "night": {
      "first": 23,
      "other": 34
    }
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
    ],
    "night": {
      "other": 61
    }
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
    ],
    "nightText": "Peut mourir (sans réveil).",
    "night": {
      "other": 71
    }
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
    ],
    "nightText": "Apprend si un Sbire a nominé.",
    "night": {
      "other": 81
    }
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
    "note": "Réveillé seulement si quelqu'un a été exécuté dans la journée.",
    "nightText": "Apprend le rôle exécuté aujourd'hui.",
    "night": {
      "other": 78
    }
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
    ],
    "night": {
      "other": 49
    }
  },
  "villageidiot": {
    "name": "Idiot Du Village",
    "en": "Village Idiot",
    "team": "townsfolk",
    "ability": "Chaque nuit, choisissez un joueur : vous apprenez son alignement. [+0 ou +1 à +2 Idiots du village dont un ivre]",
    "wake": [
      "each"
    ],
    "choice": [
      "one"
    ],
    "night": {
      "first": 68,
      "other": 86
    }
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
  "vizier": {
    "name": "Vizir",
    "en": "Vizier",
    "team": "minion",
    "ability": "Tous les joueurs savent que vous êtes le Vizir. Vous ne pouvez pas mourir dans la journée. Si le Bien a voté, vous pouvez exécuter immédiatement.",
    "wake": [
      "none"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "first": 80
    }
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
    ],
    "night": {
      "other": 47
    }
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
    ],
    "nightText": "Apprend qu'un de 2 joueurs est un Villageois précis.",
    "night": {
      "first": 52
    }
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
    ],
    "night": {
      "first": 34
    }
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
    ],
    "night": {
      "first": 42,
      "other": 27
    }
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
    "note": "Réveillé jusqu'à ce qu'il fasse son vœu.",
    "night": {
      "first": 36,
      "other": 20
    }
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
    "note": "Peut ouvrir les yeux quand les joueurs maléfiques se réveillent.",
    "night": {
      "first": 6,
      "other": 4
    }
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
    ],
    "night": {
      "first": 32,
      "other": 16
    }
  },
  "yaggababble": {
    "name": "Yaggablabla",
    "en": "Yaggababble",
    "team": "demon",
    "ability": "Lors de votre 1re nuit, vous apprenez une phrase secrète. Pour chaque fois que vous l'avez dite publiquement ce jour, un joueur pourrait mourir.",
    "wake": [
      "once"
    ],
    "choice": [
      "none"
    ],
    "night": {
      "first": 17,
      "other": 54
    }
  },
  "zealot": {
    "name": "Zélote",
    "en": "Zealot",
    "team": "outsider",
    "ability": "S'il y a au moins 5 joueurs en vie, vous devez voter pour chaque nomination.",
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
    ],
    "night": {
      "other": 41
    }
  }
};

// Jinxes (règles du Djinn) : [rôle A, rôle B, règle]
const JINXES = [
 [
  "alchemist",
  "mastermind",
  "Un Alchimiste-Conspirateur n'a pas la capacité du Conspirateur et aucun Conspirateur n'est en jeu."
 ],
 [
  "alchemist",
  "spy",
  "Un Alchimiste-Espionne n'a pas la capacité d'Espionne et une Espionne est en jeu. Après chaque exécution, l'Alchimiste vivant peut deviner publiquement un joueur vivant comme étant l'Espionne ; si c'est correct, le Démon doit choisir l'Espionne cette nuit."
 ],
 [
  "alchemist",
  "summoner",
  "L'Alchimiste-Invocatrice ne reçoit pas de bluffs et choisit le type de Démon mais pas le joueur. S'il meurt avant que cela n'arrive, les Maléfiques gagnent. [Pas de Démon]"
 ],
 [
  "alchemist",
  "boffin",
  "Un Alchimiste-Laborantin n'apprend pas quelle capacité le Démon a obtenue."
 ],
 [
  "alchemist",
  "organgrinder",
  "Si l'Alchimiste a cette capacité, l'Organiste de rue est en jeu ; si l'Alchimiste et l'Organiste de rue sont sobres, ils sont tous deux ivres."
 ],
 [
  "alchemist",
  "wraith",
  "Un Alchimiste-Spectre n'a pas la capacité de Spectre et un Spectre est en jeu. Après chaque exécution, l'Alchimiste vivant peut deviner publiquement un joueur vivant comme étant le Spectre ; si c'est correct, le Démon doit choisir le Spectre cette nuit."
 ],
 [
  "alchemist",
  "widow",
  "Un Alchimiste-Veuve n'a pas la capacité de la Veuve et une Veuve est en jeu. Après chaque exécution, l'Alchimiste vivant peut deviner publiquement un joueur vivant comme étant la Veuve ; si c'est correct, le Démon doit choisir la Veuve cette nuit."
 ],
 [
  "cannibal",
  "juggler",
  "Si le Jongleur jongle son premier jour et meurt par exécution, le Cannibale apprend combien de combinaisons étaient correctes."
 ],
 [
  "cannibal",
  "butler",
  "Si le Cannibale gagne la capacité du Majordome, il l'apprend."
 ],
 [
  "cannibal",
  "poppygrower",
  "Si le Cannibale mange le Planteur de pavot, puis meurt ou perd cette capacité, le Démon et les Sbires se reconnaissent cette nuit."
 ],
 [
  "cannibal",
  "princess",
  "Si le Cannibale a nominé, exécuté et tué la Princesse aujourd'hui, le Démon ne tue pas cette nuit."
 ],
 [
  "cannibal",
  "zealot",
  "Si le Cannibale gagne la capacité du Zélote, il l'apprend."
 ],
 [
  "bountyhunter",
  "kazali",
  "Si le Kazali transforme le Chasseur de primes en Sbire, aucun Villageois maléfique n'est créé."
 ],
 [
  "mathematician",
  "chambermaid",
  "La Femme de chambre peut détecter si le Mathématicien se réveille cette nuit."
 ],
 [
  "mathematician",
  "drunk",
  "Le Mathématicien apprend si la capacité de l'Ivrogne a produit une fausse information ou n'a pas fonctionné correctement."
 ],
 [
  "mathematician",
  "lunatic",
  "Le Mathématicien apprend si le Lunatique attaque des joueurs différents de ceux attaqués par le vrai Démon."
 ],
 [
  "plaguedoctor",
  "baron",
  "Si le Conteur gagne la capacité du Baron, jusqu'à deux joueurs deviennent des Marginaux qui ne sont pas en jeu."
 ],
 [
  "plaguedoctor",
  "boomdandy",
  "Si le Conteur acquiert la capacité du Boumdandy, un joueur devient le Boumdandy."
 ],
 [
  "plaguedoctor",
  "spy",
  "Si le Conteur acquiert la capacité de l'Espionne, un Sbire gagne la capacité de l'Espionne et l'apprend."
 ],
 [
  "plaguedoctor",
  "scarletwoman",
  "Si le Conteur acquiert la capacité de la Femme écarlate, un Sbire gagne la capacité de la Femme écarlate et l'apprend."
 ],
 [
  "plaguedoctor",
  "goblin",
  "Si le Conteur acquiert la capacité du Gobelin, un Sbire gagne la capacité du Gobelin et l'apprend."
 ],
 [
  "plaguedoctor",
  "eviltwin",
  "Si le Conteur acquiert la capacité de la Jumelle maléfique, un joueur devient Jumelle maléfique."
 ],
 [
  "plaguedoctor",
  "wraith",
  "Si le Conteur acquiert la capacité du Spectre, un Sbire gagne la capacité de Spectre et l'apprend."
 ],
 [
  "plaguedoctor",
  "fearmonger",
  "Si le Docteur de la peste meurt, un Sbire gagne cette capacité en plus de la sienne, et l'apprend."
 ],
 [
  "heretic",
  "baron",
  "Un seul rôle jinxé peut être en jeu."
 ],
 [
  "heretic",
  "spy",
  "Un seul rôle jinxé peut être en jeu."
 ],
 [
  "heretic",
  "pithag",
  "Un seul rôle jinxé peut être en jeu."
 ],
 [
  "heretic",
  "lleech",
  "Un seul rôle jinxé peut être en jeu."
 ],
 [
  "heretic",
  "godfather",
  "Un seul rôle jinxé peut être en jeu."
 ],
 [
  "heretic",
  "widow",
  "Un seul rôle jinxé peut être en jeu."
 ],
 [
  "butler",
  "organgrinder",
  "Si l'Organiste de rue provoque un vote avec les yeux fermés, le Majordome peut lever la main mais son vote ne compte que si son maître a voté."
 ],
 [
  "ogre",
  "recluse",
  "Si la Recluse s'enregistre comme maléfique pour l'Ogre, l'Ogre apprend qu'il est maléfique."
 ],
 [
  "cerenovus",
  "goblin",
  "Le Cerenovus peut rendre un joueur fou d'être Gobelin."
 ],
 [
  "mastermind",
  "vigormortis",
  "Un Conspirateur qui a sa capacité la conserve si le Vigormortis meurt."
 ],
 [
  "spy",
  "damsel",
  "Si l'Espionne est (ou a été) en jeu, la Demoiselle est empoisonnée."
 ],
 [
  "spy",
  "ogre",
  "L'Espionne s'enregistre comme maléfique pour l'Ogre."
 ],
 [
  "spy",
  "poppygrower",
  "Si le Planteur de pavot est en jeu, l'Espionne ne voit pas le grimoire avant sa mort."
 ],
 [
  "pithag",
  "cultleader",
  "Si la Guenaude transforme un maléfique en Chef de secte, il ne peut pas redevenir bon via sa propre capacité."
 ],
 [
  "pithag",
  "damsel",
  "Si une Guenaude crée une Demoiselle, le Conteur choisit quel joueur deviendra la Demoiselle."
 ],
 [
  "pithag",
  "goon",
  "Si la Guenaude transforme un maléfique en Gros-bras, il ne peut pas redevenir bon via sa propre capacité."
 ],
 [
  "pithag",
  "ogre",
  "Si la Guenaude transforme un maléfique en Ogre, il ne peut pas redevenir bon via sa propre capacité."
 ],
 [
  "pithag",
  "politician",
  "Si la Guenaude transforme un maléfique en Politicien, il ne peut pas redevenir bon via sa propre capacité."
 ],
 [
  "summoner",
  "hatter",
  "L'Invocatrice ne peut pas créer un Démon déjà en jeu. Si elle crée un Démon qui n'est pas en jeu, les morts de ce soir sont aléatoires."
 ],
 [
  "summoner",
  "courtier",
  "Si l'Invocatrice est ivre la 3ᵉ nuit, elle choisit le Démon, mais le Conteur choisit le joueur."
 ],
 [
  "summoner",
  "pithag",
  "Impossible de créer un Démon déjà en jeu. Si elle en crée un qui n'est pas en jeu, les morts de cette nuit sont arbitraires."
 ],
 [
  "summoner",
  "kazali",
  "L'Invocatrice ne peut pas créer un Démon déjà en jeu. Si elle crée un Démon qui n'est pas en jeu, les morts de ce soir sont aléatoires."
 ],
 [
  "summoner",
  "legion",
  "Si l'Invocatrice crée une Légion, la plupart des joueurs (dont tous les maléfiques) deviennent des Légions maléfiques."
 ],
 [
  "summoner",
  "poppygrower",
  "S'il est vivant quand l'Invocatrice agit, l'Invocatrice choisit le Démon, mais le Conteur choisit le joueur."
 ],
 [
  "summoner",
  "preacher",
  "S'il a choisi l'Invocatrice au plus tard la 3ᵉ nuit, l'Invocatrice choisit le Démon, le Conteur choisit le joueur."
 ],
 [
  "summoner",
  "pukka",
  "L'Invocatrice peut choisir un joueur pour qu'il devienne le Pukka dès la deuxième nuit."
 ],
 [
  "summoner",
  "zombuul",
  "Si l'Invocatrice transforme un joueur mort en Zombuul, le Conteur considère ce joueur comme un Zombuul qui est mort une fois."
 ],
 [
  "boffin",
  "cultleader",
  "Si le Démon a la capacité du Chef de secte, il ne peut pas devenir bon via cette capacité."
 ],
 [
  "boffin",
  "goon",
  "Si le Démon a la capacité du Gros-bras, il ne peut pas redevenir bon via cette capacité."
 ],
 [
  "boffin",
  "heretic",
  "Le Démon ne peut pas avoir la capacité d'Hérétique."
 ],
 [
  "boffin",
  "ogre",
  "Le Démon ne peut pas avoir la capacité d'Ogre."
 ],
 [
  "boffin",
  "politician",
  "Le Démon ne peut pas avoir la capacité de Politicien."
 ],
 [
  "widow",
  "damsel",
  "Si la Veuve est (ou a été) en jeu, la Demoiselle est empoisonnée."
 ],
 [
  "widow",
  "poppygrower",
  "Si le Planteur de pavot est en jeu, la Veuve ne voit pas le grimoire avant sa mort."
 ],
 [
  "vizier",
  "alsaahir",
  "Le Conteur n'annonce pas que le Vizir est en jeu."
 ],
 [
  "vizier",
  "courtier",
  "Si le Vizir perd sa capacité, il l'apprend. S'il est exécuté alors qu'il l'a, son équipe gagne."
 ],
 [
  "vizier",
  "investigator",
  "Le Conteur n'annonce pas que le Vizir est en jeu."
 ],
 [
  "vizier",
  "fearmonger",
  "Le Vizir se réveille avec lui, apprend sa cible et ne peut pas choisir de l'exécuter immédiatement."
 ],
 [
  "vizier",
  "politician",
  "Le Politicien peut s'enregistrer comme maléfique pour le Vizir."
 ],
 [
  "vizier",
  "preacher",
  "Si le Vizir perd son pouvoir, il l'apprend. S'il est exécuté alors qu'il possède encore son pouvoir, son équipe gagne."
 ],
 [
  "vizier",
  "zealot",
  "Le Zélote peut s'enregistrer comme maléfique pour le Vizir."
 ],
 [
  "alhadikhia",
  "mastermind",
  "Si Al-Hadikhia meurt exécuté et que le Conspirateur est vivant, Al-Hadikhia choisit trois Bons cette nuit : si tous choisissent de vivre, le Mal gagne, sinon le Bien gagne."
 ],
 [
  "alhadikhia",
  "princess",
  "Si la Princesse a nommé et exécuté un joueur lors de son 1er jour, personne ne meurt de l'Al-Hadikhia cette nuit."
 ],
 [
  "riot",
  "innkeeper",
  "Si l'Émeute est en jeu, le joueur protégé par l'Aubergiste est à l'abri de toutes les capacités maléfiques."
 ],
 [
  "riot",
  "banshee",
  "Chaque nuit*, l'Émeute choisit un joueur bon en vie : une Banshee choisie meurt et gagne sa capacité."
 ],
 [
  "riot",
  "farmer",
  "Chaque nuit*, l'Émeute choisit un joueur bon en vie : une Fermière choisie déclenche sa capacité mais ne meurt pas."
 ],
 [
  "riot",
  "ravenkeeper",
  "Chaque nuit*, l'Émeute choisit un joueur bon en vie : une Corneille choisie utilise sa capacité mais ne meurt pas."
 ],
 [
  "riot",
  "king",
  "S'il y a au moins un mort, le Roi apprend un rôle vivant chaque nuit."
 ],
 [
  "riot",
  "mayor",
  "Le Maire peut stopper les nominations. S'il le fait alors qu'il ne reste qu'une seule Émeute en vie, le Bien gagne ; sinon, les Maléfiques gagnent."
 ],
 [
  "riot",
  "monk",
  "Si une Émeute est en jeu, le joueur protégé par le Moine est à l'abri de toutes les capacités maléfiques."
 ],
 [
  "riot",
  "sage",
  "Chaque nuit*, l'Émeute choisit un joueur bon en vie : un Sage choisi utilise sa capacité mais ne meurt pas."
 ],
 [
  "riot",
  "soldier",
  "Si une Émeute est en jeu, le Soldat est à l'abri de toutes les capacités maléfiques."
 ],
 [
  "legion",
  "hatter",
  "Si la Légion est en jeu, le Chapelier n'a pas de capacité."
 ],
 [
  "legion",
  "minstrel",
  "Si une Légion a été exécutée aujourd'hui, elle garde sa capacité, mais le Ménestrel peut apprendre qu'elle est Légion."
 ],
 [
  "legion",
  "politician",
  "Le Politicien peut s'enregistrer comme maléfique pour la Légion."
 ],
 [
  "legion",
  "preacher",
  "Si le Prédicateur choisit une Légion, elle garde sa capacité, mais le Prédicateur peut apprendre qu'elle est Légion."
 ],
 [
  "legion",
  "zealot",
  "Le Zélote peut s'enregistrer comme maléfique pour la Légion."
 ],
 [
  "leviathan",
  "innkeeper",
  "Si le Léviathan nomme et fait exécuter un joueur protégé par l'Aubergiste, le Bien gagne."
 ],
 [
  "leviathan",
  "banshee",
  "Chaque nuit*, le Léviathan choisit un joueur bon en vie différent des nuits précédentes : une Banshee choisie meurt et gagne sa capacité."
 ],
 [
  "leviathan",
  "ravenkeeper",
  "Chaque nuit*, le Léviathan choisit un joueur en vie différent des nuits précédentes : une Corneille choisie utilise sa capacité mais ne meurt pas."
 ],
 [
  "leviathan",
  "hatter",
  "Le Léviathan ne peut pas entrer en jeu après le jour 5."
 ],
 [
  "leviathan",
  "farmer",
  "Chaque nuit*, le Léviathan choisit un joueur bon en vie différent des nuits précédentes : une Fermière choisie utilise sa capacité mais ne meurt pas."
 ],
 [
  "leviathan",
  "king",
  "Si le Léviathan est en jeu et qu'au moins un joueur est mort, le Roi apprend chaque nuit un rôle en vie."
 ],
 [
  "leviathan",
  "mayor",
  "Si le Léviathan et le Maire sont tous les deux en vie au 5ème jour et qu'aucune exécution n'a lieu ce jour-là, le Bien gagne."
 ],
 [
  "leviathan",
  "monk",
  "Si le Léviathan nomme et exécute le joueur protégé par le Moine, le Bien gagne."
 ],
 [
  "leviathan",
  "sage",
  "Chaque nuit*, le Léviathan choisit un joueur bon en vie différent des nuits précédentes : un Sage choisi utilise sa capacité mais ne meurt pas."
 ],
 [
  "leviathan",
  "soldier",
  "Si le Léviathan nomme et exécute le Soldat, le Bien gagne."
 ],
 [
  "lleech",
  "mastermind",
  "Si le Conspirateur est en vie et que l'hôte du Parasyte meurt exécuté, le Parasyte vit mais perd sa capacité."
 ],
 [
  "lleech",
  "slayer",
  "Si la Pourfendeuse tue l'hôte du Parasyte, l'hôte meurt."
 ],
 [
  "lilmonsta",
  "hatter",
  "Si le Chapelier meurt et que le Démon choisit le Timonstre, il choisit aussi un Sbire à devenir."
 ],
 [
  "lilmonsta",
  "vizier",
  "Si le Vizir garde le Timonstre, il meurt à l'exécution."
 ],
 [
  "vortox",
  "banshee",
  "Si le Vortox est en jeu et que le Démon tue la Banshee, les joueurs apprennent tout de même que la Banshee est morte."
 ]
];
