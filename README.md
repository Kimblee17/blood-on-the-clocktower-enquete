# Blood on the Clocktower · Carnet d'enquête

Progressive Web App (HTML/CSS/JS sans dépendance) pour enquêter pendant une partie de Blood on the Clocktower . Scénario actuellement disponible : *Veiled Threats*.

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

- `app/data.js` — rôles, catégories de réveil / choix, ordre de nuit, règles maison, répartition.
- `app/app.js` — logique (filtres, joueurs, notes, sauvegarde).
- `app/sw.js` — cache hors ligne. Changer `CACHE` après une mise à jour des fichiers.
