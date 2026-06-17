# Yu-Gi-Oh! Forbidden Memories Search

Card reference tool for **Yu-Gi-Oh! Forbidden Memories** (PS1). Search cards, inspect stats, and explore fusion relationships.

[https://rodrigoazlima.github.io/ygofm-app/](https://rodrigoazlima.github.io/ygofm-app/)

## Features

- **Card grid** — all FMR cards displayed as thumbnails on a dark background
- **Live search** — filter by name with autocomplete (top 20 matches)
- **Card detail** — image, ATK/DEF, type, attribute, level, guardian stars, and description
- **Fusion relations**
  - *Fuses Into* — what this card produces when fused with another
  - *Combines With* — which cards to pair with this one and the result
  - *Compatible Spells* — equip cards that boost this monster
  - *Made From* — fusion ingredients that produce this card
- **Image fallback** — local WebP → fandom wiki images

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS v4

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Card data, fusion tables, and results live in `src/data/`. Local card images are in `images/` (`.webp`).
