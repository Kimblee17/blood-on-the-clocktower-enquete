# Blood on the Clocktower · Carnet d'enquête

Progressive Web App (HTML/CSS/JS sans dépendance) pour enquêter pendant une partie de Blood on the Clocktower. Scénario actuellement disponible : *Veiled Threats*.

## Lancer en local

```powershell
python -m http.server 8765 --directory app
```

Puis ouvrir http://localhost:8765.

## Installer sur téléphone

Version en ligne : https://kimblee17.github.io/blood-on-the-clocktower-enquete/ — l'ouvrir sur le téléphone puis « Ajouter à l'écran d'accueil ». L'app fonctionne ensuite hors ligne ; les données restent sur l'appareil (localStorage).

Mettre à jour le site après une modification (penser à changer `CACHE` dans `app/sw.js`) :

```powershell
git push origin "$(git subtree split --prefix app main):refs/heads/gh-pages" --force
```

## Structure

- `app/roles.js` — base de données des rôles (capacité, réveil, choix), partagée par tous les scénarios, + répartition standard.
- `app/scripts.js` — les scénarios : liste de rôles, règles maison, ordre de nuit.
- `app/app.js` — logique (sélecteur de scénario, filtres, joueurs, notes, sauvegarde).
- `app/sw.js` — cache hors ligne. Changer `CACHE` après chaque mise à jour.

## Ajouter un scénario

1. Pour chaque rôle absent de `app/roles.js`, ajouter une entrée (`name`, `en`, `team`, `ability`, `wake`, `choice`).
   Les rôles dont le comportement dépend des autres (Alchimiste, Lunatique, Ivrogne…) utilisent `derive` au lieu de `wake` / `choice`.
2. Facultatif : ajouter l'icône `app/icons/roles/<id>.jpg` (128×128) et l'ajouter à la liste de `app/sw.js`. Sans icône, l'initiale du rôle s'affiche.
3. Ajouter le scénario dans `app/scripts.js` (`id`, `name`, `roles`, et si besoin `rules`, `roleNotes`, `setupNote`, `nightOrder`).
4. Incrémenter `CACHE` dans `app/sw.js`, puis publier.
