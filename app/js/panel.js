// Fiche du joueur : panneau qui monte du bas (téléphone) ou glisse à droite (ordinateur).
import { app, commit, save } from "./context.js";
import { $, closeDialog, esc, reducedMotion } from "./util.js";
import { playerHistory } from "./view-journal.js";
import { toggleFlag } from "./actions.js";

const L = app.L;
const sheet = () => $("#player-sheet");

// Ouvre la fiche d'un joueur (et le sélectionne pour l'onglet Rôles).
export function openSheet(id, { focusName = false } = {}) {
  app.state.current = id;
  save();
  app.render();
  const dlg = sheet();
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
  const name = $("#p-name");
  if (focusName && name) { name.focus(); name.select(); }
}
export const closeSheet = () => closeDialog(sheet());

export function renderPanel() {
  const dlg = sheet();
  const p = L.cur();
  if (!p || p.explore) { if (dlg.open) closeSheet(); return; }
  const claimRole = app.byId[p.claim];
  const warn = claimRole && !L.isPossible(p, claimRole)
    ? `<p class="note warn">Le rôle annoncé ne correspond pas à vos déductions : mensonge, ivresse ou poison ?</p>` : "";
  const roleOptions = (sel) => TEAMS.map((t) => {
    const rs = app.roles.filter((r) => r.team === t.id);
    return rs.length ? `<optgroup label="${t.label}">${rs.map((r) => `<option value="${r.id}" ${sel === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</optgroup>` : "";
  }).join("");
  const [left, right] = L.neighbours(p);
  const nb = L.players().length > 2
    ? `<p class="intro">Voisins vivants : <b>${esc(left?.name ?? "—")}</b> ← · → <b>${esc(right?.name ?? "—")}</b></p>` : "";
  const alignBtn = (v, label) => `<button type="button" class="seg a-${v || "unknown"} ${p.align === v ? "on" : ""}" data-align="${v}">${label}</button>`;
  const toggle = (flag, label, on, title = "") =>
    `<button type="button" class="toggle ${on ? "on" : ""}" data-flag="${flag}" aria-pressed="${on}" ${title ? `title="${title}"` : ""}>${label}</button>`;
  const h = playerHistory(p);
  const ghost = p.dead ? `<p class="intro">Vote fantôme : ${L.ghostUsed(p) ? "<b>utilisé</b>" : "disponible"}</p>` : "";
  const nGood = L.possibleGood(p).length;
  $("#player-panel").innerHTML = `
    <div class="sheet-head">
      <input type="text" id="p-name" class="name-input pn" value="${esc(p.name)}" autocomplete="off" aria-label="Nom du joueur">
      <button type="button" class="ghost" id="p-close" autofocus>Fermer</button>
    </div>
    <div class="toggles">
      ${toggle("dead", "Mort", p.dead)}
      ${toggle("me", "C'est moi", p.me)}
      ${toggle("unreliable", "Ivre / empoisonné ?", p.unreliable, "Ses infos sont peut-être fausses")}
    </div>
    <label class="field">Alignement soupçonné</label>
    <div class="segmented" role="group" aria-label="Alignement soupçonné">
      ${alignBtn("good", "Bon")}${alignBtn("", "?")}${alignBtn("evil", "Mauvais")}
    </div>
    <div class="two">
      <label class="field">Rôle annoncé<select id="p-claim"><option value="">— Aucun —</option>${roleOptions(p.claim)}</select></label>
      <label class="field">Rôle confirmé<select id="p-conf"><option value="">— Inconnu —</option>${roleOptions(L.confirmedOf(p))}</select></label>
    </div>
    ${warn}
    <button type="button" class="link see-roles" id="p-roles">Voir ses rôles possibles (${nGood} rôle${nGood > 1 ? "s" : ""} bon${nGood > 1 ? "s" : ""}) →</button>
    ${nb ? `<label class="field">Place à la table</label>${nb}` : ""}
    <label class="field">Notes sur ce joueur<textarea id="p-notes" rows="4" placeholder="Ce qu'il dit, ses votes, ses infos…">${esc(p.notes)}</textarea></label>
    <label class="field">Historique (journal)</label>${ghost}
    ${h.length ? `<ul class="history">${h.map((x) => `<li>${x}</li>`).join("")}</ul>` : `<p class="intro">Rien dans le journal pour l'instant.</p>`}
    <div class="row"><button type="button" class="ghost danger" id="p-delete">Supprimer ce joueur</button></div>`;
}

// Glisser la fiche vers le bas (téléphone) pour la fermer.
function initSwipe() {
  const dlg = sheet();
  let g = null;
  dlg.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".sheet-grip, .sheet-head") || e.target.closest("input, button")) return;
    if (window.matchMedia("(min-width: 900px)").matches) return;
    g = { y0: e.clientY, dy: 0, id: e.pointerId };
    dlg.setPointerCapture(e.pointerId);
    dlg.classList.add("dragging");
  });
  dlg.addEventListener("pointermove", (e) => {
    if (!g || e.pointerId !== g.id) return;
    g.dy = Math.max(0, e.clientY - g.y0);
    dlg.style.transform = `translateY(${g.dy}px)`;
  });
  const end = (e) => {
    if (!g || e.pointerId !== g.id) return;
    dlg.classList.remove("dragging");
    const far = g.dy > 90;
    g = null;
    if (far) closeSheet();
    else {
      if (!reducedMotion()) dlg.animate([{ transform: dlg.style.transform }, { transform: "translateY(0)" }], { duration: 180, easing: "ease-out" });
      dlg.style.transform = "";
    }
  };
  dlg.addEventListener("pointerup", end);
  dlg.addEventListener("pointercancel", end);
}

export function initPanel() {
  app.openSheet = openSheet;
  initSwipe();
  const panel = $("#player-panel");
  panel.addEventListener("input", (e) => {
    const p = L.cur();
    if (e.target.id === "p-name") { p.name = e.target.value; save(); app.renderLight(); }
    if (e.target.id === "p-notes") { p.notes = e.target.value; save(); }
  });
  panel.addEventListener("change", (e) => {
    const p = L.cur();
    if (e.target.id === "p-claim") { p.claim = e.target.value; commit(); }
    if (e.target.id === "p-conf") {
      p.confirmed = e.target.value;
      if (p.confirmed) p.excluded = p.excluded.filter((x) => x !== p.confirmed);
      commit();
    }
  });
  panel.addEventListener("click", (e) => {
    const p = L.cur();
    const al = e.target.closest("[data-align]"), fl = e.target.closest("[data-flag]");
    if (al) { p.align = al.dataset.align; return commit(); }
    if (fl) return toggleFlag(p, fl.dataset.flag);
    if (e.target.id === "p-close") return closeSheet();
    if (e.target.id === "p-roles") {
      closeSheet();
      app.state.view = "roles";
      save();
      app.render();
      return window.scrollTo(0, 0);
    }
    if (e.target.id !== "p-delete") return;
    if (!confirm(`Supprimer « ${p.name} » et ses notes ?`)) return;
    closeSheet();
    app.state.profiles = app.state.profiles.filter((x) => x.id !== p.id);
    app.state.current = "explore";
    commit();
  });
}
