'use client'

import { memo } from 'react'
import { TYPE_NAMES, TYPE_IMAGES, TYPE_COLORS, ATTR_NAMES, ATTR_IMAGES, ATTR_COLORS } from '@/lib/constants'
import { cards } from '@/lib/dataLoader'
import type { CategoryId } from './CategoryDetail'

const MONSTER_COUNT = cards.filter(c => c.Type < 20).length
const FIELD_COUNT = cards.filter(c => [330, 331, 332, 333, 334, 335].includes(c.Id)).length
const TYPE_COUNTS = TYPE_NAMES.map((_, i) => cards.filter(c => c.Type === i).length)
const ATTR_COUNTS = ATTR_NAMES.map((_, i) => cards.filter(c => c.Attribute === i).length)

// Non-monster card types (indices 20-23)
const SPELL_TYPES = [20, 21, 22, 23]

interface Props {
  onSelectType: (typeIdx: number) => void
  onSelectAttr: (attrIdx: number) => void
  onSelectCategory: (cat: CategoryId) => void
}

export const CategoryBrowser = memo(function CategoryBrowser({
  onSelectType, onSelectAttr, onSelectCategory,
}: Props) {
  return (
    <div className="px-4 py-5 space-y-5">
      {/* Broad categories */}
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#333] mb-2">Card Category</div>
        <div className="flex flex-wrap gap-2">
          {/* Monster (all) */}
          <button
            onClick={() => onSelectCategory('monster')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#1a1a28] hover:border-[#a8833a] transition-colors bg-[#0d0d18]"
          >
            <span className="text-xs font-medium" style={{ color: '#a83' }}>Monster</span>
            <span className="text-[9px] text-[#333]">{MONSTER_COUNT}</span>
          </button>

          {/* Spell / Magic, Trap, Equip, Ritual */}
          {SPELL_TYPES.map(typeIdx => {
            const name = TYPE_NAMES[typeIdx]
            const img = TYPE_IMAGES[typeIdx]
            const color = TYPE_COLORS[name] || '#666'
            const label = typeIdx === 20 ? 'Spell / Magic' : name
            return (
              <button
                key={typeIdx}
                onClick={() => onSelectType(typeIdx)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#1a1a28] hover:border-[#2a2a40] transition-colors bg-[#0d0d18]"
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={name} width={14} height={14}
                    style={{ width: 14, height: 14, objectFit: 'contain', flexShrink: 0 }} />
                )}
                <span className="text-xs font-medium" style={{ color }}>{label}</span>
                <span className="text-[9px] text-[#333]">{TYPE_COUNTS[typeIdx]}</span>
              </button>
            )
          })}

          {/* Field Spell */}
          <button
            onClick={() => onSelectCategory('field')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#1a1a28] hover:border-[#4a6a4a] transition-colors bg-[#0d0d18]"
          >
            <span className="text-xs font-medium" style={{ color: '#4a6' }}>Field Spell</span>
            <span className="text-[9px] text-[#333]">{FIELD_COUNT}</span>
          </button>
        </div>
      </div>

      {/* Monster sub-types */}
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#333] mb-2">Monster Type</div>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_NAMES.slice(0, 20).map((name, typeIdx) => {
            const img = TYPE_IMAGES[typeIdx]
            const color = TYPE_COLORS[name] || '#666'
            return (
              <button
                key={typeIdx}
                onClick={() => onSelectType(typeIdx)}
                className="flex items-center gap-1 px-2 py-1 rounded border border-[#1a1a28] hover:border-[#2a2a40] transition-colors bg-[#0d0d18]"
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={name} width={12} height={12}
                    style={{ width: 12, height: 12, objectFit: 'contain', flexShrink: 0 }} />
                )}
                <span className="text-[10px]" style={{ color }}>{name}</span>
                <span className="text-[8px] text-[#2a2a3a]">{TYPE_COUNTS[typeIdx]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Attributes / Elements */}
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#333] mb-2">Element</div>
        <div className="flex flex-wrap gap-1.5">
          {ATTR_NAMES.map((name, attrIdx) => {
            const img = ATTR_IMAGES[attrIdx]
            const color = ATTR_COLORS[name] || '#666'
            return (
              <button
                key={attrIdx}
                onClick={() => onSelectAttr(attrIdx)}
                className="flex items-center gap-1 px-2 py-1 rounded border border-[#1a1a28] hover:border-[#2a2a40] transition-colors bg-[#0d0d18]"
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={name} width={12} height={12}
                    style={{ width: 12, height: 12, objectFit: 'contain', flexShrink: 0 }} />
                )}
                <span className="text-[10px]" style={{ color }}>{name}</span>
                <span className="text-[8px] text-[#2a2a3a]">{ATTR_COUNTS[attrIdx]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})
