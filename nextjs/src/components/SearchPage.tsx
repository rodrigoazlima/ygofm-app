'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { cards, computeRelatedIds } from '@/lib/dataLoader'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { CardDetail } from './CardDetail'
import { CardGrid } from './CardGrid'
import { localUrl } from '@/lib/imageHelpers'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

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
    setSelectedId(id)
    setQuery('')
  }, [])

  const handleClear = useCallback(() => {
    setQuery('')
    setSelectedId(null)
  }, [])

  const compact = selectedId !== null || !!query

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
          <CardDetail cardId={selectedId} onSelect={handleSelect} />
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
