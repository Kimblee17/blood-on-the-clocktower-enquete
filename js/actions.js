// Actions partagées entre plusieurs vues.
import { app, commit, newProfile } from "./context.js";

const L = app.L;

export function select(id) {
  app.state.current = id;
  commit();
}

// Nouveau joueur : sa fiche s'ouvre, nom prêt à être saisi.
export function addPlayer(name) {
  const p = newProfile(name || `Joueur ${L.players().length + 1}`);
  app.state.profiles.push(p);
  app.openSheet(p.id, { focusName: !name });
}

// Ajoute plusieurs joueurs d'un coup, dans l'ordre donné.
export function addPlayers(names) {
  names.forEach((n) => app.state.profiles.push(newProfile(n)));
  commit();
}

// Rôle absent de la partie : exclu pour tous les joueurs (et rétablissable).
export function toggleOut(rid) {
  const s = app.state;
  s.notInPlay = L.isOut(rid) ? s.notInPlay.filter((x) => x !== rid) : [...(s.notInPlay || []), rid];
  commit();
}

// Retire la mort notée à la main ou bascule un champ booléen d'un joueur.
export function toggleFlag(p, key) {
  if (key === "me") {
    const was = p.me;
    L.players().forEach((o) => { o.me = false; });
    p.me = !was;
  } else p[key] = !p[key];
  commit();
}
