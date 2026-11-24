// Infos saisies en données : formats possibles et modèle par rôle.
// Module pur (sans DOM), partagé par la logique et le Journal.
//
// Champs d'une info structurée (évènement du journal de type "info") :
//   kind     — format (voir KINDS)
//   players  — joueurs désignés (ids)
//   role     — rôle désigné · roles — 2 rôles (format "among")
//   num      — nombre · yes — oui / non · none — « aucun Marginal en jeu »
//   q        — question oui / non · demon — un « non » écarte le Démon
//   text     — complément libre (facultatif)

export const KINDS = {
  pair: "Un de ces joueurs est…",
  is: "Ce joueur est…",
  among: "Ce joueur est l'un de ces 2 rôles",
  notdemon: "Ces joueurs ne sont pas le Démon",
  demonamong: "Le Démon est parmi ces joueurs",
  good: "Ce joueur est bon",
  yesno: "Oui / non",
  number: "Un nombre",
  players: "Des joueurs",
  free: "Texte libre",
};

// Modèle par rôle : format, nombre de joueurs à choisir, équipe du rôle vu…
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
export const TEMPLATES = {
  washerwoman: { kind: "pair", n: 2, team: "townsfolk" },
  librarian: { kind: "pair", n: 2, team: "outsider", allowNone: true },
  investigator: { kind: "pair", n: 2, team: "minion" },
  undertaker: { kind: "is", n: 1 },
  ravenkeeper: { kind: "is", n: 1 },
  grandmother: { kind: "is", n: 1 },
  dreamer: { kind: "among", n: 1 },
  fortuneteller: { kind: "yesno", n: 2, q: "Un Démon parmi eux ?", demon: true },
  seamstress: { kind: "yesno", n: 2, q: "Même alignement ?" },
  flowergirl: { kind: "yesno", n: 0, q: "Un Démon a voté ?" },
  towncrier: { kind: "yesno", n: 0, q: "Un Sbire a nominé ?" },
  knight: { kind: "notdemon", n: 2 },
  sage: { kind: "demonamong", n: 2 },
  steward: { kind: "good", n: 1 },
  empath: { kind: "number", max: 2, neighbours: true, unit: (n) => `${plural(n, "voisin mauvais", "voisins mauvais")}` },
  chef: { kind: "number", max: 5, unit: (n) => `${plural(n, "paire maléfique", "paires maléfiques")}` },
  clockmaker: { kind: "number", max: 7, unit: (n) => `Démon à ${plural(n, "place", "places")} du Sbire le plus proche` },
  oracle: { kind: "number", max: 7, unit: (n) => `${plural(n, "mort maléfique", "morts maléfiques")}` },
  mathematician: { kind: "number", max: 7, unit: (n) => `${plural(n, "capacité a dysfonctionné", "capacités ont dysfonctionné")}` },
  chambermaid: { kind: "number", n: 2, max: 2, unit: (n) => `${plural(n, "s'est réveillé", "se sont réveillés")}` },
  juggler: { kind: "number", max: 5, unit: (n) => `${plural(n, "bonne réponse", "bonnes réponses")}` },
  noble: { kind: "players", n: 3, label: "dont 1 seul maléfique" },
  balloonist: { kind: "players", n: 1 },
  highpriestess: { kind: "players", n: 1, label: "à qui parler" },
};

// Nombre de joueurs à désigner pour un format (si pas de modèle).
export const DEFAULT_N = { pair: 2, is: 1, among: 1, notdemon: 2, demonamong: 2, good: 1, yesno: 0, number: 0, players: 1, free: 0 };

// Modèle effectif : celui du rôle, ou un modèle par défaut pour le format choisi.
export function templateFor(roleId, kind) {
  const t = TEMPLATES[roleId];
  if (t && (!kind || kind === t.kind)) return { ...t };
  const k = kind || "free";
  return { kind: k, n: DEFAULT_N[k], max: 7, unit: (n) => String(n), q: "Oui ?" };
}

// Texte lisible d'une info structurée. names(id) → nom ; roleName(id) → nom du rôle.
export function describeInfo(e, names, roleName) {
  const ps = (e.players || []).map(names);
  const list = (arr, sep = ", ", last = " et ") => arr.length > 1 ? `${arr.slice(0, -1).join(sep)}${last}${arr[arr.length - 1]}` : arr[0] || "?";
  const t = templateFor(e.sourceRole, e.kind);
  switch (e.kind) {
    case "pair": return e.none ? "Aucun Marginal en jeu" : `${list(ps, ", ", " ou ")} : l'un est ${roleName(e.role)}`;
    case "is": return `${ps[0] || "?"} est ${roleName(e.role)}`;
    case "among": return `${ps[0] || "?"} est ${roleName(e.roles?.[0])} ou ${roleName(e.roles?.[1])}`;
    case "notdemon": return `${list(ps)} ${ps.length > 1 ? "ne sont pas" : "n'est pas"} le Démon`;
    case "demonamong": return `Le Démon est ${list(ps, ", ", " ou ")}`;
    case "good": return `${ps[0] || "?"} est bon`;
    case "yesno": return `${ps.length ? `${list(ps)} — ` : ""}${e.q || t.q} ${e.yes ? "Oui" : "Non"}`;
    case "number": return `${t.unit(e.num)}${ps.length ? ` (${list(ps)})` : ""}`;
    case "players": return `${list(ps)}${t.label ? ` — ${t.label}` : ""}`;
    default: return "";
  }
}
