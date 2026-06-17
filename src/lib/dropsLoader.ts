import dropsRaw from '@/data/drops.json'

export type DropMode = 'sapow' | 'bcd' | 'astec'

export interface DropSource {
  npcId: number
  npcSlug: string
  npcName: string
  mode: DropMode
  drop_pct: number
}

export const MODE_LABELS: Record<DropMode, string> = {
  sapow: 'SA POW',
  bcd: 'BCD',
  astec: 'ASTEC',
}

const MODES: DropMode[] = ['sapow', 'bcd', 'astec']

const cardDrops: Record<number, DropSource[]> = {}

for (const npc of dropsRaw as Array<{
  id: number
  slug: string
  name: string
  drops: Record<string, Array<{ card_id: number; drop_pct: number }>>
}>) {
  for (const mode of MODES) {
    for (const drop of npc.drops[mode] ?? []) {
      const id = drop.card_id
      if (!cardDrops[id]) cardDrops[id] = []
      cardDrops[id].push({
        npcId: npc.id,
        npcSlug: npc.slug,
        npcName: npc.name,
        mode,
        drop_pct: drop.drop_pct,
      })
    }
  }
}

export { cardDrops }
