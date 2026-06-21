'use client'

import { memo, useState } from 'react'
import { npcById, MODE_LABELS, type DropMode } from '@/lib/dropsLoader'
import { byId } from '@/lib/dataLoader'
import { NpcImage } from './NpcImage'
import { CardThumb } from './CardThumb'
import { atkColor } from '@/lib/constants'

const MODES: DropMode[] = ['sapow', 'bcd', 'astec']

const MODE_COLORS: Record<DropMode, string> = {
  sapow: '#4a9eff',
  bcd: '#ff9944',
  astec: '#66dd88',
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

interface Props {
  npcId: number
  onSelect: (cardId: number) => void
}

export const NpcDetail = memo(function NpcDetail({ npcId, onSelect }: Props) {
  const npc = npcById[npcId]
  const [viewModes, setViewModes] = useState<Record<DropMode, 'grid' | 'table'>>({
    sapow: 'grid', bcd: 'grid', astec: 'grid',
  })

  if (!npc) return null

  function setMode(mode: DropMode, m: 'grid' | 'table') {
    setViewModes(prev => ({ ...prev, [mode]: m }))
  }

  return (
    <div className="pb-8">
      {/* NPC header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#151520]">
        <NpcImage slug={npc.slug} name={npc.name} size={56} />
        <div>
          <div className="text-base font-semibold text-[#e8e8f0]">{npc.name}</div>
          <div className="text-[10px] text-[#555] uppercase tracking-widest mt-0.5">NPC Opponent</div>
        </div>
      </div>

      {/* Drops per mode (rank) */}
      {MODES.map(mode => {
        const raw = npc.drops[mode]
        if (!raw || raw.length === 0) return null

        const deduped = new Map<number, number>()
        for (const d of raw) {
          const prev = deduped.get(d.card_id) ?? 0
          if (d.drop_pct > prev) deduped.set(d.card_id, d.drop_pct)
        }

        const sorted = [...deduped.entries()]
          .map(([card_id, drop_pct]) => ({ card_id, drop_pct, card: byId[card_id] }))
          .filter(e => e.card)
          .sort((a, b) => (b.card!.Attack ?? 0) - (a.card!.Attack ?? 0))

        if (sorted.length === 0) return null

        const color = MODE_COLORS[mode]
        const isTable = viewModes[mode] === 'table'

        return (
          <div key={mode} className="mt-4">
            <div className="flex items-center justify-between px-4 mb-2">
              <h3 className="text-[10px] uppercase tracking-widest flex items-center gap-2" style={{ color }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                {MODE_LABELS[mode]}
                <span className="text-[#333]">{sorted.length}</span>
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setMode(mode, 'grid')}
                  className="p-1 rounded-sm border transition-colors"
                  style={{
                    borderColor: !isTable ? color : '#1a1a28',
                    color: !isTable ? color : '#333',
                    background: !isTable ? `${color}15` : 'transparent',
                  }}
                  title="Grid view"
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setMode(mode, 'table')}
                  className="p-1 rounded-sm border transition-colors"
                  style={{
                    borderColor: isTable ? color : '#1a1a28',
                    color: isTable ? color : '#333',
                    background: isTable ? `${color}15` : 'transparent',
                  }}
                  title="Table view"
                >
                  <ListIcon />
                </button>
              </div>
            </div>

            {isTable ? (
              <div className="px-4">
                <div
                  className="grid border-b border-[#1a1a28] pb-1 mb-0.5"
                  style={{ gridTemplateColumns: '28px 1fr 44px 36px 44px' }}
                >
                  <span />
                  <span className="text-[8px] uppercase tracking-widest text-[#333]">Name</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#333] text-right pr-1">ATK</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#333] text-right pr-1">DEF</span>
                  <span className="text-[8px] uppercase tracking-widest text-right pr-1" style={{ color: `${color}99` }}>Drop%</span>
                </div>
                {sorted.map(({ card_id, drop_pct, card }) => (
                  <div
                    key={card_id}
                    className="grid items-center py-0.5 border-b border-[#0f0f18] hover:bg-[#0d0d18] transition-colors cursor-pointer rounded-sm"
                    style={{ gridTemplateColumns: '28px 1fr 44px 36px 44px' }}
                    onClick={() => onSelect(card_id)}
                  >
                    <CardThumb card={card!} size={24} />
                    <span className="text-[10px] text-[#aaa] truncate pr-1">{card!.Name}</span>
                    <span className="text-[10px] font-mono text-right pr-1" style={{ color: atkColor(card!.Attack) }}>{card!.Attack}</span>
                    <span className="text-[10px] font-mono text-[#555] text-right pr-1">{card!.Defense}</span>
                    <span className="text-[10px] font-mono text-right pr-1" style={{ color }}>
                      {drop_pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4" style={{ columns: '110px', columnGap: 6 }}>
                {sorted.map(({ card_id, drop_pct, card }) => (
                  <div
                    key={card_id}
                    className="break-inside-avoid mb-1.5 bg-[#0d0d18] border border-[#1a1a28] rounded-sm hover:border-[#252535] transition-colors cursor-pointer"
                    onClick={() => onSelect(card_id)}
                  >
                    <div className="flex flex-col items-center px-1 pt-1.5 pb-1">
                      <CardThumb card={card!} size={68} />
                      <div className="text-[9px] text-[#777] text-center leading-tight w-full truncate mt-1 px-0.5">
                        {card!.Name}
                      </div>
                      <div className="text-[9px] text-center leading-tight mt-0.5">
                        <span style={{ color: atkColor(card!.Attack) }}>{card!.Attack}</span>
                        <span className="text-[#2a2a3a]">/</span>
                        <span className="text-[#444]">{card!.Defense}</span>
                      </div>
                      <span className="text-[9px] font-mono leading-tight mt-0.5" style={{ color }}>
                        {drop_pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
})
