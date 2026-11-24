// Tests de la logique de déduction et des données.  Lancer : node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { buildScript, createLogic, parseNames } from "../app/js/logic.js";

// Charge les fichiers de données (scripts classiques à « const » globales).
const appDir = fileURLToPath(new URL("../app/", import.meta.url));
const ctxVm = vm.createContext({});
for (const f of ["roles.js", "scripts_imported.js", "scripts.js"]) vm.runInContext(readFileSync(appDir + f, "utf8"), ctxVm, { filename: f });
const D = vm.runInContext("({ ROLES, TEAMS, COMPOSITION, JINXES, SCRIPTS, NIGHT_SPECIALS })", ctxVm);

let n = 0;
const profile = (name, extra = {}) => ({
  id: `p${n++}`, name, explore: false, wake: [], choice: [], team: [], excluded: [],
  dead: false, claim: "", notes: "", align: "", confirmed: "", me: false, unreliable: false, ...extra,
});

// Partie de test sur un scénario donné.
function game(scriptId, names = ["Léa", "Tom", "Marc", "Inès", "Hugo"]) {
  const script = D.SCRIPTS.find((s) => s.id === scriptId);
  const roles = buildScript(script, D.ROLES);
  const ctx = {
    state: {
      profiles: [{ id: "explore", name: "Exploration", explore: true, wake: [], choice: [], team: [], excluded: [] }, ...names.map((x) => profile(x))],
      current: "explore", notInPlay: [], journal: { phase: 0, last: 0, events: [] },
    },
    roles, byId: Object.fromEntries(roles.map((r) => [r.id, r])),
    COMPOSITION: D.COMPOSITION, TEAMS: D.TEAMS, JINXES: D.JINXES,
  };
  const L = createLogic(ctx);
  const [a, b, c, d, e] = L.players();
  return { ctx, L, a, b, c, d, e, r: ctx.byId };
}

// ---------- Données ----------
test("chaque scénario ne contient que des rôles connus, avec un comportement", () => {
  for (const s of D.SCRIPTS) {
    for (const id of s.roles) {
      const r = D.ROLES[id];
      assert.ok(r, `${s.name} : rôle inconnu ${id}`);
      assert.ok(r.derive || (r.wake?.length && r.choice?.length), `${id} : réveil / choix manquants`);
    }
  }
});

test("chaque rôle a une icône", () => {
  for (const id of Object.keys(D.ROLES)) assert.ok(existsSync(`${appDir}icons/roles/${id}.jpg`), `icône manquante : ${id}`);
});

test("les numéros d'ordre de nuit sont des entiers positifs", () => {
  for (const [id, r] of Object.entries(D.ROLES)) {
    for (const k of ["first", "other"]) if (r.night?.[k] != null) assert.ok(Number.isInteger(r.night[k]) && r.night[k] > 0, `${id}.${k}`);
  }
});

// ---------- Scénario ----------
test("buildScript : les rôles dérivés copient les rôles du scénario", () => {
  const roles = buildScript(D.SCRIPTS.find((s) => s.id === "veiled_threats"), D.ROLES);
  const by = Object.fromEntries(roles.map((r) => [r.id, r]));
  assert.ok(by.alchemist.wake.includes("each") && by.alchemist.wake.includes("none"), "Alchimiste = Sbires");
  assert.deepEqual([...by.lunatic.wake].sort(), ["each", "notfirst"], "Lunatique = Démons");
  assert.ok(by.drunk.choice.includes("two"), "Ivrogne = Villageois");
  assert.match(by.fortuneteller.note, /Règle maison/, "note propre au scénario");
});

// ---------- Déduction ----------
test("cellState : écarté, confirmé, pris par un autre, absent, filtres", () => {
  const { L, a, b, r, ctx } = game("trouble_brewing");
  assert.equal(L.cellState(a, r.imp), "maybe");
  a.excluded.push("imp");
  assert.equal(L.cellState(a, r.imp), "no");
  b.confirmed = "chef";
  assert.equal(L.cellState(b, r.chef), "yes");
  assert.equal(L.cellState(b, r.empath), "auto", "confirmé ailleurs → le reste est exclu");
  assert.equal(L.cellState(a, r.chef), "auto", "rôle pris par un autre joueur");
  ctx.state.notInPlay.push("baron");
  assert.equal(L.cellState(a, r.baron), "auto", "rôle absent de la partie");
  a.wake = ["none"];
  assert.equal(L.cellState(a, r.empath), "auto", "filtre de réveil");
  assert.equal(L.cellState(a, r.soldier), "maybe");
});

test("possible : compte les rôles encore possibles", () => {
  const { L, a, ctx } = game("trouble_brewing");
  assert.equal(L.possible(a).length, 22);
  ctx.state.notInPlay = ["imp", "baron"];
  a.excluded = ["chef"];
  assert.equal(L.possible(a).length, 19);
});

test("neighbours : saute les morts et fait le tour de la table", () => {
  const { L, a, b, c, d, e } = game("trouble_brewing");
  assert.deepEqual(L.neighbours(a), [e, b]);
  e.dead = true;
  assert.deepEqual(L.neighbours(a), [d, b]);
  b.dead = true;
  assert.deepEqual(L.neighbours(a), [d, c]);
});

test("movePlayer : déplace un joueur dans l'ordre de la table", () => {
  const { L, a, b, c } = game("trouble_brewing");
  L.movePlayer(0, 2);
  assert.deepEqual(L.players().slice(0, 3), [b, c, a]);
  L.movePlayer(2, 0);
  assert.deepEqual(L.players().slice(0, 3), [a, b, c]);
});

// ---------- Vérifications ----------
test("checks : double annonce, rôle confirmé deux fois, répartition", () => {
  const { L, a, b, c, d } = game("pies_baking");
  a.claim = "empath"; b.claim = "empath";
  c.confirmed = "chef"; d.confirmed = "chef";
  const texts = L.checks().map((x) => x.text).join("\n");
  assert.match(texts, /annoncent Empathe/);
  assert.match(texts, /Cuisinier est confirmé chez plusieurs joueurs/);
});

test("composition : Marginaux annoncés au-delà de la répartition (5 joueurs → 0)", () => {
  const { L, a } = game("trouble_brewing");
  a.claim = "saint";
  const c = L.composition();
  assert.deepEqual([...c.base], [3, 0, 1, 1]); // tableau venant du contexte vm
  assert.equal(c.claimed[1], 1);
  assert.match(L.checks().map((x) => x.text).join("\n"), /1 Marginaux annoncés pour 0 prévus/);
});

// ---------- Journal ----------
test("journal : morts, votes requis et vote fantôme", () => {
  const { L, a, b, c, d, ctx } = game("trouble_brewing");
  const ev = ctx.state.journal.events;
  ev.push({ id: "1", phase: 1, type: "nom", by: a.id, target: b.id, voters: [a.id, c.id, d.id], executed: true });
  ev.push({ id: "2", phase: 3, type: "nom", by: c.id, target: d.id, voters: [b.id], executed: false });
  assert.equal(L.votesNeeded(ev[0]), 3, "5 vivants → 3 votes");
  assert.equal(L.votesNeeded(ev[1]), 2, "4 vivants → 2 votes");
  assert.ok(L.deadBefore(ev[1]).has(b.id));
  assert.equal(L.ghostUsed(b), true);
  assert.equal(L.ghostUsed(a), false);
});

// ---------- Saisie ----------
test("parseNames : une liste collée devient des noms propres", () => {
  assert.deepEqual(parseNames("1. Léa\n2) Tom\n\n  Marc  \nInès, Hugo; Zoé"), ["Léa", "Tom", "Marc", "Inès", "Hugo", "Zoé"]);
  assert.deepEqual(parseNames(""), []);
});
