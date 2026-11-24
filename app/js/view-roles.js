// Onglet Rôles : filtres (réveil, choix, équipe), recherche et cartes des rôles.
import { app, commit, save } from "./context.js";
import { $, esc, icon, norm } from "./util.js";
import { toggleOut } from "./actions.js";

const L = app.L;
const WAKE_SHORT = { each: "Chaque nuit", notfirst: "Sauf 1re nuit", once: "Une fois", none: "Pas de réveil" };
const CHOICE_SHORT = { one: "1 joueur", two: "2 joueurs", three: "3 joueurs", char: "Un personnage", none: "Aucun choix" };
let search = "";

// ---------- Listes déroulantes à choix multiples ----------
const multis = [];
function makeMulti(el, title, options, key) {
  el.innerHTML = `
    <button type="button" aria-haspopup="true" aria-expanded="false">
      <span><span class="lbl">${esc(title)}</span><span class="val"></span></span>
    </button>
    <div class="menu" role="group" aria-label="${esc(title)}">
      ${options.map((o) => `<label><input type="checkbox" value="${o.id}"> ${esc(o.label)}</label>`).join("")}
      <button type="button" class="link clear">Tout décocher</button>
    </div>`;
  const btn = el.querySelector("button");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !el.classList.contains("open");
    closeMenus();
    el.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
  el.querySelector(".menu").addEventListener("click", (e) => e.stopPropagation());
  el.querySelectorAll("input").forEach((inp) => inp.addEventListener("change", () => {
    L.cur()[key] = [...el.querySelectorAll("input:checked")].map((i) => i.value);
    commit();
  }));
  el.querySelector(".clear").addEventListener("click", () => { L.cur()[key] = []; commit(); });
  multis.push(() => {
    const sel = L.cur()[key];
    el.querySelectorAll("input").forEach((i) => (i.checked = sel.includes(i.value)));
    const labels = options.filter((o) => sel.includes(o.id)).map((o) => o.label);
    el.querySelector(".val").textContent = labels.length === 0 ? "Indifférent" : labels.length === 1 ? labels[0] : `${labels.length} choix`;
    el.classList.toggle("on", labels.length > 0);
  });
}
function closeMenus() {
  document.querySelectorAll(".multi.open").forEach((m) => {
    m.classList.remove("open");
    m.querySelector("button").setAttribute("aria-expanded", "false");
  });
}
export const syncFilters = () => multis.forEach((f) => f());

// ---------- Cartes ----------
function roleCard(r, p, jinxes) {
  const st = L.cellState(p, r), ex = st === "no", out = L.isOut(r.id);
  const claimed = !p.explore && p.claim === r.id;
  const taken = L.takenBy(r.id, p);
  const off = st === "auto" || st === "ded";
  const cls = ["role", `t-${r.team}`, off && "off", ex && "excluded", (claimed || st === "yes") && "claimed",
    app.state.hideExcluded && (off || ex) && "hidden"].filter(Boolean).join(" ");
  const pills = [
    `<span class="pill" title="Réveil">☾ ${r.wake.map((w) => `<span class="${p.wake.includes(w) ? "hit" : ""}">${esc(WAKE_SHORT[w])}</span>`).join(" / ")}</span>`,
    `<span class="pill" title="Choix">◎ ${r.choice.map((c) => `<span class="${p.choice.includes(c) ? "hit" : ""}">${esc(CHOICE_SHORT[c])}</span>`).join(" / ")}</span>`,
  ].join("");
  const jx = jinxes.filter(([a, b]) => a === r.id || b === r.id).map(([a, b, t]) =>
    `<p class="jinx"><b>Jinx · ${esc(app.byId[a === r.id ? b : a].name)}</b> : ${esc(t)}</p>`).join("");
  const badge = st === "yes" ? "Confirmé" : out ? "Absent de la partie" : ex ? "Écarté" : st === "ded" ? `Déduit (${esc(L.deducedWhy(p, r.id))})` : taken ? `Pris : ${esc(taken.name)}` : claimed ? "Annoncé" : "";
  const forWho = p.explore ? "" : ` pour ${esc(p.name)}`;
  return `
    <article class="${cls}" data-role="${r.id}">
      ${icon(r.id, 56)}
      <div class="body">
        <div class="title"><span class="name">${esc(r.name)}</span><span class="en">${esc(r.en)}</span></div>
        <p class="ability">${esc(r.ability)}</p>
        ${r.note ? `<p class="note">${esc(r.note)}</p>` : ""}
        ${jx}
        <div class="pills">${pills}</div>
      </div>
      <div class="card-side">
        ${badge ? `<span class="badge">${badge}</span>` : ""}
        <div class="card-btns">
          <button type="button" class="x ${ex ? "on" : ""}" data-x="${r.id}" aria-pressed="${ex}"
            aria-label="${ex ? "Rétablir" : "Écarter"} ${esc(r.name)}${forWho}" title="${ex ? "Rétablir" : "Écarter"}${forWho}">${ex ? "↺" : "✗"}</button>
          <button type="button" class="x out ${out ? "on" : ""}" data-out="${r.id}" aria-pressed="${out}"
            aria-label="${out ? "Remettre en jeu" : "Absent de la partie"} : ${esc(r.name)}"
            title="${out ? "Remettre en jeu" : "Absent de la partie : écarter pour tous les joueurs"}">${out ? "↺" : "⊘"}</button>
        </div>
      </div>
    </article>`;
}

export function renderRoles() {
  const p = L.cur(), jinxes = L.scriptJinxes(), q = norm(search.trim());
  const hit = (r) => !q || norm(`${r.name} ${r.en} ${r.ability}`).includes(q);
  const html = TEAMS.map((t) => {
    const roles = app.roles.filter((r) => r.team === t.id);
    const shown = roles.filter(hit);
    if (!shown.length) return "";
    const n = roles.filter((r) => L.isPossible(p, r)).length;
    return `<div class="team-block"><h2>${t.label} <small>${n}/${roles.length}</small></h2>
      <div class="grid">${shown.map((r) => roleCard(r, p, jinxes)).join("")}</div></div>`;
  }).join("");
  const n = L.possible(p).length;
  const empty = q && !html ? `<p class="empty">Aucun rôle ne contient « ${esc(search)} ».</p>`
    : app.state.hideExcluded && n === 0 ? `<p class="empty">Aucun rôle ne correspond. Une info est peut-être fausse (ivresse, poison, Reclus…).</p>` : "";
  $("#roles").innerHTML = html + empty;
  $("#roles").classList.toggle("compact", !!app.state.compact);
  $("#count").innerHTML = `<strong>${n}</strong> / ${app.roles.length} rôles possibles${p.explore ? ` <span class="muted">(aucun joueur sélectionné)</span>` : ` pour <em>${esc(p.name)}</em>`}`;
  $("#hide-excluded").checked = app.state.hideExcluded;
  $("#compact").checked = !!app.state.compact;
}

export function initRoles() {
  makeMulti($("#f-wake"), "Réveil", WAKE_OPTIONS, "wake");
  makeMulti($("#f-choice"), "Choix", CHOICE_OPTIONS, "choice");
  makeMulti($("#f-team"), "Équipe", TEAMS, "team");
  document.addEventListener("click", closeMenus);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });

  $("#roles").addEventListener("click", (e) => {
    const outBtn = e.target.closest("[data-out]");
    if (outBtn) return toggleOut(outBtn.dataset.out);
    const x = e.target.closest("[data-x]");
    if (x) {
      const p = L.cur(), id = x.dataset.x;
      p.excluded = p.excluded.includes(id) ? p.excluded.filter((y) => y !== id) : [...p.excluded, id];
      return commit();
    }
    const card = e.target.closest(".role");
    if (card && app.state.compact) card.classList.toggle("open");
  });
  $("#role-search").addEventListener("input", (e) => { search = e.target.value; renderRoles(); });
  $("#compact").addEventListener("change", (e) => { app.state.compact = e.target.checked; save(); renderRoles(); });
  $("#hide-excluded").addEventListener("change", (e) => { app.state.hideExcluded = e.target.checked; save(); renderRoles(); });
  $("#toggle-filters").addEventListener("click", (e) => {
    const f = $(".filters"), open = !f.classList.contains("open");
    f.classList.toggle("open", open);
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });
  $("#reset-filters").addEventListener("click", () => {
    const p = L.cur(); p.wake = []; p.choice = []; p.team = []; p.excluded = [];
    commit();
  });
}
