// Logique pure du carnet (aucun accès au DOM) : testable avec `node --test`.
//
// createLogic(ctx) lit, au moment de chaque appel :
//   ctx.state  — l'état de la partie (profiles, current, notInPlay, journal…)
//   ctx.roles  — rôles effectifs du scénario (voir buildScript)
//   ctx.byId   — ces rôles indexés par id
//   ctx.COMPOSITION, ctx.TEAMS, ctx.JINXES — données de référence

const union = (lists) => [...new Set(lists.flat())];

// Rôles effectifs d'un scénario : notes propres au scénario et comportements
// dérivés (Alchimiste, Lunatique, Ivrogne…) calculés à partir des autres rôles.
export function buildScript(script, ROLES) {
  const ids = script.roles.filter((id) => ROLES[id]);
  const resolved = {};
  const resolve = (id, stack = []) => {
    if (resolved[id]) return resolved[id];
    const base = ROLES[id];
    let wake = base.wake || [], choice = base.choice || [], extra = "";
    if (base.derive) {
      const sources = ids.filter((x) => x !== id && ROLES[x].team === base.derive && !stack.includes(x));
      const res = sources.map((x) => resolve(x, [...stack, id]));
      wake = union(res.map((r) => r.wake));
      choice = union(res.map((r) => r.choice));
      if (base.derive !== "townsfolk" && sources.length) extra = `Ici : ${sources.map((x) => ROLES[x].name).join(", ")}.`;
    }
    const note = [base.note, extra, script.roleNotes?.[id]].filter(Boolean).join(" ");
    return (resolved[id] = { id, ...base, wake, choice, note });
  };
  return ids.map((id) => resolve(id));
}

export const phaseName = (i) => `${i % 2 ? "Jour" : "Nuit"} ${Math.floor(i / 2) + 1}`;
export const phaseShort = (i) => `${i % 2 ? "J" : "N"}${Math.floor(i / 2) + 1}`;

export function createLogic(ctx) {
  const S = () => ctx.state;
  const L = {};

  L.cur = () => S().profiles.find((p) => p.id === S().current) || S().profiles[0];
  // Joueurs dans l'ordre de la table (sens horaire), sans le profil d'exploration.
  L.players = () => S().profiles.filter((p) => !p.explore);
  L.confirmedOf = (p) => (ctx.byId[p.confirmed] ? p.confirmed : "");

  // ---------- Filtrage / déduction ----------
  L.matches = (role, p) => {
    if (p.wake.length && !role.wake.some((w) => p.wake.includes(w))) return false;
    if (p.choice.length && !role.choice.some((c) => p.choice.includes(c))) return false;
    if (p.team.length && !p.team.includes(role.team)) return false;
    return true;
  };
  // Rôle absent de la partie : exclu pour tous les joueurs.
  L.isOut = (rid) => (S().notInPlay || []).includes(rid);
  // Joueur (autre que p) dont ce rôle est confirmé.
  L.takenBy = (rid, p) => (p.explore ? null : L.players().find((o) => o !== p && L.confirmedOf(o) === rid));
  // État d'une case joueur × rôle :
  //   yes = confirmé · no = écarté à la main · ded = déduit d'une info du journal
  //   auto = exclu (filtres, rôle absent ou pris) · maybe = possible
  L.cellState = (p, r) => {
    const conf = L.confirmedOf(p);
    if (conf === r.id) return "yes";
    if (p.excluded.includes(r.id)) return "no";
    if (L.isOut(r.id)) return "auto";
    if (L.deducedWhy(p, r.id)) return "ded";
    if (conf || !L.matches(r, p) || L.takenBy(r.id, p)) return "auto";
    return "maybe";
  };
  L.isPossible = (p, r) => { const s = L.cellState(p, r); return s === "yes" || s === "maybe"; };
  L.possible = (p) => ctx.roles.filter((r) => L.isPossible(p, r));
  // Rôles bons (Villageois + Marginaux) encore possibles : un Mauvais annonce
  // toujours un rôle bon, c'est donc ce nombre qui aide à démasquer.
  L.possibleGood = (p) => L.possible(p).filter((r) => r.team === "townsfolk" || r.team === "outsider");

  // ---------- Déductions tirées des infos structurées du journal ----------
  // Map « idJoueur|idRôle » → origine (« Léa, N1 »). Les infos d'un joueur marqué
  // « ivre / empoisonné ? » sont ignorées. Calcul mis en cache : L.invalidate()
  // après chaque modification (fait par le rendu).
  let dedCache = null;
  L.invalidate = () => { dedCache = null; };
  L.deductions = () => {
    if (dedCache) return dedCache;
    const map = new Map(), ps = L.players(), roles = ctx.roles;
    const team = (t) => roles.filter((r) => r.team === t).map((r) => r.id);
    const demons = team("demon"), evil = [...team("minion"), ...demons];
    for (const e of L.ordered()) {
      if (e.type !== "info" || !e.kind) continue;
      const src = S().profiles.find((x) => x.id === e.player);
      if (src?.unreliable) continue;
      const why = `${src ? src.name : "?"}, ${phaseShort(e.phase)}`;
      const add = (p, rid) => { const k = `${p.id}|${rid}`; if (!map.has(k)) map.set(k, why); };
      const sel = e.players || [], inSel = (p) => sel.includes(p.id);
      if (e.kind === "pair") {
        if (e.none) ps.forEach((p) => team("outsider").forEach((rid) => add(p, rid)));
        else if (e.role) ps.filter((p) => !inSel(p)).forEach((p) => add(p, e.role));
      } else if (e.kind === "is" && e.role && sel[0]) {
        ps.forEach((p) => (p.id === sel[0] ? roles.forEach((r) => r.id !== e.role && add(p, r.id)) : add(p, e.role)));
      } else if (e.kind === "among" && sel[0] && e.roles?.filter(Boolean).length) {
        ps.filter(inSel).forEach((p) => roles.forEach((r) => !e.roles.includes(r.id) && add(p, r.id)));
      } else if (e.kind === "notdemon" || (e.kind === "yesno" && e.demon && e.yes === false)) {
        ps.filter(inSel).forEach((p) => demons.forEach((rid) => add(p, rid)));
      } else if (e.kind === "demonamong" && sel.length) {
        ps.filter((p) => !inSel(p)).forEach((p) => demons.forEach((rid) => add(p, rid)));
      } else if (e.kind === "good") {
        ps.filter(inSel).forEach((p) => evil.forEach((rid) => add(p, rid)));
      }
    }
    return (dedCache = map);
  };
  L.deducedWhy = (p, rid) => (p.explore ? null : L.deductions().get(`${p.id}|${rid}`) || null);

  // Voisins vivants les plus proches (gauche = sens anti-horaire, droite = sens horaire).
  L.neighbours = (p) => {
    const ps = L.players(), n = ps.length, i = ps.indexOf(p);
    if (i < 0 || n < 2) return [null, null];
    const find = (dir) => {
      for (let k = 1; k < n; k++) {
        const o = ps[(i + dir * k + n * k) % n];
        if (o !== p && !o.dead) return o;
      }
      return null;
    };
    return [find(-1), find(1)];
  };

  // ---------- Vérifications de cohérence ----------
  // Modificateurs de répartition des rôles du scénario (« [+2 Marginaux] »…).
  L.setupModifiers = () => ctx.roles.flatMap((r) => {
    const m = r.ability.match(/\[([^\]]*\d[^\]]*)\]/);
    return m ? [{ role: r, text: m[1].replace(/\s+/g, " ").trim() }] : [];
  });
  L.shownRole = (p) => ctx.byId[L.confirmedOf(p)] || ctx.byId[p.claim] || null;

  // Répartition prévue vs rôles annoncés / confirmés, par équipe.
  L.composition = () => {
    const ps = L.players(), base = ctx.COMPOSITION[ps.length];
    if (!base) return null;
    const claimed = ctx.TEAMS.map((t) => ps.filter((p) => L.shownRole(p)?.team === t.id).length);
    return { n: ps.length, base, claimed, unknown: ps.filter((p) => !L.shownRole(p)).length };
  };

  // Liste d'alertes : { lvl: "bad" | "warn" | "info", text }
  L.checks = () => {
    const ps = L.players(), out = [], byId = ctx.byId;
    const names = (list) => list.map((p) => p.name).join(", ");
    const group = (key) => {
      const m = {};
      ps.forEach((p) => { const v = key(p); if (v) (m[v] = m[v] || []).push(p); });
      return Object.entries(m).filter(([, l]) => l.length > 1);
    };
    group(L.confirmedOf).forEach(([rid, l]) =>
      out.push({ lvl: "bad", text: `${byId[rid].name} est confirmé chez plusieurs joueurs : ${names(l)}.` }));
    group((p) => (byId[p.claim] ? p.claim : "")).forEach(([rid, l]) =>
      out.push({ lvl: "warn", text: `${names(l)} annoncent ${byId[rid].name} : au moins ${l.length - 1} ment${l.length > 2 ? "ent" : ""} (ou un Ivrogne / Marionnette…).` }));
    ps.forEach((p) => {
      const claim = byId[p.claim], conf = L.confirmedOf(p);
      if (!L.possible(p).length) out.push({ lvl: "bad", text: `Plus aucun rôle possible pour ${p.name} : une de vos infos est fausse.` });
      if (claim && !L.isPossible(p, claim) && !(conf && conf !== claim.id))
        out.push({ lvl: "warn", text: `${p.name} annonce ${claim.name}, incompatible avec vos déductions.` });
      if (claim && conf && conf !== claim.id)
        out.push({ lvl: "info", text: `${p.name} a annoncé ${claim.name} mais est ${byId[conf].name}.` });
    });
    const c = L.composition();
    if (c) {
      const [bt, bo] = c.base, [ct, co, cm, cd] = c.claimed;
      const mods = L.setupModifiers().length ? " Un modificateur de répartition peut l'expliquer (voir ci-dessous)." : "";
      const liars = (k) => ` Au moins ${k} ment${k > 1 ? "ent" : ""}.`;
      if (co > bo) out.push({ lvl: "warn", text: `${co} Marginaux annoncés pour ${bo} prévus.${mods || liars(co - bo)}` });
      if (ct > bt) out.push({ lvl: "warn", text: `${ct} Villageois annoncés pour ${bt} prévus.${mods || liars(ct - bt)}` });
      if (cm + cd) out.push({ lvl: "info", text: `${cm + cd} joueur(s) annoncé(s) ou confirmé(s) maléfique(s).` });
    }
    return out;
  };

  // Jinxes du scénario : [a, b, texte] dont les deux rôles sont présents.
  L.scriptJinxes = () => {
    const ids = new Set(ctx.roles.map((r) => r.id));
    return (ctx.JINXES || []).filter(([a, b]) => ids.has(a) && ids.has(b));
  };

  // ---------- Journal ----------
  // Évènements : { id, phase, type, ... }
  //   info  : player, text, targets[] · death : player, cause (night|exec|other)
  //   nom   : by, target, voters[], executed · note : text
  L.J = () => S().journal;
  L.pname = (id) => S().profiles.find((p) => p.id === id)?.name || "(joueur supprimé)";
  L.ordered = () => L.J().events.map((e, k) => ({ e, k })).sort((a, b) => a.e.phase - b.e.phase || a.k - b.k).map((x) => x.e);
  L.killOf = (e) => (e.type === "death" ? e.player : e.type === "nom" && e.executed ? e.target : null);
  // Joueurs morts avant un évènement (ou à la fin si ev est absent).
  L.deadBefore = (ev) => {
    const dead = new Set();
    for (const e of L.ordered()) { if (e === ev) break; const k = L.killOf(e); if (k) dead.add(k); }
    return dead;
  };
  L.ghostUsed = (p) => L.J().events.some((e) => e.type === "nom" && e.voters.includes(p.id) && L.deadBefore(e).has(p.id));
  // Votes requis pour exécuter (la moitié des vivants, arrondie au-dessus).
  L.votesNeeded = (ev) => {
    const dead = L.deadBefore(ev);
    return Math.ceil(L.players().filter((p) => !dead.has(p.id)).length / 2);
  };

  // ---------- Joueurs ----------
  // Déplace un joueur de la position `from` à `to` (indices dans l'ordre de la table).
  L.movePlayer = (from, to) => {
    const ps = L.players();
    if (from === to || from < 0 || to < 0 || from >= ps.length || to >= ps.length) return;
    const [p] = ps.splice(from, 1);
    ps.splice(to, 0, p);
    S().profiles = [...S().profiles.filter((x) => x.explore), ...ps];
  };

  return L;
}

// Découpe une liste de noms collée (un par ligne, ou séparés par des virgules / points-virgules).
// Retire les numéros en tête (« 1. Léa », « 2) Tom ») et les doublons vides.
export function parseNames(text) {
  return String(text || "")
    .split(/[\n,;]+/)
    .map((s) => s.replace(/^\s*\d+\s*[.)\-:]?\s*/, "").trim())
    .filter(Boolean);
}
