# Veiled Threats · Carnet d'enquête

Progressive Web App (HTML/CSS/JS sans dépendance) pour enquêter pendant une partie de Blood on the Clocktower avec le script *Veiled Threats*.

## Lancer en local

```powershell
python -m http.server 8765 --directory app
```

Puis ouvrir http://localhost:8765.

## Installer sur téléphone

Une PWA doit être servie en HTTPS. Le plus simple : publier le dossier `app/` (GitHub Pages, Netlify, Cloudflare Pages…), ouvrir l'adresse sur le téléphone puis « Ajouter à l'écran d'accueil ». L'app fonctionne ensuite hors ligne ; les données restent sur l'appareil (localStorage).

## Structure

- `app/data.js` — rôles, catégories de réveil / choix, ordre de nuit, règles maison, répartition.
- `app/app.js` — logique (filtres, joueurs, notes, sauvegarde).
- `app/sw.js` — cache hors ligne. Changer `CACHE` après une mise à jour des fichiers.
