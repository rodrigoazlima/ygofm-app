'use client'

import { memo, useMemo, useState, useEffect, useCallback } from 'react'
import { cards } from '@/lib/dataLoader'
import { FIELD_BOOSTS, atkColor } from '@/lib/constants'
import { CardThumb } from './CardThumb'

type SortField = 'Attack' | 'Defense' | 'Level' | 'Stars'
type SortDir = 'desc' | 'asc'

const SORT_FIELDS: { key: SortField; label: string }[] = [
  { key: 'Attack', label: 'ATK' },
  { key: 'Defense', label: 'DEF' },
  { key: 'Level', label: 'LVL' },
  { key: 'Stars', label: 'STARS' },
]

const FIELD_IDS = new Set(Object.keys(FIELD_BOOSTS).map(Number))

export type CategoryId = 'monster' | 'field'

interface CategoryMeta {
  label: string
  color: string
}

const META: Record<CategoryId, CategoryMeta> = {
  monster: { label: 'Monster', color: '#a83' },
  field: { label: 'Field Spell', color: '#4a6' },
}

function readSort(): [SortField, SortDir] {
  if (typeof window === 'undefined') return ['Attack', 'desc']
  return [
    (localStorage.getItem('sortField') as SortField) || 'Attack',
    (localStorage.getItem('sortDir') as SortDir) || 'desc',
  ]
}

interface Props {
  category: CategoryId
  onSelect: (cardId: number) => void
}

export const CategoryDetail = memo(function CategoryDetail({ category, onSelect }: Props) {
  const meta = META[category]
  const [sortField, setSortField] = useState<SortField>(() => readSort()[0])
  const [sortDir, setSortDir] = useState<SortDir>(() => readSort()[1])
  const [sortKey, setSortKey] = useState(0)

  useEffect(() => { setSortKey(k => k + 1) }, [category])

  const handleSort = useCallback((field: SortField) => {
    const newDir = field === sortField ? (sortDir === 'desc' ? 'asc' : 'desc') : 'desc'
    setSortField(field)
    setSortDir(newDir)
    localStorage.setItem('sortField', field)
    localStorage.setItem('sortDir', newDir)
    setSortKey(k => k + 1)
  }, [sortField, sortDir])

  const sorted = useMemo(() => {
    const base = category === 'monster'
      ? cards.filter(c => c.Type < 20)
      : cards.filter(c => FIELD_IDS.has(c.Id))
    return [...base].sort((a, b) => {
      const av = a[sortField] as number
      const bv = b[sortField] as number
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [category, sortField, sortDir])

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#151520]">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold" style={{ color: meta.color }}>{meta.label}</div>
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
                  borderColor: active ? meta.color : '#1a1a28',
                  color: active ? meta.color : '#444',
                  background: active ? `${meta.color}15` : 'transparent',
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
