'use client'

import { memo, useState } from 'react'
import type { Card } from '@/lib/types'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, ATTR_NAMES, STAR_NAMES, TYPE_COLORS, TYPE_IMAGES, ATTR_IMAGES, ATTR_COLORS, FIELD_BOOSTS, atkColor } from '@/lib/constants'
import { fullSources } from '@/lib/imageHelpers'
import { useCardRelations } from '@/hooks/useCardRelations'
import { FusesIntoSection } from './sections/FusesIntoSection'
import { CombinesWithSection } from './sections/CombinesWithSection'
import { CompatibleSpellsSection } from './sections/CompatibleSpellsSection'
import { MadeFromSection } from './sections/MadeFromSection'
import { DropsSection } from './sections/DropsSection'

interface Props {
  cardId: number
  onSelect: (id: number) => void
  onSelectNpc?: (npcId: number) => void
  onSelectType?: (typeIdx: number) => void
  onSelectAttr?: (attrIdx: number) => void
  query?: string
}

function CardImage({ card }: { card: Card }) {
  const sources = fullSources(card)
  const [srcIdx, setSrcIdx] = useState(0)
  const exhausted = srcIdx >= sources.length

  return exhausted ? (
    <div className="w-32 h-40 sm:w-44 sm:h-56 flex items-center justify-center bg-[#1a1a2e] text-[#444] text-xs rounded">
      {card.Name.slice(0, 8)}
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[srcIdx]}
      alt={card.Name}
      onError={() => setSrcIdx(i => i + 1)}
      className="w-32 h-40 sm:w-44 sm:h-56 object-cover rounded shadow-lg"
    />
  )
}

export const CardDetail = memo(function CardDetail({ cardId, onSelect, onSelectNpc, onSelectType, onSelectAttr, query }: Props) {
  const card = byId[cardId]
  const relations = useCardRelations(cardId)

  if (!card || !relations) return null

  const typeName = TYPE_NAMES[card.Type] || ''
  const typeColor = TYPE_COLORS[typeName] || '#555'
  const attrName = ATTR_NAMES[card.Attribute] ?? ''
  const isMonster = card.Type < 20
  const isEquip = card.Type === 23

  // FMR effect summary for equip and field cards
  const effectLine = (() => {
    if (isEquip && card.Equip?.length) {
      const typeCounts: Record<number, number> = {}
      for (const id of card.Equip) {
        const t = byId[id]?.Type
        if (t != null && t < 20) typeCounts[t] = (typeCounts[t] || 0) + 1
      }
      const types = Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([t]) => TYPE_NAMES[Number(t)])
        .filter(Boolean)
      const boost = card.Stars === 50000 ? '+1000 ATK/DEF (any type)'
        : card.Stars === 999999 ? 'Special effect'
        : `+500 ATK/DEF → ${types.join(', ')}`
      return boost
    }
    const fieldTypes = FIELD_BOOSTS[card.Id]
    if (fieldTypes) {
      const names = fieldTypes.map(i => TYPE_NAMES[i]).filter(Boolean)
      return `+200 ATK/DEF → ${names.join(', ')}`
    }
    return null
  })()

  const q = query?.toLowerCase() ?? ''
  const noSectionMatch = q !== '' && (() => {
    const hasMatch = (name: string) => name.toLowerCase().includes(q)
    for (const [resultId, partners] of relations.fusesInto) {
      if (hasMatch(byId[resultId]?.Name ?? '')) return false
      if (partners.some(pid => hasMatch(byId[pid]?.Name ?? ''))) return false
    }
    for (const [pid, rid] of relations.combinesWith) {
      if (hasMatch(byId[pid]?.Name ?? '') || hasMatch(byId[rid]?.Name ?? '')) return false
    }
    if (relations.compatibleSpells.some(id => hasMatch(byId[id]?.Name ?? ''))) return false
    if (relations.madeFrom.some(({ card1, card2 }) =>
      hasMatch(byId[card1]?.Name ?? '') || hasMatch(byId[card2]?.Name ?? ''))) return false
    return true
  })()

  return (
    <div className="border-b border-[#1a1a28] bg-[#09090e]">
      {/* Card header */}
      <div className="flex gap-4 p-4 items-start">
        <CardImage card={card} />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[#f0e8c0] leading-tight mb-2">{card.Name}</h2>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              onClick={() => onSelectType?.(card.Type)}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm border transition-opacity"
              style={{
                borderColor: typeColor,
                color: typeColor,
                cursor: onSelectType ? 'pointer' : undefined,
              }}
              title={onSelectType ? `View all ${typeName}` : undefined}
            >
              {TYPE_IMAGES[card.Type] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={TYPE_IMAGES[card.Type]} alt={typeName} width={11} height={11}
                  style={{ width: 11, height: 11, objectFit: 'contain' }} />
              )}
              {typeName}
            </span>
            {attrName && (
              <span
                onClick={() => onSelectAttr?.(card.Attribute)}
                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm border transition-opacity"
                style={{
                  borderColor: ATTR_COLORS[attrName] ?? '#555',
                  color: ATTR_COLORS[attrName] ?? '#555',
                  cursor: onSelectAttr ? 'pointer' : undefined,
                }}
                title={onSelectAttr ? `View all ${attrName}` : undefined}
              >
                {ATTR_IMAGES[card.Attribute] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ATTR_IMAGES[card.Attribute]} alt={attrName} width={11} height={11}
                    style={{ width: 11, height: 11, objectFit: 'contain' }} />
                )}
                {attrName}
              </span>
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

          <p className="text-[9px] text-[#666] leading-relaxed mt-2">
            {card.Description.replace(/\r\n/g, '\n')}
          </p>
          {effectLine && (
            <p className="text-[9px] text-[#a0c4ff] mt-1 font-mono">
              {effectLine}
            </p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
            <span className="text-[9px] font-mono text-[#555]">ID <span className="text-[#888]">{card.Id}</span></span>
            {card.Stars !== undefined && <span className="text-[9px] font-mono text-[#555]">Stars <span className="text-[#888]">{card.Stars}</span></span>}
            {card.CardCode && card.CardCode !== '00000000' && (
              <span className="text-[9px] font-mono text-[#555]">Code <span className="text-[#888]">{card.CardCode}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* Relationships */}
      <div className="pb-4">
        {noSectionMatch ? (
          <div className="px-4 py-6 text-center">
            <span className="text-[11px] text-[#333] bg-[#0e0e14] border border-[#1a1a24] rounded px-3 py-2">
              No fusions, materials or equips matching &ldquo;{query}&rdquo;
            </span>
          </div>
        ) : (
          <>
            <FusesIntoSection fusesInto={relations.fusesInto} onSelect={onSelect} query={query} />
            <CombinesWithSection selfId={cardId} combinesWith={relations.combinesWith} onSelect={onSelect} query={query} />
            <CompatibleSpellsSection
              compatibleSpells={relations.compatibleSpells}
              isEquip={isEquip}
              onSelect={onSelect}
              query={query}
            />
            <MadeFromSection selfId={cardId} madeFrom={relations.madeFrom} onSelect={onSelect} query={query} />
            <DropsSection cardId={cardId} onSelectNpc={onSelectNpc} />
          </>
        )}
      </div>
    </div>
  )
})
