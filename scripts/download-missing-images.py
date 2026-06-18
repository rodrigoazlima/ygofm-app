import json
import os
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
img_dir = os.path.join(base, "public/images")
os.makedirs(img_dir, exist_ok=True)

with open(os.path.join(base, "src/data/localImages.json"), encoding="utf-8") as f:
    local = json.load(f)

with open(os.path.join(base, "src/data/fandomImages.json"), encoding="utf-8") as f:
    fandom = json.load(f)

UA = {"User-Agent": "ygofm-app/1.0 (image-downloader; rodrigoazlima@gmail.com)"}

def ext_from_url(url):
    path = urllib.parse.urlparse(url).path
    _, e = os.path.splitext(path)
    return e.lower() or ".jpg"

def download_one(card_id, url):
    ext = ext_from_url(url)
    filename = f"{card_id}{ext}"
    dest = os.path.join(img_dir, filename)
    if os.path.exists(dest):
        return card_id, filename, "skip"
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read()
        if len(data) < 1000:
            return card_id, None, "tiny"
        with open(dest, "wb") as f:
            f.write(data)
        return card_id, filename, "ok"
    except Exception as e:
        return card_id, None, f"err:{e}"

print(f"Fandom URLs to download : {len(fandom)}")

downloaded = {}
failed = {}
skipped = {}
done = 0

with ThreadPoolExecutor(max_workers=10) as ex:
    futures = {ex.submit(download_one, cid, url): cid for cid, url in fandom.items()}
    for fut in as_completed(futures):
        cid, filename, status = fut.result()
        done += 1
        print(f"  [{done}/{len(fandom)}] {cid:<6} {status:<10}", end="\r")
        if status == "ok":
            downloaded[cid] = f"/images/{filename}"
        elif status == "skip":
            skipped[cid] = f"/images/{filename}"
        else:
            failed[cid] = status

print()

# Merge skipped (already-local) into downloaded map
all_local = {**downloaded, **skipped}

if all_local:
    local.update(all_local)
    local_path = os.path.join(base, "src/data/localImages.json")
    with open(local_path, "w", encoding="utf-8") as f:
        json.dump(local, f, ensure_ascii=False, separators=(",", ":"))

    # Remove successfully handled entries from fandomImages.json
    for cid in all_local:
        fandom.pop(cid, None)
    fandom_path = os.path.join(base, "src/data/fandomImages.json")
    with open(fandom_path, "w", encoding="utf-8") as f:
        json.dump(fandom, f, ensure_ascii=False, separators=(",", ":"))

print(f"Downloaded  : {len(downloaded)}")
print(f"Already had : {len(skipped)}")
print(f"Failed      : {len(failed)}")
if failed:
    for cid, reason in sorted(failed.items()):
        print(f"  id={cid}  {reason}")
