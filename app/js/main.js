// Point d'entrée : assemble les vues et gère le rendu global.
import { app, save } from "./context.js";
import { $, $$, initDialogMotion, placeholder } from "./util.js";
import { initRoles, renderRoles, syncFilters } from "./view-roles.js";
import { initGrid, renderGrid } from "./view-grid.js";
import { initTable, renderTable } from "./view-table.js";
import { initJournal, renderJournal } from "./view-journal.js";
import { initPanel, renderPanel } from "./panel.js";
import { copySummary, initDialogs, renderRules, renderScriptSelect } from "./dialogs.js";

const L = app.L;

// La Grille est masquée pour l'instant : passer à true pour la réafficher.
const GRID_ENABLED = false;

// ---------- Vues ----------
const VIEWS = { table: renderTable, roles: renderRoles, journal: renderJournal, ...(GRID_ENABLED ? { grid: renderGrid } : {}) };
const SECTION = { table: "#table-view", grid: "#grid-view", roles: "#roles-view", journal: "#journal-wrap" };
const currentView = () => (VIEWS[app.state.view] ? app.state.view : "table");

function renderView() {
  const v = currentView();
  $$("[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === v);
    b.setAttribute("aria-selected", String(b.dataset.view === v));
  });
  Object.entries(SECTION).forEach(([k, sel]) => { $(sel).hidden = k !== v; });
  VIEWS[v]();
}

// Chaque vue retrouve sa position de défilement quand on y revient.
const scrollOf = {};
function goView(v) {
  if (v === currentView()) return window.scrollTo({ top: 0, behavior: "smooth" });
  scrollOf[currentView()] = window.scrollY;
  app.state.view = v;
  save();
  renderView();
  window.scrollTo(0, scrollOf[v] || 0);
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
  $("[data-view=table] .lbl").innerHTML = `Table${nAlerts ? `<span class="badge-n" title="Alertes">${nAlerts}</span>` : ""}`;
  syncFilters();
  renderView();
  renderPanel();
  renderDiscreet();
};
// Rendu léger (frappe du nom d'un joueur) : sans redessiner la fiche en cours d'édition.
app.renderLight = () => { L.invalidate(); renderView(); };

// ---------- Initialisation ----------
initDialogMotion();
initRoles();
initGrid();
initTable();
initJournal({ copySummary });
initPanel();
initDialogs();

$$("[data-view]").forEach((b) => b.addEventListener("click", () => goView(b.dataset.view)));

// Menu « ⋯ » : Aide de jeu, Parties archivées, Nouvelle partie.
const moreBtn = $("#more-btn"), moreMenu = $("#more-menu");
const setMenu = (open) => {
  moreMenu.hidden = !open;
  moreBtn.setAttribute("aria-expanded", String(open));
};
moreBtn.addEventListener("click", (e) => { e.stopPropagation(); setMenu(moreMenu.hidden); });
moreMenu.addEventListener("click", (e) => { if (e.target.closest("button")) setMenu(false); });
document.addEventListener("click", (e) => { if (!e.target.closest(".more")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

const gn = $("#global-notes");
gn.value = app.state.globalNotes;
gn.addEventListener("input", () => { app.state.globalNotes = gn.value; save(); });

// Mode discret : un voile animé couvre tout ; toucher le voile ou le bouton pour réafficher.
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
