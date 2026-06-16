# YGOFM Fusions — Agent Context

Single-file vanilla JS/HTML app. No build step, no framework, no package.json. Everything is in `index.html` + data files.

## Structure

```
index.html          — entire app (CSS + HTML + JS, ~780 lines)
data/
  cards.js          — exports card_db[] (722 cards)
  fusions.js        — exports fusionsList[] (indexed by card1 id, ~50k fusions)
  results.js        — exports resultsList[] (indexed by result card id, ~25k pairs)
  types_and_stars.js — exports cardTypes[], starNames[]
  local_images.js   — exports localImages{} (id → local WebP path, fallback)
images/             — WebP card images (local fallback)
```

## Data shapes

```js
// card_db entry
{ Id, Name, Type, Attack, Defense, Level, Attribute, CardCode, GuardianStarA, GuardianStarB, Description, Fusions[] }

// fusionsList[card1Id] = [{card: card2Id, result: resultId}, ...]
// resultsList[resultId] = [{card1: id, card2: id}, ...]
// cardTypes[Type] = "Dragon" | "Spellcaster" | ... (24 types)
// Attribute: 0=Dark 1=Earth 2=Fire 3=Light 4=Water 5=Wind 6=Divine
// Type >= 20 = non-monster (Magic/Trap/Ritual/Equip)
```

## Runtime indices (built once on load)

```js
byId          // {[id]: Card}          — O(1) card lookup
mat2Idx       // {[card2Id]: [[card1Id, resultId], ...]} — fusions where card is mat2
fusionResultIds // Set<id>             — all cards that are fusion results
```

## Key functions

| Function | Purpose |
|---|---|
| `buildIndices()` | Populate byId, mat2Idx, fusionResultIds from raw data |
| `buildGrid(filterQ?)` | Render main grid of 204 fusion-result cards, grouped by type |
| `openModal(cardId)` | Open card detail modal |
| `closeModal()` | Close modal, reset filter + right panel |
| `applyPartnerFilter(q)` | Filter modal rows; faded+reordered via CSS order; update right panel |
| `updateRightPanel(lq)` | Show/hide right panel with all 722 cards matching name or type |
| `makeFusesIntoSection(c)` | Build "Fuses Into" DOM section for modal |
| `makeMadeFromSection(c)` | Build "Made From" DOM section for modal |
| `miniThumb(card, cls)` | Returns img or placeholder div for a card |
| `selectCard(id)` | Called when user picks from search dropdown; opens modal, focuses filter |

## Modal layout (when filter active)

```
#modal (.has-panel → max-width 900px)
  #m-head          — card image (120px) + stats + close button
  #m-filter-wrap   — search input (auto-focused after card select)
  #m-content-wrap  — flex row
    #m-body        — "Fuses Into" + "Made From" sections
    #m-right-panel — sticky; all 722 cards matching filter query
```

## CSS conventions

- Faded/reordered rows: `.faded` → `opacity:.15; order:1` (CSS flex order within `.m-section`)
- `.m-section` is `display:flex; flex-direction:column` so `order` works on child rows
- `.fi-group[data-partners]` — pipe-separated lowercase partner names for filter matching
- `.mf-row[data-materials]` — pipe-separated lowercase material names
- ATK color: red ≥3000, orange ≥2500, gold ≥2000, yellow ≥1500, gray <1500
- Type colors: `TYPE_COLORS` map in JS

## Image loading

Three-tier fallback per card: CDN cropped thumb → CDN full → local WebP → text placeholder.
`localImages[cardId]` holds local path. `CODE_FIXES` overrides bad CardCode values.

## Editing rules

- All changes go in `index.html` only (unless adding new data files).
- No comments unless the WHY is non-obvious.
- Keep minified CSS style (single-line rules, no spaces after colons in shorthand).
- Data files are read-only — never modify cards.js, fusions.js, results.js.
