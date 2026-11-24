// Onglet Journal : phases (nuits / jours) et évènements.
import { app, commit, save } from "./context.js";
import { $, esc, uid } from "./util.js";
import { phaseName, phaseShort } from "./logic.js";
import { describeInfo, KINDS, templateFor, TEMPLATES } from "./infos.js";

const L = app.L;
export const TYPE_LABEL = { info: "Info", death: "Mort", nom: "Nomination", note: "Note" };
const CAUSE = { night: "pendant la nuit", exec: "par exécution", other: "" };

const INFO_BLANK = { kind: "free", sourceRole: "", players: [], role: "", roles: ["", ""], num: null, yes: null, none: false };
let draft = { type: "info", player: "", text: "", targets: [], cause: "night", by: "", target: "", voters: [], executed: false, ...INFO_BLANK };
export function resetDraft(type) {
  draft = { ...draft, ...INFO_BLANK, type: type || (L.J().phase % 2 ? "nom" : "info"), player: "", text: "", targets: [], by: "", target: "", voters: [], executed: false, cause: L.J().phase % 2 ? "exec" : "night" };
}
// Choisit le modèle d'info d'après le rôle annoncé / confirmé de la source.
function applySource() {
  const p = app.state.profiles.find((x) => x.id === draft.player);
  const r = p && L.shownRole(p);
  Object.assign(draft, INFO_BLANK, { sourceRole: r?.id || "", kind: (r && TEMPLATES[r.id]?.kind) || "free" });
  if (r && TEMPLATES[r.id]?.neighbours) draft.players = L.neighbours(p).filter(Boolean).map((x) => x.id);
}
const roleName = (id) => app.byId[id]?.name || ROLES[id]?.name || "?";

export function evText(e) {
  const b = (id) => `<b class="pn">${esc(L.pname(id))}</b>`;
  if (e.type === "info") {
    const structured = e.kind && e.kind !== "free";
    const desc = structured ? esc(describeInfo(e, L.pname, roleName)) : "";
    const t = !structured && e.targets.length ? ` <span class="muted">→ ${e.targets.map(L.pname).map(esc).join(", ")}</span>` : "";
    const src = app.state.profiles.find((x) => x.id === e.player);
    const unrel = src?.unreliable ? ` <span class="tag warn">ivre / empoisonné ?</span>` : "";
    const extra = e.text ? `${desc ? " — " : ""}${esc(e.text)}` : "";
    return `${e.player ? b(e.player) + " : " : ""}${desc}${extra}${t}${unrel}`;
  }
  if (e.type === "death") return `${b(e.player)} meurt ${CAUSE[e.cause] || ""}`.trim() + ".";
  if (e.type === "nom") {
    const dead = L.deadBefore(e);
    const voters = e.voters.map((v) => esc(L.pname(v)) + (dead.has(v) ? " †" : "")).join(", ");
    return `${b(e.by)} nomine ${b(e.target)} — <b>${e.voters.length}</b> vote${e.voters.length > 1 ? "s" : ""} (${L.votesNeeded(e)} requis)` +
      (voters ? ` <span class="muted">: ${voters}</span>` : "") +
      (e.executed ? ` <span class="tag evil">Exécuté</span>` : "");
  }
  return esc(e.text);
}

// Évènements du journal qui concernent un joueur.
export function playerHistory(p) {
  return L.ordered().flatMap((e) => {
    const ph = `<b>${phaseShort(e.phase)}</b> `;
    if (e.type === "info" && (e.player === p.id || e.targets.includes(p.id))) return [ph + evText(e)];
    if (e.type === "death" && e.player === p.id) return [ph + evText(e)];
    if (e.type === "nom") {
      if (e.by === p.id || e.target === p.id) return [ph + evText(e)];
      if (e.voters.includes(p.id)) return [`${ph}A voté pour la nomination de <b>${esc(L.pname(e.target))}</b>${L.deadBefore(e).has(p.id) ? " (vote fantôme)" : ""}.`];
    }
    return [];
  });
}

// Effet d'une info sur la grille, en clair.
function effectText(d, t) {
  const r = roleName(d.role);
  switch (d.kind) {
    case "pair": return d.none ? "Écartera tous les Marginaux pour tous les joueurs." : d.role ? `Écartera ${r} pour tous les autres joueurs.` : "";
    case "is": return d.role ? `Seul rôle possible pour ce joueur : ${r} ; écarté pour les autres.` : "";
    case "among": return "Seuls ces 2 rôles resteront possibles pour ce joueur.";
    case "notdemon": return "Écartera les Démons pour ces joueurs.";
    case "demonamong": return "Écartera les Démons pour tous les autres joueurs.";
    case "good": return "Écartera Sbires et Démons pour ce joueur.";
    case "yesno": return t.demon ? "Si « Non » : écartera les Démons pour ces joueurs." : "Noté dans le journal (pas d'effet sur la grille).";
    case "free": return "";
    default: return "Noté dans le journal (pas d'effet sur la grille).";
  }
}

function infoForm(opts, chips) {
  const d = draft, t = templateFor(d.sourceRole, d.kind);
  const roleOpts = (sel, team) => `<option value="">— Rôle —</option>` + TEAMS.filter((x) => !team || x.id === team).map((x) => {
    const rs = app.roles.filter((r) => r.team === x.id);
    return rs.length ? `<optgroup label="${x.label}">${rs.map((r) => `<option value="${r.id}" ${sel === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</optgroup>` : "";
  }).join("");
  const n = t.n ?? 0;
  const pickLabel = n ? `Joueur${n > 1 ? "s" : ""} désigné${n > 1 ? "s" : ""} <span class="muted">(${n})</span>` : "Joueurs désignés";
  const fields = [];
  if (d.kind !== "free" && (n > 0 || ["notdemon", "demonamong", "players", "good"].includes(d.kind)))
    if (!(d.kind === "pair" && d.none)) fields.push(`<label class="field">${pickLabel}</label>${chips("data-pp", d.players)}`);
  if (d.kind === "pair") {
    if (t.allowNone) fields.push(`<label class="switch" style="margin-top:8px"><input type="checkbox" data-d="none" ${d.none ? "checked" : ""}> Aucun Marginal en jeu</label>`);
    if (!d.none) fields.push(`<label class="field">Rôle vu<select data-d="role">${roleOpts(d.role, t.team)}</select></label>`);
  }
  if (d.kind === "is") fields.push(`<label class="field">Rôle<select data-d="role">${roleOpts(d.role)}</select></label>`);
  if (d.kind === "among") fields.push(`<div class="two">
      <label class="field">Rôle 1<select data-d="roles0">${roleOpts(d.roles[0])}</select></label>
      <label class="field">Rôle 2<select data-d="roles1">${roleOpts(d.roles[1])}</select></label></div>`);
  if (d.kind === "yesno") fields.push(`<label class="field">${esc(t.q)}</label>
      <div class="segmented"><button type="button" class="seg ${d.yes === true ? "on" : ""}" data-yes="1">Oui</button>
      <button type="button" class="seg ${d.yes === false ? "on" : ""}" data-yes="0">Non</button></div>`);
  if (d.kind === "number") fields.push(`<label class="field">Nombre</label><div class="pick">${Array.from({ length: (t.max ?? 7) + 1 }, (_, i) =>
      `<button type="button" class="pk num ${d.num === i ? "on" : ""}" data-num="${i}">${i}</button>`).join("")}</div>`);
  const eff = effectText(d, t);
  const kindOpts = Object.entries(KINDS).map(([k, l]) => `<option value="${k}" ${d.kind === k ? "selected" : ""}>${esc(l)}</option>`).join("");
  return `
    <label class="field">Qui ?<select data-d="player">${opts(d.player)}</select></label>
    <label class="field">Format${d.sourceRole && TEMPLATES[d.sourceRole] ? ` <span class="muted">— modèle ${esc(roleName(d.sourceRole))}</span>` : ""}<select data-d="kind">${kindOpts}</select></label>
    ${fields.join("")}
    <label class="field">${d.kind === "free" ? "Information" : "Complément (facultatif)"}<textarea data-d="text" rows="2" placeholder="${d.kind === "free" ? "Ce qu'il a appris ou annoncé…" : "Précision, doute…"}">${esc(d.text)}</textarea></label>
    ${eff ? `<p class="effect">${esc(eff)}</p>` : ""}`;
}

export function renderJournal() {
  const j = L.J(), ps = L.players();
  const opts = (sel) => `<option value="">— Choisir —</option>` +
    ps.map((p) => `<option value="${p.id}" ${sel === p.id ? "selected" : ""}>${esc(p.name)}${p.dead ? " †" : ""}</option>`).join("");
  const chips = (attr, selected, mark) => `<div class="pick">${ps.map((p) =>
    `<button type="button" class="pk ${selected.includes(p.id) ? "on" : ""} ${mark ? mark(p) : ""}" ${attr}="${p.id}">${esc(p.name)}${p.dead ? " †" : ""}</button>`).join("")}</div>`;

  let form = "";
  if (draft.type === "info") form = infoForm(opts, chips);
  if (draft.type === "death") form = `
    <label class="field">Qui ?<select data-d="player">${opts(draft.player)}</select></label>
    <label class="field">Cause<select data-d="cause">
      <option value="night" ${draft.cause === "night" ? "selected" : ""}>Pendant la nuit</option>
      <option value="exec" ${draft.cause === "exec" ? "selected" : ""}>Par exécution</option>
      <option value="other" ${draft.cause === "other" ? "selected" : ""}>Autre (capacité de jour…)</option>
    </select></label>`;
  if (draft.type === "nom") form = `
    <div class="two">
      <label class="field">Nominateur<select data-d="by">${opts(draft.by)}</select></label>
      <label class="field">Nominé<select data-d="target">${opts(draft.target)}</select></label>
    </div>
    <label class="field">Votants <span class="muted">— ${draft.voters.length} vote(s), ${L.votesNeeded(null)} requis</span></label>
    ${chips("data-vt", draft.voters, (p) => (p.dead && L.ghostUsed(p) ? "spent" : ""))}
    <label class="switch" style="margin-top:10px"><input type="checkbox" data-d="executed" ${draft.executed ? "checked" : ""}> Exécuté</label>`;
  if (draft.type === "note") form = `<label class="field">Note<textarea data-d="text" rows="3" placeholder="Ce qui s'est dit, une intuition…">${esc(draft.text)}</textarea></label>`;

  const phases = Array.from({ length: j.last + 1 }, (_, i) =>
    `<button type="button" class="ph-chip ${i === j.phase ? "on" : ""} ${i % 2 ? "day" : "night"}" data-phase="${i}">${phaseShort(i)}</button>`).join("");
  const timeline = Array.from({ length: j.last + 1 }, (_, i) => j.last - i).map((i) => {
    const evs = j.events.filter((e) => e.phase === i);
    return `<section class="ph-block ${i === j.phase ? "current" : ""}">
      <h3>${phaseName(i)}</h3>
      ${evs.length ? `<ul class="events">${evs.map((e) => `
        <li class="ev ev-${e.type}"><span class="tag">${TYPE_LABEL[e.type]}${e.sourceRole ? ` · ${esc(roleName(e.sourceRole))}` : ""}</span><span class="txt">${evText(e)}</span>
        <button type="button" class="del" data-del="${e.id}" aria-label="Supprimer">×</button></li>`).join("")}</ul>`
        : `<p class="muted small">Rien de noté.</p>`}
    </section>`;
  }).join("");

  $("#journal-view").innerHTML = `
    <div class="phase-bar">
      <div class="phases">${phases}</div>
      <div class="row" style="margin:0">
        <button type="button" class="ghost" id="j-summary">Copier le résumé</button>
        <button type="button" class="ghost" id="j-next">Passer au ${phaseName(j.last + 1).toLowerCase()} →</button>
      </div>
    </div>
    <div class="panel j-form">
      <h2>Ajouter — ${phaseName(j.phase)}</h2>
      <div class="segmented">${Object.entries(TYPE_LABEL).map(([k, l]) =>
        `<button type="button" class="seg ${draft.type === k ? "on" : ""}" data-jtype="${k}">${l}</button>`).join("")}</div>
      ${ps.length ? form : `<p class="intro">Ajoutez d'abord des joueurs.</p>`}
      <div class="row"><button type="button" class="primary" id="j-add">Ajouter au journal</button><span class="muted small" id="j-msg"></span></div>
    </div>
    <div class="timeline">${timeline}</div>`;
}

function addEvent() {
  const d = draft, e = { id: uid(), phase: L.J().phase, type: d.type };
  const msg = (t) => { $("#j-msg").textContent = t; };
  if (d.type === "info") {
    const err = infoError(d);
    if (err) return msg(err);
    const t = templateFor(d.sourceRole, d.kind);
    Object.assign(e, {
      player: d.player, text: d.text.trim(), kind: d.kind, sourceRole: d.sourceRole,
      players: d.kind === "pair" && d.none ? [] : d.players, targets: d.kind === "pair" && d.none ? [] : d.players,
      role: d.role, roles: d.roles, num: d.num, yes: d.yes, none: d.none,
      q: d.kind === "yesno" ? t.q : undefined, demon: !!(d.kind === "yesno" && t.demon),
    });
  }
  if (d.type === "death") { if (!d.player) return msg("Choisissez le joueur."); Object.assign(e, { player: d.player, cause: d.cause }); }
  if (d.type === "nom") { if (!d.by || !d.target) return msg("Choisissez nominateur et nominé."); Object.assign(e, { by: d.by, target: d.target, voters: d.voters, executed: d.executed }); }
  if (d.type === "note") { if (!d.text.trim()) return msg("Écrivez la note."); e.text = d.text.trim(); }
  L.J().events.push(e);
  const k = L.killOf(e);
  if (k) { const p = app.state.profiles.find((x) => x.id === k); if (p) p.dead = true; }
  resetDraft(d.type);
  commit();
}

// Message d'erreur si l'info est incomplète, sinon "".
function infoError(d) {
  const t = templateFor(d.sourceRole, d.kind), n = t.n ?? 0, k = d.players.length;
  if (d.kind === "free") return d.text.trim() ? "" : "Écrivez l'information.";
  if (d.kind === "pair") return d.none ? "" : k !== n ? `Choisissez ${n} joueurs.` : d.role ? "" : "Choisissez le rôle vu.";
  if (d.kind === "is") return k !== 1 ? "Choisissez le joueur." : d.role ? "" : "Choisissez le rôle.";
  if (d.kind === "among") return k !== 1 ? "Choisissez le joueur." : d.roles[0] && d.roles[1] ? "" : "Choisissez les 2 rôles.";
  if (["notdemon", "demonamong", "good", "players"].includes(d.kind)) return k ? "" : "Choisissez au moins un joueur.";
  if (d.kind === "yesno") return n && k !== n ? `Choisissez ${n} joueurs.` : d.yes === null ? "Répondez Oui ou Non." : "";
  if (d.kind === "number") return n && k !== n ? `Choisissez ${n} joueurs.` : d.num === null ? "Choisissez le nombre." : "";
  return "";
}

function deleteEvent(id) {
  const e = L.J().events.find((x) => x.id === id);
  if (!e || !confirm("Supprimer cet évènement du journal ?")) return;
  L.J().events = L.J().events.filter((x) => x !== e);
  const k = L.killOf(e);
  if (k) { const p = app.state.profiles.find((x) => x.id === k); if (p) p.dead = L.J().events.some((x) => L.killOf(x) === k); }
  commit();
}

export function initJournal({ copySummary }) {
  const jv = $("#journal-view");
  jv.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.jtype) { resetDraft(t.dataset.jtype); return renderJournal(); }
    if (t.dataset.phase) { L.J().phase = Number(t.dataset.phase); resetDraft(); save(); return renderJournal(); }
    if (t.id === "j-next") { L.J().last += 1; L.J().phase = L.J().last; resetDraft(); save(); return renderJournal(); }
    if (t.dataset.pp) {
      // Joueurs désignés : on garde au plus n joueurs (les plus récents).
      const n = templateFor(draft.sourceRole, draft.kind).n || 0, id = t.dataset.pp;
      draft.players = draft.players.includes(id) ? draft.players.filter((x) => x !== id) : [...draft.players, id];
      if (n && draft.players.length > n) draft.players = draft.players.slice(-n);
      return renderJournal();
    }
    if (t.dataset.yes) { draft.yes = t.dataset.yes === "1"; return renderJournal(); }
    if (t.dataset.num) { draft.num = Number(t.dataset.num); return renderJournal(); }
    if (t.dataset.tg || t.dataset.vt) {
      const key = t.dataset.tg ? "targets" : "voters", id = t.dataset.tg || t.dataset.vt;
      draft[key] = draft[key].includes(id) ? draft[key].filter((x) => x !== id) : [...draft[key], id];
      return renderJournal();
    }
    if (t.id === "j-add") return addEvent();
    if (t.id === "j-summary") return copySummary();
    if (t.dataset.del) return deleteEvent(t.dataset.del);
  });
  const draftField = (e) => {
    const k = e.target.dataset.d;
    if (!k) return;
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (k === "roles0" || k === "roles1") draft.roles[Number(k.slice(-1))] = v;
    else draft[k] = v;
  };
  jv.addEventListener("input", draftField);
  jv.addEventListener("change", (e) => {
    draftField(e);
    const k = e.target.dataset.d;
    if (draft.type !== "info" || !k) return;
    if (k === "player") applySource();                      // modèle du rôle de la source
    if (k === "kind") { draft.players = []; draft.role = ""; draft.roles = ["", ""]; draft.num = null; draft.yes = null; draft.none = false; }
    if (["player", "kind", "none", "role", "roles0", "roles1"].includes(k)) renderJournal();
  });
  resetDraft();
}
