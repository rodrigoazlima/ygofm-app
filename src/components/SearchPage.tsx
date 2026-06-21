'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cards, computeRelatedIds, byId } from '@/lib/dataLoader'
import { npcList, npcById } from '@/lib/dropsLoader'
import { TYPE_NAMES, ATTR_NAMES, FIELD_BOOSTS } from '@/lib/constants'
import { DEFAULT_GAME, getGame } from '@/lib/games'
import { parseFilters, applyFilters } from '@/lib/filters'
import type { FilterState } from '@/lib/filters'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { TooltipProvider } from './TooltipProvider'
import type { TypeSearchItem, AttrSearchItem, CategorySearchItem } from './SearchBar'
import { CardDetail } from './CardDetail'
import { NpcDetail } from './NpcDetail'

import { CategoryDetail } from './CategoryDetail'
import { CategoryBrowser } from './CategoryBrowser'
import { CardGrid } from './CardGrid'
import { localUrl } from '@/lib/imageHelpers'
import type { CategoryId } from './CategoryDetail'

const FIELD_IDS = new Set(Object.keys(FIELD_BOOSTS).map(Number))
const MONSTER_COUNT = cards.filter(c => c.Type < 20).length
const FIELD_COUNT = cards.filter(c => FIELD_IDS.has(c.Id)).length

const FADE_MS = 180

const TYPE_COUNTS = TYPE_NAMES.map((_, i) => cards.filter(c => c.Type === i).length)
const ATTR_COUNTS = ATTR_NAMES.map((_, i) => cards.filter(c => c.Attribute === i).length)

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(() => {
    const raw = searchParams.get('cat')
    return raw === 'monster' || raw === 'field' ? raw : null
  })
  const [game, setGame] = useState(() => searchParams.get('game') ?? DEFAULT_GAME)
  const [fadingOut, setFadingOut] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const filterState = useMemo((): FilterState =>
    parseFilters(
      k => searchParams.get(k),
      k => searchParams.has(k),
      k => searchParams.getAll(k),
    ),
    [searchParams]
  )

  const hasSelection = selectedId !== null || selectedNpcId !== null ||
    selectedCategory !== null
  const isInitial = !query && !hasSelection

  useEffect(() => {
    for (const card of cards) {
      const url = localUrl(card)
      if (url) { const img = new Image(); img.src = url }
    }
  }, [])

  // URL → local state (back/forward)
  useEffect(() => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = null

    // Legacy ?attr=X → redirect to ?cat=monster&fAttr=X
    const rawAttr = searchParams.get('attr')
    if (rawAttr !== null) {
      const p = new URLSearchParams(searchParams.toString())
      p.delete('attr')
      p.set('cat', 'monster')
      p.set('fAttr', rawAttr)
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      return
    }

    // Legacy ?type=X → redirect to ?cat=monster&fType=X
    const rawType = searchParams.get('type')
    if (rawType !== null) {
      const p = new URLSearchParams(searchParams.toString())
      p.delete('type')
      p.set('cat', 'monster')
      p.append('fType', rawType)
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      return
    }

    const rawCard = searchParams.get('card')
    const rawNpc = searchParams.get('npc')
    const rawCat = searchParams.get('cat')

    setSelectedId(rawCard ? (byId[Number(rawCard)] ? Number(rawCard) : null) : null)
    setSelectedNpcId(rawNpc ? (npcById[Number(rawNpc)] ? Number(rawNpc) : null) : null)
    setSelectedCategory(rawCat === 'monster' || rawCat === 'field' ? rawCat : null)
    setGame(searchParams.get('game') ?? DEFAULT_GAME)
    setQuery(searchParams.get('q') ?? '')
    setFadingOut(false)
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const autocompleteTypes = useMemo((): TypeSearchItem[] => {
    if (!query) return []
    const q = query.toLowerCase()
    return TYPE_NAMES
      .map((name, typeIdx) => ({
        typeIdx,
        name: typeIdx === 20 ? 'Magic / Spell' : name,
        count: TYPE_COUNTS[typeIdx],
      }))
      .filter(t => t.name.toLowerCase().includes(q) || (q === 'spell' && t.typeIdx === 20))
  }, [query])

  const autocompleteAttrs = useMemo((): AttrSearchItem[] => {
    if (!query) return []
    const q = query.toLowerCase()
    return ATTR_NAMES
      .map((name, attrIdx) => ({ attrIdx, name, count: ATTR_COUNTS[attrIdx] }))
      .filter(a => a.name.toLowerCase().includes(q))
  }, [query])

  const autocompleteCategories = useMemo((): CategorySearchItem[] => {
    if (!query) return []
    const q = query.toLowerCase()
    const cats: CategorySearchItem[] = [
      { categoryId: 'monster', label: 'Monster (All Types)', count: MONSTER_COUNT, color: '#a83' },
      { categoryId: 'field', label: 'Field Spell', count: FIELD_COUNT, color: '#4a6' },
    ]
    return cats.filter(c =>
      c.label.toLowerCase().includes(q) ||
      (q.includes('spell') && c.categoryId === 'field') ||
      (q === 'monster' && c.categoryId === 'monster')
    )
  }, [query])

  const brightIds = useMemo((): Set<number> => {
    if (selectedId !== null) return computeRelatedIds(selectedId)
    if (selectedNpcId !== null) {
      const npc = npcById[selectedNpcId]
      if (!npc) return new Set()
      const ids = new Set<number>()
      for (const mode of ['sapow', 'bcd', 'astec'] as const)
        for (const d of npc.drops[mode]) ids.add(d.card_id)
      return ids
    }
    if (selectedCategory === 'monster') {
      const f = filterState
      return new Set(
        cards.filter(c =>
          c.Type < 20 &&
          (f.filterAttr === null || c.Attribute === f.filterAttr) &&
          (f.filterType === null || f.filterType.includes(c.Type))
        ).map(c => c.Id)
      )
    }
    if (selectedCategory === 'field')
      return new Set(cards.filter(c => FIELD_IDS.has(c.Id)).map(c => c.Id))
    if (query) {
      const q = query.toLowerCase()
      const ids = new Set(cards.filter(c => c.Name.toLowerCase().includes(q)).map(c => c.Id))
      const matchedNpc = npcList.find(n => n.name.toLowerCase().includes(q))
      if (matchedNpc)
        for (const mode of ['sapow', 'bcd', 'astec'] as const)
          for (const d of matchedNpc.drops[mode]) ids.add(d.card_id)
      const matchedType = TYPE_NAMES.findIndex(n => n.toLowerCase().includes(q))
      if (matchedType >= 0) for (const c of cards) if (c.Type === matchedType) ids.add(c.Id)
      const matchedAttr = ATTR_NAMES.findIndex(n => n.toLowerCase().includes(q))
      if (matchedAttr >= 0) for (const c of cards) if (c.Attribute === matchedAttr) ids.add(c.Id)
      return ids
    }
    return new Set<number>()
  }, [selectedId, selectedNpcId, selectedCategory, filterState, query])

  const handleFilterChange = useCallback((partial: Partial<FilterState>) => {
    const merged = { ...filterState, ...partial }
    const base = new URLSearchParams(searchParams.toString())
    const p = applyFilters(base, merged)
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [filterState, searchParams, pathname, router])

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
    const params = new URLSearchParams()
    if (selectedId !== null) params.set('card', String(selectedId))
    if (selectedNpcId !== null) params.set('npc', String(selectedNpcId))
    if (q) params.set('q', q)
    if (game !== DEFAULT_GAME) params.set('game', game)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [selectedId, selectedNpcId, pathname, router, game])

  const handleGameChange = useCallback((newGame: string) => {
    setGame(newGame)
    const params = new URLSearchParams(searchParams.toString())
    if (newGame === DEFAULT_GAME) params.delete('game')
    else params.set('game', newGame)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, pathname, router])

  const clearAllSelections = () => {
    setSelectedId(null); setSelectedNpcId(null); setSelectedCategory(null)
  }

  const handleSelect = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedId(id); setSelectedNpcId(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('card', String(id))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname, router, game])

  const handleSelectNpc = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedNpcId(id); setSelectedId(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('npc', String(id))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleSelectType = useCallback((typeIdx: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedCategory('monster'); setSelectedId(null); setSelectedNpcId(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('cat', 'monster')
    params.append('fType', String(typeIdx))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleSelectAttr = useCallback((attrIdx: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedCategory('monster')
    setSelectedId(null); setSelectedNpcId(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('cat', 'monster')
    params.set('fAttr', String(attrIdx))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const getCardHref = useCallback((id: number) => {
    const p = new URLSearchParams()
    p.set('card', String(id))
    if (game !== DEFAULT_GAME) p.set('game', game)
    return `${pathname}?${p}`
  }, [game, pathname])

  const handleSelectCategory = useCallback((cat: CategoryId) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedCategory(cat); setSelectedId(null); setSelectedNpcId(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('cat', cat)
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleClear = useCallback(() => {
    setQuery('')
    if (!hasSelection) {
      if (searchParams.toString()) {
        const dest = game !== DEFAULT_GAME ? `${pathname}?game=${game}` : pathname
        router.replace(dest, { scroll: false })
      }
      return
    }
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(true)
    fadeTimerRef.current = setTimeout(() => {
      clearAllSelections()
      setFadingOut(false)
      const dest = game !== DEFAULT_GAME ? `${pathname}?game=${game}` : pathname
      router.push(dest, { scroll: false })
    }, FADE_MS)
  }, [hasSelection, pathname, router, game, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasSelection && !fadingOut &&
        autocompleteCards.length === 1 &&
        autocompleteNpcs.length === 0 &&
        autocompleteTypes.length === 0 &&
        autocompleteAttrs.length === 0 &&
        autocompleteCategories.length === 0) {
      handleSelect(autocompleteCards[0].Id)
    }
  }, [autocompleteCards, autocompleteNpcs, autocompleteTypes, autocompleteAttrs,
      autocompleteCategories, hasSelection, fadingOut, handleSelect])

  useEffect(() => () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }, [])

  useEffect(() => {
    document.title = `Yu-Gi-Oh! ${getGame(game).name} > Card Search`
  }, [game])

  const compact = hasSelection || fadingOut || !!query

  const searchBarProps = {
    query, onChange: handleQueryChange,
    onSelect: handleSelect, onSelectNpc: handleSelectNpc,
    onSelectType: handleSelectType, onSelectAttr: handleSelectAttr,
    onSelectCategory: handleSelectCategory,
    items: autocompleteCards, npcItems: autocompleteNpcs,
    typeItems: autocompleteTypes, attrItems: autocompleteAttrs,
    categoryItems: autocompleteCategories,
  }

  return (
    <TooltipProvider>
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#09090b]">
      <header className="shrink-0 z-40 bg-[#09090b] border-b border-[#151520] px-4 pt-3 pb-3">
        {compact ? (
          <div className="flex items-center gap-3">
            <Logo compact game={game} onClear={handleClear} />
            <div className="flex-1">
              <SearchBar {...searchBarProps} onClear={handleClear} hasSelection={hasSelection} />
            </div>
          </div>
        ) : (
          <>
            <Logo compact={false} game={game} onGameChange={handleGameChange} />
            <SearchBar {...searchBarProps} />
          </>
        )}
      </header>

      <main ref={mainRef} className="flex-1 overflow-y-auto">
        {selectedId !== null && (
          <div key={`card-${selectedId}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <CardDetail cardId={selectedId} onSelect={handleSelect}
              onSelectNpc={handleSelectNpc} onSelectType={handleSelectType}
              onSelectAttr={handleSelectAttr} onSelectCategory={handleSelectCategory}
              query={query} />
          </div>
        )}
        {selectedNpcId !== null && (
          <div key={`npc-${selectedNpcId}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <NpcDetail npcId={selectedNpcId} onSelect={handleSelect} />
          </div>
        )}
        {selectedCategory !== null && (
          <div key={`cat-${selectedCategory}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <CategoryDetail
              category={selectedCategory}
              filters={filterState}
              onFilterChange={handleFilterChange}
              onSelect={handleSelect}
              getCardHref={getCardHref}
            />
          </div>
        )}
        {isInitial && !fadingOut && (
          <CategoryBrowser
            onSelectType={handleSelectType}
            onSelectAttr={handleSelectAttr}
            onSelectCategory={handleSelectCategory}
            onSelectNpc={handleSelectNpc}
          />
        )}
        <CardGrid brightIds={brightIds} isInitial={isInitial} onSelect={handleSelect} />
      </main>
    </div>
    </TooltipProvider>
  )
}
