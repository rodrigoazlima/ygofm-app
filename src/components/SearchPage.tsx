'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cards, computeRelatedIds, byId } from '@/lib/dataLoader'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { CardDetail } from './CardDetail'
import { CardGrid } from './CardGrid'
import { localUrl } from '@/lib/imageHelpers'

const FADE_MS = 180

export function SearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize state from URL on first render
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const raw = searchParams.get('card')
    if (!raw) return null
    const id = Number(raw)
    return byId[id] ? id : null
  })
  const [fadingOut, setFadingOut] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isInitial = !query && selectedId === null

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

  // Sync state → URL (replace, no history push). Skip during fade to avoid premature URL clear.
  useEffect(() => {
    if (fadingOut) return
    const params = new URLSearchParams()
    if (selectedId !== null) params.set('card', String(selectedId))
    if (query) params.set('q', query)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [query, selectedId, fadingOut, pathname, router])

  const autocompleteItems = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return cards.filter(c => c.Name.toLowerCase().includes(q)).slice(0, 20)
  }, [query])

  const brightIds = useMemo((): Set<number> => {
    if (selectedId !== null) return computeRelatedIds(selectedId)
    if (query) {
      const q = query.toLowerCase()
      return new Set(cards.filter(c => c.Name.toLowerCase().includes(q)).map(c => c.Id))
    }
    return new Set<number>()
  }, [selectedId, query])

  const handleSelect = useCallback((id: number) => {
    // Cancel any in-progress fade-out
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedId(id)
    setQuery('')
  }, [])

  const handleClear = useCallback(() => {
    setQuery('')
    if (selectedId === null) return
    setFadingOut(true)
    fadeTimerRef.current = setTimeout(() => {
      setSelectedId(null)
      setFadingOut(false)
    }, FADE_MS)
  }, [selectedId])

  // Auto-select when exactly one result and no card selected
  useEffect(() => {
    if (selectedId === null && !fadingOut && autocompleteItems.length === 1) {
      handleSelect(autocompleteItems[0].Id)
    }
  }, [autocompleteItems, selectedId, fadingOut, handleSelect])

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
  }, [])

  const compact = selectedId !== null || fadingOut || !!query

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b]">
      {/* Sticky header */}
      <header className="shrink-0 z-40 bg-[#09090b] border-b border-[#151520] px-4 pt-3 pb-3">
        {compact ? (
          <div className="flex items-center gap-3">
            <Logo compact />
            <div className="flex-1">
              <SearchBar
                query={query}
                onChange={setQuery}
                onSelect={handleSelect}
                onClear={handleClear}
                hasSelection={selectedId !== null}
                items={autocompleteItems}
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
              items={autocompleteItems}
            />
          </>
        )}
      </header>

      {/* Scrollable body */}
      <main className="flex-1 overflow-y-auto">
        {selectedId !== null && (
          <div key={selectedId} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <CardDetail cardId={selectedId} onSelect={handleSelect} query={query} />
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
