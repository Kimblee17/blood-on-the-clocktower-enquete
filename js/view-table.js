// Onglet Table : joueurs en cercle, glisser-déposer pour réorganiser,
// appui long (ou clic droit) pour le menu rapide, vérifications de cohérence.
import { app, commit, newProfile } from "./context.js";
import { $, esc, icon, placeholder } from "./util.js";
import { addPlayer, addPlayers, select, toggleFlag } from "./actions.js";
import { parseNames } from "./logic.js";

const L = app.L;
const LONG_PRESS_MS = 500;
const DRAG_START_PX = 8;

// Jeton d'un joueur : rôle confirmé, sinon rôle annoncé, sinon son initiale.
function token(p) {
  const conf = L.confirmedOf(p), claim = app.byId[p.claim] ? p.claim : "";
  const rid = conf || claim;
  const img = rid
    ? icon(rid, 64)
    : `<img src="${placeholder(esc((p.name || "?").trim()[0] || "?").toUpperCase())}" alt="" width="64" height="64" draggable="false">`;
  return { img, rid, conf };
}

// Position (en %) de la place i sur n autour du cercle, en partant du haut.
const seatPos = (i, n) => {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
  return { x: 50 + 40 * Math.cos(a), y: 50 + 40 * Math.sin(a) };
};

export function renderTable() {
  const ps = L.players(), n = ps.length;
  const alive = ps.filter((p) => !p.dead).length;
  const seats = ps.map((p, i) => {
    const { x, y } = seatPos(i, n);
    const t = token(p);
    const sub = (t.conf ? `✓ ${app.byId[t.conf].name}` : t.rid ? `« ${app.byId[t.rid].name} »` : "?") + (p.unreliable ? " · ivre ?" : "");
    const cls = ["seat", `a-${p.align || "unknown"}`, p.dead && "dead", p.id === app.state.current && "active", t.conf && "conf"].filter(Boolean).join(" ");
    return `
      <button type="button" class="${cls}" data-id="${p.id}" data-i="${i}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"
        aria-label="${esc(p.name)}${p.dead ? ", mort" : ""}. Appui long : menu rapide.">
        <span class="tok">${t.img}<span class="n">${L.possible(p).length}</span></span>
        <span class="nm">${p.me ? `<span class="me">Moi</span> ` : ""}<span class="pn">${esc(p.name || "Sans nom")}</span></span>
        <span class="sub">${esc(sub)}</span>
      </button>`;
  }).join("");
  $("#table-view").innerHTML = `
    <div class="table-wrap">
      <div class="table-circle">
        ${seats}
        <div class="table-center">
          ${n ? `<strong>${alive}</strong><span>vivant${alive > 1 ? "s" : ""} sur ${n}</span>`
              : `<span>Ajoutez les joueurs dans l'ordre de la table, en partant du haut et dans le sens horaire.</span>`}
          <div class="center-btns">
            <button type="button" class="ghost" id="add-seat">+ Joueur</button>
            <button type="button" class="ghost" id="paste-players">Coller une liste</button>
          </div>
        </div>
      </div>
    </div>
    <p class="hint legend">
      <span class="lg a-good"></span> Bon <span class="lg a-evil"></span> Mauvais <span class="lg a-unknown"></span> Inconnu
      · ✓ confirmé · « » annoncé · chiffre = rôles possibles<br>
      Glissez un jeton pour changer sa place · appui long pour le menu rapide.
    </p>
    ${renderChecks()}`;
}

function renderChecks() {
  const c = L.composition(), list = L.checks(), mods = L.setupModifiers();
  const compo = c ? `
    <table class="compo-check">
      <thead><tr><th></th>${TEAMS.map((t) => `<th class="t-${t.id}">${t.label}</th>`).join("")}<th>Inconnus</th></tr></thead>
      <tbody>
        <tr><th>Prévus (${c.n} joueurs)</th>${c.base.map((v) => `<td>${v}</td>`).join("")}<td>—</td></tr>
        <tr><th>Annoncés / confirmés</th>${c.claimed.map((v, i) => `<td class="${v > c.base[i] ? "over" : ""}">${v}</td>`).join("")}<td>${c.unknown}</td></tr>
      </tbody>
    </table>` : `<p class="intro">La répartition s'affiche de 5 à 15 joueurs.</p>`;
  return `
    <section class="panel checks">
      <h2>Vérifications</h2>
      ${compo}
      ${list.length ? `<ul class="alerts">${list.map((a) => `<li class="lvl-${a.lvl}">${esc(a.text)}</li>`).join("")}</ul>`
        : `<p class="intro">Aucune incohérence détectée.</p>`}
      ${mods.length ? `<p class="hint">Modificateurs de répartition dans ce scénario : ${mods.map((m) => `<b>${esc(m.role.name)}</b> (${esc(m.text)})`).join(", ")}.</p>` : ""}
    </section>`;
}

// ---------- Menu rapide ----------
let quickId = null;
function openQuick(id) {
  const p = app.state.profiles.find((x) => x.id === id);
  if (!p) return;
  quickId = id;
  const roleOptions = TEAMS.map((t) => {
    const rs = app.roles.filter((r) => r.team === t.id);
    return rs.length ? `<optgroup label="${t.label}">${rs.map((r) => `<option value="${r.id}" ${p.claim === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</optgroup>` : "";
  }).join("");
  const seg = (v, label) => `<button type="button" class="seg a-${v || "unknown"} ${p.align === v ? "on" : ""}" data-q-align="${v}">${label}</button>`;
  $("#quick-body").innerHTML = `
    <h2 class="pn">${esc(p.name)}</h2>
    <div class="quick-row">
      <button type="button" class="ghost ${p.dead ? "on" : ""}" data-q-flag="dead">${p.dead ? "Vivant" : "Mort"}</button>
      <button type="button" class="ghost ${p.unreliable ? "on" : ""}" data-q-flag="unreliable">${p.unreliable ? "Fiable" : "Ivre / empoisonné ?"}</button>
    </div>
    <label class="field">Alignement soupçonné</label>
    <div class="segmented">${seg("good", "Bon")}${seg("", "?")}${seg("evil", "Mauvais")}</div>
    <label class="field">Rôle annoncé<select id="q-claim"><option value="">— Aucun —</option>${roleOptions}</select></label>
    <div class="row"><button type="button" class="primary" data-q-open>Ouvrir la fiche</button></div>`;
  const dlg = $("#quick-dialog");
  if (!dlg.open) dlg.showModal();
}

function initQuick() {
  const dlg = $("#quick-dialog");
  const p = () => app.state.profiles.find((x) => x.id === quickId);
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) return dlg.close(); // clic sur le fond
    const f = e.target.closest("[data-q-flag]"), al = e.target.closest("[data-q-align]");
    if (f) { toggleFlag(p(), f.dataset.qFlag); return openQuick(quickId); }
    if (al) { p().align = al.dataset.qAlign; commit(); return openQuick(quickId); }
    if (e.target.closest("[data-q-open]")) { dlg.close(); select(quickId); $("#player-panel")?.scrollIntoView({ behavior: "smooth" }); }
  });
  dlg.addEventListener("change", (e) => {
    if (e.target.id === "q-claim") { p().claim = e.target.value; commit(); }
  });
}

// ---------- Glisser-déposer + appui long ----------
function initPointer() {
  const view = $("#table-view");
  let g = null; // geste en cours
  const cancelTimer = () => { if (g?.timer) { clearTimeout(g.timer); g.timer = null; } };

  view.addEventListener("pointerdown", (e) => {
    const seat = e.target.closest(".seat");
    if (!seat || e.button > 0) return;
    g = { seat, id: seat.dataset.id, from: Number(seat.dataset.i), x0: e.clientX, y0: e.clientY, drag: false, done: false, pointerId: e.pointerId };
    g.timer = setTimeout(() => { g.done = true; g.timer = null; openQuick(g.id); }, LONG_PRESS_MS);
  });

  view.addEventListener("pointermove", (e) => {
    if (!g || g.done || e.pointerId !== g.pointerId) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
    if (!g.drag && Math.hypot(dx, dy) < DRAG_START_PX) return;
    if (!g.drag) {
      cancelTimer();
      g.drag = true;
      g.seat.setPointerCapture(e.pointerId);
      g.seat.classList.add("dragging");
    }
    g.seat.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    // Place visée : la plus proche de l'angle du doigt autour du centre.
    const circle = $(".table-circle").getBoundingClientRect();
    const a = Math.atan2(e.clientY - (circle.top + circle.height / 2), e.clientX - (circle.left + circle.width / 2));
    const n = L.players().length;
    g.to = ((Math.round(((a + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI / n))) % n + n) % n;
    view.querySelectorAll(".seat").forEach((s) => s.classList.toggle("drop-target", Number(s.dataset.i) === g.to && s !== g.seat));
  });

  const end = (e) => {
    if (!g || e.pointerId !== g.pointerId) return;
    cancelTimer();
    if (g.drag) {
      g.done = true;
      if (g.to != null && g.to !== g.from) { L.movePlayer(g.from, g.to); commit(); }
      else app.render();
    }
    const finished = g;
    g = null;
    // Un geste (glisser ou appui long) ne doit pas déclencher le clic qui suit.
    if (finished.done) {
      const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      view.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => view.removeEventListener("click", stop, { capture: true }), 50);
    }
  };
  view.addEventListener("pointerup", end);
  view.addEventListener("pointercancel", end);

  // Clic droit (ordinateur) = menu rapide.
  view.addEventListener("contextmenu", (e) => {
    const seat = e.target.closest(".seat");
    if (!seat) return;
    e.preventDefault();
    cancelTimer();
    openQuick(seat.dataset.id);
  });
}

// ---------- Coller une liste de joueurs ----------
function initPaste() {
  const dlg = $("#paste-dialog"), ta = $("#paste-text"), info = $("#paste-info");
  const refresh = () => {
    const names = parseNames(ta.value);
    info.textContent = names.length ? `${names.length} joueur(s) : ${names.join(", ")}` : "Un nom par ligne, dans l'ordre de la table (sens horaire).";
    $("#paste-replace").hidden = !L.players().length;
  };
  ta.addEventListener("input", refresh);
  $("#paste-add").addEventListener("click", () => {
    const names = parseNames(ta.value);
    if (!names.length) return;
    addPlayers(names);
    ta.value = ""; dlg.close();
  });
  $("#paste-replace").addEventListener("click", () => {
    const names = parseNames(ta.value);
    if (!names.length || !confirm(`Remplacer les ${L.players().length} joueurs actuels par ces ${names.length} joueurs ?`)) return;
    app.state.profiles = [...app.state.profiles.filter((p) => p.explore), ...names.map((n) => newProfile(n))];
    app.state.current = "explore";
    commit();
    ta.value = ""; dlg.close();
  });
  return () => { refresh(); dlg.showModal(); ta.focus(); };
}

export function initTable() {
  initQuick();
  initPointer();
  const openPaste = initPaste();
  $("#table-view").addEventListener("click", (e) => {
    if (e.target.closest("#add-seat")) return addPlayer();
    if (e.target.closest("#paste-players")) return openPaste();
    const seat = e.target.closest(".seat");
    if (seat) select(seat.dataset.id === app.state.current ? "explore" : seat.dataset.id);
  });
  return { openPaste };
}
