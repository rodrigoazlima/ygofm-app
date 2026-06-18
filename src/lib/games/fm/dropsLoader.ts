import dropsRaw from '@/data/drops.json'

export type DropMode = 'sapow' | 'bcd' | 'astec'

export interface DropSource {
  npcId: number
  npcSlug: string
  npcName: string
  mode: DropMode
  drop_pct: number
}

export interface NpcDropEntry {
  card_id: number
  drop_pct: number
}

export interface NpcInfo {
  id: number
  slug: string
  name: string
  drops: Record<DropMode, NpcDropEntry[]>
}

export const MODE_LABELS: Record<DropMode, string> = {
  sapow: 'SA POW',
  bcd: 'BCD',
  astec: 'ASTEC',
}

const MODES: DropMode[] = ['sapow', 'bcd', 'astec']

type RawNpc = {
  id: number
  slug: string
  name: string
  drops: Record<string, Array<{ card_id: number; drop_pct: number }>>
}

export const npcList: NpcInfo[] = (dropsRaw as RawNpc[]).map(npc => ({
  id: npc.id,
  slug: npc.slug,
  name: npc.name,
  drops: {
    sapow: npc.drops.sapow ?? [],
    bcd: npc.drops.bcd ?? [],
    astec: npc.drops.astec ?? [],
  },
}))

export const npcById: Record<number, NpcInfo> = {}
for (const npc of npcList) {
  npcById[npc.id] = npc
}

const cardDrops: Record<number, DropSource[]> = {}

for (const npc of dropsRaw as RawNpc[]) {
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
