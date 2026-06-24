'use client'

import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect,
} from 'react'
import { createPortal } from 'react-dom'
import type { Card } from '@/lib/types'
import { fullSources } from '@/lib/imageHelpers'
import {
  TYPE_NAMES, ATTR_NAMES, TYPE_COLORS, ATTR_COLORS,
  TYPE_IMAGES, ATTR_IMAGES, STAR_NAMES, atkColor,
  GUARDIAN_STAR_SYMBOLS, GUARDIAN_STAR_STRONG, GUARDIAN_STAR_WEAK, GUARDIAN_STAR_COLORS,
} from '@/lib/constants'

type TipData =
  | { kind: 'card'; card: Card }
  | { kind: 'npc'; slug: string; name: string }

interface Pos { x: number; y: number }

interface CtxValue {
  show: (data: TipData, pos: Pos) => void
  move: (pos: Pos) => void
  hide: () => void
}

const TooltipCtx = createContext<CtxValue | null>(null)

export function useTooltip() {
  return useContext(TooltipCtx)
}

const DELAY_MS = 400
const CARD_IMG_W = 156
const CARD_IMG_H = 228 // ~2:3 YGO card ratio
const DETAILS_W = 168
const TIP_TOTAL_W = CARD_IMG_W + DETAILS_W
const OFFSET = 16

function CardTip({ card, pos }: { card: Card; pos: Pos }) {
  const [srcIdx, setSrcIdx] = useState(0)
  const sources = fullSources(card)
  const typeName = TYPE_NAMES[card.Type] ?? 'Unknown'
  const attrName = ATTR_NAMES[card.Attribute] ?? ''
  const isMonster = card.Type < 20
  const typeColor = TYPE_COLORS[typeName] ?? '#888'
  const attrColor = ATTR_COLORS[attrName] ?? '#888'

  const vw = window.innerWidth
  const vh = window.innerHeight
  const fitsRight = pos.x + TIP_TOTAL_W + OFFSET < vw
  const left = fitsRight ? pos.x + OFFSET : pos.x - TIP_TOTAL_W - OFFSET
  const top = Math.max(8, Math.min(pos.y - CARD_IMG_H / 2, vh - CARD_IMG_H - 8))

  return (
    <div
      style={{ position: 'fixed', left, top, width: TIP_TOTAL_W, zIndex: 9999, pointerEvents: 'none' }}
      className="flex bg-[#0a0a14] border border-[#1e1e2e] rounded shadow-2xl shadow-black/80 overflow-hidden"
    >
      {/* Full card image */}
      <div style={{ width: CARD_IMG_W, flexShrink: 0, height: CARD_IMG_H }}>
        {sources[srcIdx] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sources[srcIdx]}
            alt={card.Name}
            onError={() => setSrcIdx(i => i + 1)}
            className="block w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#111120] text-[#333] text-[10px]">
            {card.Name.slice(0, 8)}
          </div>
        )}
      </div>

      {/* Details panel */}
      <div className="px-2 pt-2 pb-2 flex flex-col overflow-hidden" style={{ width: DETAILS_W, height: CARD_IMG_H }}>
        <div className="text-[11px] font-semibold leading-tight mb-1.5 truncate" style={{ color: typeColor }}>
          {card.Name}
        </div>

        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TYPE_IMAGES[card.Type]} alt={typeName} width={11} height={11} className="opacity-80" />
            <span className="text-[9px] leading-none" style={{ color: typeColor }}>{typeName}</span>
          </div>
          {isMonster && (
            <div className="flex items-center gap-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ATTR_IMAGES[card.Attribute]} alt={attrName} width={11} height={11} className="opacity-80" />
              <span className="text-[9px] leading-none" style={{ color: attrColor }}>{attrName}</span>
            </div>
          )}
        </div>

        {isMonster && (
          <>
            {card.Level > 0 && (
              <div className="text-[9px] text-[#554422] mb-1 tracking-tight">
                {'★'.repeat(Math.min(card.Level, 12))}
              </div>
            )}
            <div className="text-[10px] mb-1">
              <span style={{ color: atkColor(card.Attack) }}>{card.Attack}</span>
              <span className="text-[#2a2a3a]">/</span>
              <span className="text-[#505060]">{card.Defense}</span>
            </div>
            {STAR_NAMES[card.GuardianStarA - 1] && (
              <div className="mb-1 space-y-0.5">
                {[card.GuardianStarA, card.GuardianStarB].map((idx, i) => {
                  const name = STAR_NAMES[idx - 1]
                  if (!name) return null
                  const sym = GUARDIAN_STAR_SYMBOLS[name] ?? name
                  const color = GUARDIAN_STAR_COLORS[name] ?? '#555'
                  const strongName = GUARDIAN_STAR_STRONG[name]
                  const weakName = GUARDIAN_STAR_WEAK[name]
                  const strongSym = GUARDIAN_STAR_SYMBOLS[strongName] ?? strongName
                  const weakSym = GUARDIAN_STAR_SYMBOLS[weakName] ?? weakName
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-[12px] leading-none shrink-0" style={{ color }}>{sym}</span>
                      <span className="text-[9px] leading-none flex-1" style={{ color }}>{name}</span>
                      <span className="text-[9px] font-mono leading-none" style={{ color: '#4a8' }} title={`Strong vs ${strongName}`}>▲{strongSym}</span>
                      <span className="text-[9px] font-mono leading-none ml-0.5" style={{ color: '#a44' }} title={`Weak vs ${weakName}`}>▼{weakSym}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {card.Description && (
          <div className="text-[9px] text-[#555] leading-tight mt-0.5 flex-1 overflow-hidden"
            style={{ display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
            {card.Description}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1 border-t border-[#111120]">
          <span className="text-[8px] font-mono text-[#2a2a3a] tracking-wider">
            {card.CardCode || '—'}
          </span>
          {card.Stars > 0 && (
            <span className="text-[8px] font-mono text-[#2a2a3a]">
              ★{card.Stars}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function NpcTip({ slug, name, pos }: { slug: string; name: string; pos: Pos }) {
  const [idx, setIdx] = useState(0)
  const sources = [
    `${BASE_PATH}/images/npc/${slug}.png`,
    `https://www.yugiohfm.com/imgs/personagens/${slug}.png`,
  ]

  const vw = window.innerWidth
  const vh = window.innerHeight
  const NPC_W = 180
  const fitsRight = pos.x + NPC_W + OFFSET < vw
  const left = fitsRight ? pos.x + OFFSET : pos.x - NPC_W - OFFSET
  const top = Math.max(8, Math.min(pos.y - 10, vh - 100))

  return (
    <div
      style={{ position: 'fixed', left, top, zIndex: 9999, pointerEvents: 'none' }}
      className="flex items-center gap-2 bg-[#0a0a14] border border-[#1e1e2e] rounded px-2.5 py-2 shadow-xl shadow-black/70"
    >
      {idx < sources.length ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sources[idx]}
          alt={name}
          width={40}
          height={40}
          onError={() => setIdx(i => i + 1)}
          className="rounded-full object-cover bg-[#1a1a2e] shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[#444] text-[9px] shrink-0">
          {name.slice(0, 2)}
        </div>
      )}
      <span className="text-[11px] text-[#aaa] whitespace-nowrap">{name}</span>
    </div>
  )
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tip, setTip] = useState<{ data: TipData; pos: Pos } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingData = useRef<TipData | null>(null)
  const pendingPos = useRef<Pos>({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const show = useCallback((data: TipData, pos: Pos) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingData.current = data
    pendingPos.current = pos
    timerRef.current = setTimeout(() => {
      if (pendingData.current) setTip({ data: pendingData.current, pos: pendingPos.current })
    }, DELAY_MS)
  }, [])

  const move = useCallback((pos: Pos) => {
    pendingPos.current = pos
    setTip(s => s ? { ...s, pos } : null)
  }, [])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingData.current = null
    setTip(null)
  }, [])

  return (
    <TooltipCtx.Provider value={{ show, move, hide }}>
      {children}
      {mounted && tip && createPortal(
        tip.data.kind === 'card'
          ? <CardTip card={tip.data.card} pos={tip.pos} />
          : <NpcTip slug={tip.data.slug} name={tip.data.name} pos={tip.pos} />,
        document.body,
      )}
    </TooltipCtx.Provider>
  )
}
