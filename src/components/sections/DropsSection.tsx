'use client'

import { cardDrops, MODE_LABELS, type DropMode } from '@/lib/dropsLoader'
import { NpcImage } from '@/components/NpcImage'

const MODE_COLORS: Record<DropMode, string> = {
  sapow: '#4a9eff',
  bcd: '#ff9944',
  astec: '#66dd88',
}

interface Props {
  cardId: number
  onSelectNpc?: (npcId: number) => void
}

export function DropsSection({ cardId, onSelectNpc }: Props) {
  const drops = cardDrops[cardId]
  if (!drops || drops.length === 0) return null

  type NpcEntry = {
    npcId: number
    npcSlug: string
    npcName: string
    modes: { mode: DropMode; drop_pct: number }[]
  }

  const byNpc: Record<number, NpcEntry> = {}
  for (const d of drops) {
    if (!byNpc[d.npcId]) {
      byNpc[d.npcId] = { npcId: d.npcId, npcSlug: d.npcSlug, npcName: d.npcName, modes: [] }
    }
    byNpc[d.npcId].modes.push({ mode: d.mode, drop_pct: d.drop_pct })
  }

  const npcs = Object.values(byNpc).sort((a, b) => {
    const maxA = Math.max(...a.modes.map(m => m.drop_pct))
    const maxB = Math.max(...b.modes.map(m => m.drop_pct))
    return maxB - maxA
  })

  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-2 px-4">
        ✦ Dropped By
        <span className="ml-2 text-[#333]">{npcs.length}</span>
      </h3>
      <div className="flex flex-col gap-2 px-4">
        {npcs.map(npc => (
          <div
            key={npc.npcId}
            className={`flex items-center gap-2 rounded-sm transition-colors ${onSelectNpc ? 'cursor-pointer hover:bg-[#0e0e1a] px-2 py-1 -mx-2' : ''}`}
            onClick={() => onSelectNpc?.(npc.npcId)}
          >
            <NpcImage slug={npc.npcSlug} name={npc.npcName} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[#888] truncate">{npc.npcName}</div>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {npc.modes.map(({ mode, drop_pct }) => (
                  <span
                    key={mode}
                    className="text-[9px] font-mono px-1 py-0.5 rounded-sm"
                    style={{ color: MODE_COLORS[mode], backgroundColor: `${MODE_COLORS[mode]}18` }}
                  >
                    {MODE_LABELS[mode]} {drop_pct.toFixed(2)}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
