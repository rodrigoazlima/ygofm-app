'use client'

import { useState, useMemo } from 'react'
import type { Card } from '@/lib/types'
import { TYPE_NAMES, TYPE_IMAGES, ATTR_NAMES, ATTR_IMAGES, atkColor } from '@/lib/constants'
import { CardThumb } from './CardThumb'

export type ViewMode = 'grid' | 'table'

type TableCol = 'Name' | 'Attack' | 'Defense' | 'Level' | 'Stars' | 'Type' | 'Attribute'

interface Props {
  cards: Card[]
  sortKey: number
  accentColor: string
  onSelect: (cardId: number) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
}

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

const COLS: { key: TableCol; label: string; align: 'left' | 'right' | 'center' }[] = [
  { key: 'Name',      label: 'Name',  align: 'left'   },
  { key: 'Type',      label: 'Type',  align: 'center' },
  { key: 'Attribute', label: 'Elem',  align: 'center' },
  { key: 'Attack',    label: 'ATK',   align: 'right'  },
  { key: 'Defense',   label: 'DEF',   align: 'right'  },
  { key: 'Level',     label: 'LVL',   align: 'right'  },
  { key: 'Stars',     label: 'Stars', align: 'right'  },
]

const COL_WIDTHS = '28px 1fr 22px 22px 48px 40px 36px 42px'

export function CardListView({ cards: items, sortKey, accentColor, onSelect, viewMode: viewModeProp, onViewModeChange }: Props) {
  const [tableCol, setTableCol] = useState<TableCol>('Attack')
  const [tableDir, setTableDir] = useState<'asc' | 'desc'>('desc')
  const viewMode = viewModeProp ?? 'grid'

  function switchView(mode: ViewMode) {
    onViewModeChange?.(mode)
  }

  function handleColClick(col: TableCol) {
    if (col === tableCol) {
      setTableDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setTableCol(col)
      setTableDir(col === 'Name' ? 'asc' : 'desc')
    }
  }

  const tableItems = useMemo(() => {
    if (viewMode !== 'table') return items
    return [...items].sort((a, b) => {
      if (tableCol === 'Name') {
        return tableDir === 'asc'
          ? a.Name.localeCompare(b.Name)
          : b.Name.localeCompare(a.Name)
      }
      const av = a[tableCol] as number
      const bv = b[tableCol] as number
      return tableDir === 'desc' ? bv - av : av - bv
    })
  }, [items, viewMode, tableCol, tableDir])

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end px-4 pt-2 pb-1 gap-1">
        <button
          onClick={() => switchView('grid')}
          className="p-1 rounded-sm border transition-colors"
          style={{
            borderColor: viewMode === 'grid' ? accentColor : '#1a1a28',
            color: viewMode === 'grid' ? accentColor : '#333',
            background: viewMode === 'grid' ? `${accentColor}15` : 'transparent',
          }}
          title="Grid view"
        >
          <GridIcon />
        </button>
        <button
          onClick={() => switchView('table')}
          className="p-1 rounded-sm border transition-colors"
          style={{
            borderColor: viewMode === 'table' ? accentColor : '#1a1a28',
            color: viewMode === 'table' ? accentColor : '#333',
            background: viewMode === 'table' ? `${accentColor}15` : 'transparent',
          }}
          title="Table view"
        >
          <ListIcon />
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div
          key={sortKey}
          className="sort-enter px-4 mt-2"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: 4 }}
        >
          {items.map(card => (
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
      ) : (
        <div className="sort-enter px-4 mt-2">
          {/* Sortable column headers */}
          <div
            className="grid border-b border-[#1a1a28] pb-1 mb-0.5"
            style={{ gridTemplateColumns: COL_WIDTHS }}
          >
            <span />
            {COLS.map(({ key, label, align }) => {
              const active = tableCol === key
              const dir = active ? tableDir : null
              return (
                <button
                  key={key}
                  onClick={() => handleColClick(key)}
                  className="text-[8px] uppercase tracking-widest transition-colors select-none"
                  style={{
                    textAlign: align,
                    color: active ? accentColor : '#333',
                    cursor: 'pointer',
                    paddingRight: align === 'right' ? 4 : 0,
                  }}
                >
                  {label}{dir ? (dir === 'desc' ? ' ↓' : ' ↑') : ''}
                </button>
              )
            })}
          </div>

          {tableItems.map(card => {
            const typeName = TYPE_NAMES[card.Type] || ''
            const typeImg = TYPE_IMAGES[card.Type]
            const attrName = ATTR_NAMES[card.Attribute] || ''
            const attrImg = ATTR_IMAGES[card.Attribute]
            return (
              <div
                key={card.Id}
                className="grid items-center py-0.5 border-b border-[#0f0f18] hover:bg-[#0d0d18] transition-colors cursor-pointer rounded-sm"
                style={{ gridTemplateColumns: COL_WIDTHS }}
                onClick={() => onSelect(card.Id)}
              >
                <CardThumb card={card} size={24} />
                <span className="text-[10px] text-[#aaa] truncate pr-1">{card.Name}</span>
                <span className="flex justify-center">
                  {typeImg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={typeImg} alt={typeName} title={typeName} width={12} height={12}
                      style={{ width: 12, height: 12, objectFit: 'contain' }} />
                  )}
                </span>
                <span className="flex justify-center">
                  {attrImg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={attrImg} alt={attrName} title={attrName} width={12} height={12}
                      style={{ width: 12, height: 12, objectFit: 'contain' }} />
                  )}
                </span>
                <span className="text-[10px] font-mono text-right pr-1" style={{ color: atkColor(card.Attack) }}>
                  {card.Attack}
                </span>
                <span className="text-[10px] font-mono text-[#555] text-right pr-1">{card.Defense}</span>
                <span className="text-[10px] font-mono text-[#444] text-right pr-1">{card.Level}</span>
                <span className="text-[10px] font-mono text-[#444] text-right pr-1">{card.Stars}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
