export interface GameConfig {
  id: string
  name: string
  shortName: string
  platform: string
  year: number
  cover: string | null
  available: boolean
}

export const GAMES: GameConfig[] = [
  {
    id: 'fm',
    name: 'Forbidden Memories',
    shortName: 'FM',
    platform: 'PS1',
    year: 1999,
    cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Yu-Gi-Oh%21_Forbidden_Memories_Cover.png/250px-Yu-Gi-Oh%21_Forbidden_Memories_Cover.png',
    available: true,
  },
  {
    id: 'dor',
    name: 'The Duelists of the Roses',
    shortName: 'DoR',
    platform: 'PS2',
    year: 2001,
    cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Yu-Gi-Oh%21_The_Duelists_of_the_Roses_Cover.png/250px-Yu-Gi-Oh%21_The_Duelists_of_the_Roses_Cover.png',
    available: false,
  },
  {
    id: 'cmc',
    name: 'Capsule Monster Coliseum',
    shortName: 'CMC',
    platform: 'PS2',
    year: 2004,
    cover: null,
    available: false,
  },
  {
    id: 'poc',
    name: 'Power of Chaos: Joey',
    shortName: 'PoC',
    platform: 'PC',
    year: 2003,
    cover: null,
    available: false,
  },
  {
    id: 'lotle',
    name: 'Legacy of the Duelist: Link Evolution',
    shortName: 'LotD',
    platform: 'PC/PS4',
    year: 2019,
    cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Yu-Gi-Oh%21_Legacy_of_the_Duelist_Link_Evolutio_video_game_cover.jpeg/250px-Yu-Gi-Oh%21_Legacy_of_the_Duelist_Link_Evolutio_video_game_cover.jpeg',
    available: false,
  },
  {
    id: 'md',
    name: 'Master Duel',
    shortName: 'MD',
    platform: 'PC/PS4/PS5',
    year: 2022,
    cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Yu_Gi_Oh_Master_Duel_cover_art_full.jpg/250px-Yu_Gi_Oh_Master_Duel_cover_art_full.jpg',
    available: false,
  },
]

export const DEFAULT_GAME = 'fm'

export function getGame(id: string): GameConfig {
  return GAMES.find(g => g.id === id) ?? GAMES[0]
}
