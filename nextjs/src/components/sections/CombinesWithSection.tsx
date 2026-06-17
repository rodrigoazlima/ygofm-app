'use client'

import { useState } from 'react'
import { CardThumb } from '../CardThumb'
import { CardLabel } from '../CardLabel'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_COLORS, atkColor } from '@/lib/constants'

interface Props {
  selfId: number
  combinesWith: Map<number, number>
  onSelect: (id: number) => void
}

export function CombinesWithSection({ selfId, combinesWith, onSelect }: Props) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null)

  if (combinesWith.size === 0) return null

  const self = byId[selfId]
  const typeSet = new Set<number>()
  for (const [pid] of combinesWith) {
    const p = byId[pid]
    if (p) typeSet.add(p.Type)
  }

  const sorted = [...combinesWith.entries()].sort((a, b) => {
    const ra = byId[a[1]]?.Attack ?? 0
    const rb = byId[b[1]]?.Attack ?? 0
    return rb - ra
  })

  const filtered = typeFilter !== null
    ? sorted.filter(([pid]) => byId[pid]?.Type === typeFilter)
    : sorted

  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-2 px-4">
        ⬡ Combines With
        <span className="ml-2 text-[#333]">{combinesWith.size}</span>
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
      <div className="space-y-px">
        {filtered.map(([partnerId, resultId]) => {
          const partner = byId[partnerId]
          const result = byId[resultId]
          if (!partner || !result) return null
          return (
            <div
              key={partnerId}
              className="flex items-center gap-2 px-4 py-1.5 hover:bg-[#0e0e1a]"
            >
              {/* X: self (thumbnail only) */}
              {self && (
                <CardThumb card={self} size={44} onClick={() => onSelect(selfId)} />
              )}
              <span className="text-[#444] text-base font-light">+</span>
              {/* Y: partner (thumbnail only) */}
              <CardThumb card={partner} size={44} onClick={() => onSelect(partnerId)} />
              <span className="text-[#444] text-base font-light">=</span>
              {/* Z: result (thumbnail + name + stats) */}
              <CardThumb card={result} size={52} onClick={() => onSelect(resultId)} />
              <div className="flex-1 min-w-0">
                <CardLabel
                  card={result}
                  iconSize={12}
                  className="text-sm text-[#ccc] hover:text-white"
                  onClick={() => onSelect(resultId)}
                />
                {result.Type < 20 && (
                  <div className="text-xs mt-0.5" style={{ color: atkColor(result.Attack) }}>
                    ATK {result.Attack} / DEF {result.Defense}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
