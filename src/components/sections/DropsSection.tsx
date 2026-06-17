'use client'

import { useState } from 'react'
import { cardDrops, MODE_LABELS, type DropMode } from '@/lib/dropsLoader'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const MODE_COLORS: Record<DropMode, string> = {
  sapow: '#4a9eff',
  bcd: '#ff9944',
  astec: '#66dd88',
}

function NpcImage({ slug, name }: { slug: string; name: string }) {
  const [idx, setIdx] = useState(0)
  const sources = [
    `${BASE_PATH}/images/npc/${slug}.png`,
    `https://www.yugiohfm.com/imgs/personagens/${slug}.png`,
  ]
  if (idx >= sources.length) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[8px] text-[#444]">
        {name.slice(0, 2)}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[idx]}
      alt={name}
      width={36}
      height={36}
      onError={() => setIdx(i => i + 1)}
      className="w-9 h-9 object-cover rounded-full bg-[#1a1a2e]"
    />
  )
}

interface Props {
  cardId: number
}

export function DropsSection({ cardId }: Props) {
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
          <div key={npc.npcId} className="flex items-center gap-2">
            <NpcImage slug={npc.npcSlug} name={npc.npcName} />
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
