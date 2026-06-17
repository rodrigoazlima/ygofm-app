import hashlib
import json
import os
import re
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

base = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(base, "src/data/cards.json"), encoding="utf-8") as f:
    cards = json.load(f)

with open(os.path.join(base, "src/data/localImages.json"), encoding="utf-8") as f:
    local = json.load(f)

with open(os.path.join(base, "src/data/fandomImages.json"), encoding="utf-8") as f:
    fandom = json.load(f)

CODE_FIXES = {"Meteor B. Dragon": "90660762"}
CDN_FULL  = "https://images.ygoprodeck.com/images/cards"
CDN_THUMB = "https://images.ygoprodeck.com/images/cards_cropped"
YUGIPEDIA_API = "https://yugipedia.com/api.php"
UA = {"User-Agent": "ygofm-app/1.0 (image-finder; rodrigoazlima@gmail.com)"}

def get_code(card):
    code = card.get("CardCode") or ""
    if not code or code == "00000000":
        code = CODE_FIXES.get(card.get("Name", ""), "")
    return code

def http_status(url):
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code          # explicit 404 / 403 / etc.
    except Exception:
        return 0               # network error

def cdn_ok(code):
    # mirrors fullSources order: full first, then cropped
    return (
        http_status(f"{CDN_FULL}/{code}.jpg") == 200
        or http_status(f"{CDN_THUMB}/{code}.jpg") == 200
    )

def yugipedia_image(card_name):
    slug = re.sub(r"[^A-Za-z0-9]", "", card_name)
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": card_name,
        "prop": "images",
        "imlimit": "50",
        "format": "json",
    })
    try:
        req = urllib.request.Request(f"{YUGIPEDIA_API}?{params}", headers=UA)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        pages = data.get("query", {}).get("pages", {})
        page = next(iter(pages.values()))
        images = [img["title"] for img in page.get("images", [])]
    except Exception:
        return None

    def rank(title):
        fn = title.split(":")[-1]
        return 0 if fn.startswith(slug) else 1

    candidates = [t for t in images if t.lower().endswith((".png", ".jpg"))]
    candidates.sort(key=rank)
    if not candidates:
        return None

    # build URL via MediaWiki MD5 hash (avoids broken imageinfo API)
    filename = candidates[0].split(":", 1)[-1]
    h = hashlib.md5(filename.encode()).hexdigest()
    return f"https://ms.yugipedia.com/{h[0]}/{h[:2]}/{filename}"

# ── Phase 1: CDN check ───────────────────────────────────────────────────────
covered_ids = set(local.keys()) | set(fandom.keys())
cdn_only = [c for c in cards if str(c.get("Id", "")) not in covered_ids]
no_code  = [c for c in cdn_only if not get_code(c)]
to_check = [c for c in cdn_only if get_code(c)]

print(f"Total cards      : {len(cards)}")
print(f"Has local/fandom : {len(covered_ids)}")
print(f"Checking CDN for : {len(to_check)} cards...")

cdn_bad = []
done = 0
with ThreadPoolExecutor(max_workers=20) as ex:
    futures = {ex.submit(cdn_ok, get_code(c)): c for c in to_check}
    for fut in as_completed(futures):
        card = futures[fut]
        done += 1
        print(f"  CDN [{done}/{len(to_check)}] {card['Name']:<40}", end="\r")
        if not fut.result():
            cdn_bad.append(card)

print()

# ── Phase 2: Yugipedia fallback for CDN failures ─────────────────────────────
need_wiki = no_code + cdn_bad
print(f"Checking Yugipedia for : {len(need_wiki)} cards...")

new_fandom = {}   # id -> url  (to add to fandomImages.json)
still_missing = []
done = 0

with ThreadPoolExecutor(max_workers=8) as ex:
    futures = {ex.submit(yugipedia_image, c["Name"]): c for c in need_wiki}
    for fut in as_completed(futures):
        card = futures[fut]
        done += 1
        url = fut.result()
        print(f"  Wiki [{done}/{len(need_wiki)}] {card['Name']:<40}", end="\r")
        if url:
            new_fandom[str(card["Id"])] = url
        else:
            still_missing.append(card)

print()

# ── Save results ─────────────────────────────────────────────────────────────
if new_fandom:
    fandom.update(new_fandom)
    fandom_path = os.path.join(base, "src/data/fandomImages.json")
    with open(fandom_path, "w", encoding="utf-8") as f:
        json.dump(fandom, f, ensure_ascii=False, separators=(",", ":"))
    print(f"fandomImages.json updated : +{len(new_fandom)} entries")

still_missing.sort(key=lambda c: c.get("Id", 0))
missing_out = [{"id": c.get("Id"), "name": c.get("Name", "")} for c in still_missing]

out = os.path.join(base, "missing-img.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(missing_out, f, indent=2, ensure_ascii=False)

print(f"Yugipedia found  : {len(new_fandom)}")
print(f"Still missing    : {len(still_missing)}")
print(f"Written to {out}")
