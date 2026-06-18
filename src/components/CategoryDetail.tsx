'use client'

import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { cards } from '@/lib/dataLoader'
import { FIELD_BOOSTS, TYPE_NAMES, TYPE_IMAGES, TYPE_COLORS, ATTR_NAMES, ATTR_IMAGES, ATTR_COLORS } from '@/lib/constants'
import { CardListView } from './CardListView'
import type { FilterState } from '@/lib/filters'

type SortField = 'Attack' | 'Defense' | 'Level' | 'Stars'

const SORT_FIELDS: { key: SortField; label: string }[] = [
  { key: 'Attack', label: 'ATK' },
  { key: 'Defense', label: 'DEF' },
  { key: 'Level', label: 'LVL' },
  { key: 'Stars', label: 'STARS' },
]

const ATK_FILTERS = [0, 500, 1000, 1500, 2000, 2500, 3000]
const DEF_FILTERS = [0, 500, 1000, 1500, 2000, 2500, 3000]
const STAR_FILTERS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

const FIELD_IDS = new Set(Object.keys(FIELD_BOOSTS).map(Number))
const MONSTER_TYPES = TYPE_NAMES.slice(0, 20).map((name, i) => ({ idx: i, name }))

export type CategoryId = 'monster' | 'field'

const META: Record<CategoryId, { label: string; color: string }> = {
  monster: { label: 'Monster', color: '#a83' },
  field: { label: 'Field Spell', color: '#4a6' },
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 px-4 py-1.5 border-b border-[#0f0f1a] flex-wrap">
      <span className="text-[8px] uppercase tracking-widest text-[#333] mr-1 shrink-0 w-14">{label}</span>
      {children}
    </div>
  )
}

interface Props {
  category: CategoryId
  filters: FilterState
  onFilterChange: (partial: Partial<FilterState>) => void
  onSelect: (cardId: number) => void
  getCardHref?: (id: number) => string
}

export const CategoryDetail = memo(function CategoryDetail({ category, filters, onFilterChange, onSelect, getCardHref }: Props) {
  const meta = META[category]
  const isMonster = category === 'monster'
  const [sortKey, setSortKey] = useState(0)
  const [nameQuery, setNameQuery] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  const { sortField, sortDir, viewMode, minAtk, minDef, filterType, filterAttr, minStars, maxStars, tableSortField, tableSortDir } = filters
  const MONSTER_ONLY_FIELDS = new Set(['Attack', 'Defense', 'Level', 'Type', 'Attribute'])
  const effectiveTableSortField = (!isMonster && MONSTER_ONLY_FIELDS.has(tableSortField)) ? 'Stars' : tableSortField
  const effectiveTableSortDir = effectiveTableSortField !== tableSortField ? 'desc' : tableSortDir

  useEffect(() => {
    setSortKey(k => k + 1)
  }, [sortField, sortDir, minAtk, minDef, filterType, filterAttr, minStars, maxStars, viewMode])

  const base = useMemo(() => {
    const raw = isMonster
      ? cards.filter(c => c.Type < 20)
      : cards.filter(c => FIELD_IDS.has(c.Id))
    return [...raw].sort((a, b) => {
      const av = a[sortField] as number
      const bv = b[sortField] as number
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [isMonster, sortField, sortDir])

  const sorted = useMemo(() => {
    let result = base
    if (minAtk > 0) result = result.filter(c => c.Attack >= minAtk)
    if (isMonster) {
      if (filterType !== null && filterType.length > 0) result = result.filter(c => filterType.includes(c.Type))
      if (filterAttr !== null) result = result.filter(c => c.Attribute === filterAttr)
      if (minDef > 0) result = result.filter(c => c.Defense >= minDef)
      if (minStars > 0) result = result.filter(c => c.Stars >= minStars)
      if (maxStars < 999) result = result.filter(c => c.Stars <= maxStars)
    }
    if (nameQuery) {
      const q = nameQuery.toLowerCase()
      result = result.filter(c => c.Name.toLowerCase().includes(q))
    }
    return result
  }, [base, minAtk, isMonster, filterType, filterAttr, minDef, minStars, maxStars, nameQuery])

  const hasFilter = minAtk > 0 || (filterType !== null && filterType.length > 0) || filterAttr !== null ||
    minDef > 0 || minStars > 0 || maxStars < 999 || !!nameQuery

  function pill(active: boolean, onClick: () => void, children: React.ReactNode) {
    return (
      <button
        onClick={onClick}
        className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border transition-colors"
        style={{
          borderColor: active ? meta.color : '#1a1a28',
          color: active ? meta.color : '#333',
          background: active ? `${meta.color}15` : 'transparent',
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#151520]">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold" style={{ color: meta.color }}>{meta.label}</div>
          <div className="text-[10px] text-[#555] uppercase tracking-widest mt-0.5">
            {sorted.length}{hasFilter ? ` / ${base.length}` : ''} cards
          </div>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {SORT_FIELDS.filter(({ key }) => isMonster || key === 'Stars').map(({ key, label }) => {
            const active = sortField === key
            const disabled = viewMode === 'table'
            return (
              <button
                key={key}
                onClick={() => {
                  if (disabled) return
                  const newDir = key === sortField ? (sortDir === 'desc' ? 'asc' : 'desc') : 'desc'
                  onFilterChange({ sortField: key, sortDir: newDir })
                }}
                disabled={disabled}
                className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border transition-colors"
                style={{
                  borderColor: disabled ? '#111' : active ? meta.color : '#1a1a28',
                  color: disabled ? '#252525' : active ? meta.color : '#444',
                  background: disabled ? 'transparent' : active ? `${meta.color}15` : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {label}{!disabled && active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* Name search */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-[#0f0f1a]">
        <span className="text-[8px] uppercase tracking-widest text-[#333] mr-1 shrink-0 w-14">Search</span>
        <input
          ref={nameInputRef}
          type="text"
          value={nameQuery}
          onChange={e => setNameQuery(e.target.value)}
          placeholder="card name…"
          className="flex-1 bg-transparent border border-[#1a1a28] rounded-sm px-1.5 py-0.5 text-[9px] text-[#888] placeholder:text-[#2a2a3a] outline-none focus:border-[#2a2a3a] transition-colors font-mono"
        />
        {nameQuery && (
          <button
            onClick={() => { setNameQuery(''); nameInputRef.current?.focus() }}
            className="text-[9px] text-[#333] hover:text-[#555] transition-colors px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* ATK filter — monsters only */}
      {isMonster && (
        <FilterRow label="Min ATK">
          {ATK_FILTERS.map(val => pill(minAtk === val, () => onFilterChange({ minAtk: val }),
            val === 0 ? 'All' : `${val}+`))}
        </FilterRow>
      )}

      {/* Monster-only filters */}
      {isMonster && (
        <>
          {/* Min DEF */}
          <FilterRow label="Min DEF">
            {DEF_FILTERS.map(val => pill(minDef === val, () => onFilterChange({ minDef: val }),
              val === 0 ? 'All' : `${val}+`))}
          </FilterRow>

          {/* Type filter (multi-select) */}
          <FilterRow label="Type">
            {pill(filterType === null || filterType.length === 0, () => onFilterChange({ filterType: null }), 'All')}
            {MONSTER_TYPES.map(({ idx, name }) => {
              const img = TYPE_IMAGES[idx]
              const color = TYPE_COLORS[name] || '#555'
              const active = filterType !== null && filterType.includes(idx)
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const cur = filterType ?? []
                    const next = active ? cur.filter(t => t !== idx) : [...cur, idx]
                    onFilterChange({ filterType: next.length === 0 ? null : next })
                  }}
                  className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm border transition-colors"
                  style={{
                    borderColor: active ? color : '#1a1a28',
                    color: active ? color : '#333',
                    background: active ? `${color}15` : 'transparent',
                  }}
                  title={name}
                >
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={name} width={10} height={10}
                      style={{ width: 10, height: 10, objectFit: 'contain' }} />
                  )}
                  <span className="hidden sm:inline">{name}</span>
                </button>
              )
            })}
          </FilterRow>

          {/* Element filter */}
          <FilterRow label="Element">
            {pill(filterAttr === null, () => onFilterChange({ filterAttr: null }), 'All')}
            {ATTR_NAMES.map((name, idx) => {
              const img = ATTR_IMAGES[idx]
              const color = ATTR_COLORS[name] || '#555'
              return (
                <button
                  key={idx}
                  onClick={() => onFilterChange({ filterAttr: filterAttr === idx ? null : idx })}
                  className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm border transition-colors"
                  style={{
                    borderColor: filterAttr === idx ? color : '#1a1a28',
                    color: filterAttr === idx ? color : '#333',
                    background: filterAttr === idx ? `${color}15` : 'transparent',
                  }}
                >
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={name} width={10} height={10}
                      style={{ width: 10, height: 10, objectFit: 'contain' }} />
                  )}
                  <span>{name}</span>
                </button>
              )
            })}
          </FilterRow>

          {/* Star cost min */}
          <FilterRow label="Min Stars">
            {STAR_FILTERS.map(val => pill(minStars === val, () => onFilterChange({ minStars: val }),
              val === 0 ? 'Any' : String(val)))}
          </FilterRow>

          {/* Star cost max */}
          <FilterRow label="Max Stars">
            {[...STAR_FILTERS.slice(1), 999].map(val => pill(maxStars === val,
              () => onFilterChange({ maxStars: val }),
              val === 999 ? 'Any' : String(val)))}
          </FilterRow>
        </>
      )}

      <CardListView
        cards={sorted}
        sortKey={sortKey}
        accentColor={meta.color}
        onSelect={onSelect}
        viewMode={viewMode}
        onViewModeChange={mode => onFilterChange({ viewMode: mode })}
        tableSortField={effectiveTableSortField}
        tableSortDir={effectiveTableSortDir}
        onTableSortChange={(field, dir) => onFilterChange({ tableSortField: field, tableSortDir: dir })}
        getCardHref={getCardHref}
        showMonsterStats={isMonster}
      />
    </div>
  )
})
