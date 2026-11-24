// Petits outils d'interface.

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const uid = () => Math.random().toString(36).slice(2, 9);
// Minuscules sans accents, pour la recherche.
export const norm = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Pastille ronde avec une initiale (rôle sans icône, joueur sans rôle).
export const placeholder = (letter) => "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f4eee2"/><text x="32" y="42" font-family="Georgia,serif" font-size="30" font-weight="700" text-anchor="middle" fill="#16121c">${letter}</text></svg>`);

// Icône d'un rôle ; si l'image manque, l'initiale s'affiche (voir main.js).
export const icon = (id, size) =>
  `<img src="icons/roles/${id}.jpg" alt="" loading="lazy" width="${size}" height="${size}" data-initial="${esc((ROLES[id]?.name || "?")[0])}" draggable="false">`;

// Message temporaire en bas de l'écran.
let toastTimer;
export function toast(msg) {
  const t = $("#toast");
  t.innerHTML = `<span>${esc(msg)}</span>`;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
}
