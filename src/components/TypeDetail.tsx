'use client'

import { memo, useMemo, useState, useEffect, useCallback } from 'react'
import { cards } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_IMAGES, TYPE_COLORS } from '@/lib/constants'
import { CardListView, type ViewMode } from './CardListView'

type SortField = 'Attack' | 'Defense' | 'Level' | 'Stars'
type SortDir = 'desc' | 'asc'

const SORT_FIELDS: { key: SortField; label: string }[] = [
  { key: 'Attack', label: 'ATK' },
  { key: 'Defense', label: 'DEF' },
  { key: 'Level', label: 'LVL' },
  { key: 'Stars', label: 'STARS' },
]

const ATK_FILTERS = [0, 500, 1000, 1500, 2000, 2500, 3000]
const STAR_FILTERS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

function readSort(): [SortField, SortDir] {
  if (typeof window === 'undefined') return ['Attack', 'desc']
  return [
    (localStorage.getItem('sortField') as SortField) || 'Attack',
    (localStorage.getItem('sortDir') as SortDir) || 'desc',
  ]
}

interface Props {
  typeIdx: number
  onSelect: (cardId: number) => void
}

export const TypeDetail = memo(function TypeDetail({ typeIdx, onSelect }: Props) {
  const name = TYPE_NAMES[typeIdx] ?? ''
  const img = TYPE_IMAGES[typeIdx]
  const color = TYPE_COLORS[name] || '#666'
  const [sortField, setSortField] = useState<SortField>(() => readSort()[0])
  const [sortDir, setSortDir] = useState<SortDir>(() => readSort()[1])
  const [minAtk, setMinAtk] = useState(0)
  const [minStars, setMinStars] = useState(0)
  const [sortKey, setSortKey] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => { setSortKey(k => k + 1); setMinAtk(0); setMinStars(0) }, [typeIdx])

  const handleSort = useCallback((field: SortField) => {
    const newDir = field === sortField ? (sortDir === 'desc' ? 'asc' : 'desc') : 'desc'
    setSortField(field)
    setSortDir(newDir)
    localStorage.setItem('sortField', field)
    localStorage.setItem('sortDir', newDir)
    setSortKey(k => k + 1)
  }, [sortField, sortDir])

  const handleMinAtk = useCallback((val: number) => {
    setMinAtk(val)
    setSortKey(k => k + 1)
  }, [])

  const base = useMemo(() =>
    [...cards.filter(c => c.Type === typeIdx)].sort((a, b) => {
      const av = a[sortField] as number
      const bv = b[sortField] as number
      return sortDir === 'desc' ? bv - av : av - bv
    }),
    [typeIdx, sortField, sortDir]
  )

  const sorted = useMemo(() => {
    let result = minAtk > 0 ? base.filter(c => c.Attack >= minAtk) : base
    if (minStars > 0) result = result.filter(c => c.Stars >= minStars)
    return result
  }, [base, minAtk, minStars])

  if (base.length === 0) return null

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
            {sorted.length}{(minAtk > 0 || minStars > 0) ? ` / ${base.length}` : ''} cards
          </div>
        </div>
        <div className="flex gap-1">
          {SORT_FIELDS.map(({ key, label }) => {
            const active = sortField === key
            const disabled = viewMode === 'table'
            return (
              <button
                key={key}
                onClick={() => !disabled && handleSort(key)}
                disabled={disabled}
                className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border transition-colors"
                style={{
                  borderColor: disabled ? '#111' : active ? color : '#1a1a28',
                  color: disabled ? '#252525' : active ? color : '#444',
                  background: disabled ? 'transparent' : active ? `${color}15` : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {label}{!disabled && active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* ATK filter row */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#0f0f1a]">
        <span className="text-[8px] uppercase tracking-widest text-[#333] mr-1 shrink-0">Min ATK</span>
        {ATK_FILTERS.map(val => {
          const active = minAtk === val
          return (
            <button
              key={val}
              onClick={() => handleMinAtk(val)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border transition-colors"
              style={{
                borderColor: active ? color : '#1a1a28',
                color: active ? color : '#333',
                background: active ? `${color}15` : 'transparent',
              }}
            >
              {val === 0 ? 'All' : `${val}+`}
            </button>
          )
        })}
      </div>

      {/* Stars filter row */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#0f0f1a]">
        <span className="text-[8px] uppercase tracking-widest text-[#333] mr-1 shrink-0">Min Stars</span>
        {STAR_FILTERS.map(val => {
          const active = minStars === val
          return (
            <button
              key={val}
              onClick={() => { setMinStars(val); setSortKey(k => k + 1) }}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border transition-colors"
              style={{
                borderColor: active ? color : '#1a1a28',
                color: active ? color : '#333',
                background: active ? `${color}15` : 'transparent',
              }}
            >
              {val === 0 ? 'Any' : String(val)}
            </button>
          )
        })}
      </div>

      <CardListView cards={sorted} sortKey={sortKey} accentColor={color} onSelect={onSelect} viewMode={viewMode} onViewModeChange={setViewMode} />
    </div>
  )
})
