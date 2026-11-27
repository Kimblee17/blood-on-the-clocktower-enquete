// Onglet Table : joueurs en cercle. Toucher un jeton ouvre sa fiche ;
// appui long puis glisser pour changer sa place. Vérifications de cohérence.
import { app, commit, newProfile, save } from "./context.js";
import { $, closeDialog, esc, icon, placeholder, reducedMotion } from "./util.js";
import { addPlayer, addPlayers } from "./actions.js";
import { parseNames } from "./logic.js";

const L = app.L;
const LONG_PRESS_MS = 450;
const MOVE_TOLERANCE_PX = 10;
const SHOW_COUNT_FROM = 3; // le chiffre n'apparaît qu'à partir de 3 rôles bons restants
const SHORT = { townsfolk: "Vill.", outsider: "Marg.", minion: "Sbires", demon: "Dém." };

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

function onboarding() {
  return `
    <section class="panel onboard">
      <h2>Préparer la partie</h2>
      <ol class="steps">
        <li class="done"><div><b>Scénario</b> · ${esc(app.script.name)}</div>
          <button type="button" class="link" id="ob-script">Changer</button></li>
        <li class="now"><div><b>Ajoutez les joueurs</b> dans l'ordre de la table, en partant du haut et dans le sens horaire.</div>
          <div class="row"><button type="button" class="primary" id="add-seat">+ Joueur</button>
          <button type="button" class="ghost" id="paste-players">Coller une liste</button></div></li>
        <li><div><b>Touchez votre jeton</b> puis « C'est moi », et notez votre rôle.</div></li>
        <li><div><b>Pendant la partie</b>, notez infos, morts et votes dans le Journal.</div></li>
      </ol>
    </section>`;
}

export function renderTable() {
  const ps = L.players(), n = ps.length;
  if (!n) { $("#table-view").innerHTML = onboarding(); return; }
  const alive = ps.filter((p) => !p.dead).length;
  const seats = ps.map((p, i) => {
    const { x, y } = seatPos(i, n);
    const t = token(p);
    const sub = (t.conf ? `✓ ${app.byId[t.conf].name}` : t.rid ? `« ${app.byId[t.rid].name} »` : "?") + (p.unreliable ? " · ivre ?" : "");
    const k = L.possibleGood(p).length;
    const count = !t.conf && k <= SHOW_COUNT_FROM ? `<span class="n ${k === 0 ? "zero" : ""}" title="Rôles bons encore possibles">${k}</span>` : "";
    const cls = ["seat", `a-${p.align || "unknown"}`, p.dead && "dead", p.id === app.state.current && "active", t.conf && "conf"].filter(Boolean).join(" ");
    return `
      <button type="button" class="${cls}" data-id="${p.id}" data-i="${i}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"
        aria-label="${esc(p.name)}${p.dead ? ", mort" : ""}. Toucher : fiche. Appui long : déplacer.">
        <span class="tok">${t.img}${count}</span>
        <span class="nm">${p.me ? `<span class="me">Moi</span> ` : ""}<span class="pn">${esc(p.name || "Sans nom")}</span></span>
        <span class="sub">${esc(sub)}</span>
      </button>`;
  }).join("");
  const noMe = !ps.some((p) => p.me)
    ? `<p class="nudge">Touchez votre jeton puis « C'est moi » pour que le Journal et vos voisins se remplissent tout seuls.</p>` : "";

  const before = seatRects();
  $("#table-view").innerHTML = `
    ${noMe}
    <div class="table-wrap">
      <div class="table-circle">
        ${seats}
        <div class="table-center">
          <strong>${alive}</strong><span>vivant${alive > 1 ? "s" : ""} sur ${n}</span>
          <div class="center-btns">
            <button type="button" class="ghost" id="add-seat">+ Joueur</button>
            <button type="button" class="ghost" id="paste-players">Coller une liste</button>
          </div>
        </div>
      </div>
    </div>
    <p class="hint legend">
      <span class="lg a-good"></span> Bon <span class="lg a-evil"></span> Mauvais <span class="lg a-unknown"></span> Inconnu
      · ✓ confirmé · « » annoncé · chiffre = rôles bons encore possibles (à partir de ${SHOW_COUNT_FROM})<br>
      Touchez un jeton pour sa fiche · appui long puis glissez pour changer sa place.
    </p>
    ${renderChecks()}`;
  animateSeats(before);
}

// Les jetons glissent vers leur nouvelle place au lieu de sauter (technique FLIP).
function seatRects() {
  const m = new Map();
  document.querySelectorAll("#table-view .seat").forEach((s) => m.set(s.dataset.id, s.getBoundingClientRect()));
  return m;
}
function animateSeats(before) {
  if (!before.size || reducedMotion() || $("#table-view").hidden) return;
  document.querySelectorAll("#table-view .seat").forEach((s) => {
    const a = before.get(s.dataset.id);
    if (!a) return;
    const b = s.getBoundingClientRect();
    const dx = a.left - b.left, dy = a.top - b.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    s.animate([
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))` },
      { transform: "translate(-50%, -50%)" },
    ], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" });
  });
}

function renderChecks() {
  const c = L.composition(), list = L.checks(), mods = L.setupModifiers();
  const nAlerts = list.filter((a) => a.lvl !== "info").length;
  const head = (t) => `<th class="t-${t.id}" title="${t.label}"><span class="long">${t.label}</span><span class="short">${SHORT[t.id] || t.label}</span></th>`;
  const compo = c ? `
    <table class="compo-check">
      <thead><tr><th></th>${TEAMS.map(head).join("")}<th title="Inconnus"><span class="long">Inconnus</span><span class="short">?</span></th></tr></thead>
      <tbody>
        <tr><th>Prévus (${c.n})</th>${c.base.map((v) => `<td>${v}</td>`).join("")}<td>—</td></tr>
        <tr><th>Annoncés</th>${c.claimed.map((v, i) => `<td class="${v > c.base[i] ? "over" : ""}">${v}</td>`).join("")}<td>${c.unknown}</td></tr>
      </tbody>
    </table>` : `<p class="intro">La répartition s'affiche de 5 à 15 joueurs.</p>`;
  return `
    <details class="panel checks" id="checks" ${app.state.checksOpen ? "open" : ""}>
      <summary><h2>Vérifications</h2>
        ${nAlerts ? `<span class="badge-n">${nAlerts}</span>` : `<span class="muted small">Rien à signaler</span>`}
      </summary>
      <div class="checks-body">
        ${compo}
        ${list.length ? `<ul class="alerts">${list.map((a) => `<li class="lvl-${a.lvl}">${esc(a.text)}</li>`).join("")}</ul>`
          : `<p class="intro">Aucune incohérence détectée.</p>`}
        ${mods.length ? `<p class="hint">Modificateurs de répartition dans ce scénario : ${mods.map((m) => `<b>${esc(m.role.name)}</b> (${esc(m.text)})`).join(", ")}.</p>` : ""}
      </div>
    </details>`;
}

// ---------- Toucher, appui long, glisser-déposer ----------
function initPointer() {
  const view = $("#table-view");
  let g = null; // geste en cours
  const cancelTimer = () => { if (g?.timer) { clearTimeout(g.timer); g.timer = null; } };

  view.addEventListener("pointerdown", (e) => {
    const seat = e.target.closest(".seat");
    if (!seat || e.button > 0) return;
    g = { seat, id: seat.dataset.id, from: Number(seat.dataset.i), x0: e.clientX, y0: e.clientY, armed: false, drag: false, moved: false, pointerId: e.pointerId };
    // Appui long : le jeton se soulève et peut être déplacé.
    g.timer = setTimeout(() => {
      if (!g) return;
      g.timer = null;
      g.armed = true;
      seat.classList.add("lifted");
      try { seat.setPointerCapture(g.pointerId); } catch (err) { /* pointeur déjà relâché */ }
      navigator.vibrate?.(15);
    }, LONG_PRESS_MS);
  });

  view.addEventListener("pointermove", (e) => {
    if (!g || e.pointerId !== g.pointerId) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
    if (!g.armed) {
      // Le doigt bouge avant l'appui long : c'est un défilement, pas un déplacement.
      if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) { g.moved = true; cancelTimer(); }
      return;
    }
    if (!g.drag) { g.drag = true; g.seat.classList.add("dragging"); }
    g.seat.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.08)`;
    // Place visée : la plus proche de l'angle du doigt autour du centre.
    const circle = $(".table-circle").getBoundingClientRect();
    const a = Math.atan2(e.clientY - (circle.top + circle.height / 2), e.clientX - (circle.left + circle.width / 2));
    const n = L.players().length;
    g.to = ((Math.round(((a + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI / n))) % n + n) % n;
    view.querySelectorAll(".seat").forEach((s) => s.classList.toggle("drop-target", Number(s.dataset.i) === g.to && s !== g.seat));
  });

  // Pendant le déplacement, l'écran ne défile pas.
  view.addEventListener("touchmove", (e) => { if (g?.armed) e.preventDefault(); }, { passive: false });

  const end = (e) => {
    if (!g || e.pointerId !== g.pointerId) return;
    cancelTimer();
    const finished = g;
    g = null;
    if (finished.armed) {
      if (finished.drag && finished.to != null && finished.to !== finished.from) {
        L.movePlayer(finished.from, finished.to);
        commit();
      } else {
        // Relâché sans bouger, ou à sa place : le jeton se repose doucement.
        finished.seat.classList.remove("lifted", "dragging");
        finished.seat.style.transform = "";
        view.querySelectorAll(".drop-target").forEach((s) => s.classList.remove("drop-target"));
      }
    }
    // Un appui long ou un défilement ne doit pas ouvrir la fiche.
    if (finished.armed || finished.moved) {
      const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      view.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => view.removeEventListener("click", stop, { capture: true }), 50);
    }
  };
  view.addEventListener("pointerup", end);
  view.addEventListener("pointercancel", end);
  // Pas de menu contextuel du navigateur sur un jeton (appui long, clic droit).
  view.addEventListener("contextmenu", (e) => { if (e.target.closest(".seat")) e.preventDefault(); });
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
    ta.value = ""; closeDialog(dlg);
  });
  $("#paste-replace").addEventListener("click", () => {
    const names = parseNames(ta.value);
    if (!names.length || !confirm(`Remplacer les ${L.players().length} joueurs actuels par ces ${names.length} joueurs ?`)) return;
    app.state.profiles = [...app.state.profiles.filter((p) => p.explore), ...names.map((n) => newProfile(n))];
    app.state.current = "explore";
    commit();
    ta.value = ""; closeDialog(dlg);
  });
  return () => { refresh(); dlg.showModal(); ta.focus(); };
}

export function initTable() {
  initPointer();
  const openPaste = initPaste();
  const view = $("#table-view");
  view.addEventListener("click", (e) => {
    if (e.target.closest("#add-seat")) return addPlayer();
    if (e.target.closest("#paste-players")) return openPaste();
    if (e.target.closest("#ob-script")) return app.openNewGame?.("blank");
    const seat = e.target.closest(".seat");
    if (seat) app.openSheet(seat.dataset.id);
  });
  // Vérifications repliées / dépliées : mémorisé.
  view.addEventListener("toggle", (e) => {
    if (e.target.id !== "checks") return;
    app.state.checksOpen = e.target.open;
    save();
  }, true);
  return { openPaste };
}
