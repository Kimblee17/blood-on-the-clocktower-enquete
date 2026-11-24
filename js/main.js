// Point d'entrée : assemble les vues et gère le rendu global.
import { app, save } from "./context.js";
import { $, $$, esc, placeholder } from "./util.js";
import { select, addPlayer } from "./actions.js";
import { initRoles, renderRoles, syncFilters } from "./view-roles.js";
import { initGrid, renderGrid } from "./view-grid.js";
import { initTable, renderTable } from "./view-table.js";
import { initJournal, renderJournal } from "./view-journal.js";
import { initPanel, renderPanel } from "./panel.js";
import { changeScript, copySummary, initDialogs, renderRules, renderScriptSelect } from "./dialogs.js";

const L = app.L;

// ---------- Bande des joueurs ----------
function renderPlayers() {
  const ps = L.players(), cur = app.state.current;
  $("#player-strip").innerHTML = ps.map((p) => `
    <button type="button" class="chip ${p.id === cur ? "active" : ""} ${p.dead ? "dead" : ""}" data-id="${p.id}"
      aria-pressed="${p.id === cur}" title="${p.id === cur ? "Toucher à nouveau pour désélectionner" : ""}">
      <span class="dot a-${p.align || "unknown"}" aria-hidden="true"></span>
      <span class="name pn">${esc(p.name || "Sans nom")}${p.me ? " (moi)" : ""}</span>
      <span class="n" title="Rôles encore possibles">${L.possible(p).length}</span>
    </button>`).join("") +
    `<button type="button" class="chip add" id="add-player">+ Joueur</button>` +
    (ps.length ? "" : `<span class="strip-hint">Ajoutez les joueurs dans l'ordre de la table.</span>`);
}

// ---------- Vues ----------
const VIEWS = { table: renderTable, grid: renderGrid, roles: renderRoles, journal: renderJournal };
function renderView() {
  const v = VIEWS[app.state.view] ? app.state.view : "table";
  $$("[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === v);
    b.setAttribute("aria-selected", String(b.dataset.view === v));
  });
  $("#table-view").hidden = v !== "table";
  $("#grid-view").hidden = v !== "grid";
  $("#roles-view").hidden = v !== "roles";
  $("#journal-view").hidden = v !== "journal";
  VIEWS[v]();
}

function renderDiscreet() {
  const on = !!app.state.discreet;
  document.body.classList.toggle("discreet", on);
  $("#discreet-veil").hidden = !on;
  const b = $("#discreet");
  b.setAttribute("aria-pressed", String(on));
  b.textContent = on ? "Afficher" : "Masquer";
}

app.render = () => {
  L.invalidate();
  const nAlerts = L.checks().filter((a) => a.lvl !== "info").length;
  $("[data-view=table]").innerHTML = `Table${nAlerts ? ` <span class="badge-n" title="Alertes">${nAlerts}</span>` : ""}`;
  syncFilters();
  renderPlayers();
  renderView();
  renderPanel();
  renderDiscreet();
};
// Rendu léger (frappe du nom d'un joueur) : sans redessiner la fiche en cours d'édition.
app.renderLight = () => { L.invalidate(); renderPlayers(); renderView(); };

// ---------- Initialisation ----------
initRoles();
initGrid();
initTable();
initJournal({ copySummary });
initPanel();
initDialogs();

$("#player-strip").addEventListener("click", (e) => {
  if (e.target.closest("#add-player")) return addPlayer();
  const chip = e.target.closest(".chip[data-id]");
  // Toucher le joueur déjà sélectionné le désélectionne.
  if (chip) select(chip.dataset.id === app.state.current ? "explore" : chip.dataset.id);
});
$$("[data-view]").forEach((b) => b.addEventListener("click", () => { app.state.view = b.dataset.view; save(); renderView(); }));
$("#script-select").addEventListener("change", (e) => changeScript(e.target.value));

const gn = $("#global-notes");
gn.value = app.state.globalNotes;
gn.addEventListener("input", () => { app.state.globalNotes = gn.value; save(); });

// Mode discret : un voile couvre tout ; toucher le voile ou le bouton pour réafficher.
const setDiscreet = (on) => { app.state.discreet = on; save(); renderDiscreet(); };
$("#discreet").addEventListener("click", () => setDiscreet(!app.state.discreet));
$("#discreet-veil").addEventListener("click", () => setDiscreet(false));

// Rôle sans icône : on affiche son initiale.
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName === "IMG" && img.dataset.initial && !img.src.startsWith("data:")) img.src = placeholder(img.dataset.initial);
}, true);

renderScriptSelect();
renderRules();
app.render();

// ---------- PWA ----------
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
