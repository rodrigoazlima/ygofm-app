export const THUMB_BASE = 'https://images.ygoprodeck.com/images/cards_cropped'
export const FULL_BASE = 'https://images.ygoprodeck.com/images/cards'

export const CODE_FIXES: Record<string, string> = {
  'Meteor B. Dragon': '90660762',
}

export const TYPE_NAMES = [
  'Dragon', 'Spellcaster', 'Zombie', 'Warrior', 'Beast-Warrior', 'Beast',
  'Winged Beast', 'Fiend', 'Fairy', 'Insect', 'Dinosaur', 'Reptile',
  'Fish', 'Sea Serpent', 'Machine', 'Thunder', 'Aqua', 'Pyro', 'Rock', 'Plant',
  'Magic', 'Trap', 'Ritual', 'Equip',
]

export const STAR_NAMES = [
  'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Pluto',
  'Neptune', 'Mercury', 'Sun', 'Moon', 'Venus',
]

export const GUARDIAN_STAR_SYMBOLS: Record<string, string> = {
  Sun: '☉', Mercury: '☿', Venus: '♀', Moon: '☾',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢',
  Neptune: '♆', Pluto: '♇',
}

export const GUARDIAN_STAR_STRONG: Record<string, string> = {
  Sun: 'Moon', Mercury: 'Sun', Venus: 'Mercury', Moon: 'Venus',
  Mars: 'Jupiter', Jupiter: 'Saturn', Saturn: 'Uranus', Uranus: 'Pluto',
  Neptune: 'Mars', Pluto: 'Neptune',
}

export const GUARDIAN_STAR_WEAK: Record<string, string> = {
  Sun: 'Mercury', Mercury: 'Venus', Venus: 'Moon', Moon: 'Sun',
  Mars: 'Neptune', Jupiter: 'Mars', Saturn: 'Jupiter', Uranus: 'Saturn',
  Neptune: 'Pluto', Pluto: 'Uranus',
}

export const GUARDIAN_STAR_COLORS: Record<string, string> = {
  Sun: '#d4a82a', Mercury: '#9944cc', Venus: '#cc77dd', Moon: '#7766aa',
  Mars: '#cc4422', Jupiter: '#4a8a3a', Saturn: '#5599aa', Uranus: '#7a6644',
  Neptune: '#3366bb', Pluto: '#999922',
}

export const ATTR_NAMES = ['Dark', 'Earth', 'Fire', 'Light', 'Water', 'Wind', 'Divine']

export const ATTR_COLORS: Record<string, string> = {
  Dark: '#9944cc', Earth: '#aa7733', Fire: '#dd4422',
  Light: '#ccbb22', Water: '#3388dd', Wind: '#44aa55', Divine: '#ddaa33',
}

export const TYPE_IMAGES = [
  'https://ms.yugipedia.com//c/c7/Dragon.png',
  'https://ms.yugipedia.com//2/2f/Spellcaster.png',
  'https://ms.yugipedia.com//c/c3/Zombie.png',
  'https://ms.yugipedia.com//9/97/Warrior.png',
  'https://ms.yugipedia.com//1/1d/Beast-Warrior.png',
  'https://ms.yugipedia.com//1/17/Beast.png',
  'https://ms.yugipedia.com//0/01/Winged_Beast.png',
  'https://ms.yugipedia.com//6/6e/Fiend.png',
  'https://ms.yugipedia.com//4/43/Fairy.png',
  'https://ms.yugipedia.com//7/79/Insect.png',
  'https://ms.yugipedia.com//8/89/Dinosaur.png',
  'https://ms.yugipedia.com//9/90/Reptile.png',
  'https://ms.yugipedia.com//f/fb/Fish.png',
  'https://ms.yugipedia.com//2/2f/Sea_Serpent.png',
  'https://ms.yugipedia.com//1/18/Machine.png',
  'https://ms.yugipedia.com//3/3d/Thunder.png',
  'https://ms.yugipedia.com//4/44/Aqua.png',
  'https://ms.yugipedia.com//c/c8/Pyro.png',
  'https://ms.yugipedia.com//0/0b/Rock.png',
  'https://ms.yugipedia.com//d/d1/Plant.png',
  'https://ms.yugipedia.com//d/db/Spell.svg',
  'https://ms.yugipedia.com//5/5e/Trap.svg',
  'https://ms.yugipedia.com//7/70/Ritual.png',
  'https://ms.yugipedia.com//9/90/Equip.svg',
]

export const ATTR_IMAGES = [
  'https://static.wikia.nocookie.net/yugioh/images/d/de/DARK.svg/revision/latest?cb=20120918053848',
  'https://static.wikia.nocookie.net/yugioh/images/a/a1/EARTH.svg/revision/latest?cb=20120918053843',
  'https://static.wikia.nocookie.net/yugioh/images/d/d6/FIRE.svg/revision/latest?cb=20120918053839',
  'https://static.wikia.nocookie.net/yugioh/images/3/39/LIGHT.svg/revision/latest?cb=20120918053832',
  'https://static.wikia.nocookie.net/yugioh/images/4/40/WATER.svg/revision/latest?cb=20120918052107',
  'https://static.wikia.nocookie.net/yugioh/images/0/01/WIND.svg/revision/latest?cb=20170920205028',
  'https://static.wikia.nocookie.net/yugioh/images/7/7c/DIVINE.svg/revision/latest?cb=20120918053906',
]

export const TYPE_COLORS: Record<string, string> = {
  Dragon: '#c44', Spellcaster: '#84a', Zombie: '#5a7', Warrior: '#a83',
  'Beast-Warrior': '#976', Beast: '#6a4', 'Winged Beast': '#69b', Fiend: '#855',
  Fairy: '#b8b', Insect: '#7a5', Dinosaur: '#a64', Reptile: '#4a6',
  Fish: '#48b', 'Sea Serpent': '#37a', Machine: '#777', Thunder: '#aa4',
  Aqua: '#4ab', Pyro: '#c73', Rock: '#885', Plant: '#4a4',
  Magic: '#46a', Trap: '#a46', Ritual: '#77a', Equip: '#6a8',
}

// Field card ID → monster type indices they boost (+500 ATK/DEF in FMR)
export const FIELD_BOOSTS: Record<number, number[]> = {
  330: [5, 4, 9, 19],  // Forest:    Beast, Beast-Warrior, Insect, Plant
  331: [2, 18, 10],    // Wasteland: Zombie, Rock, Dinosaur
  332: [0, 6, 15],     // Mountain:  Dragon, Winged Beast, Thunder
  333: [3, 4],         // Sogen:     Warrior, Beast-Warrior
  334: [16, 13, 12],   // Umi:       Aqua, Sea Serpent, Fish
  335: [7, 1],         // Yami:      Fiend, Spellcaster
}

export function atkColor(atk: number): string {
  if (atk >= 3000) return '#f44'
  if (atk >= 2500) return '#f80'
  if (atk >= 2000) return '#fa0'
  if (atk >= 1500) return '#cc0'
  return '#888'
}
