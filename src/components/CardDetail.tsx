'use client'

import { memo, useState } from 'react'
import type { Card } from '@/lib/types'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, ATTR_NAMES, STAR_NAMES, TYPE_COLORS, TYPE_IMAGES, ATTR_IMAGES, atkColor } from '@/lib/constants'
import { fullSources } from '@/lib/imageHelpers'
import { useCardRelations } from '@/hooks/useCardRelations'
import { FusesIntoSection } from './sections/FusesIntoSection'
import { CombinesWithSection } from './sections/CombinesWithSection'
import { CompatibleSpellsSection } from './sections/CompatibleSpellsSection'
import { MadeFromSection } from './sections/MadeFromSection'

interface Props {
  cardId: number
  onSelect: (id: number) => void
}

function CardImage({ card }: { card: Card }) {
  const sources = fullSources(card)
  const [srcIdx, setSrcIdx] = useState(0)
  const exhausted = srcIdx >= sources.length

  return exhausted ? (
    <div className="w-44 h-56 flex items-center justify-center bg-[#1a1a2e] text-[#444] text-xs rounded">
      {card.Name.slice(0, 8)}
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[srcIdx]}
      alt={card.Name}
      onError={() => setSrcIdx(i => i + 1)}
      className="w-44 h-56 object-cover rounded shadow-lg"
    />
  )
}

export const CardDetail = memo(function CardDetail({ cardId, onSelect }: Props) {
  const card = byId[cardId]
  const relations = useCardRelations(cardId)

  if (!card || !relations) return null

  const typeName = TYPE_NAMES[card.Type] || ''
  const typeColor = TYPE_COLORS[typeName] || '#555'
  const attrName = ATTR_NAMES[card.Attribute] ?? ''
  const isMonster = card.Type < 20
  const isEquip = card.Type === 23

  return (
    <div className="border-b border-[#1a1a28] bg-[#09090e]">
      {/* Card header */}
      <div className="flex gap-4 p-4 items-start">
        <CardImage card={card} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {TYPE_IMAGES[card.Type] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={TYPE_IMAGES[card.Type]} alt={typeName} title={typeName} width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
            )}
            <h2 className="text-lg font-bold text-[#f0e8c0] leading-tight">{card.Name}</h2>
            {card.Attribute != null && ATTR_IMAGES[card.Attribute] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ATTR_IMAGES[card.Attribute]} alt={attrName} title={attrName} width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-sm border"
              style={{ borderColor: typeColor, color: typeColor }}
            >
              {typeName}
            </span>
            {attrName && (
              <span className="text-[10px] text-[#555]">{attrName}</span>
            )}
          </div>

          {isMonster && (
            <>
              <div className="text-sm mb-1">
                <span style={{ color: atkColor(card.Attack) }} className="font-mono">
                  ATK {card.Attack}
                </span>
                <span className="text-[#444] mx-1">/</span>
                <span className="text-[#666] font-mono">DEF {card.Defense}</span>
              </div>
              {card.Level > 0 && (
                <div className="text-[10px] text-[#666] mb-1">
                  {'★'.repeat(Math.min(card.Level, 12))}
                  <span className="ml-2">
                    {STAR_NAMES[card.GuardianStarA]} / {STAR_NAMES[card.GuardianStarB]}
                  </span>
                </div>
              )}
            </>
          )}

          <p className="text-[11px] text-[#666] leading-relaxed whitespace-pre-line mt-2">
            {card.Description.replace(/\r\n/g, '\n')}
          </p>
        </div>
      </div>

      {/* Relationships */}
      <div className="pb-4">
        <FusesIntoSection fusesInto={relations.fusesInto} onSelect={onSelect} />
        <CombinesWithSection selfId={cardId} combinesWith={relations.combinesWith} onSelect={onSelect} />
        <CompatibleSpellsSection
          compatibleSpells={relations.compatibleSpells}
          isEquip={isEquip}
          onSelect={onSelect}
        />
        <MadeFromSection madeFrom={relations.madeFrom} onSelect={onSelect} />
      </div>
    </div>
  )
})
