"""Importe rôles, scénarios et icônes depuis le wiki BotC FR de BambiPotato.

Source : https://github.com/bambipotato/botc-fr-bambi (licence CC BY 4.0).
Les textes sont repris (parfois corrigés) ; le comportement de nuit de chaque
rôle (réveil / choix) est renseigné à la main dans BEHAVIOUR ci-dessous.

Usage (depuis la racine du projet) :
    python -I tools/import_bambi.py

Génère :
    app/roles.js              — base de données des rôles
    app/scripts_imported.js   — scénarios importés
    app/icons/roles/<id>.jpg  — icônes 128×128
Les scénarios écrits à la main (avec ordre de nuit) restent dans app/scripts.js.
"""
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, "app")
RAW = "https://raw.githubusercontent.com/bambipotato/botc-fr-bambi/main/"
API_TREE = "https://api.github.com/repos/bambipotato/botc-fr-bambi/git/trees/main?recursive=1"
# Ordre de nuit officiel (The Pandemonium Institute) : listes ordonnées d'ids.
NIGHTSHEET = "https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-release/main/resources/data/nightsheet.json"
NIGHT_SPECIAL_LABELS = {
    "minioninfo": ("Info des Sbires", "Les Sbires apprennent qui est le Démon (7+ joueurs)."),
    "demoninfo": ("Info du Démon", "Le Démon apprend ses Sbires et 3 rôles absents (7+ joueurs)."),
}
ROLE_DIRS = ("tb_roles", "bmr_roles", "sv_roles", "roles_experimentaux", "loric_roles", "legendaire_roles")
EDITIONS = [
    ("trouble_brewing", "Trouble Brewing", "tb_roles"),
    ("bad_moon_rising", "Bad Moon Rising", "bmr_roles"),
    ("sects_and_violets", "Sects & Violets", "sv_roles"),
]

ALL_W = ["each", "notfirst", "once", "none"]
ALL_C = ["one", "two", "three", "char", "none"]

# id -> (réveil, choix)   |   "derive:<équipe>" = comportement copié d'autres rôles du scénario
BEHAVIOUR = {
    # --- Villageois ---
    "alchemist": "derive:minion",
    "alsaahir": (["none"], ["none"]),
    "amnesiac": (ALL_W, ALL_C),
    "artist": (["none"], ["none"]),
    "balloonist": (["each"], ["none"]),
    "banshee": (["none"], ["none"]),
    "cannibal": (["notfirst", "once", "none"], ALL_C),
    "chambermaid": (["each"], ["two"]),
    "chef": (["once"], ["none"]),
    "clockmaker": (["once"], ["none"]),
    "courtier": (["once"], ["char"]),
    "dreamer": (["each"], ["one"]),
    "empath": (["each"], ["none"]),
    "exorcist": (["notfirst"], ["one"]),
    "fisherman": (["none"], ["none"]),
    "flowergirl": (["notfirst"], ["none"]),
    "fool": (["none"], ["none"]),
    "fortuneteller": (["each"], ["two"]),
    "gambler": (["notfirst"], ["one", "char"]),
    "general": (["each"], ["none"]),
    "gossip": (["none"], ["none"]),
    "grandmother": (["once"], ["none"]),
    "highpriestess": (["each"], ["none"]),
    "huntsman": (["once"], ["one"]),
    "innkeeper": (["notfirst"], ["two"]),
    "investigator": (["once"], ["none"]),
    "juggler": (["once"], ["none"]),
    "king": (["notfirst", "none"], ["none"]),
    "knight": (["once"], ["none"]),
    "librarian": (["once"], ["none"]),
    "lycanthrope": (["notfirst"], ["one"]),
    "mathematician": (["each"], ["none"]),
    "mayor": (["none"], ["none"]),
    "minstrel": (["none"], ["none"]),
    "monk": (["notfirst"], ["one"]),
    "nightwatchman": (["once"], ["one"]),
    "noble": (["once"], ["none"]),
    "oracle": (["notfirst"], ["none"]),
    "pacifist": (["none"], ["none"]),
    "philosopher": (["once"], ["char"]),
    "pixie": (["once"], ["none"]),
    "preacher": (["each"], ["one"]),
    "princess": (["none"], ["none"]),
    "professor": (["once"], ["one"]),
    "ravenkeeper": (["once"], ["one"]),
    "sage": (["once"], ["none"]),
    "sailor": (["each"], ["one"]),
    "savant": (["none"], ["none"]),
    "seamstress": (["once"], ["two"]),
    "shugenja": (["once"], ["none"]),
    "slayer": (["none"], ["none"]),
    "snakecharmer": (["each"], ["one"]),
    "soldier": (["none"], ["none"]),
    "steward": (["once"], ["none"]),
    "tealady": (["none"], ["none"]),
    "towncrier": (["notfirst"], ["none"]),
    "undertaker": (["notfirst"], ["none"]),
    "virgin": (["none"], ["none"]),
    "washerwoman": (["once"], ["none"]),
    # --- Marginaux ---
    "barber": (["none"], ["none"]),
    "butler": (["each"], ["one"]),
    "damsel": (["none"], ["none"]),
    "drunk": "derive:townsfolk",
    "golem": (["none"], ["none"]),
    "goon": (["none"], ["none"]),
    "klutz": (["none"], ["none"]),
    "lunatic": "derive:demon",
    "moonchild": (["none"], ["none"]),
    "mutant": (["none"], ["none"]),
    "plaguedoctor": (["none"], ["none"]),
    "politician": (["none"], ["none"]),
    "puzzlemaster": (["none"], ["none"]),
    "recluse": (["none"], ["none"]),
    "saint": (["none"], ["none"]),
    "snitch": (["none"], ["none"]),
    "sweetheart": (["none"], ["none"]),
    "tinker": (["none"], ["none"]),
    # --- Sbires ---
    "assassin": (["once"], ["one"]),
    "baron": (["none"], ["none"]),
    "boffin": (["none"], ["none"]),
    "boomdandy": (["none"], ["none"]),
    "cerenovus": (["each"], ["one", "char"]),
    "devilsadvocate": (["each"], ["one"]),
    "eviltwin": (["once"], ["none"]),
    "fearmonger": (["each"], ["one"]),
    "goblin": (["none"], ["none"]),
    "godfather": (["once", "notfirst"], ["none", "one"]),
    "marionette": "derive:townsfolk",
    "mastermind": (["none"], ["none"]),
    "mezepheles": (["once"], ["none"]),
    "pithag": (["notfirst"], ["one", "char"]),
    "poisoner": (["each"], ["one"]),
    "scarletwoman": (["none", "notfirst"], ["none", "one"]),
    "spy": (["each"], ["none"]),
    "widow": (["once"], ["one"]),
    "witch": (["each"], ["one"]),
    "wizard": (["once"], ["none"]),
    "wraith": (["each", "none"], ["none"]),
    "xaan": (["none"], ["none"]),
    # --- Démons ---
    "alhadikhia": (["notfirst"], ["three"]),
    "fanggu": (["notfirst"], ["one"]),
    "imp": (["notfirst"], ["one"]),
    "leviathan": (["none"], ["none"]),
    "lilmonsta": (["none"], ["none"]),
    "nodashii": (["notfirst"], ["one"]),
    "po": (["notfirst"], ["one", "three", "none"]),
    "pukka": (["each"], ["one"]),
    "shabaloth": (["notfirst"], ["two"]),
    "vigormortis": (["notfirst"], ["one"]),
    "vortox": (["notfirst"], ["one"]),
    "zombuul": (["notfirst"], ["one"]),
    # --- Rôles expérimentaux (non utilisés dans les scénarios fournis) ---
    "acrobat": (["notfirst"], ["one"]),
    "atheist": (["none"], ["none"]),
    "bountyhunter": (["once", "notfirst"], ["none"]),
    "choirboy": (["notfirst", "none"], ["none"]),
    "cultleader": (["each"], ["none"]),
    "engineer": (["once", "none"], ["char", "none"]),
    "farmer": (["notfirst", "none"], ["none"]),
    "magician": (["none"], ["none"]),
    "poppygrower": (["none"], ["none"]),
    "villageidiot": (["each"], ["one"]),
    "hatter": (["none"], ["none"]),
    "heretic": (["none"], ["none"]),
    "hermit": "derive:outsider",
    "ogre": (["once"], ["one"]),
    "zealot": (["none"], ["none"]),
    "harpy": (["each"], ["two"]),
    "organgrinder": (["each"], ["none"]),
    "psychopath": (["none"], ["none"]),
    "summoner": (["once", "notfirst"], ["none", "one", "char"]),
    "vizier": (["none"], ["none"]),
    "kazali": (["each"], ["one", "none"]),
    "legion": (["notfirst"], ["none"]),
    "lleech": (["each"], ["one"]),
    "lordoftyphon": (["notfirst"], ["one"]),
    "ojo": (["notfirst"], ["char"]),
    "riot": (["none"], ["none"]),
    "yaggababble": (["once"], ["none"]),
}

NOTES = {
    "nightwatchman": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "courtier": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "seamstress": "Réveillée chaque nuit jusqu'à ce qu'elle utilise sa capacité.",
    "philosopher": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "assassin": "Réveillé chaque nuit* jusqu'à ce qu'il utilise sa capacité.",
    "professor": "Réveillé chaque nuit* jusqu'à ce qu'il utilise sa capacité.",
    "huntsman": "Réveillé chaque nuit jusqu'à ce qu'il utilise sa capacité.",
    "wizard": "Réveillé jusqu'à ce qu'il fasse son vœu.",
    "alchemist": "Se comporte comme le Sbire copié.",
    "lunatic": "Se comporte comme le Démon qu'il croit être.",
    "drunk": "Peut se comporter comme n'importe quel Villageois du scénario.",
    "marionette": "Croit être un rôle bon et se comporte comme lui.",
    "cannibal": "Comportement variable selon le dernier exécuté. Jamais réveillé la première nuit.",
    "amnesiac": "Capacité inconnue : comportement libre.",
    "scarletwoman": "Ne se réveille que si elle devient le Démon, puis agit comme lui.",
    "godfather": "Info la 1re nuit, puis choisit une victime si un Marginal est mort dans la journée.",
    "king": "Réveillé seulement quand il y a autant de morts que de vivants.",
    "undertaker": "Réveillé seulement si quelqu'un a été exécuté dans la journée.",
    "ravenkeeper": "Ne se réveille que la nuit de sa mort.",
    "sage": "Ne se réveille que la nuit où le Démon le tue.",
    "juggler": "Devine de jour ; apprend le résultat la nuit suivante.",
    "slayer": "Capacité de jour : choisit un joueur publiquement.",
    "lilmonsta": "Les Sbires se réveillent pour désigner le gardien.",
    "wraith": "Peut ouvrir les yeux quand les joueurs maléfiques se réveillent.",
    "po": "Peut choisir personne, puis 3 joueurs la nuit suivante.",
    "gambler": "Choisit un joueur et devine son rôle.",
    "cerenovus": "Choisit un joueur et un rôle bon.",
    "pithag": "Choisit un joueur et un rôle.",
}

# Texte court affiché dans l'ordre de nuit (sinon un texte générique est déduit du choix).
NIGHT_TEXT = {
    "washerwoman": "Apprend qu'un de 2 joueurs est un Villageois précis.",
    "librarian": "Apprend qu'un de 2 joueurs est un Marginal précis.",
    "investigator": "Apprend qu'un de 2 joueurs est un Sbire précis.",
    "chef": "Apprend le nombre de paires maléfiques.",
    "empath": "Apprend combien de voisins sont maléfiques.",
    "undertaker": "Apprend le rôle exécuté aujourd'hui.",
    "spy": "Regarde le Grimoire.",
    "butler": "Choisit son maître.",
    "ravenkeeper": "Si mort cette nuit, choisit un joueur et apprend son rôle.",
    "sage": "Si tué par le Démon, apprend 2 joueurs dont le Démon.",
    "scarletwoman": "Apprend qu'elle est devenue le Démon.",
    "clockmaker": "Apprend la distance Démon / Sbire le plus proche.",
    "grandmother": "Apprend un joueur bon et son rôle.",
    "knight": "Apprend 2 joueurs qui ne sont pas le Démon.",
    "noble": "Apprend 3 joueurs dont 1 seul maléfique.",
    "steward": "Apprend 1 joueur bon.",
    "shugenja": "Apprend de quel côté est le joueur maléfique le plus proche.",
    "pixie": "Apprend un Villageois en jeu.",
    "balloonist": "Apprend un joueur d'un type différent.",
    "general": "Apprend quelle équipe gagne.",
    "highpriestess": "Apprend à qui parler.",
    "mathematician": "Apprend combien de capacités ont dysfonctionné.",
    "flowergirl": "Apprend si un Démon a voté.",
    "towncrier": "Apprend si un Sbire a nominé.",
    "oracle": "Apprend combien de morts sont maléfiques.",
    "juggler": "Apprend combien de ses suppositions étaient justes.",
    "king": "Si autant de morts que de vivants, apprend un rôle en vie.",
    "eviltwin": "Les jumeaux se découvrent.",
    "mezepheles": "Apprend son mot secret.",
    "godfather": "1re nuit : apprend les Marginaux. Ensuite : peut tuer.",
    "tinker": "Peut mourir (sans réveil).",
    "lunatic": "Agit comme le Démon qu'il croit être.",
    "alchemist": "Apprend son pouvoir de Sbire / l'utilise.",
    "philosopher": "Peut choisir un rôle bon.",
    "courtier": "Peut choisir un personnage.",
    "seamstress": "Peut choisir 2 joueurs.",
    "nightwatchman": "Peut choisir un joueur.",
    "pukka": "Choisit un joueur ; l'empoisonné précédent meurt.",
}

# Textes absents ou erronés sur le site.
ABILITY_FIX = {
    "pukka": "Chaque nuit, choisissez un joueur : il est empoisonné. Le joueur précédemment empoisonné meurt puis redevient sain.",
    "huntsman": "Une fois par partie, la nuit, choisissez un joueur en vie : si c'est la Demoiselle, elle devient un Villageois pas en jeu. [+la Demoiselle]",
    "shugenja": "Lors de votre 1re nuit, vous apprenez si votre joueur maléfique le plus proche est dans le sens horaire ou anti-horaire. S'ils sont à égale distance, l'info est arbitraire.",
    "imp": "Chaque nuit*, choisissez un joueur : il meurt. Si vous vous tuez de cette façon, un Sbire devient le Diablotin.",
}

TYPE = {"villageois": "townsfolk", "marginal": "outsider", "marginaux": "outsider", "sbire": "minion",
        "sbires": "minion", "démon": "demon", "démons": "demon", "loric": "loric",
        "légendaire": "fabled", "légendaires": "fabled"}
TYPE_FIX = {"alhadikhia": "demon", "kazali": "demon", "washerwoman": "townsfolk", "mayor": "townsfolk"}
ID_FIX = {"sv_roles/savant.md": "savant", "tb_roles/ivrogne.md": "drunk", "tb_roles/reclus.md": "recluse"}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "botc-enquete-import"})
    return urllib.request.urlopen(req, timeout=60).read()


def unescape(s):
    import html
    return html.unescape(s).replace("’", "'").strip()


def parse_role(path, text):
    fm = re.search(r"^---\s*\n(.*?)\n---", text, re.S)
    fm = fm.group(1) if fm else ""
    def field(k):
        m = re.search(r"^" + k + r":\s*(.*)$", fm, re.M)
        return m.group(1).strip().strip('"').strip("'") if m else ""
    m = re.search(r"Icon_([a-z0-9_]+)\.png", field("image") or text)
    rid = ID_FIX.get(path) or (m.group(1) if m else None)
    if not rid:
        return None
    typ = re.search(r"Type :</strong>\s*<a [^>]*>([^<]+)<", text)
    team = TYPE_FIX.get(rid) or (TYPE.get(typ.group(1).strip().lower()) if typ else None)
    name = re.search(r'font-size:50px;">([^<]+)<', text)
    en = re.search(r"wiki\.bloodontheclocktower\.com/[^\"]+\"[^>]*>([^<]+)<", text)
    return {
        "id": rid, "dir": path.split("/")[0], "file": path, "team": team,
        "name": unescape(name.group(1) if name else field("title").title()).replace("Djinn & Jinxes", "Djinn"),
        "en": unescape(en.group(1)) if en else "",
        "ability": unescape(field("description")),
    }


def norm(i):
    return i.replace("_", "").replace("-", "").lower()


ICON_FIX = {"drunk": "Icon_drunk-1.png", "recluse": "Icon_recluse-1.png"}


def save_icon(rid):
    dest = os.path.join(APP, "icons", "roles", rid + ".jpg")
    try:
        data = fetch(RAW + "images/" + ICON_FIX.get(rid, "Icon_" + rid + ".png"))
    except Exception:
        return os.path.exists(dest)
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    side = max(im.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
    out = Image.new("RGB", (128, 128), (244, 238, 226))
    sq = sq.resize((116, 116), Image.LANCZOS)
    out.paste(sq, (6, 6), sq)
    out.save(dest, quality=85)
    return True


def main():
    tree = [t["path"] for t in json.loads(fetch(API_TREE))["tree"] if t["type"] == "blob"]
    role_files = [p for p in tree if p.split("/")[0] in ROLE_DIRS and p.endswith(".md")]
    with ThreadPoolExecutor(12) as ex:
        texts = dict(zip(role_files, ex.map(lambda p: fetch(RAW + urllib.parse.quote(p)).decode("utf-8"), role_files)))
    roles = {}
    for p, t in texts.items():
        r = parse_role(p, t)
        if r and r["team"]:
            roles.setdefault(r["id"], r)

    # Scénarios
    scripts = []
    for sid, name, folder in EDITIONS:
        ids = sorted(r["id"] for r in roles.values() if r["dir"] == folder)
        scripts.append({"id": sid, "name": name, "author": "The Pandemonium Institute", "roles": ids})
    script_files = [x for x in tree if x.endswith(".json") and (x.startswith("images/") or "/" not in x)]
    for p in sorted(script_files, key=lambda x: os.path.basename(x).lower()):
        data = json.loads(fetch(RAW + urllib.parse.quote(p)).decode("utf-8"))
        meta = next((x for x in data if isinstance(x, dict) and x.get("id") == "_meta"), {})
        ids = [norm(x if isinstance(x, str) else x.get("id", "")) for x in data]
        ids = [i for i in ids if i and i != "meta"]
        name = meta.get("name") or os.path.basename(p)[:-5]
        sid = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
        scripts.append({"id": sid, "name": name, "author": meta.get("author", ""), "roles": ids})

    # Tous les rôles du wiki : un scénario importé en JSON peut utiliser n'importe lequel.
    used = {i for s in scripts for i in s["roles"]} | set(BEHAVIOUR) | set(roles)
    chars, rules = {}, {}
    for rid in sorted(used):
        r = roles.get(rid)
        if not r:
            continue
        if r["team"] in ("loric", "fabled"):
            rules[rid] = {"name": r["name"], "text": r["ability"]}
            continue
        b = BEHAVIOUR.get(rid)
        if b is None:
            print("Comportement manquant :", rid)
            continue
        entry = {"name": r["name"], "en": r["en"], "team": r["team"],
                 "ability": ABILITY_FIX.get(rid) or r["ability"]}
        if isinstance(b, str):
            entry["derive"] = b.split(":")[1]
        else:
            entry["wake"], entry["choice"] = b
        if rid in NOTES:
            entry["note"] = NOTES[rid]
        if rid in NIGHT_TEXT:
            entry["nightText"] = NIGHT_TEXT[rid]
        chars[rid] = entry

    # Jinxes (règles du Djinn) en français : page legendaire_roles/djinn.md.
    # Lignes « - <a href="../dir/role.html">A</a> / <a href="...">B</a> : texte ».
    by_file = {r["file"][:-3]: r["id"] for r in roles.values()}
    jinxes = []
    djinn = texts.get("legendaire_roles/djinn.md", "")
    for m in re.finditer(r'^- <a href="\.\./([^"]+)\.html"[^>]*>[^<]*</a>\s*/\s*<a href="\.\./([^"]+)\.html"[^>]*>[^<]*</a>\s*:\s*(.+)$', djinn, re.M):
        a, b = by_file.get(m.group(1)), by_file.get(m.group(2))
        text = unescape(re.sub(r"<[^>]+>", "", m.group(3)))
        if a in chars and b in chars:
            jinxes.append([a, b, text])
    print(f"{len(jinxes)} jinxes")

    # Numéros d'ordre de nuit : position dans la feuille de nuit officielle.
    sheet = json.loads(fetch(NIGHTSHEET))
    specials = {}
    for key, night in (("firstNight", "first"), ("otherNight", "other")):
        for n, rid in enumerate(sheet[key], start=1):
            rid = norm(rid)
            if rid in chars:
                chars[rid].setdefault("night", {})[night] = n
            elif rid in NIGHT_SPECIAL_LABELS:
                label, text = NIGHT_SPECIAL_LABELS[rid]
                specials.setdefault(night, []).append({"order": n, "label": label, "text": text})
    no_order = [k for k, v in chars.items() if "night" not in v and v.get("wake") not in (["none"], None)]
    if no_order:
        print("Rôles qui se réveillent mais absents de la feuille de nuit :", no_order)

    for s in scripts:
        s["rules"] = [rules[i] for i in s["roles"] if i in rules]
        dropped = [i for i in s["roles"] if i not in chars and i not in rules]
        s["roles"] = [i for i in s["roles"] if i in chars]
        if dropped:
            print(f"{s['name']} : ignorés (voyageurs / inconnus) {dropped}")

    with ThreadPoolExecutor(12) as ex:
        ok = dict(zip(chars, ex.map(save_icon, chars)))
    missing = [k for k, v in ok.items() if not v]
    if missing:
        print("Icônes manquantes :", missing)

    head = open(os.path.join(ROOT, "tools", "roles_header.js"), encoding="utf-8").read()
    with open(os.path.join(APP, "roles.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write(head)
        f.write("// Étapes de nuit qui ne sont pas des rôles, avec leur numéro d'ordre.\n")
        f.write("const NIGHT_SPECIALS = " + json.dumps(specials, ensure_ascii=False, indent=2) + ";\n\n")
        f.write("// night.first / night.other : numéro d'ordre de réveil (feuille de nuit officielle).\n")
        f.write("const ROLES = " + json.dumps(chars, ensure_ascii=False, indent=2) + ";\n\n")
        f.write("// Jinxes (règles du Djinn) : [rôle A, rôle B, règle]\n")
        f.write("const JINXES = " + json.dumps(jinxes, ensure_ascii=False, indent=1) + ";\n")
    with open(os.path.join(APP, "scripts_imported.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("// Généré par tools/import_bambi.py — ne pas modifier à la main.\n")
        f.write("// Source : wiki BotC FR de BambiPotato (CC BY 4.0).\n")
        f.write("const SCRIPTS_IMPORTED = " + json.dumps(scripts, ensure_ascii=False, indent=2) + ";\n")
    print(f"{len(chars)} rôles, {len(scripts)} scénarios, {sum(ok.values())} icônes.")
    print("Publiez ensuite avec : python -I tools/publish.py --push")


if __name__ == "__main__":
    main()
