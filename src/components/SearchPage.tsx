'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cards, computeRelatedIds, byId } from '@/lib/dataLoader'
import { npcList, npcById } from '@/lib/dropsLoader'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { CardDetail } from './CardDetail'
import { NpcDetail } from './NpcDetail'
import { CardGrid } from './CardGrid'
import { localUrl } from '@/lib/imageHelpers'

const FADE_MS = 180

export function SearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const raw = searchParams.get('card')
    if (!raw) return null
    const id = Number(raw)
    return byId[id] ? id : null
  })
  const [selectedNpcId, setSelectedNpcId] = useState<number | null>(() => {
    const raw = searchParams.get('npc')
    if (!raw) return null
    const id = Number(raw)
    return npcById[id] ? id : null
  })
  const [fadingOut, setFadingOut] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasSelection = selectedId !== null || selectedNpcId !== null
  const isInitial = !query && !hasSelection

  // Preload local WebP images on mount
  useEffect(() => {
    for (const card of cards) {
      const url = localUrl(card)
      if (url) {
        const img = new Image()
        img.src = url
      }
    }
  }, [])

  // Sync state → URL
  useEffect(() => {
    if (fadingOut) return
    const params = new URLSearchParams()
    if (selectedId !== null) params.set('card', String(selectedId))
    if (selectedNpcId !== null) params.set('npc', String(selectedNpcId))
    if (query) params.set('q', query)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [query, selectedId, selectedNpcId, fadingOut, pathname, router])

  const autocompleteCards = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return cards.filter(c => c.Name.toLowerCase().includes(q)).slice(0, 15)
  }, [query])

  const autocompleteNpcs = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return npcList.filter(n => n.name.toLowerCase().includes(q)).slice(0, 5)
  }, [query])

  const brightIds = useMemo((): Set<number> => {
    if (selectedId !== null) return computeRelatedIds(selectedId)
    if (selectedNpcId !== null) {
      const npc = npcById[selectedNpcId]
      if (!npc) return new Set()
      const ids = new Set<number>()
      for (const mode of ['sapow', 'bcd', 'astec'] as const) {
        for (const d of npc.drops[mode]) ids.add(d.card_id)
      }
      return ids
    }
    if (query) {
      const q = query.toLowerCase()
      const fromCards = new Set(cards.filter(c => c.Name.toLowerCase().includes(q)).map(c => c.Id))
      // If query matches an NPC, highlight all its dropped cards
      const matchedNpc = npcList.find(n => n.name.toLowerCase().includes(q))
      if (matchedNpc) {
        for (const mode of ['sapow', 'bcd', 'astec'] as const) {
          for (const d of matchedNpc.drops[mode]) fromCards.add(d.card_id)
        }
      }
      return fromCards
    }
    return new Set<number>()
  }, [selectedId, selectedNpcId, query])

  const startFade = useCallback((then: () => void) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(true)
    fadeTimerRef.current = setTimeout(() => {
      then()
      setFadingOut(false)
    }, FADE_MS)
  }, [])

  const handleSelect = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedId(id)
    setSelectedNpcId(null)
    setQuery('')
  }, [])

  const handleSelectNpc = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedNpcId(id)
    setSelectedId(null)
    setQuery('')
  }, [])

  const handleClear = useCallback(() => {
    setQuery('')
    if (!hasSelection) return
    startFade(() => {
      setSelectedId(null)
      setSelectedNpcId(null)
    })
  }, [hasSelection, startFade])

  // Auto-select when exactly one card result and no selection
  useEffect(() => {
    if (!hasSelection && !fadingOut && autocompleteCards.length === 1 && autocompleteNpcs.length === 0) {
      handleSelect(autocompleteCards[0].Id)
    }
  }, [autocompleteCards, autocompleteNpcs, hasSelection, fadingOut, handleSelect])

  useEffect(() => () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
  }, [])

  const compact = hasSelection || fadingOut || !!query

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b]">
      <header className="shrink-0 z-40 bg-[#09090b] border-b border-[#151520] px-4 pt-3 pb-3">
        {compact ? (
          <div className="flex items-center gap-3">
            <Logo compact />
            <div className="flex-1">
              <SearchBar
                query={query}
                onChange={setQuery}
                onSelect={handleSelect}
                onSelectNpc={handleSelectNpc}
                onClear={handleClear}
                hasSelection={hasSelection}
                items={autocompleteCards}
                npcItems={autocompleteNpcs}
              />
            </div>
          </div>
        ) : (
          <>
            <Logo compact={false} />
            <SearchBar
              query={query}
              onChange={setQuery}
              onSelect={handleSelect}
              onSelectNpc={handleSelectNpc}
              items={autocompleteCards}
              npcItems={autocompleteNpcs}
            />
          </>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {selectedId !== null && (
          <div key={`card-${selectedId}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <CardDetail cardId={selectedId} onSelect={handleSelect} onSelectNpc={handleSelectNpc} query={query} />
          </div>
        )}
        {selectedNpcId !== null && (
          <div key={`npc-${selectedNpcId}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <NpcDetail npcId={selectedNpcId} onSelect={handleSelect} />
          </div>
        )}
        <CardGrid
          brightIds={brightIds}
          isInitial={isInitial}
          onSelect={handleSelect}
        />
      </main>
    </div>
  )
}
