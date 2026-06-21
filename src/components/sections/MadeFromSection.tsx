'use client'

import { useState } from 'react'
import type { ResultEntry } from '@/lib/types'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_COLORS } from '@/lib/constants'
import { CardSlot, TILE_W } from './CardSlot'
import { CardThumb } from '../CardThumb'

function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
      <rect x="0" y="0" width="5" height="5" rx="0.5"/>
      <rect x="7" y="0" width="5" height="5" rx="0.5"/>
      <rect x="0" y="7" width="5" height="5" rx="0.5"/>
      <rect x="7" y="7" width="5" height="5" rx="0.5"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
      <rect x="0" y="1" width="12" height="2" rx="0.5"/>
      <rect x="0" y="5" width="12" height="2" rx="0.5"/>
      <rect x="0" y="9" width="12" height="2" rx="0.5"/>
    </svg>
  )
}

const ACCENT = '#666'

interface Props {
  selfId: number
  madeFrom: ResultEntry[]
  onSelect: (id: number) => void
  query?: string
}

export function MadeFromSection({ selfId, madeFrom, onSelect, query }: Props) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

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
      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="text-[10px] uppercase tracking-widest text-[#555]">
          ✦ Made From
          <span className="ml-2 text-[#333]">{queryFiltered.length}</span>
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className="p-1 rounded-sm border transition-colors"
            style={{
              borderColor: viewMode === 'grid' ? ACCENT : '#1a1a28',
              color: viewMode === 'grid' ? ACCENT : '#333',
              background: viewMode === 'grid' ? `${ACCENT}15` : 'transparent',
            }}
            title="Grid view"
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className="p-1 rounded-sm border transition-colors"
            style={{
              borderColor: viewMode === 'table' ? ACCENT : '#1a1a28',
              color: viewMode === 'table' ? ACCENT : '#333',
              background: viewMode === 'table' ? `${ACCENT}15` : 'transparent',
            }}
            title="Table view"
          >
            <ListIcon />
          </button>
        </div>
      </div>

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

      {viewMode === 'grid' ? (
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
      ) : (
        <div className="px-4">
          <div
            className="grid border-b border-[#1a1a28] pb-1 mb-0.5"
            style={{ gridTemplateColumns: '28px 1fr 28px 1fr' }}
          >
            <span />
            <span className="text-[8px] uppercase tracking-widest text-[#333]">Material 1</span>
            <span />
            <span className="text-[8px] uppercase tracking-widest text-[#333]">Material 2</span>
          </div>
          {filtered.map(({ card1, card2 }, idx) => {
            const c1 = byId[card1]
            const c2 = byId[card2]
            if (!c1 || !c2) return null
            return (
              <div
                key={idx}
                className="grid items-center py-0.5 border-b border-[#0f0f18] hover:bg-[#0d0d18] transition-colors rounded-sm"
                style={{ gridTemplateColumns: '28px 1fr 28px 1fr' }}
              >
                <CardThumb card={c1} size={24} onClick={() => onSelect(card1)} />
                <span
                  className="text-[10px] text-[#aaa] truncate pr-1 cursor-pointer hover:text-white"
                  onClick={() => onSelect(card1)}
                >
                  {c1.Name}
                </span>
                <CardThumb card={c2} size={24} onClick={() => onSelect(card2)} />
                <span
                  className="text-[10px] text-[#aaa] truncate pr-1 cursor-pointer hover:text-white"
                  onClick={() => onSelect(card2)}
                >
                  {c2.Name}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
