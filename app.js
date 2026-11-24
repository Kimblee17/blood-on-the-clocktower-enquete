(() => {
  "use strict";

  const STORE_KEY = "vt-enquete-v1";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const wakeLabel = Object.fromEntries(WAKE_OPTIONS.map((o) => [o.id, o.label]));
  const choiceLabel = Object.fromEntries(CHOICE_OPTIONS.map((o) => [o.id, o.label]));
  const teamLabel = Object.fromEntries(TEAMS.map((t) => [t.id, t.label]));
  const union = (lists) => [...new Set(lists.flat())];

  // ---------- Scénario ----------
  // Construit la liste des rôles effectifs du scénario : notes propres au
  // scénario et comportements dérivés (Alchimiste, Lunatique, Ivrogne…).
  function buildScript(script) {
    const ids = script.roles.filter((id) => ROLES[id]);
    const resolved = {};
    const resolve = (id, stack = []) => {
      if (resolved[id]) return resolved[id];
      const base = ROLES[id];
      let wake = base.wake || [], choice = base.choice || [], extra = "";
      if (base.derive) {
        const sources = ids.filter((x) => x !== id && ROLES[x].team === base.derive && !stack.includes(x));
        const res = sources.map((x) => resolve(x, [...stack, id]));
        wake = union(res.map((r) => r.wake));
        choice = union(res.map((r) => r.choice));
        if (base.derive !== "townsfolk" && sources.length) extra = `Ici : ${sources.map((x) => ROLES[x].name).join(", ")}.`;
      }
      const note = [base.note, extra, script.roleNotes?.[id]].filter(Boolean).join(" ");
      return (resolved[id] = { id, ...base, wake, choice, note });
    };
    return ids.map((id) => resolve(id));
  }

  let SCRIPT, ROLE_LIST, roleById;
  function useScript(id) {
    SCRIPT = SCRIPTS.find((s) => s.id === id) || SCRIPTS[0];
    ROLE_LIST = buildScript(SCRIPT);
    roleById = Object.fromEntries(ROLE_LIST.map((r) => [r.id, r]));
  }

  // ---------- État ----------
  const newProfile = (name, explore = false) => ({
    id: explore ? "explore" : uid(), name, explore,
    wake: [], choice: [], team: [], excluded: [],
    dead: false, claim: "", notes: "",
    align: "", confirmed: "", // align : "good" | "evil" | "" (inconnu)
  });

  const defaultState = () => ({
    view: "table", // "table" | "grid" | "roles"
    scriptId: SCRIPTS[0].id,
    profiles: [newProfile("Exploration", true)],
    current: "explore",
    globalNotes: "",
    hideExcluded: false,
    playerCount: 8,
    // Journal : phases N1, J1, N2, J2… (index pair = nuit, impair = jour).
    journal: { phase: 0, last: 0, events: [] },
  });

  let state = load();
  useScript(state.scriptId);

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.profiles) && s.profiles.length) {
          // Anciens ids de rôles (« fortune_teller » → « fortuneteller »).
          const fix = (id) => (id || "").replace(/_/g, "");
          s.profiles.forEach((p) => { p.excluded = (p.excluded || []).map(fix); p.claim = fix(p.claim); });
          return { ...defaultState(), ...s };
        }
      }
    } catch (e) { /* stockage indisponible */ }
    return defaultState();
  }

  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
        $("#saved-indicator").textContent = "Enregistré sur cet appareil";
      } catch (e) {
        $("#saved-indicator").textContent = "Impossible d'enregistrer (stockage bloqué)";
      }
    }, 250);
  }

  const cur = () => state.profiles.find((p) => p.id === state.current) || state.profiles[0];
  // Joueurs dans l'ordre de la table (sens horaire), sans le profil d'exploration.
  const players = () => state.profiles.filter((p) => !p.explore);
  const confirmedOf = (p) => (roleById[p.confirmed] ? p.confirmed : "");

  // ---------- Filtrage / déduction ----------
  function matches(role, p) {
    if (p.wake.length && !role.wake.some((w) => p.wake.includes(w))) return false;
    if (p.choice.length && !role.choice.some((c) => p.choice.includes(c))) return false;
    if (p.team.length && !p.team.includes(role.team)) return false;
    return true;
  }
  // Joueur (autre que p) dont ce rôle est confirmé.
  const takenBy = (rid, p) => (p.explore ? null : players().find((o) => o !== p && confirmedOf(o) === rid));
  // État d'une case joueur × rôle :
  //   yes = confirmé · no = écarté à la main · auto = exclu par déduction · maybe = possible
  function cellState(p, r) {
    const conf = confirmedOf(p);
    if (conf === r.id) return "yes";
    if (p.excluded.includes(r.id)) return "no";
    if (conf || !matches(r, p) || takenBy(r.id, p)) return "auto";
    return "maybe";
  }
  const isPossible = (p, r) => { const s = cellState(p, r); return s === "yes" || s === "maybe"; };
  const possible = (p) => ROLE_LIST.filter((r) => isPossible(p, r));

  // Voisins vivants les plus proches (gauche = sens anti-horaire, droite = sens horaire).
  function neighbours(p) {
    const ps = players(), n = ps.length, i = ps.indexOf(p);
    if (i < 0 || n < 2) return [null, null];
    const find = (dir) => {
      for (let k = 1; k < n; k++) {
        const o = ps[(i + dir * k + n * k) % n];
        if (o !== p && !o.dead) return o;
      }
      return null;
    };
    return [find(-1), find(1)];
  }

  // ---------- Icônes ----------
  const icon = (id, size) => `<img src="icons/roles/${id}.jpg" alt="" loading="lazy" width="${size}" height="${size}" data-initial="${esc((ROLES[id]?.name || "?")[0])}">`;
  const placeholder = (letter) => "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f4eee2"/><text x="32" y="42" font-family="Georgia,serif" font-size="30" font-weight="700" text-anchor="middle" fill="#16121c">${letter}</text></svg>`);
  // Rôle sans icône : on affiche son initiale.
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.initial && !img.src.startsWith("data:")) img.src = placeholder(img.dataset.initial);
  }, true);

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
    el.querySelectorAll("input").forEach((inp) =>
      inp.addEventListener("change", () => {
        const p = cur();
        p[key] = [...el.querySelectorAll("input:checked")].map((i) => i.value);
        save(); render();
      }));
    el.querySelector(".clear").addEventListener("click", () => { cur()[key] = []; save(); render(); });
    const sync = () => {
      const sel = cur()[key];
      el.querySelectorAll("input").forEach((i) => (i.checked = sel.includes(i.value)));
      const labels = options.filter((o) => sel.includes(o.id)).map((o) => o.label);
      el.querySelector(".val").textContent = labels.length === 0 ? "Indifférent" : labels.length === 1 ? labels[0] : `${labels.length} choix`;
      el.classList.toggle("on", labels.length > 0);
    };
    multis.push(sync);
  }
  function closeMenus() {
    document.querySelectorAll(".multi.open").forEach((m) => {
      m.classList.remove("open");
      m.querySelector("button").setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("click", closeMenus);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });

  makeMulti($("#f-wake"), "Réveil", WAKE_OPTIONS, "wake");
  makeMulti($("#f-choice"), "Choix", CHOICE_OPTIONS, "choice");
  makeMulti($("#f-team"), "Équipe", TEAMS, "team");

  // ---------- Rendu ----------
  function renderScriptSelect() {
    const sel = $("#script-select");
    const opt = (s) => `<option value="${s.id}" ${s.id === SCRIPT.id ? "selected" : ""}>${esc(s.name)}</option>`;
    const official = (s) => s.author === "The Pandemonium Institute";
    sel.innerHTML =
      `<optgroup label="Éditions de base">${SCRIPTS.filter(official).map(opt).join("")}</optgroup>` +
      `<optgroup label="Scénarios personnalisés">${SCRIPTS.filter((s) => !official(s)).map(opt).join("")}</optgroup>`;
    document.title = `${SCRIPT.name} · Enquête`;
  }

  function renderPlayers() {
    const strip = $("#player-strip");
    strip.innerHTML = state.profiles.map((p) => `
      <button type="button" class="chip ${p.id === state.current ? "active" : ""} ${p.dead ? "dead" : ""}" data-id="${p.id}">
        ${p.explore ? "" : `<span class="dot a-${p.align || "unknown"}" aria-hidden="true"></span>`}
        <span class="name">${esc(p.name || "Sans nom")}</span>
        <span class="n" title="Rôles encore possibles">${possible(p).length}</span>
      </button>`).join("") +
      `<button type="button" class="chip add" id="add-player">+ Joueur</button>`;
  }

  function roleCard(r, p) {
    const st = cellState(p, r);
    const ex = st === "no";
    const claimed = !p.explore && p.claim === r.id;
    const taken = takenBy(r.id, p);
    const cls = ["role", `t-${r.team}`, st === "auto" && "off", ex && "excluded", (claimed || st === "yes") && "claimed",
      state.hideExcluded && (st === "auto" || ex) && "hidden"].filter(Boolean).join(" ");
    const pills = [
      ...r.wake.map((w) => `<span class="pill ${p.wake.includes(w) ? "hit" : ""}">${esc(wakeLabel[w])}</span>`),
      ...r.choice.map((c) => `<span class="pill ${p.choice.includes(c) ? "hit" : ""}">${esc(choiceLabel[c])}</span>`),
    ].join("");
    const badge = st === "yes" ? "Confirmé" : ex ? "Écarté" : taken ? `Pris : ${esc(taken.name)}` : claimed ? "Annoncé" : "";
    return `
      <button type="button" class="${cls}" data-role="${r.id}" aria-pressed="${ex}">
        ${icon(r.id, 56)}
        <div>
          <div><span class="name">${esc(r.name)}</span><span class="en">${esc(r.en)}</span></div>
          <p class="ability">${esc(r.ability)}</p>
          ${r.note ? `<p class="note">${esc(r.note)}</p>` : ""}
          <div class="pills">${pills}</div>
        </div>
        ${badge ? `<span class="badge">${badge}</span>` : ""}
      </button>`;
  }

  function renderRoles() {
    const p = cur();
    const html = TEAMS.map((t) => {
      const roles = ROLE_LIST.filter((r) => r.team === t.id);
      if (!roles.length) return "";
      const n = roles.filter((r) => isPossible(p, r)).length;
      return `<div class="team-block"><h2>${t.label} <small>${n}/${roles.length}</small></h2>
        <div class="grid">${roles.map((r) => roleCard(r, p)).join("")}</div></div>`;
    }).join("");
    const n = possible(p).length;
    $("#roles").innerHTML = html + (state.hideExcluded && n === 0 ? `<p class="empty">Aucun rôle ne correspond. Une info est peut-être fausse (ivresse, poison, Reclus…).</p>` : "");
    $("#count").innerHTML = `<strong>${n}</strong> / ${ROLE_LIST.length} rôles possibles${p.explore ? "" : ` pour <em>${esc(p.name)}</em>`}`;
    $("#hide-excluded").checked = state.hideExcluded;
  }

  function renderPanel() {
    const p = cur();
    const poss = possible(p);
    const list = `<div class="possible-list">${poss.map((r) => `<span class="pill">${esc(r.name)}</span>`).join("") || `<span class="intro">Aucun</span>`}</div>`;
    if (p.explore) {
      $("#player-panel").innerHTML = `
        <h2>Exploration</h2>
        <label class="field">Rôles possibles</label>${list}`;
      return;
    }
    const claimRole = roleById[p.claim];
    const warn = claimRole && !isPossible(p, claimRole)
      ? `<p class="note warn">Le rôle annoncé ne correspond pas à vos déductions : mensonge, ivresse ou poison ?</p>` : "";
    const roleOptions = (sel) => TEAMS.map((t) => {
      const rs = ROLE_LIST.filter((r) => r.team === t.id);
      return rs.length ? `<optgroup label="${t.label}">${rs.map((r) => `<option value="${r.id}" ${sel === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</optgroup>` : "";
    }).join("");
    const [left, right] = neighbours(p);
    const nb = players().length > 2
      ? `<p class="intro">Voisins vivants : <b>${esc(left?.name ?? "—")}</b> ← · → <b>${esc(right?.name ?? "—")}</b></p>` : "";
    const alignBtn = (v, label) => `<button type="button" class="seg a-${v || "unknown"} ${p.align === v ? "on" : ""}" data-align="${v}">${label}</button>`;
    $("#player-panel").innerHTML = `
      <h2>Joueur</h2>
      <label class="field">Nom<input type="text" id="p-name" value="${esc(p.name)}" autocomplete="off"></label>
      <div class="row"><label class="switch"><input type="checkbox" id="p-dead" ${p.dead ? "checked" : ""}> Mort</label></div>
      <label class="field">Alignement soupçonné</label>
      <div class="segmented" role="group" aria-label="Alignement soupçonné">
        ${alignBtn("good", "Bon")}${alignBtn("", "?")}${alignBtn("evil", "Mauvais")}
      </div>
      <label class="field">Rôle annoncé<select id="p-claim"><option value="">— Aucun —</option>${roleOptions(p.claim)}</select></label>
      ${warn}
      <label class="field">Rôle confirmé<select id="p-conf"><option value="">— Inconnu —</option>${roleOptions(confirmedOf(p))}</select></label>
      <label class="field">Place à la table</label>
      ${nb}
      <div class="row">
        <button type="button" class="ghost" data-move="-1">← Reculer</button>
        <button type="button" class="ghost" data-move="1">Avancer →</button>
      </div>
      <label class="field">Rôles possibles (${poss.length})</label>${list}
      ${(() => {
        const h = playerHistory(p);
        const ghost = p.dead ? `<p class="intro">Vote fantôme : ${ghostUsed(p) ? "<b>utilisé</b>" : "disponible"}</p>` : "";
        return `<label class="field">Historique (journal)</label>${ghost}` +
          (h.length ? `<ul class="history">${h.map((x) => `<li>${x}</li>`).join("")}</ul>` : `<p class="intro">Rien dans le journal pour l'instant.</p>`);
      })()}
      <label class="field">Notes sur ce joueur<textarea id="p-notes" rows="5" placeholder="Ce qu'il dit, ses votes, ses infos…">${esc(p.notes)}</textarea></label>
      <div class="row"><button type="button" class="ghost danger" id="p-delete">Supprimer ce joueur</button></div>`;
  }

  // ---------- Vue Table (cercle) ----------
  // Jeton d'un joueur : rôle confirmé, sinon rôle annoncé, sinon son initiale.
  function token(p) {
    const conf = confirmedOf(p), claim = roleById[p.claim] ? p.claim : "";
    const rid = conf || claim;
    const img = rid
      ? icon(rid, 64)
      : `<img src="${placeholder(esc((p.name || "?").trim()[0] || "?").toUpperCase())}" alt="" width="64" height="64">`;
    return { img, rid, conf };
  }

  function renderTable() {
    const ps = players(), n = ps.length;
    const alive = ps.filter((p) => !p.dead).length;
    const seats = ps.map((p, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
      const x = 50 + 40 * Math.cos(a), y = 50 + 40 * Math.sin(a);
      const t = token(p);
      const sub = t.conf ? `✓ ${roleById[t.conf].name}` : t.rid ? `« ${roleById[t.rid].name} »` : "?";
      const cls = ["seat", `a-${p.align || "unknown"}`, p.dead && "dead", p.id === state.current && "active", t.conf && "conf"].filter(Boolean).join(" ");
      return `
        <button type="button" class="${cls}" data-id="${p.id}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"
          aria-label="${esc(p.name)}${p.dead ? ", mort" : ""}">
          <span class="tok">${t.img}<span class="n">${possible(p).length}</span></span>
          <span class="nm">${esc(p.name || "Sans nom")}</span>
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
            <button type="button" class="ghost add-seat" id="add-seat">+ Joueur</button>
          </div>
        </div>
      </div>
      <p class="hint legend">
        <span class="lg a-good"></span> Bon <span class="lg a-evil"></span> Mauvais <span class="lg a-unknown"></span> Inconnu
        · ✓ rôle confirmé · « » rôle annoncé · le chiffre = rôles encore possibles
      </p>`;
  }

  // ---------- Vue Grille (joueurs × rôles) ----------
  const CELL = { yes: "✓", no: "✗", auto: "·", maybe: "" };
  const CELL_LABEL = { yes: "confirmé", no: "écarté", auto: "exclu par déduction", maybe: "possible" };
  function renderGrid() {
    const ps = players();
    if (!ps.length) {
      $("#grid-view").innerHTML = `<p class="empty">Ajoutez des joueurs pour remplir la grille de déduction.</p>`;
      return;
    }
    const teams = TEAMS.map((t) => ({ ...t, roles: ROLE_LIST.filter((r) => r.team === t.id) })).filter((t) => t.roles.length);
    const roles = teams.flatMap((t) => t.roles);
    const head1 = teams.map((t) => `<th colspan="${t.roles.length}" class="team t-${t.id}">${t.label}</th>`).join("");
    const head2 = roles.map((r) => `<th class="rh t-${r.team}" title="${esc(r.name)} — ${esc(r.ability)}">${icon(r.id, 28)}<span>${esc(r.name)}</span></th>`).join("");
    const rows = ps.map((p) => {
      const cells = roles.map((r) => {
        const s = cellState(p, r);
        return `<td><button type="button" class="cell s-${s}" data-p="${p.id}" data-r="${r.id}"
          aria-label="${esc(p.name)} / ${esc(r.name)} : ${CELL_LABEL[s]}">${CELL[s]}</button></td>`;
      }).join("");
      return `<tr class="${p.id === state.current ? "active" : ""} ${p.dead ? "dead" : ""}">
        <th class="pname"><button type="button" data-id="${p.id}"><span class="dot a-${p.align || "unknown"}"></span>${esc(p.name || "Sans nom")}</button></th>
        ${cells}<td class="cnt">${possible(p).length}</td></tr>`;
    }).join("");
    const foot = roles.map((r) => {
      const k = ps.filter((p) => isPossible(p, r)).length;
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
      <p class="hint">Touchez une case : vide → ✗ écarté → ✓ confirmé → vide.
        « · » = exclu par vos filtres ou parce que le rôle est confirmé chez un autre joueur.
        La ligne « Candidats » compte les joueurs qui peuvent encore avoir ce rôle (0 = rôle sans doute absent).</p>`;
  }

  // ---------- Journal de partie ----------
  // Évènements : { id, phase, type, ... }
  //   info  : player, text, targets[]      — info reçue / annoncée
  //   death : player, cause (night|exec|other)
  //   nom   : by, target, voters[], executed
  //   note  : text
  const J = () => state.journal;
  const phaseName = (i) => `${i % 2 ? "Jour" : "Nuit"} ${Math.floor(i / 2) + 1}`;
  const phaseShort = (i) => `${i % 2 ? "J" : "N"}${Math.floor(i / 2) + 1}`;
  const pname = (id) => state.profiles.find((p) => p.id === id)?.name || "(joueur supprimé)";
  const ordered = () => J().events.map((e, k) => ({ e, k })).sort((a, b) => a.e.phase - b.e.phase || a.k - b.k).map((x) => x.e);
  const killOf = (e) => (e.type === "death" ? e.player : e.type === "nom" && e.executed ? e.target : null);
  // Joueurs morts avant un évènement (ou à la fin si ev est absent).
  function deadBefore(ev) {
    const dead = new Set();
    for (const e of ordered()) { if (e === ev) break; const k = killOf(e); if (k) dead.add(k); }
    return dead;
  }
  const ghostUsed = (p) => J().events.some((e) => e.type === "nom" && e.voters.includes(p.id) && deadBefore(e).has(p.id));
  const CAUSE = { night: "pendant la nuit", exec: "par exécution", other: "" };

  function evText(e) {
    const b = (id) => `<b>${esc(pname(id))}</b>`;
    if (e.type === "info") {
      const t = e.targets.length ? ` <span class="muted">→ ${e.targets.map(pname).map(esc).join(", ")}</span>` : "";
      return `${e.player ? b(e.player) + " : " : ""}${esc(e.text)}${t}`;
    }
    if (e.type === "death") return `${b(e.player)} meurt ${CAUSE[e.cause] || ""}`.trim() + ".";
    if (e.type === "nom") {
      const dead = deadBefore(e);
      const alive = players().filter((p) => !dead.has(p.id)).length;
      const need = Math.ceil(alive / 2);
      const voters = e.voters.map((v) => esc(pname(v)) + (dead.has(v) ? " †" : "")).join(", ");
      return `${b(e.by)} nomine ${b(e.target)} — <b>${e.voters.length}</b> vote${e.voters.length > 1 ? "s" : ""} (${need} requis)` +
        (voters ? ` <span class="muted">: ${voters}</span>` : "") +
        (e.executed ? ` <span class="tag evil">Exécuté</span>` : "");
    }
    return esc(e.text);
  }
  const TYPE_LABEL = { info: "Info", death: "Mort", nom: "Nomination", note: "Note" };

  let draft = { type: "info", player: "", text: "", targets: [], cause: "night", by: "", target: "", voters: [], executed: false };
  const resetDraft = (type) => { draft = { ...draft, type, player: "", text: "", targets: [], by: "", target: "", voters: [], executed: false, cause: J().phase % 2 ? "exec" : "night" }; };

  function renderJournal() {
    const j = J(), ps = players();
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
    if (draft.type === "nom") {
      const dead = deadBefore(null);
      const need = Math.ceil(ps.filter((p) => !dead.has(p.id)).length / 2);
      form = `
      <div class="two">
        <label class="field">Nominateur<select data-d="by">${opts(draft.by)}</select></label>
        <label class="field">Nominé<select data-d="target">${opts(draft.target)}</select></label>
      </div>
      <label class="field">Votants <span class="muted">— ${draft.voters.length} vote(s), ${need} requis</span></label>
      ${chips("data-vt", draft.voters, (p) => (p.dead && ghostUsed(p) ? "spent" : ""))}
      <label class="switch" style="margin-top:10px"><input type="checkbox" data-d="executed" ${draft.executed ? "checked" : ""}> Exécuté</label>`;
    }
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
        <button type="button" class="ghost" id="j-next">Passer au ${phaseName(j.last + 1).toLowerCase()} →</button>
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
    const d = draft, e = { id: uid(), phase: J().phase, type: d.type };
    const msg = (t) => { $("#j-msg").textContent = t; };
    if (d.type === "info") { if (!d.text.trim()) return msg("Écrivez l'information."); Object.assign(e, { player: d.player, text: d.text.trim(), targets: d.targets }); }
    if (d.type === "death") { if (!d.player) return msg("Choisissez le joueur."); Object.assign(e, { player: d.player, cause: d.cause }); }
    if (d.type === "nom") { if (!d.by || !d.target) return msg("Choisissez nominateur et nominé."); Object.assign(e, { by: d.by, target: d.target, voters: d.voters, executed: d.executed }); }
    if (d.type === "note") { if (!d.text.trim()) return msg("Écrivez la note."); e.text = d.text.trim(); }
    J().events.push(e);
    const k = killOf(e);
    if (k) { const p = state.profiles.find((x) => x.id === k); if (p) p.dead = true; }
    resetDraft(d.type);
    save(); render();
  }

  function deleteEvent(id) {
    const e = J().events.find((x) => x.id === id);
    if (!e || !confirm("Supprimer cet évènement du journal ?")) return;
    J().events = J().events.filter((x) => x !== e);
    const k = killOf(e);
    if (k) { const p = state.profiles.find((x) => x.id === k); if (p) p.dead = J().events.some((x) => killOf(x) === k); }
    save(); render();
  }

  // Évènements du journal qui concernent un joueur.
  function playerHistory(p) {
    return ordered().flatMap((e) => {
      const ph = `<b>${phaseShort(e.phase)}</b> `;
      if (e.type === "info" && (e.player === p.id || e.targets.includes(p.id))) return [ph + evText(e)];
      if (e.type === "death" && e.player === p.id) return [ph + evText(e)];
      if (e.type === "nom") {
        if (e.by === p.id || e.target === p.id) return [ph + evText(e)];
        if (e.voters.includes(p.id)) return [`${ph}A voté pour la nomination de <b>${esc(pname(e.target))}</b>${deadBefore(e).has(p.id) ? " (vote fantôme)" : ""}.`];
      }
      return [];
    });
  }

  function renderView() {
    const v = state.view;
    document.querySelectorAll("[data-view]").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === v);
      b.setAttribute("aria-selected", String(b.dataset.view === v));
    });
    $("#roles-view").hidden = v !== "roles";
    $("#table-view").hidden = v !== "table";
    $("#grid-view").hidden = v !== "grid";
    $("#journal-view").hidden = v !== "journal";
    if (v === "journal") renderJournal();
    if (v === "table") renderTable();
    if (v === "grid") renderGrid();
    if (v === "roles") renderRoles();
  }

  function render() {
    multis.forEach((f) => f());
    renderPlayers();
    renderView();
    renderPanel();
  }

  // ---------- Évènements ----------
  $("#script-select").addEventListener("change", (e) => {
    state.scriptId = e.target.value;
    useScript(state.scriptId);
    save(); renderScriptSelect(); renderRules(); render();
  });

  function addPlayer() {
    const p = newProfile(`Joueur ${players().length + 1}`);
    state.profiles.push(p);
    state.current = p.id;
    save(); render();
    const inp = $("#p-name"); if (inp) { inp.focus(); inp.select(); }
  }
  const select = (id) => { state.current = id; save(); render(); };

  $("#player-strip").addEventListener("click", (e) => {
    if (e.target.closest("#add-player")) return addPlayer();
    const chip = e.target.closest(".chip[data-id]");
    if (chip) select(chip.dataset.id);
  });

  document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
    state.view = b.dataset.view; save(); renderView();
  }));

  $("#table-view").addEventListener("click", (e) => {
    if (e.target.closest("#add-seat")) return addPlayer();
    const seat = e.target.closest(".seat");
    if (seat) select(seat.dataset.id);
  });

  // Journal
  const jv = $("#journal-view");
  jv.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.jtype) { resetDraft(t.dataset.jtype); return renderJournal(); }
    if (t.dataset.phase) {
      J().phase = Number(t.dataset.phase);
      resetDraft(J().phase % 2 ? "nom" : "info");
      save(); return renderJournal();
    }
    if (t.id === "j-next") {
      J().last += 1; J().phase = J().last;
      resetDraft(J().phase % 2 ? "nom" : "info");
      save(); return renderJournal();
    }
    if (t.dataset.tg || t.dataset.vt) {
      const key = t.dataset.tg ? "targets" : "voters", id = t.dataset.tg || t.dataset.vt;
      draft[key] = draft[key].includes(id) ? draft[key].filter((x) => x !== id) : [...draft[key], id];
      return renderJournal();
    }
    if (t.id === "j-add") return addEvent();
    if (t.dataset.del) return deleteEvent(t.dataset.del);
  });
  const draftField = (e) => {
    const k = e.target.dataset.d;
    if (!k) return;
    draft[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
  };
  jv.addEventListener("input", draftField);
  jv.addEventListener("change", (e) => {
    draftField(e);
    if (e.target.dataset.d === "player" && draft.type === "info" && !draft.text) {
      // Pré-remplit avec le rôle annoncé ou confirmé du joueur.
      const p = state.profiles.find((x) => x.id === draft.player);
      const r = p && (roleById[confirmedOf(p)] || roleById[p.claim]);
      if (r) { draft.text = `${r.name} : `; renderJournal(); jv.querySelector("textarea[data-d=text]")?.focus(); }
    }
  });

  $("#grid-view").addEventListener("click", (e) => {
    const name = e.target.closest(".pname button[data-id]");
    if (name) return select(name.dataset.id);
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const p = state.profiles.find((x) => x.id === cell.dataset.p), rid = cell.dataset.r;
    const s = cellState(p, roleById[rid]);
    if (s === "yes") p.confirmed = "";                                    // ✓ → vide
    else if (s === "no") {                                                 // ✗ → ✓
      p.excluded = p.excluded.filter((x) => x !== rid);
      p.confirmed = rid;
    } else p.excluded = [...p.excluded, rid];                              // vide / · → ✗
    state.current = p.id;
    save(); render();
  });

  $("#roles").addEventListener("click", (e) => {
    const card = e.target.closest(".role");
    if (!card) return;
    const p = cur(), id = card.dataset.role;
    p.excluded = p.excluded.includes(id) ? p.excluded.filter((x) => x !== id) : [...p.excluded, id];
    save(); render();
  });

  $("#player-panel").addEventListener("input", (e) => {
    const p = cur();
    if (e.target.id === "p-name") { p.name = e.target.value; save(); renderPlayers(); renderView(); }
    if (e.target.id === "p-notes") { p.notes = e.target.value; save(); }
  });
  $("#player-panel").addEventListener("change", (e) => {
    const p = cur();
    if (e.target.id === "p-dead") { p.dead = e.target.checked; save(); render(); }
    if (e.target.id === "p-claim") { p.claim = e.target.value; save(); render(); }
    if (e.target.id === "p-conf") {
      p.confirmed = e.target.value;
      if (p.confirmed) p.excluded = p.excluded.filter((x) => x !== p.confirmed);
      save(); render();
    }
  });
  $("#player-panel").addEventListener("click", (e) => {
    const p = cur();
    const al = e.target.closest("[data-align]");
    if (al) { p.align = al.dataset.align; save(); render(); return; }
    const mv = e.target.closest("[data-move]");
    if (mv) {
      const ps = players(), n = ps.length, i = ps.indexOf(p), j = (i + Number(mv.dataset.move) + n) % n;
      [ps[i], ps[j]] = [ps[j], ps[i]];
      state.profiles = [...state.profiles.filter((x) => x.explore), ...ps];
      save(); render(); return;
    }
    if (e.target.id !== "p-delete") return;
    if (!confirm(`Supprimer « ${p.name} » et ses notes ?`)) return;
    state.profiles = state.profiles.filter((x) => x.id !== p.id);
    state.current = "explore";
    save(); render();
  });

  $("#hide-excluded").addEventListener("change", (e) => { state.hideExcluded = e.target.checked; save(); renderRoles(); });
  $("#reset-filters").addEventListener("click", () => {
    const p = cur(); p.wake = []; p.choice = []; p.team = []; p.excluded = [];
    save(); render();
  });

  const gn = $("#global-notes");
  gn.value = state.globalNotes;
  gn.addEventListener("input", () => { state.globalNotes = gn.value; save(); });

  $("#new-game").addEventListener("click", () => {
    if (!confirm("Nouvelle partie : effacer filtres, notes, journal, morts et rôles ?\nLes noms des joueurs sont conservés.")) return;
    state.profiles = state.profiles.map((p) => ({ ...newProfile(p.name, p.explore), id: p.id }));
    state.globalNotes = ""; gn.value = "";
    state.journal = { phase: 0, last: 0, events: [] };
    state.current = "explore";
    save(); render();
  });

  // ---------- Dialogues ----------
  document.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", () => $("#" + b.dataset.open).showModal()));

  let night = "first";
  const CHOICE_TEXT = { one: "un joueur", two: "2 joueurs", three: "3 joueurs", char: "un personnage" };
  function nightText(r) {
    if (r.nightText) return r.nightText;
    if (r.wake.length === 1 && r.wake[0] === "none") return "Étape du Conteur (sans réveil).";
    const picks = r.choice.filter((c) => CHOICE_TEXT[c]).map((c) => CHOICE_TEXT[c]);
    if (!picks.length) return "Reçoit une information.";
    return `Choisit ${picks.join(" ou ")}.`;
  }
  function renderNight() {
    const poss = new Set(possible(cur()).map((r) => r.id));
    // Ordre calculé : numéros d'ordre des rôles du scénario + étapes spéciales.
    const steps = [
      ...ROLE_LIST.filter((r) => r.night?.[night] != null).map((r) => ({ order: r.night[night], role: r })),
      ...(SCRIPT.hideNightSpecials ? [] : NIGHT_SPECIALS[night] || []),
      ...(SCRIPT.nightExtras?.[night] || []),
    ].sort((a, b) => a.order - b.order);
    $("#night-list").innerHTML = steps.map((s) => {
      if (!s.role) {
        return `<li><div class="ph">${esc(s.label[0])}</div><div><b>${esc(s.label)}</b><span>${esc(s.text)}</span></div></li>`;
      }
      const r = s.role;
      return `<li class="${poss.has(r.id) ? "" : "dim"}">${icon(r.id, 36)}<div><b>${esc(r.name)}</b><span>${esc(nightText(r))}</span></div></li>`;
    }).join("") || `<li><div></div><div><span>Personne ne se réveille cette nuit-là dans ce scénario.</span></div></li>`;
  }
  document.querySelectorAll("[data-night]").forEach((t) => t.addEventListener("click", () => {
    night = t.dataset.night;
    document.querySelectorAll("[data-night]").forEach((x) => x.classList.toggle("active", x === t));
    renderNight();
  }));
  $("[data-open=night-dialog]").addEventListener("click", renderNight);

  function renderRules() {
    $("#rules-title").textContent = `Scénario ${SCRIPT.name}${SCRIPT.author ? ` · ${SCRIPT.author}` : ""}`;
    $("#fabled").innerHTML = (SCRIPT.rules || []).map((f) => `<li><b>${esc(f.name)}</b> — ${esc(f.text)}</li>`).join("") || "<li>Aucune règle particulière.</li>";
    $("#setup-note").textContent = SCRIPT.setupNote || "";
  }
  const pc = $("#player-count");
  function renderCompo() {
    const n = Math.min(15, Math.max(5, parseInt(pc.value, 10) || 5));
    const c = COMPOSITION[n];
    $("#compo").innerHTML = TEAMS.map((t, i) => `<div class="t-${t.id}"><strong>${c[i]}</strong><span>${teamLabel[t.id]}</span></div>`).join("");
    state.playerCount = n; save();
  }
  pc.value = state.playerCount;
  pc.addEventListener("input", renderCompo);

  resetDraft(J().phase % 2 ? "nom" : "info");
  renderScriptSelect();
  renderRules();
  renderCompo();
  render();

  // ---------- PWA ----------
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
