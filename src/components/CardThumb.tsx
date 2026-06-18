'use client'

import { memo, useState, useCallback } from 'react'
import type { Card } from '@/lib/types'
import { thumbSources } from '@/lib/imageHelpers'
import { useTooltip } from './TooltipProvider'

interface Props {
  card: Card
  size?: number
  faded?: boolean
  onClick?: () => void
  className?: string
}

export const CardThumb = memo(function CardThumb({ card, size = 42, faded = false, onClick, className = '' }: Props) {
  const sources = thumbSources(card)
  const [srcIdx, setSrcIdx] = useState(0)
  const tip = useTooltip()

  const handleError = () => {
    if (srcIdx + 1 < sources.length) setSrcIdx(i => i + 1)
    else setSrcIdx(sources.length) // exhausted
  }

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    tip?.show({ kind: 'card', card }, { x: e.clientX, y: e.clientY })
  }, [tip, card])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    tip?.move({ x: e.clientX, y: e.clientY })
  }, [tip])

  const handleMouseLeave = useCallback(() => {
    tip?.hide()
  }, [tip])

  const exhausted = srcIdx >= sources.length
  const opacity = faded ? 'opacity-20 hover:opacity-60' : 'opacity-100'
  const cursor = onClick ? 'cursor-pointer' : ''

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: size, height: size, flexShrink: 0 }}
      className={`relative inline-flex items-center justify-center transition-opacity duration-150 rounded-sm overflow-hidden ${opacity} ${cursor} ${className}`}
    >
      {!exhausted && sources[srcIdx] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sources[srcIdx]}
          alt={card.Name}
          onError={handleError}
          style={{ width: size, height: size, objectFit: 'cover' }}
          loading="lazy"
        />
      ) : (
        <div
          style={{ width: size, height: size, fontSize: size < 30 ? 7 : 9 }}
          className="flex items-center justify-center bg-[#1a1a2e] text-[#666] text-center leading-tight p-px"
        >
          {card.Name.slice(0, 5)}
        </div>
      )}
    </div>
  )
})
