'use client'

import { useState } from 'react'
import { CardThumb } from '../CardThumb'
import { CardLabel } from '../CardLabel'
import { byId } from '@/lib/dataLoader'
import { atkColor } from '@/lib/constants'

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
  fusesInto: Map<number, number[]>
  onSelect: (id: number) => void
  query?: string
}

export function FusesIntoSection({ fusesInto, onSelect, query }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  if (fusesInto.size === 0) return null

  const q = query?.toLowerCase() ?? ''

  const sorted = [...fusesInto.entries()]
    .filter(([resultId, partners]) => {
      if (!q) return true
      if (byId[resultId]?.Name.toLowerCase().includes(q)) return true
      return partners.some(pid => byId[pid]?.Name.toLowerCase().includes(q))
    })
    .sort((a, b) => {
      const ra = byId[a[0]]?.Attack ?? 0
      const rb = byId[b[0]]?.Attack ?? 0
      return rb - ra
    })

  if (sorted.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="text-[10px] uppercase tracking-widest text-[#555]">
          ⚔ Fuses Into
          <span className="ml-2 text-[#333]">{sorted.length}</span>
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

      {viewMode === 'grid' ? (
        <div className="space-y-1">
          {sorted.map(([resultId, partners]) => {
            const result = byId[resultId]
            if (!result) return null
            return (
              <div
                key={resultId}
                className="flex items-center gap-2 px-4 py-1 hover:bg-[#0e0e1a] cursor-pointer group"
              >
                <CardThumb card={result} size={56} onClick={() => onSelect(resultId)} />
                <div className="flex-1 min-w-0">
                  <CardLabel
                    card={result}
                    iconSize={13}
                    className="text-sm text-[#ddd] hover:text-white"
                    onClick={() => onSelect(resultId)}
                  />
                  {result.Type < 20 && (
                    <div className="text-xs">
                      <span style={{ color: atkColor(result.Attack) }}>{result.Attack} ATK</span>
                      <span className="text-[#444] mx-1">/</span>
                      <span className="text-[#555]">{result.Defense} DEF</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {partners.slice(0, 6).map(pid => {
                    const p = byId[pid]
                    return p ? (
                      <CardThumb key={pid} card={p} size={40} onClick={() => onSelect(pid)} />
                    ) : null
                  })}
                  {partners.length > 6 && (
                    <span className="text-xs text-[#444] self-center">+{partners.length - 6}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-4">
          <div
            className="grid border-b border-[#1a1a28] pb-1 mb-0.5"
            style={{ gridTemplateColumns: '28px 1fr 44px 36px 48px' }}
          >
            <span />
            <span className="text-[8px] uppercase tracking-widest text-[#333]">Result</span>
            <span className="text-[8px] uppercase tracking-widest text-[#333] text-right pr-1">ATK</span>
            <span className="text-[8px] uppercase tracking-widest text-[#333] text-right pr-1">DEF</span>
            <span className="text-[8px] uppercase tracking-widest text-[#333] text-right pr-1">Partners</span>
          </div>
          {sorted.map(([resultId, partners]) => {
            const result = byId[resultId]
            if (!result) return null
            return (
              <div
                key={resultId}
                className="grid items-center py-0.5 border-b border-[#0f0f18] hover:bg-[#0d0d18] transition-colors cursor-pointer rounded-sm"
                style={{ gridTemplateColumns: '28px 1fr 44px 36px 48px' }}
                onClick={() => onSelect(resultId)}
              >
                <CardThumb card={result} size={24} />
                <span className="text-[10px] text-[#aaa] truncate pr-1">{result.Name}</span>
                <span className="text-[10px] font-mono text-right pr-1" style={{ color: atkColor(result.Attack) }}>{result.Attack}</span>
                <span className="text-[10px] font-mono text-[#555] text-right pr-1">{result.Defense}</span>
                <span className="text-[10px] font-mono text-[#444] text-right pr-1">{partners.length}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
