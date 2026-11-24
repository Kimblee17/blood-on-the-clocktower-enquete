// Fiche du joueur sélectionné (colonne de droite).
import { app, commit, save } from "./context.js";
import { $, esc } from "./util.js";
import { playerHistory } from "./view-journal.js";
import { toggleFlag } from "./actions.js";

const L = app.L;

export function renderPanel() {
  const p = L.cur();
  // Sans joueur sélectionné, pas de fiche : l'onglet Rôles suffit pour explorer.
  $("#player-panel").hidden = !!p.explore;
  if (p.explore) return;
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
  const h = playerHistory(p);
  const ghost = p.dead ? `<p class="intro">Vote fantôme : ${L.ghostUsed(p) ? "<b>utilisé</b>" : "disponible"}</p>` : "";
  $("#player-panel").innerHTML = `
    <h2>Joueur</h2>
    <label class="field">Nom<input type="text" id="p-name" value="${esc(p.name)}" autocomplete="off"></label>
    <div class="row">
      <label class="switch"><input type="checkbox" data-flag="dead" ${p.dead ? "checked" : ""}> Mort</label>
      <label class="switch"><input type="checkbox" data-flag="me" ${p.me ? "checked" : ""}> C'est moi</label>
      <label class="switch" title="Ses infos sont peut-être fausses"><input type="checkbox" data-flag="unreliable" ${p.unreliable ? "checked" : ""}> Ivre / empoisonné ?</label>
    </div>
    <label class="field">Alignement soupçonné</label>
    <div class="segmented" role="group" aria-label="Alignement soupçonné">
      ${alignBtn("good", "Bon")}${alignBtn("", "?")}${alignBtn("evil", "Mauvais")}
    </div>
    <label class="field">Rôle annoncé<select id="p-claim"><option value="">— Aucun —</option>${roleOptions(p.claim)}</select></label>
    ${warn}
    <label class="field">Rôle confirmé<select id="p-conf"><option value="">— Inconnu —</option>${roleOptions(L.confirmedOf(p))}</select></label>
    ${nb ? `<label class="field">Place à la table</label>${nb}` : ""}
    <label class="field">Historique (journal)</label>${ghost}
    ${h.length ? `<ul class="history">${h.map((x) => `<li>${x}</li>`).join("")}</ul>` : `<p class="intro">Rien dans le journal pour l'instant.</p>`}
    <label class="field">Notes sur ce joueur<textarea id="p-notes" rows="5" placeholder="Ce qu'il dit, ses votes, ses infos…">${esc(p.notes)}</textarea></label>
    <div class="row"><button type="button" class="ghost danger" id="p-delete">Supprimer ce joueur</button></div>`;
}

export function initPanel() {
  const panel = $("#player-panel");
  panel.addEventListener("input", (e) => {
    const p = L.cur();
    if (e.target.id === "p-name") { p.name = e.target.value; save(); app.renderLight(); }
    if (e.target.id === "p-notes") { p.notes = e.target.value; save(); }
  });
  panel.addEventListener("change", (e) => {
    const p = L.cur();
    if (e.target.dataset.flag) return toggleFlag(p, e.target.dataset.flag);
    if (e.target.id === "p-claim") { p.claim = e.target.value; commit(); }
    if (e.target.id === "p-conf") {
      p.confirmed = e.target.value;
      if (p.confirmed) p.excluded = p.excluded.filter((x) => x !== p.confirmed);
      commit();
    }
  });
  panel.addEventListener("click", (e) => {
    const p = L.cur();
    const al = e.target.closest("[data-align]");
    if (al) { p.align = al.dataset.align; return commit(); }
    if (e.target.id !== "p-delete") return;
    if (!confirm(`Supprimer « ${p.name} » et ses notes ?`)) return;
    app.state.profiles = app.state.profiles.filter((x) => x.id !== p.id);
    app.state.current = "explore";
    commit();
  });
}
