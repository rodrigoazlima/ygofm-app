'use client'

import { useState } from 'react'
import { CardThumb } from '../CardThumb'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_COLORS, TYPE_IMAGES, atkColor } from '@/lib/constants'

interface Props {
  selfId: number
  combinesWith: Map<number, number>
  onSelect: (id: number) => void
}

const CARD_W = 72   // px — fixed width per card slot
const TILE_W = 290  // px — fixed formula tile width

interface SlotProps {
  id: number
  isResult?: boolean
  onSelect: (id: number) => void
}

function Slot({ id, isResult, onSelect }: SlotProps) {
  const card = byId[id]
  if (!card) return <div style={{ width: CARD_W }} />
  const typeImg = TYPE_IMAGES[card.Type]
  const typeName = TYPE_NAMES[card.Type] || ''
  const isMonster = card.Type < 20

  return (
    <div
      style={{ width: CARD_W }}
      className="flex flex-col items-center gap-0.5 cursor-pointer group shrink-0"
      onClick={() => onSelect(id)}
    >
      <CardThumb card={card} size={isResult ? 48 : 44} />
      {/* type icon + name — no attribute */}
      <div className="flex items-center gap-0.5 w-full overflow-hidden justify-center">
        {typeImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={typeImg} alt={typeName} title={typeName} width={9} height={9}
            style={{ width: 9, height: 9, objectFit: 'contain', flexShrink: 0 }} />
        )}
        <span
          className="text-[9px] text-[#777] group-hover:text-[#bbb] truncate leading-tight"
          style={{ maxWidth: CARD_W - 14 }}
        >
          {card.Name}
        </span>
      </div>
      {/* ATK / DEF for all cards */}
      {isMonster ? (
        <div className="text-[8px] text-center leading-tight">
          <span style={{ color: atkColor(card.Attack) }}>{card.Attack}</span>
          <span className="text-[#2a2a3a]">/</span>
          <span className="text-[#444]">{card.Defense}</span>
        </div>
      ) : (
        <div style={{ height: 12 }} />
      )}
    </div>
  )
}

export function CombinesWithSection({ selfId, combinesWith, onSelect }: Props) {
  const [typeFilter, setTypeFilter] = useState<number | null>(null)

  if (combinesWith.size === 0) return null

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
              <Slot id={selfId} onSelect={onSelect} />
              <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">+</span>
              <Slot id={partnerId} onSelect={onSelect} />
              <span className="text-[#2a2a3a] text-sm font-light shrink-0 select-none">=</span>
              <Slot id={resultId} isResult onSelect={onSelect} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
