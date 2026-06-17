'use client'

import { useState } from 'react'
import type { ResultEntry } from '@/lib/types'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_COLORS } from '@/lib/constants'
import { CardSlot, TILE_W } from './CardSlot'

interface Props {
  selfId: number
  madeFrom: ResultEntry[]
  onSelect: (id: number) => void
  query?: string
}

export function MadeFromSection({ selfId, madeFrom, onSelect, query }: Props) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null)

  if (madeFrom.length === 0) return null

  const q = query?.toLowerCase() ?? ''

  const queryFiltered = q
    ? madeFrom.filter(({ card1, card2 }) =>
        byId[card1]?.Name.toLowerCase().includes(q) ||
        byId[card2]?.Name.toLowerCase().includes(q))
    : madeFrom

  if (queryFiltered.length === 0) return null

  const typeSet = new Set<number>()
  for (const { card1, card2 } of queryFiltered) {
    const c1 = byId[card1], c2 = byId[card2]
    if (c1) typeSet.add(c1.Type)
    if (c2) typeSet.add(c2.Type)
  }

  const filtered = typeFilter !== null
    ? queryFiltered.filter(({ card1, card2 }) =>
        byId[card1]?.Type === typeFilter || byId[card2]?.Type === typeFilter)
    : queryFiltered

  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-2 px-4">
        ✦ Made From
        <span className="ml-2 text-[#333]">{queryFiltered.length}</span>
      </h3>

      {typeSet.size > 1 && (
        <div className="flex flex-wrap gap-1 px-4 mb-3">
          {[...typeSet].map(t => {
            const name = TYPE_NAMES[t] || ''
            const color = TYPE_COLORS[name] || '#555'
            const active = typeFilter === t
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(active ? null : t)}
                className="text-[9px] px-1.5 py-0.5 rounded-sm border transition-colors"
                style={{
                  borderColor: color,
                  color: active ? '#000' : color,
                  background: active ? color : 'transparent',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      <div className="px-4" style={{ columns: `${TILE_W}px`, columnGap: 8 }}>
        {filtered.map(({ card1, card2 }, idx) => (
          <div
            key={idx}
            className="break-inside-avoid mb-2 bg-[#0d0d18] border border-[#1a1a28] rounded-sm hover:border-[#252535] transition-colors"
            style={{ width: '100%' }}
          >
            <div className="flex items-center justify-between px-2 py-2" style={{ width: '100%' }}>
              <CardSlot id={card1} onSelect={onSelect} />
              <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">+</span>
              <CardSlot id={card2} onSelect={onSelect} />
              <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">=</span>
              <CardSlot id={selfId} isResult onSelect={onSelect} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
