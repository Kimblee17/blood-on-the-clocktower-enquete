// Fenêtres : Aide de jeu (ordre de nuit, règles, répartition, scénarios),
// Parties (archives / nouvelle partie) et résumé à copier.
import { app, allScripts, commit, GAME_KEYS, newProfile, save, useScript } from "./context.js";
import { $, $$, closeDialog, esc, icon, toast, uid } from "./util.js";
import { phaseName } from "./logic.js";
import { evText, resetDraft, TYPE_LABEL } from "./view-journal.js";

const L = app.L;
const teamLabel = Object.fromEntries(TEAMS.map((t) => [t.id, t.label]));

// ---------- Ordre de nuit ----------
let night = "first";
const CHOICE_TEXT = { one: "un joueur", two: "2 joueurs", three: "3 joueurs", char: "un personnage" };
function nightText(r) {
  if (r.nightText) return r.nightText;
  if (r.wake.length === 1 && r.wake[0] === "none") return "Étape du Conteur (sans réveil).";
  const picks = r.choice.filter((c) => CHOICE_TEXT[c]).map((c) => CHOICE_TEXT[c]);
  return picks.length ? `Choisit ${picks.join(" ou ")}.` : "Reçoit une information.";
}
function renderNight() {
  const poss = new Set(L.possible(L.cur()).map((r) => r.id));
  // Ordre calculé : numéros d'ordre des rôles du scénario + étapes spéciales.
  const steps = [
    ...app.roles.filter((r) => r.night?.[night] != null).map((r) => ({ order: r.night[night], role: r })),
    ...(app.script.hideNightSpecials ? [] : NIGHT_SPECIALS[night] || []),
    ...(app.script.nightExtras?.[night] || []),
  ].sort((a, b) => a.order - b.order);
  $("#night-list").innerHTML = steps.map((s) => {
    if (!s.role) return `<li><div class="ph">${esc(s.label[0])}</div><div><b>${esc(s.label)}</b><span>${esc(s.text)}</span></div></li>`;
    const r = s.role;
    return `<li class="${poss.has(r.id) ? "" : "dim"}">${icon(r.id, 36)}<div><b>${esc(r.name)}</b><span>${esc(nightText(r))}</span></div></li>`;
  }).join("") || `<li><div></div><div><span>Personne ne se réveille cette nuit-là dans ce scénario.</span></div></li>`;
}

// ---------- Règles, jinxes, répartition ----------
export function renderRules() {
  const s = app.script;
  $("#rules-title").textContent = `Scénario ${s.name}${s.author ? ` · ${s.author}` : ""}`;
  $("#fabled").innerHTML = (s.rules || []).map((f) => `<li><b>${esc(f.name)}</b> — ${esc(f.text)}</li>`).join("") || "<li>Aucune règle particulière.</li>";
  const mods = L.setupModifiers().map((m) => `${m.role.name} : ${m.text}`).join(" · ");
  $("#setup-note").textContent = s.setupNote || (mods ? `Modificateurs : ${mods}.` : "");
  $("#jinxes").innerHTML = L.scriptJinxes().map(([a, b, t]) => `<li><b>${esc(app.byId[a].name)} / ${esc(app.byId[b].name)}</b> — ${esc(t)}</li>`).join("")
    || "<li>Aucun jinx entre les rôles de ce scénario.</li>";
}
function renderCompo() {
  const pc = $("#player-count");
  const n = Math.min(15, Math.max(5, parseInt(pc.value, 10) || 5));
  $("#compo").innerHTML = TEAMS.map((t, i) => `<div class="t-${t.id}"><strong>${COMPOSITION[n][i]}</strong><span>${teamLabel[t.id]}</span></div>`).join("");
  app.state.playerCount = n; save();
}

// ---------- Scénarios importés (JSON) ----------
function importScript(text, fallbackName) {
  const msg = (t) => { $("#import-msg").textContent = t; };
  let data;
  try { data = JSON.parse(text); } catch (e) { return msg("Ce n'est pas un JSON valide."); }
  if (!Array.isArray(data)) return msg("Format attendu : une liste de rôles.");
  const meta = data.find((x) => x && typeof x === "object" && x.id === "_meta") || {};
  const ids = [...new Set(data.map((x) => (typeof x === "string" ? x : x?.id)).filter(Boolean)
    .map((i) => String(i).replace(/[_-]/g, "").toLowerCase()).filter((i) => i !== "meta"))];
  const known = ids.filter((i) => ROLES[i]), unknown = ids.filter((i) => !ROLES[i]);
  if (!known.length) return msg("Aucun rôle reconnu dans ce scénario.");
  const sc = { id: `custom_${uid()}`, name: meta.name || fallbackName || "Scénario importé", author: meta.author || "", roles: known };
  app.state.customScripts.push(sc);
  save();
  renderScriptSelect();
  renderCustom();
  $("#import-json").value = "";
  msg(`« ${sc.name} » importé : ${known.length} rôles. Choisissez-le dans « Nouvelle partie ».${unknown.length ? ` Ignorés (voyageurs, Légendaires, inconnus) : ${unknown.join(", ")}.` : ""}`);
}
function renderCustom() {
  $("#custom-scripts").innerHTML = app.state.customScripts.map((c) =>
    `<li><div><b>${esc(c.name)}</b><span class="muted small">${c.roles.length} rôles${c.author ? ` · ${esc(c.author)}` : ""}</span></div>
     <button type="button" class="ghost danger" data-del-script="${c.id}">Supprimer</button></li>`).join("")
    || `<li class="muted">Aucun scénario importé.</li>`;
}

// ---------- Sélecteur de scénario (fenêtre Nouvelle partie) ----------
// Une partie = un scénario : il ne se choisit qu'en commençant une partie.
export function renderScriptSelect() {
  const opt = (s) => `<option value="${s.id}" ${s.id === app.script.id ? "selected" : ""}>${esc(s.name)}</option>`;
  const official = (s) => s.author === "The Pandemonium Institute";
  const mine = app.state.customScripts || [];
  $("#script-name").textContent = app.script.name;
  $("#ng-script").innerHTML =
    `<optgroup label="Éditions de base">${SCRIPTS.filter(official).map(opt).join("")}</optgroup>` +
    `<optgroup label="Scénarios personnalisés">${SCRIPTS.filter((s) => !official(s)).map(opt).join("")}</optgroup>` +
    (mine.length ? `<optgroup label="Mes scénarios">${mine.map(opt).join("")}</optgroup>` : "");
  document.title = `${app.script.name} · Enquête`;
}
function changeScript(id) {
  app.state.scriptId = id;
  useScript(id);
  renderScriptSelect(); renderRules();
  commit();
}

// ---------- Parties (archives) ----------
const gameSnapshot = () => Object.fromEntries(GAME_KEYS.map((k) => [k, JSON.parse(JSON.stringify(app.state[k]))]));
function archiveCurrent() {
  const ps = L.players();
  // Rien d'intéressant à garder (seulement des noms) : pas d'archive.
  const used = ps.some((p) => p.claim || p.confirmed || p.dead || p.align || p.notes.trim() || p.excluded.length);
  if (!used && !L.J().events.length && !app.state.globalNotes.trim()) return;
  app.state.archives.unshift({ id: uid(), date: new Date().toISOString(), name: `${app.script.name} · ${ps.length} joueurs`, game: gameSnapshot() });
  app.state.archives = app.state.archives.slice(0, 30);
}
function renderGames() {
  const fmt = (d) => new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  $("#games-list").innerHTML = app.state.archives.map((a) => {
    const names = a.game.profiles.filter((p) => !p.explore).map((p) => p.name).join(", ");
    return `<li><div><b>${esc(a.name)}</b><span class="muted small">${fmt(a.date)} · ${a.game.journal.events.length} évènement(s)</span>
      <span class="muted small pn">${esc(names)}</span></div>
      <div class="row"><button type="button" class="ghost" data-open-game="${a.id}">Ouvrir</button>
      <button type="button" class="ghost danger" data-del-game="${a.id}">Supprimer</button></div></li>`;
  }).join("") || `<li class="muted">Aucune partie archivée.</li>`;
}
const afterGameSwap = () => {
  useScript(app.state.scriptId);
  $("#global-notes").value = app.state.globalNotes;
  resetDraft();
  renderScriptSelect(); renderRules();
  commit();
};

// ---------- Résumé ----------
function summaryText() {
  const txt = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " ").trim(); };
  const out = [`${app.script.name} — ${new Date().toLocaleDateString("fr-FR")}`, "", "JOUEURS (ordre de la table)"];
  L.players().forEach((p, i) => {
    const conf = app.byId[L.confirmedOf(p)], cl = app.byId[p.claim], parts = [];
    if (p.dead) parts.push("mort");
    if (conf) parts.push(`confirmé ${conf.name}`);
    if (cl && cl !== conf) parts.push(`annonce ${cl.name}`);
    if (p.align) parts.push(p.align === "good" ? "bon ?" : "mauvais ?");
    if (p.unreliable) parts.push("ivre / empoisonné ?");
    const poss = L.possible(p);
    if (!conf) parts.push(poss.length <= 5 ? `possibles : ${poss.map((r) => r.name).join(", ") || "aucun"}` : `${poss.length} rôles possibles`);
    out.push(`${i + 1}. ${p.name}${p.me ? " (moi)" : ""} — ${parts.join(" · ")}`);
    if (p.notes.trim()) out.push(`   Notes : ${p.notes.trim().replace(/\n+/g, " / ")}`);
  });
  for (let i = 0; i <= L.J().last; i++) {
    const evs = L.J().events.filter((e) => e.phase === i);
    if (!evs.length) continue;
    out.push("", phaseName(i).toUpperCase());
    evs.forEach((e) => out.push(`- ${TYPE_LABEL[e.type]} : ${txt(evText(e))}`));
  }
  const al = L.checks();
  if (al.length) { out.push("", "ALERTES"); al.forEach((a) => out.push(`- ${a.text}`)); }
  if (app.state.globalNotes.trim()) out.push("", "NOTES", app.state.globalNotes.trim());
  return out.join("\n");
}
export function copySummary() {
  const text = summaryText();
  const fallback = () => { $("#summary-text").value = text; $("#summary-dialog").showModal(); $("#summary-text").select(); };
  if (!navigator.clipboard) return fallback();
  navigator.clipboard.writeText(text).then(() => toast("Résumé copié dans le presse-papiers."), fallback);
}

export function initDialogs() {
  $$("[data-open]").forEach((b) => b.addEventListener("click", () => $("#" + b.dataset.open).showModal()));

  // Aide de jeu
  $$("[data-night]").forEach((t) => t.addEventListener("click", () => {
    night = t.dataset.night;
    $$("[data-night]").forEach((x) => x.classList.toggle("active", x === t));
    renderNight();
  }));
  $$("[data-help]").forEach((t) => t.addEventListener("click", () => {
    $$("[data-help]").forEach((x) => x.classList.toggle("active", x === t));
    $$(".help-pane").forEach((p) => { p.hidden = p.dataset.pane !== t.dataset.help; });
  }));
  $("[data-open=help-dialog]").addEventListener("click", () => { renderNight(); renderRules(); renderCustom(); });
  const pc = $("#player-count");
  pc.value = app.state.playerCount;
  pc.addEventListener("input", renderCompo);
  renderCompo();

  $("#import-btn").addEventListener("click", () => importScript($("#import-json").value));
  $("#import-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) f.text().then((t) => importScript(t, f.name.replace(/\.json$/i, "")));
    e.target.value = "";
  });
  $("#custom-scripts").addEventListener("click", (e) => {
    const b = e.target.closest("[data-del-script]");
    if (!b || !confirm("Supprimer ce scénario importé ?")) return;
    app.state.customScripts = app.state.customScripts.filter((c) => c.id !== b.dataset.delScript);
    if (!allScripts().some((x) => x.id === app.state.scriptId)) changeScript(SCRIPTS[0].id);
    else { renderScriptSelect(); save(); }
    renderCustom();
  });

  // Nouvelle partie : scénario + garder les joueurs ou repartir de zéro.
  const ng = $("#newgame-dialog");
  app.openNewGame = (mode = "keep") => {
    renderScriptSelect();
    $("#ng-script").value = app.script.id;
    const hasPlayers = L.players().length > 0;
    ng.querySelector(`[name=ng-mode][value=${hasPlayers ? mode : "blank"}]`).checked = true;
    ng.querySelector("[name=ng-mode][value=keep]").closest(".choice").hidden = !hasPlayers;
    ng.showModal();
  };
  $("#new-game").addEventListener("click", () => app.openNewGame("keep"));
  $("#ng-start").addEventListener("click", () => {
    const blank = ng.querySelector("[name=ng-mode]:checked").value === "blank";
    archiveCurrent();
    const s = app.state;
    s.scriptId = $("#ng-script").value;
    s.profiles = blank
      ? [newProfile("Exploration", true)]
      : s.profiles.map((p) => ({ ...newProfile(p.name, p.explore), id: p.id }));
    s.globalNotes = "";
    s.journal = { phase: 0, last: 0, events: [] };
    s.notInPlay = [];
    s.current = "explore";
    s.view = "table";
    closeDialog(ng);
    afterGameSwap();
    window.scrollTo(0, 0);
    toast(blank ? "Partie vierge commencée." : "Nouvelle partie commencée avec les mêmes joueurs.");
  });
  $("[data-open=games-dialog]").addEventListener("click", renderGames);
  $("#games-list").addEventListener("click", (e) => {
    const op = e.target.closest("[data-open-game]"), del = e.target.closest("[data-del-game]");
    if (op) {
      const a = app.state.archives.find((x) => x.id === op.dataset.openGame);
      app.state.archives = app.state.archives.filter((x) => x !== a);
      archiveCurrent();
      Object.assign(app.state, JSON.parse(JSON.stringify(a.game)));
      closeDialog($("#games-dialog"));
      afterGameSwap();
      toast(`Partie « ${a.name} » ouverte.`);
    }
    if (del) {
      if (!confirm("Supprimer définitivement cette partie archivée ?")) return;
      app.state.archives = app.state.archives.filter((x) => x.id !== del.dataset.delGame);
      save(); renderGames();
    }
  });
}
