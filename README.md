# Blood on the Clocktower · Carnet d'enquête

Progressive Web App (HTML/CSS/JS sans dépendance) pour enquêter pendant une partie de Blood on the Clocktower. Scénarios disponibles : les 3 éditions de base (Trouble Brewing, Bad Moon Rising, Sects & Violets), Veiled Threats et 8 scénarios personnalisés.

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

- `app/roles.js` — base de données des rôles (**générée**, voir plus bas).
- `app/scripts_imported.js` — scénarios importés (**généré**).
- `app/scripts.js` — scénarios écrits à la main (Veiled Threats) et compléments aux scénarios importés (ordre de nuit, notes, règles de répartition).
- `app/app.js` — logique (sélecteur de scénario, filtres, joueurs, notes, sauvegarde).
- `app/sw.js` — cache hors ligne. Changer `CACHE` après chaque mise à jour.
- `tools/import_bambi.py` — import depuis le wiki BotC FR.

## Importer / mettre à jour les rôles et scénarios

Les noms, capacités, icônes et scénarios personnalisés viennent du [wiki BotC FR de BambiPotato](https://bambipotato.github.io/botc-fr-bambi/).
Le moment de réveil et le type de choix de chaque rôle ne figurent pas sur le site : ils sont renseignés dans `BEHAVIOUR` du script d'import.

```powershell
python -I tools/import_bambi.py
```

Le script signale les rôles dont le comportement manque : les ajouter dans `BEHAVIOUR` (et éventuellement `NOTES`), puis relancer.
Les voyageurs ne sont pas gérés.

L'ordre de nuit vient de la [feuille de nuit officielle](https://github.com/ThePandemoniumInstitute/botc-release/blob/main/resources/data/nightsheet.json) : chaque rôle reçoit un numéro (`night.first`, `night.other` dans `roles.js`) et l'ordre de chaque scénario, importé ou non, est calculé en triant ses rôles par numéro. Le texte affiché vient de `NIGHT_TEXT` (sinon il est déduit du type de choix).

## Ajouter un scénario à la main

Dans `app/scripts.js`, ajouter une entrée (`id`, `name`, `roles`, et si besoin `rules`, `roleNotes`, `setupNote`, `nightExtras`, `hideNightSpecials`).
Une entrée qui reprend l'`id` d'un scénario importé le complète au lieu d'en créer un nouveau.

## Crédits

- Noms, capacités, icônes et scénarios personnalisés : wiki BotC FR de BambiPotato, licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.fr). Textes parfois corrigés ou complétés.
- Blood on the Clocktower © The Pandemonium Institute. Outil non officiel.
