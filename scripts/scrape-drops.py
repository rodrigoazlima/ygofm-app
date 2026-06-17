"""
Scrape per-NPC card drop data from yugiohfm.com and write src/data/drops.json.

Each NPC page contains all three mode sections (saa/bcc/ass) regardless of the
?cod= query parameter, so we do ONE fetch per NPC and split by section.

Output schema:
[
  {
    "id": 1,
    "slug": "simon-muran",
    "name": "Simon Muran",
    "image": "https://www.yugiohfm.com/imgs/personagens/simon-muran.png",
    "drops": {
      "sapow":  [{"card_id": 333, "name": "Sogen", "type": "Magic", "drop_pct": 1.95}, ...],
      "bcd":    [...],
      "astec":  [...]
    }
  },
  ...
]
"""

import json
import os
import re
import time
import urllib.request
import urllib.error

BASE_URL = "https://www.yugiohfm.com"
UA = "ygofm-app/1.0 (drops-scraper; rodrigoazlima@gmail.com)"

# Section div id  →  mode key
SECTION_MAP = {
    "saa": "sapow",
    "bcc": "bcd",
    "ass": "astec",
}

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

# ── regexes ──────────────────────────────────────────────────────────────────

# Matches a full card entry inside an <a> tag
CARD_RE = re.compile(
    r'<a\s+href="\.\./cards/(\d+)\.php"[^>]*>'  # group 1: card id
    r'.*?class="nome_yfmpro">([^<]+)'             # group 2: card name
    r'.*?class="tipo_yfmpro">([^<]+)'             # group 3: card type
    r'.*?class="chan_yfmpro">([^<]+)',             # group 4: drop % e.g. "1,95%"
    re.DOTALL | re.IGNORECASE,
)

# ── helpers ──────────────────────────────────────────────────────────────────

def fetch_html(url, retries=3):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return r.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
            else:
                print(f"  HTTP {e.code}: {url}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
            else:
                print(f"  Error: {e} ({url})")
                return None


def parse_pct(raw):
    """'1,95%' or '1.95%' → 1.95"""
    return float(raw.strip().rstrip("%").replace(",", "."))


def split_sections(html):
    """Return {section_id: html_fragment} for the known section divs."""
    sections = {}
    ids = list(SECTION_MAP.keys())

    # Find start position of each section
    positions = {}
    for sid in ids:
        m = re.search(rf'id="{sid}"', html, re.IGNORECASE)
        if m:
            positions[sid] = m.start()

    ordered = sorted(positions.items(), key=lambda x: x[1])
    for i, (sid, start) in enumerate(ordered):
        end = ordered[i + 1][1] if i + 1 < len(ordered) else len(html)
        sections[sid] = html[start:end]

    return sections


def parse_section(html_fragment):
    drops = []
    for m in CARD_RE.finditer(html_fragment):
        card_id = int(m.group(1))
        name = m.group(2).strip()
        card_type = m.group(3).strip()
        try:
            pct = parse_pct(m.group(4))
        except ValueError:
            continue
        drops.append({
            "card_id": card_id,
            "name": name,
            "type": card_type,
            "drop_pct": pct,
        })
    drops.sort(key=lambda d: (-d["drop_pct"], d["card_id"]))
    return drops


def scrape_npc(npc_id, slug, name):
    url = f"{BASE_URL}/drops/drops-{slug}.php?cod=sapow"
    html = fetch_html(url)

    entry = {
        "id": npc_id,
        "slug": slug,
        "name": name,
        "image": f"{BASE_URL}/imgs/personagens/{slug}.png",
        "drops": {mode: [] for mode in SECTION_MAP.values()},
    }

    if not html:
        return entry

    sections = split_sections(html)
    for sid, mode in SECTION_MAP.items():
        fragment = sections.get(sid, "")
        entry["drops"][mode] = parse_section(fragment)

    total = sum(len(v) for v in entry["drops"].values())
    counts = " | ".join(
        f"{mode}:{len(entry['drops'][mode])}" for mode in SECTION_MAP.values()
    )
    print(f"  [{npc_id:2d}] {name:<25} — {total} total  ({counts})")
    return entry

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(script_dir, "..", "src", "data", "drops.json")

    print(f"Scraping {len(NPCS)} NPCs (1 fetch each) …")
    results = []

    for npc_id, slug, name in NPCS:
        entry = scrape_npc(npc_id, slug, name)
        results.append(entry)
        time.sleep(0.4)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, separators=(",", ":"))

    total_drops = sum(
        len(mode_drops)
        for npc in results
        for mode_drops in npc["drops"].values()
    )
    print(f"\nDone. {total_drops} total drop entries across {len(results)} NPCs.")
    print(f"Written to {os.path.abspath(out_path)}")


if __name__ == "__main__":
    main()
