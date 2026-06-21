'use client'

import { useState } from 'react'
import { CardThumb } from '../CardThumb'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES } from '@/lib/constants'

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
  compatibleSpells: number[]
  isEquip: boolean
  onSelect: (id: number) => void
  query?: string
}

export function CompatibleSpellsSection({ compatibleSpells, isEquip, onSelect, query }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  if (compatibleSpells.length === 0) return null

  const q = query?.toLowerCase() ?? ''
  const visible = q
    ? compatibleSpells.filter(id => byId[id]?.Name.toLowerCase().includes(q))
    : compatibleSpells

  if (visible.length === 0) return null

  const label = isEquip ? '✦ Equips Onto' : '✦ Compatible Spells'

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="text-[10px] uppercase tracking-widest text-[#555]">
          {label}
          <span className="ml-2 text-[#333]">{visible.length}</span>
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
        <div className="flex flex-wrap gap-2 px-4">
          {visible.map(id => {
            const card = byId[id]
            if (!card) return null
            const typeName = TYPE_NAMES[card.Type] || ''
            return (
              <div
                key={id}
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={() => onSelect(id)}
              >
                <CardThumb card={card} size={52} />
                <span className="text-[10px] text-[#555] group-hover:text-[#888] text-center w-14 truncate leading-tight">
                  {typeName === 'Equip' || typeName === 'Magic' ? card.Name : typeName}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-4">
          <div
            className="grid border-b border-[#1a1a28] pb-1 mb-0.5"
            style={{ gridTemplateColumns: '28px 1fr 50px' }}
          >
            <span />
            <span className="text-[8px] uppercase tracking-widest text-[#333]">Name</span>
            <span className="text-[8px] uppercase tracking-widest text-[#333]">Type</span>
          </div>
          {visible.map(id => {
            const card = byId[id]
            if (!card) return null
            const typeName = TYPE_NAMES[card.Type] || ''
            return (
              <div
                key={id}
                className="grid items-center py-0.5 border-b border-[#0f0f18] hover:bg-[#0d0d18] transition-colors cursor-pointer rounded-sm"
                style={{ gridTemplateColumns: '28px 1fr 50px' }}
                onClick={() => onSelect(id)}
              >
                <CardThumb card={card} size={24} />
                <span className="text-[10px] text-[#aaa] truncate pr-1">{card.Name}</span>
                <span className="text-[10px] text-[#555] truncate">{typeName}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
