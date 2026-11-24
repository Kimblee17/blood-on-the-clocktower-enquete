// Onglet Journal : phases (nuits / jours) et évènements.
import { app, commit, save } from "./context.js";
import { $, esc, uid } from "./util.js";
import { phaseName, phaseShort } from "./logic.js";

const L = app.L;
export const TYPE_LABEL = { info: "Info", death: "Mort", nom: "Nomination", note: "Note" };
const CAUSE = { night: "pendant la nuit", exec: "par exécution", other: "" };

let draft = { type: "info", player: "", text: "", targets: [], cause: "night", by: "", target: "", voters: [], executed: false };
export function resetDraft(type) {
  draft = { ...draft, type: type || (L.J().phase % 2 ? "nom" : "info"), player: "", text: "", targets: [], by: "", target: "", voters: [], executed: false, cause: L.J().phase % 2 ? "exec" : "night" };
}

export function evText(e) {
  const b = (id) => `<b class="pn">${esc(L.pname(id))}</b>`;
  if (e.type === "info") {
    const t = e.targets.length ? ` <span class="muted">→ ${e.targets.map(L.pname).map(esc).join(", ")}</span>` : "";
    const src = app.state.profiles.find((x) => x.id === e.player);
    const unrel = src?.unreliable ? ` <span class="tag warn">ivre / empoisonné ?</span>` : "";
    return `${e.player ? b(e.player) + " : " : ""}${esc(e.text)}${t}${unrel}`;
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

export function renderJournal() {
  const j = L.J(), ps = L.players();
  const opts = (sel) => `<option value="">— Choisir —</option>` +
    ps.map((p) => `<option value="${p.id}" ${sel === p.id ? "selected" : ""}>${esc(p.name)}${p.dead ? " †" : ""}</option>`).join("");
  const chips = (attr, selected, mark) => `<div class="pick">${ps.map((p) =>
    `<button type="button" class="pk ${selected.includes(p.id) ? "on" : ""} ${mark ? mark(p) : ""}" ${attr}="${p.id}">${esc(p.name)}${p.dead ? " †" : ""}</button>`).join("")}</div>`;

  let form = "";
  if (draft.type === "info") form = `
    <label class="field">Qui ?<select data-d="player">${opts(draft.player)}</select></label>
    <label class="field">Information<textarea data-d="text" rows="2" placeholder="Ex. : Empathe, 1 voisin mauvais · Tom ou Marc est Voyante">${esc(draft.text)}</textarea></label>
    <label class="field">Joueurs concernés</label>${chips("data-tg", draft.targets)}`;
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
        <li class="ev ev-${e.type}"><span class="tag">${TYPE_LABEL[e.type]}</span><span class="txt">${evText(e)}</span>
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
  if (d.type === "info") { if (!d.text.trim()) return msg("Écrivez l'information."); Object.assign(e, { player: d.player, text: d.text.trim(), targets: d.targets }); }
  if (d.type === "death") { if (!d.player) return msg("Choisissez le joueur."); Object.assign(e, { player: d.player, cause: d.cause }); }
  if (d.type === "nom") { if (!d.by || !d.target) return msg("Choisissez nominateur et nominé."); Object.assign(e, { by: d.by, target: d.target, voters: d.voters, executed: d.executed }); }
  if (d.type === "note") { if (!d.text.trim()) return msg("Écrivez la note."); e.text = d.text.trim(); }
  L.J().events.push(e);
  const k = L.killOf(e);
  if (k) { const p = app.state.profiles.find((x) => x.id === k); if (p) p.dead = true; }
  resetDraft(d.type);
  commit();
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
    if (k) draft[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
  };
  jv.addEventListener("input", draftField);
  jv.addEventListener("change", (e) => {
    draftField(e);
    if (e.target.dataset.d === "player" && draft.type === "info" && !draft.text) {
      // Pré-remplit avec le rôle annoncé ou confirmé du joueur.
      const p = app.state.profiles.find((x) => x.id === draft.player);
      const r = p && L.shownRole(p);
      if (r) { draft.text = `${r.name} : `; renderJournal(); jv.querySelector("textarea[data-d=text]")?.focus(); }
    }
  });
  resetDraft();
}
