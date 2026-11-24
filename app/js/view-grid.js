// Onglet Grille : joueurs × rôles.
import { app, commit } from "./context.js";
import { $, esc, icon } from "./util.js";
import { select, toggleOut } from "./actions.js";

const L = app.L;
const CELL = { yes: "✓", no: "✗", auto: "·", maybe: "" };
const CELL_LABEL = { yes: "confirmé", no: "écarté", auto: "exclu par déduction", maybe: "possible" };

export function renderGrid() {
  const ps = L.players();
  if (!ps.length) {
    $("#grid-view").innerHTML = `<p class="empty">Ajoutez des joueurs pour remplir la grille de déduction.</p>`;
    return;
  }
  const teams = TEAMS.map((t) => ({ ...t, roles: app.roles.filter((r) => r.team === t.id) })).filter((t) => t.roles.length);
  const roles = teams.flatMap((t) => t.roles);
  const head1 = teams.map((t) => `<th colspan="${t.roles.length}" class="team t-${t.id}">${t.label}</th>`).join("");
  const head2 = roles.map((r) => {
    const out = L.isOut(r.id);
    return `<th class="rh t-${r.team} ${out ? "out" : ""}"><button type="button" data-out="${r.id}"
      title="${esc(r.name)} — ${esc(r.ability)}\n\nToucher : ${out ? "remettre en jeu" : "absent de la partie (exclu pour tous)"}">${icon(r.id, 28)}<span>${esc(r.name)}</span></button></th>`;
  }).join("");
  const rows = ps.map((p) => {
    const cells = roles.map((r) => {
      const s = L.cellState(p, r);
      return `<td><button type="button" class="cell s-${s}" data-p="${p.id}" data-r="${r.id}"
        aria-label="${esc(p.name)} / ${esc(r.name)} : ${CELL_LABEL[s]}">${CELL[s]}</button></td>`;
    }).join("");
    return `<tr class="${p.id === app.state.current ? "active" : ""} ${p.dead ? "dead" : ""}">
      <th class="pname"><button type="button" data-id="${p.id}"><span class="dot a-${p.align || "unknown"}"></span><span class="pn">${esc(p.name || "Sans nom")}</span></button></th>
      ${cells}<td class="cnt">${L.possible(p).length}</td></tr>`;
  }).join("");
  const foot = roles.map((r) => {
    const k = ps.filter((p) => L.isPossible(p, r)).length;
    return `<td class="cnt ${k === 0 ? "zero" : ""}" title="${k} joueur(s) peuvent être ${esc(r.name)}">${k}</td>`;
  }).join("");
  $("#grid-view").innerHTML = `
    <div class="grid-wrap">
      <table class="deduce">
        <thead><tr><th class="corner" rowspan="2">Joueur</th>${head1}<th class="cnt" rowspan="2" title="Rôles possibles">#</th></tr><tr>${head2}</tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><th class="pname">Candidats</th>${foot}<td></td></tr></tfoot>
      </table>
    </div>
    <p class="hint">Touchez une case : vide → ✗ écarté → ✓ confirmé → vide. Touchez l'icône d'un rôle pour le déclarer absent de la partie.
      « · » = exclu par déduction. La ligne « Candidats » compte les joueurs qui peuvent encore avoir ce rôle.</p>`;
}

export function initGrid() {
  $("#grid-view").addEventListener("click", (e) => {
    const outBtn = e.target.closest("[data-out]");
    if (outBtn) return toggleOut(outBtn.dataset.out);
    const name = e.target.closest(".pname button[data-id]");
    if (name) return select(name.dataset.id);
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const p = app.state.profiles.find((x) => x.id === cell.dataset.p), rid = cell.dataset.r;
    const s = L.cellState(p, app.byId[rid]);
    if (s === "yes") p.confirmed = "";                                     // ✓ → vide
    else if (s === "no") {                                                  // ✗ → ✓
      p.excluded = p.excluded.filter((x) => x !== rid);
      p.confirmed = rid;
    } else p.excluded = [...p.excluded, rid];                               // vide / · → ✗
    app.state.current = p.id;
    commit();
  });
}
