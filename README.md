# YGOFM Fusion Chart

Interactive fusion reference for **Yu-Gi-Oh! Forbidden Memories**.

**Live:** https://rodrigoazlima.github.io/ygofm-app/

## Features

- 204 fusion result cards grouped by monster type, sorted by ATK descending
- Hover tooltip with full card art and ATK/DEF stats
- Search all 722 cards by name with keyboard-navigable autocomplete
- Click any card to open a detail modal with two sections:
  - **Fuses Into** — all fusion results this card can produce as a material, grouped by result and sorted by ATK
  - **Made From** — all material pairs that produce this card
- Chain-navigate: click any result or material in the modal to open its own modal
- Filter bar to narrow the result grid by card name or type

## Codebase

Pure HTML/JS, no build step. Single `index.html` with all styles and logic inline.

```
index.html            — full app (styles + logic, ~680 lines)
data/
  cards.js            — 722 cards (card_db array via TAFFY shim)
  fusions.js          — 50 262 fusion rules (fusionsList[mat1Id] → [{card, result}])
  results.js          — 25 131 material pairs (resultsList[resultId] → [{card1, card2}])
  types_and_stars.js  — type names (cardTypes[typeId]) and guardian star names
```

### Key globals

| Variable | Shape | Purpose |
|---|---|---|
| `card_db` | `Card[]` | All 722 cards with Id, Name, Type, Attack, Defense, Attribute, CardCode |
| `fusionsList` | `Array[722]` | Index by card1 Id → fusions where that card is material 1 |
| `resultsList` | `Array[722]` | Index by result Id → all material pairs that produce it |
| `cardTypes` | `string[]` | Maps Type integer → type name string |

### Runtime indices (built on load)

- `byId` — `{[id]: Card}` for O(1) card lookup
- `mat2Idx` — `{[cardId]: [mat1Id, resultId][]}` — fusions where card is material 2
- `fusionResultIds` — `Set<number>` of all cards that are fusion outputs (drives the grid)

## Deploy

GitHub Pages — branch deploy from `master` root. `.nojekyll` present, no Jekyll processing.

To enable: repo Settings → Pages → Source: Deploy from a branch → `master` / `/ (root)`.

## Data Sources

Card data from [YGO-FM-FusionCalc](https://github.com/Solumin/YGO-FM-FusionCalc) (MIT).  
Card images from [ygoprodeck.com](https://ygoprodeck.com).
