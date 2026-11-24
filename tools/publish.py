"""Prépare et publie l'application.

1. Liste tous les fichiers de app/ et calcule une empreinte de leur contenu.
2. Réécrit la version du cache et la liste des fichiers dans app/sw.js
   (la version change toute seule dès qu'un fichier change).
3. Lance les tests (node --test).
4. Avec --push : commit si besoin, push de main, puis publication de app/
   sur la branche gh-pages (GitHub Pages).

Usage (depuis la racine du projet) :
    python -I tools/publish.py            # met à jour sw.js et teste
    python -I tools/publish.py --push     # … puis publie
"""
import hashlib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, "app")
SW = os.path.join(APP, "sw.js")


def app_files():
    out = []
    for base, _, files in os.walk(APP):
        for f in files:
            rel = os.path.relpath(os.path.join(base, f), APP).replace(os.sep, "/")
            if rel != "sw.js":
                out.append(rel)
    return sorted(out)


def update_sw():
    files = app_files()
    h = hashlib.sha256()
    for rel in files:
        h.update(rel.encode())
        with open(os.path.join(APP, rel), "rb") as fh:
            h.update(fh.read())
    version = "enquete-" + h.hexdigest()[:10]
    assets = ["./"] + ["./" + f for f in files]
    block = (
        "// ASSETS-START\n"
        f'const CACHE = "{version}";\n'
        "const ASSETS = " + json.dumps(assets, indent=2) + ";\n"
        "// ASSETS-END"
    )
    sw = open(SW, encoding="utf-8").read()
    new = re.sub(r"// ASSETS-START.*?// ASSETS-END", lambda _: block, sw, flags=re.S)
    if new != sw:
        with open(SW, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(new)
    print(f"sw.js : {version} ({len(assets)} fichiers)")
    return version


def run(cmd):
    print("$", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def main():
    version = update_sw()
    run(["node", "--test", "tests/"])
    if "--push" not in sys.argv:
        return
    status = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
    if status.strip():
        run(["git", "add", "-A"])
        run(["git", "commit", "-m", f"Publication {version}"])
    run(["git", "push", "-q"])
    split = subprocess.run(["git", "subtree", "split", "--prefix", "app", "main"], cwd=ROOT,
                           capture_output=True, text=True, check=True).stdout.strip()
    run(["git", "push", "-q", "--force", "origin", f"{split}:refs/heads/gh-pages"])
    print("Publié :", version)


if __name__ == "__main__":
    main()
