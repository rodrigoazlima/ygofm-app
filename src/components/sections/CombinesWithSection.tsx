'use client'

import { useState } from 'react'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_COLORS } from '@/lib/constants'
import { CardSlot, TILE_W } from './CardSlot'

interface Props {
  selfId: number
  combinesWith: Map<number, number>
  onSelect: (id: number) => void
  query?: string
}

export function CombinesWithSection({ selfId, combinesWith, onSelect, query }: Props) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null)

  if (combinesWith.size === 0) return null

  const q = query?.toLowerCase() ?? ''

  const sorted = [...combinesWith.entries()].sort((a, b) => {
    const ra = byId[a[1]]?.Attack ?? 0
    const rb = byId[b[1]]?.Attack ?? 0
    return rb - ra
  })

  const queryFiltered = q
    ? sorted.filter(([pid, rid]) =>
        byId[pid]?.Name.toLowerCase().includes(q) ||
        byId[rid]?.Name.toLowerCase().includes(q))
    : sorted

  if (queryFiltered.length === 0) return null

  const typeSet = new Set<number>()
  for (const [pid] of queryFiltered) {
    const p = byId[pid]
    if (p) typeSet.add(p.Type)
  }

  const filtered = typeFilter !== null
    ? queryFiltered.filter(([pid]) => byId[pid]?.Type === typeFilter)
    : queryFiltered

  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-2 px-4">
        ⬡ Combines With
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

      {/* Masonry via CSS columns with fixed-width tiles */}
      <div className="px-4" style={{ columns: `${TILE_W}px`, columnGap: 8 }}>
        {filtered.map(([partnerId, resultId]) => (
          <div
            key={partnerId}
            className="break-inside-avoid mb-2 bg-[#0d0d18] border border-[#1a1a28] rounded-sm hover:border-[#252535] transition-colors"
            style={{ width: '100%' }}
          >
            <div
              className="flex items-center justify-between px-2 py-2"
              style={{ width: '100%' }}
            >
              <CardSlot id={selfId} onSelect={onSelect} />
              <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">+</span>
              <CardSlot id={partnerId} onSelect={onSelect} />
              <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">=</span>
              <CardSlot id={resultId} isResult onSelect={onSelect} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
