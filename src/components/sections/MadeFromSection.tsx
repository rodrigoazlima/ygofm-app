'use client'

import { useState } from 'react'
import type { ResultEntry } from '@/lib/types'
import { CardThumb } from '../CardThumb'
import { CardLabel } from '../CardLabel'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_COLORS, atkColor } from '@/lib/constants'

interface Props {
  madeFrom: ResultEntry[]
  onSelect: (id: number) => void
  query?: string
}

export function MadeFromSection({ madeFrom, onSelect, query }: Props) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null)

  if (madeFrom.length === 0) return null

  const q = query?.toLowerCase() ?? ''

  const queryFiltered = q
    ? madeFrom.filter(({ card1, card2 }) =>
        byId[card1]?.Name.toLowerCase().includes(q) ||
        byId[card2]?.Name.toLowerCase().includes(q))
    : madeFrom

  if (queryFiltered.length === 0) return null

  // Unique types across query-filtered materials
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
        <div className="flex flex-wrap gap-1 px-4 mb-2">
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
      <div className="space-y-0.5">
        {filtered.map(({ card1, card2 }, idx) => {
          const c1 = byId[card1], c2 = byId[card2]
          if (!c1 || !c2) return null
          return (
            <div key={idx} className="flex items-center gap-2 px-4 py-1.5 hover:bg-[#0e0e1a]">
              <CardThumb card={c1} size={52} onClick={() => onSelect(card1)} />
              <span className="text-[#333] text-sm">+</span>
              <CardThumb card={c2} size={52} onClick={() => onSelect(card2)} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#666] flex items-center gap-1 flex-wrap">
                  <CardLabel card={c1} iconSize={11} className="hover:text-[#ccc]" onClick={() => onSelect(card1)} />
                  <span className="text-[#333]">+</span>
                  <CardLabel card={c2} iconSize={11} className="hover:text-[#ccc]" onClick={() => onSelect(card2)} />
                </div>
                <div className="text-[10px] text-[#444]">
                  <span style={{ color: atkColor(c1.Attack) }}>{c1.Attack}</span>
                  <span className="text-[#333]">/{c1.Defense}</span>
                  <span className="text-[#333] mx-1">+</span>
                  <span style={{ color: atkColor(c2.Attack) }}>{c2.Attack}</span>
                  <span className="text-[#333]">/{c2.Defense}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
