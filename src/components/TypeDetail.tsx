'use client'

import { memo, useMemo } from 'react'
import { cards } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_IMAGES, TYPE_COLORS, atkColor } from '@/lib/constants'
import { CardThumb } from './CardThumb'

interface Props {
  typeIdx: number
  onSelect: (cardId: number) => void
}

export const TypeDetail = memo(function TypeDetail({ typeIdx, onSelect }: Props) {
  const name = TYPE_NAMES[typeIdx] ?? ''
  const img = TYPE_IMAGES[typeIdx]
  const color = TYPE_COLORS[name] || '#666'

  const sorted = useMemo(() =>
    cards
      .filter(c => c.Type === typeIdx)
      .sort((a, b) => b.Attack - a.Attack),
    [typeIdx]
  )

  if (sorted.length === 0) return null

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#151520]">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} width={32} height={32}
            style={{ width: 32, height: 32, objectFit: 'contain' }} />
        )}
        <div>
          <div className="text-base font-semibold" style={{ color }}>{name}</div>
          <div className="text-[10px] text-[#555] uppercase tracking-widest mt-0.5">
            {sorted.length} cards
          </div>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="px-4 mt-4" style={{ columns: '90px', columnGap: 4 }}>
        {sorted.map(card => (
          <div
            key={card.Id}
            className="break-inside-avoid mb-1 bg-[#0d0d18] border border-[#1a1a28] rounded-sm hover:border-[#252535] transition-colors cursor-pointer"
            onClick={() => onSelect(card.Id)}
          >
            <div className="flex flex-col items-center px-0.5 pt-1 pb-0.5">
              <CardThumb card={card} size={52} />
              <div className="text-[7px] text-[#777] text-center leading-none w-full truncate mt-0.5 px-0.5">
                {card.Name}
              </div>
              <div className="text-[7px] text-center leading-none mt-0.5">
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
