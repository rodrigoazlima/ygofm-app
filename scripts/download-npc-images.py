"""
Download NPC portrait images from yugiohfm.com and store under images/npc/.

Images are sourced from:
  https://www.yugiohfm.com/imgs/personagens/<slug>.png

Saved to:
  <project-root>/images/npc/<slug>.png
"""

import os
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://www.yugiohfm.com"
UA = "ygofm-app/1.0 (npc-image-downloader; rodrigoazlima@gmail.com)"

NPCS = [
    (1,  "simon-muran",         "Simon Muran"),
    (2,  "teana",               "Teana"),
    (3,  "jono",                "Jono"),
    (4,  "villaguer-1",         "Villager 1"),
    (5,  "villaguer-2",         "Villager 2"),
    (6,  "villaguer-3",         "Villager 3"),
    (7,  "seto",                "Seto"),
    (8,  "heishin",             "Heishin"),
    (9,  "rex-raptor",          "Rex Raptor"),
    (10, "weevil-underwood",    "Weevil Underwood"),
    (11, "mai-valentine",       "Mai Valentine"),
    (12, "bandit-keith",        "Bandit Keith"),
    (13, "shadi",               "Shadi"),
    (14, "yami-bakura",         "Yami Bakura"),
    (15, "pegasus",             "Pegasus"),
    (16, "isis",                "Isis"),
    (17, "kaiba",               "Kaiba"),
    (18, "mage-soldier",        "Mage Soldier"),
    (19, "teana-2nd",           "Teana 2nd"),
    (20, "jono-2nd",            "Jono 2nd"),
    (21, "ocean-mage",          "Ocean Mage"),
    (22, "high-mage-secmeton",  "High Mage Secmeton"),
    (23, "forest-mage",         "Forest Mage"),
    (24, "high-mage-anubisius", "High Mage Anubisius"),
    (25, "mountain-mage",       "Mountain Mage"),
    (26, "high-mage-atenza",    "High Mage Atenza"),
    (27, "desert-mage",         "Desert Mage"),
    (28, "high-mage-martis",    "High Mage Martis"),
    (29, "meadow-mage",         "Meadow Mage"),
    (30, "high-mage-kepura",    "High Mage Kepura"),
    (31, "labyrinth-mage",      "Labyrinth Mage"),
    (32, "seto-2nd",            "Seto 2nd"),
    (33, "guardian-sebek",      "Guardian Sebek"),
    (34, "guardian-neku",       "Guardian Neku"),
    (35, "heishin-2nd",         "Heishin 2nd"),
    (36, "seto-3rd",            "Seto 3rd"),
    (37, "darknite",            "Darknite"),
    (38, "nitemare",            "Nitemare"),
    (39, "duel-master-k",       "Duel Master K"),
]


def download_image(slug, dest_path):
    if os.path.exists(dest_path):
        return "skip"

    url = f"{BASE_URL}/imgs/personagens/{slug}.png"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
        with open(dest_path, "wb") as f:
            f.write(data)
        return "ok"
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}"
    except Exception as e:
        return f"error: {e}"


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(script_dir, "..", "images", "npc")
    os.makedirs(out_dir, exist_ok=True)

    print(f"Downloading {len(NPCS)} NPC images to {os.path.abspath(out_dir)} …\n")

    ok = skipped = failed = 0

    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {
            ex.submit(download_image, slug, os.path.join(out_dir, f"{slug}.png")): (npc_id, slug, name)
            for npc_id, slug, name in NPCS
        }
        for fut in as_completed(futures):
            npc_id, slug, name = futures[fut]
            status = fut.result()
            if status == "ok":
                ok += 1
                print(f"  [{npc_id:2d}] {name:<25} OK")
            elif status == "skip":
                skipped += 1
                print(f"  [{npc_id:2d}] {name:<25} (already exists)")
            else:
                failed += 1
                print(f"  [{npc_id:2d}] {name:<25} FAILED — {status}")

    print(f"\nDone. {ok} downloaded, {skipped} skipped, {failed} failed.")
    print(f"Images at: {os.path.abspath(out_dir)}")


if __name__ == "__main__":
    main()
