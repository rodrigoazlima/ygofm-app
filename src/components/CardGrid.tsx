'use client'

import { memo } from 'react'
import { cards } from '@/lib/dataLoader'
import { CardThumb } from './CardThumb'

interface Props {
  brightIds: Set<number>
  isInitial: boolean
  onSelect: (id: number) => void
}

export const CardGrid = memo(function CardGrid({ brightIds, isInitial, onSelect }: Props) {
  return (
    <div className="p-2">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(66px, 1fr))' }}
      >
        {cards.map(card => (
          <CardThumb
            key={card.Id}
            card={card}
            size={64}
            faded={isInitial || !brightIds.has(card.Id)}
            onClick={() => onSelect(card.Id)}
          />
        ))}
      </div>
    </div>
  )
})
