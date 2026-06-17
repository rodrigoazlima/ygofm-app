'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Card } from '@/lib/types'
import type { NpcInfo } from '@/lib/dropsLoader'
import { CardThumb } from './CardThumb'
import { CardLabel } from './CardLabel'
import { NpcImage } from './NpcImage'
import { atkColor, TYPE_NAMES, TYPE_IMAGES, TYPE_COLORS } from '@/lib/constants'

export type SearchItem =
  | { kind: 'card'; card: Card }
  | { kind: 'npc'; npc: NpcInfo }

export interface TypeSearchItem {
  typeIdx: number
  name: string
  count: number
}

interface Props {
  query: string
  onChange: (q: string) => void
  onSelect: (id: number) => void
  onSelectNpc?: (id: number) => void
  onSelectType?: (typeIdx: number) => void
  onClear?: () => void
  hasSelection?: boolean
  items: Card[]
  npcItems?: NpcInfo[]
  typeItems?: TypeSearchItem[]
}

export function SearchBar({
  query, onChange, onSelect, onSelectNpc, onSelectType,
  onClear, hasSelection, items, npcItems = [], typeItems = [],
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [open, setOpen] = useState(false)
  const lastEscRef = useRef<number>(0)

  const mainItems: SearchItem[] = [
    ...items.map(card => ({ kind: 'card' as const, card })),
    ...npcItems.map(npc => ({ kind: 'npc' as const, npc })),
  ]
  const totalItems = mainItems.length + typeItems.length

  useEffect(() => {
    setActiveIdx(-1)
    setOpen(totalItems > 0 && query.length > 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, npcItems, typeItems, query])

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])

  const selectMain = useCallback((item: SearchItem) => {
    if (item.kind === 'card') onSelect(item.card.Id)
    else onSelectNpc?.(item.npc.id)
    setOpen(false)
    setActiveIdx(-1)
  }, [onSelect, onSelectNpc])

  const selectType = useCallback((typeIdx: number) => {
    onSelectType?.(typeIdx)
    setOpen(false)
    setActiveIdx(-1)
  }, [onSelectType])

  // Unified index: 0..mainItems.length-1 = main, mainItems.length..totalItems-1 = types
  const activateIdx = (idx: number) => {
    if (idx < mainItems.length) {
      selectMain(mainItems[idx])
    } else {
      const typeItem = typeItems[idx - mainItems.length]
      if (typeItem) selectType(typeItem.typeIdx)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, totalItems - 1))
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && open) {
      e.preventDefault()
      const idx = activeIdx >= 0 ? activeIdx : 0
      activateIdx(idx)
    } else if (e.key === 'Tab' && open) {
      e.preventDefault()
      activateIdx(0)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      const now = Date.now()
      const isDouble = now - lastEscRef.current < 500
      lastEscRef.current = now

      if (open || query) {
        setOpen(false)
        onChange('')
      } else if (isDouble && onClear) {
        onClear()
        lastEscRef.current = 0
      }
    }
  }

  const showClear = !!(query || hasSelection)

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={query}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => query && totalItems > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search cards, NPCs or types..."
          className="w-full bg-[#111118] border border-[#2a2a40] rounded-md pl-9 pr-9 py-2.5 text-sm text-[#e8e8f0] placeholder-[#444] focus:outline-none focus:border-[#0C5CAB] focus:ring-1 focus:ring-[#0C5CAB] transition-colors"
          spellCheck={false}
        />
        {showClear && (
          <button
            onMouseDown={e => { e.preventDefault(); onClear?.(); setOpen(false); inputRef.current?.focus() }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
            tabIndex={-1}
            title="Clear (double Esc)"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        )}
      </div>

      {open && totalItems > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-[#0e0e18] border border-[#2a2a40] rounded-md shadow-xl overflow-hidden">
          <div className="max-h-72 overflow-y-auto">
            {/* Cards + NPCs */}
            {mainItems.map((item, idx) => {
              const active = idx === activeIdx
              if (item.kind === 'card') {
                const card = item.card
                const isMonster = card.Type < 20
                return (
                  <div
                    key={`card-${card.Id}`}
                    onMouseDown={() => selectMain(item)}
                    className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${active ? 'bg-[#0C5CAB]/30' : 'hover:bg-[#1a1a2e]'}`}
                  >
                    <CardThumb card={card} size={32} />
                    <CardLabel card={card} iconSize={12} className="flex-1 text-xs text-[#ccc]" />
                    {isMonster && (
                      <span className="text-[10px] shrink-0" style={{ color: atkColor(card.Attack) }}>
                        {card.Attack}
                      </span>
                    )}
                  </div>
                )
              } else {
                const npc = item.npc
                return (
                  <div
                    key={`npc-${npc.id}`}
                    onMouseDown={() => selectMain(item)}
                    className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${active ? 'bg-[#0C5CAB]/30' : 'hover:bg-[#1a1a2e]'}`}
                  >
                    <NpcImage slug={npc.slug} name={npc.name} size={32} />
                    <span className="flex-1 text-xs text-[#ccc] truncate">{npc.name}</span>
                    <span className="text-[9px] text-[#444] shrink-0">NPC</span>
                  </div>
                )
              }
            })}

            {/* Type separator + items */}
            {typeItems.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-t border-[#1e1e30]">
                  <span className="text-[9px] uppercase tracking-widest text-[#333]">Types</span>
                </div>
                {typeItems.map((t, i) => {
                  const globalIdx = mainItems.length + i
                  const active = globalIdx === activeIdx
                  const img = TYPE_IMAGES[t.typeIdx]
                  const color = TYPE_COLORS[t.name] || '#666'
                  return (
                    <div
                      key={`type-${t.typeIdx}`}
                      onMouseDown={() => selectType(t.typeIdx)}
                      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${active ? 'bg-[#0C5CAB]/30' : 'hover:bg-[#1a1a2e]'}`}
                    >
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={t.name} width={18} height={18}
                          style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
                      )}
                      <span className="flex-1 text-xs truncate" style={{ color }}>{t.name}</span>
                      <span className="text-[9px] text-[#333] shrink-0">{t.count}</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
