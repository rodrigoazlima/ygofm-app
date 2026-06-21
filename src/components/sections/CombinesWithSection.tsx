'use client'

import { useState } from 'react'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_COLORS, atkColor } from '@/lib/constants'
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
  combinesWith: Map<number, number>
  onSelect: (id: number) => void
  query?: string
}

export function CombinesWithSection({ selfId, combinesWith, onSelect, query }: Props) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

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
      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="text-[10px] uppercase tracking-widest text-[#555]">
          ⬡ Combines With
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
          {filtered.map(([partnerId, resultId]) => (
            <div
              key={partnerId}
              className="break-inside-avoid mb-2 bg-[#0d0d18] border border-[#1a1a28] rounded-sm hover:border-[#252535] transition-colors"
              style={{ width: '100%' }}
            >
              <div className="flex items-center justify-between px-2 py-2" style={{ width: '100%' }}>
                <CardSlot id={selfId} onSelect={onSelect} />
                <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">+</span>
                <CardSlot id={partnerId} onSelect={onSelect} />
                <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">=</span>
                <CardSlot id={resultId} isResult onSelect={onSelect} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4">
          <div
            className="grid border-b border-[#1a1a28] pb-1 mb-0.5"
            style={{ gridTemplateColumns: '28px 1fr 28px 1fr 44px' }}
          >
            <span />
            <span className="text-[8px] uppercase tracking-widest text-[#333]">Partner</span>
            <span />
            <span className="text-[8px] uppercase tracking-widest text-[#333]">Result</span>
            <span className="text-[8px] uppercase tracking-widest text-[#333] text-right pr-1">ATK</span>
          </div>
          {filtered.map(([partnerId, resultId]) => {
            const partner = byId[partnerId]
            const result = byId[resultId]
            if (!partner || !result) return null
            return (
              <div
                key={partnerId}
                className="grid items-center py-0.5 border-b border-[#0f0f18] hover:bg-[#0d0d18] transition-colors rounded-sm"
                style={{ gridTemplateColumns: '28px 1fr 28px 1fr 44px' }}
              >
                <CardThumb card={partner} size={24} onClick={() => onSelect(partnerId)} />
                <span
                  className="text-[10px] text-[#aaa] truncate pr-1 cursor-pointer hover:text-white"
                  onClick={() => onSelect(partnerId)}
                >
                  {partner.Name}
                </span>
                <CardThumb card={result} size={24} onClick={() => onSelect(resultId)} />
                <span
                  className="text-[10px] text-[#aaa] truncate pr-1 cursor-pointer hover:text-white"
                  onClick={() => onSelect(resultId)}
                >
                  {result.Name}
                </span>
                <span
                  className="text-[10px] font-mono text-right pr-1 cursor-pointer"
                  style={{ color: atkColor(result.Attack) }}
                  onClick={() => onSelect(resultId)}
                >
                  {result.Attack}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
