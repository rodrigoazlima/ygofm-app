'use client'

import { memo, useMemo, useState, useEffect, useCallback } from 'react'
import { cards } from '@/lib/dataLoader'
import { ATTR_NAMES, ATTR_IMAGES, ATTR_COLORS, atkColor } from '@/lib/constants'
import { CardThumb } from './CardThumb'

type SortField = 'Attack' | 'Defense' | 'Level' | 'Stars'
type SortDir = 'desc' | 'asc'

const SORT_FIELDS: { key: SortField; label: string }[] = [
  { key: 'Attack', label: 'ATK' },
  { key: 'Defense', label: 'DEF' },
  { key: 'Level', label: 'LVL' },
  { key: 'Stars', label: 'STARS' },
]

function readSort(): [SortField, SortDir] {
  if (typeof window === 'undefined') return ['Attack', 'desc']
  return [
    (localStorage.getItem('sortField') as SortField) || 'Attack',
    (localStorage.getItem('sortDir') as SortDir) || 'desc',
  ]
}

interface Props {
  attrIdx: number
  onSelect: (cardId: number) => void
}

export const AttributeDetail = memo(function AttributeDetail({ attrIdx, onSelect }: Props) {
  const name = ATTR_NAMES[attrIdx] ?? ''
  const img = ATTR_IMAGES[attrIdx]
  const color = ATTR_COLORS[name] || '#666'
  const [sortField, setSortField] = useState<SortField>(() => readSort()[0])
  const [sortDir, setSortDir] = useState<SortDir>(() => readSort()[1])
  const [sortKey, setSortKey] = useState(0)

  useEffect(() => { setSortKey(k => k + 1) }, [attrIdx])

  const handleSort = useCallback((field: SortField) => {
    const newDir = field === sortField ? (sortDir === 'desc' ? 'asc' : 'desc') : 'desc'
    setSortField(field)
    setSortDir(newDir)
    localStorage.setItem('sortField', field)
    localStorage.setItem('sortDir', newDir)
    setSortKey(k => k + 1)
  }, [sortField, sortDir])

  const sorted = useMemo(() =>
    [...cards.filter(c => c.Attribute === attrIdx)].sort((a, b) => {
      const av = a[sortField] as number
      const bv = b[sortField] as number
      return sortDir === 'desc' ? bv - av : av - bv
    }),
    [attrIdx, sortField, sortDir]
  )

  if (sorted.length === 0) return null

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#151520]">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} width={32} height={32}
            style={{ width: 32, height: 32, objectFit: 'contain' }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold" style={{ color }}>{name}</div>
          <div className="text-[10px] text-[#555] uppercase tracking-widest mt-0.5">
            {sorted.length} cards
          </div>
        </div>
        <div className="flex gap-1">
          {SORT_FIELDS.map(({ key, label }) => {
            const active = sortField === key
            return (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border transition-colors"
                style={{
                  borderColor: active ? color : '#1a1a28',
                  color: active ? color : '#444',
                  background: active ? `${color}15` : 'transparent',
                }}
              >
                {label}{active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
              </button>
            )
          })}
        </div>
      </div>

      <div
        key={sortKey}
        className="sort-enter px-4 mt-4"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: 4 }}
      >
        {sorted.map(card => (
          <div
            key={card.Id}
            className="bg-[#0d0d18] border border-[#1a1a28] rounded-sm hover:border-[#252535] transition-colors cursor-pointer"
            onClick={() => onSelect(card.Id)}
          >
            <div className="flex flex-col items-center px-0.5 pt-1 pb-0.5">
              <CardThumb card={card} size={52} />
              <div className="text-[8px] text-[#777] text-center leading-none w-full truncate mt-0.5 px-0.5">
                {card.Name}
              </div>
              <div className="text-[8px] text-center leading-none mt-0.5">
                <span style={{ color: atkColor(card.Attack) }}>{card.Attack}</span>
                <span className="text-[#2a2a3a]">/</span>
                <span className="text-[#444]">{card.Defense}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
