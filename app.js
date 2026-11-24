(() => {
  "use strict";

  const STORE_KEY = "vt-enquete-v1";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const roleById = Object.fromEntries(ROLES.map((r) => [r.id, r]));
  const wakeLabel = Object.fromEntries(WAKE_OPTIONS.map((o) => [o.id, o.label]));
  const choiceLabel = Object.fromEntries(CHOICE_OPTIONS.map((o) => [o.id, o.label]));

  const newProfile = (name, explore = false) => ({
    id: explore ? "explore" : uid(), name, explore,
    wake: [], choice: [], team: [], excluded: [],
    dead: false, claim: "", notes: "",
  });

  const defaultState = () => ({
    profiles: [newProfile("Exploration", true)],
    current: "explore",
    globalNotes: "",
    hideExcluded: false,
    playerCount: 8,
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.profiles) && s.profiles.length) return { ...defaultState(), ...s };
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

  // ---------- Filtrage ----------
  function matches(role, p) {
    if (p.wake.length && !role.wake.some((w) => p.wake.includes(w))) return false;
    if (p.choice.length && !role.choice.some((c) => p.choice.includes(c))) return false;
    if (p.team.length && !p.team.includes(role.team)) return false;
    return true;
  }
  const possible = (p) => ROLES.filter((r) => matches(r, p) && !p.excluded.includes(r.id));

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
  function renderPlayers() {
    const strip = $("#player-strip");
    strip.innerHTML = state.profiles.map((p) => `
      <button type="button" class="chip ${p.id === state.current ? "active" : ""} ${p.dead ? "dead" : ""}" data-id="${p.id}">
        <span class="name">${esc(p.name || "Sans nom")}</span>
        <span class="n" title="Rôles encore possibles">${possible(p).length}</span>
      </button>`).join("") +
      `<button type="button" class="chip add" id="add-player">+ Joueur</button>`;
  }

  function roleCard(r, p) {
    const on = matches(r, p);
    const ex = p.excluded.includes(r.id);
    const claimed = !p.explore && p.claim === r.id;
    const cls = ["role", `t-${r.team}`, !on && "off", ex && "excluded", claimed && "claimed",
      state.hideExcluded && (!on || ex) && "hidden"].filter(Boolean).join(" ");
    const pills = [
      ...r.wake.map((w) => `<span class="pill ${p.wake.includes(w) ? "hit" : ""}">${esc(wakeLabel[w])}</span>`),
      ...r.choice.map((c) => `<span class="pill ${p.choice.includes(c) ? "hit" : ""}">${esc(choiceLabel[c])}</span>`),
    ].join("");
    const badge = claimed ? "Annoncé" : ex ? "Écarté" : "";
    return `
      <button type="button" class="${cls}" data-role="${r.id}" aria-pressed="${ex}">
        <img src="icons/roles/${r.id}.jpg" alt="" loading="lazy" width="56" height="56">
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
      const roles = ROLES.filter((r) => r.team === t.id);
      const n = roles.filter((r) => matches(r, p) && !p.excluded.includes(r.id)).length;
      return `<div class="team-block"><h2>${t.label} <small>${n}/${roles.length}</small></h2>
        <div class="grid">${roles.map((r) => roleCard(r, p)).join("")}</div></div>`;
    }).join("");
    const n = possible(p).length;
    $("#roles").innerHTML = html + (state.hideExcluded && n === 0 ? `<p class="empty">Aucun rôle ne correspond. Une info est peut-être fausse (ivresse, poison, Reclus…).</p>` : "");
    $("#count").innerHTML = `<strong>${n}</strong> / ${ROLES.length} rôles possibles${p.explore ? "" : ` pour <em>${esc(p.name)}</em>`}`;
    $("#hide-excluded").checked = state.hideExcluded;
  }

  function renderPanel() {
    const p = cur();
    const poss = possible(p);
    const list = `<div class="possible-list">${poss.map((r) => `<span class="pill">${esc(r.name)}</span>`).join("") || `<span class="intro">Aucun</span>`}</div>`;
    if (p.explore) {
      $("#player-panel").innerHTML = `
        <h2>Exploration</h2>
        <p class="intro">Filtrez librement sans l'associer à un joueur. Ajoutez des joueurs avec « + Joueur » pour suivre les rôles possibles de chacun.</p>
        <label class="field">Rôles possibles</label>${list}`;
      return;
    }
    const claimRole = roleById[p.claim];
    const warn = claimRole && (!matches(claimRole, p) || p.excluded.includes(claimRole.id))
      ? `<p class="note" style="color:var(--danger)">Le rôle annoncé ne correspond pas à vos observations : mensonge, ivresse ou poison ?</p>` : "";
    $("#player-panel").innerHTML = `
      <h2>Joueur</h2>
      <label class="field">Nom<input type="text" id="p-name" value="${esc(p.name)}" autocomplete="off"></label>
      <div class="row"><label class="switch"><input type="checkbox" id="p-dead" ${p.dead ? "checked" : ""}> Mort</label></div>
      <label class="field">Rôle annoncé
        <select id="p-claim">
          <option value="">— Aucun —</option>
          ${TEAMS.map((t) => `<optgroup label="${t.label}">${ROLES.filter((r) => r.team === t.id).map((r) => `<option value="${r.id}" ${p.claim === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</optgroup>`).join("")}
        </select>
      </label>
      ${warn}
      <label class="field">Rôles possibles (${poss.length})</label>${list}
      <label class="field">Notes sur ce joueur<textarea id="p-notes" rows="5" placeholder="Ce qu'il dit, ses votes, ses infos…">${esc(p.notes)}</textarea></label>
      <div class="row"><button type="button" class="ghost danger" id="p-delete">Supprimer ce joueur</button></div>`;
  }

  function render() {
    multis.forEach((f) => f());
    renderPlayers();
    renderRoles();
    renderPanel();
  }

  // ---------- Évènements ----------
  $("#player-strip").addEventListener("click", (e) => {
    if (e.target.closest("#add-player")) {
      const n = state.profiles.filter((p) => !p.explore).length + 1;
      const p = newProfile(`Joueur ${n}`);
      state.profiles.push(p);
      state.current = p.id;
      save(); render();
      const inp = $("#p-name"); if (inp) { inp.focus(); inp.select(); }
      return;
    }
    const chip = e.target.closest(".chip[data-id]");
    if (chip) { state.current = chip.dataset.id; save(); render(); }
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
    if (e.target.id === "p-name") { p.name = e.target.value; save(); renderPlayers(); renderRoles(); }
    if (e.target.id === "p-notes") { p.notes = e.target.value; save(); }
  });
  $("#player-panel").addEventListener("change", (e) => {
    const p = cur();
    if (e.target.id === "p-dead") { p.dead = e.target.checked; save(); renderPlayers(); }
    if (e.target.id === "p-claim") { p.claim = e.target.value; save(); renderRoles(); renderPanel(); }
  });
  $("#player-panel").addEventListener("click", (e) => {
    if (e.target.id !== "p-delete") return;
    const p = cur();
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
    if (!confirm("Nouvelle partie : effacer filtres, notes, morts et rôles annoncés ?\nLes noms des joueurs sont conservés.")) return;
    state.profiles = state.profiles.map((p) => ({ ...newProfile(p.name, p.explore), id: p.id }));
    state.globalNotes = ""; gn.value = "";
    state.current = "explore";
    save(); render();
  });

  // ---------- Dialogues ----------
  document.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", () => $("#" + b.dataset.open).showModal()));

  let night = "first";
  function renderNight() {
    const p = cur();
    const poss = new Set(possible(p).map((r) => r.id));
    $("#night-list").innerHTML = NIGHT_ORDER[night].map(([id, txt]) => {
      if (id.startsWith("_")) return `<li><div class="ph">T</div><div><b>Tor</b><span>${esc(txt)}</span></div></li>`;
      const r = roleById[id];
      return `<li class="${poss.has(id) ? "" : "dim"}"><img src="icons/roles/${id}.jpg" alt=""><div><b>${esc(r.name)}</b><span>${esc(txt)}</span></div></li>`;
    }).join("");
  }
  document.querySelectorAll("[data-night]").forEach((t) => t.addEventListener("click", () => {
    night = t.dataset.night;
    document.querySelectorAll("[data-night]").forEach((x) => x.classList.toggle("active", x === t));
    renderNight();
  }));
  $("[data-open=night-dialog]").addEventListener("click", renderNight);

  $("#fabled").innerHTML = FABLED.map((f) => `<li><b>${esc(f.name)}</b> — ${esc(f.text)}</li>`).join("");
  const pc = $("#player-count");
  function renderCompo() {
    const n = Math.min(15, Math.max(5, parseInt(pc.value, 10) || 5));
    const c = COMPOSITION[n];
    $("#compo").innerHTML = TEAMS.map((t, i) => `<div class="t-${t.id}"><strong>${c[i]}</strong><span>${t.label}</span></div>`).join("");
    state.playerCount = n; save();
  }
  pc.value = state.playerCount;
  pc.addEventListener("input", renderCompo);
  renderCompo();

  render();

  // ---------- PWA ----------
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
