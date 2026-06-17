'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Card } from '@/lib/types'
import { CardThumb } from './CardThumb'
import { CardLabel } from './CardLabel'
import { atkColor } from '@/lib/constants'

interface Props {
  query: string
  onChange: (q: string) => void
  onSelect: (id: number) => void
  items: Card[]
}

export function SearchBar({ query, onChange, onSelect, items }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setActiveIdx(-1)
    setOpen(items.length > 0 && query.length > 0)
  }, [items, query])

  useEffect(() => {
    // Route global keypresses to this input
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

  const select = useCallback((id: number) => {
    onSelect(id)
    setOpen(false)
    setActiveIdx(-1)
  }, [onSelect])

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = activeIdx >= 0 ? items[activeIdx] : items[0]
      if (target) select(target.Id)
    } else if (e.key === 'Escape') {
      setOpen(false)
      onChange('')
    } else if (e.key === 'Tab') {
      if (items[0]) { e.preventDefault(); select(items[0].Id) }
    }
  }

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
          onFocus={() => query && items.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search cards..."
          className="w-full bg-[#111118] border border-[#2a2a40] rounded-md pl-9 pr-4 py-2.5 text-sm text-[#e8e8f0] placeholder-[#444] focus:outline-none focus:border-[#0C5CAB] focus:ring-1 focus:ring-[#0C5CAB] transition-colors"
          spellCheck={false}
        />
      </div>

      {open && items.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-[#0e0e18] border border-[#2a2a40] rounded-md shadow-xl overflow-hidden">
          <div className="max-h-72 overflow-y-auto">
            {items.map((card, idx) => {
              const isMonster = card.Type < 20
              return (
                <div
                  key={card.Id}
                  onMouseDown={() => select(card.Id)}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
                    idx === activeIdx ? 'bg-[#0C5CAB]/30' : 'hover:bg-[#1a1a2e]'
                  }`}
                >
                  <CardThumb card={card} size={32} />
                  <CardLabel card={card} iconSize={12} className="flex-1 text-xs text-[#ccc]" />
                  {isMonster ? (
                    <span className="text-[10px] shrink-0" style={{ color: atkColor(card.Attack) }}>
                      {card.Attack}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
