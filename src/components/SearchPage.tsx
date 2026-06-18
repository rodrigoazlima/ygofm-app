'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cards, computeRelatedIds, byId } from '@/lib/dataLoader'
import { npcList, npcById } from '@/lib/dropsLoader'
import { TYPE_NAMES, ATTR_NAMES, FIELD_BOOSTS } from '@/lib/constants'
import { DEFAULT_GAME } from '@/lib/games'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { TooltipProvider } from './TooltipProvider'
import type { TypeSearchItem, AttrSearchItem, CategorySearchItem } from './SearchBar'
import { CardDetail } from './CardDetail'
import { NpcDetail } from './NpcDetail'
import { TypeDetail } from './TypeDetail'
import { AttributeDetail } from './AttributeDetail'
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
  const [selectedType, setSelectedType] = useState<number | null>(() => {
    const raw = searchParams.get('type')
    if (!raw) return null
    const idx = Number(raw)
    return idx >= 0 && idx < TYPE_NAMES.length ? idx : null
  })
  const [selectedAttr, setSelectedAttr] = useState<number | null>(() => {
    const raw = searchParams.get('attr')
    if (!raw) return null
    const idx = Number(raw)
    return idx >= 0 && idx < ATTR_NAMES.length ? idx : null
  })
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(() => {
    const raw = searchParams.get('cat')
    return raw === 'monster' || raw === 'field' ? raw : null
  })
  const [game, setGame] = useState(() => searchParams.get('game') ?? DEFAULT_GAME)
  const [fadingOut, setFadingOut] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasSelection = selectedId !== null || selectedNpcId !== null ||
    selectedType !== null || selectedAttr !== null || selectedCategory !== null
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

    const rawCard = searchParams.get('card')
    const rawNpc = searchParams.get('npc')
    const rawType = searchParams.get('type')
    const rawAttr = searchParams.get('attr')
    const rawCat = searchParams.get('cat')

    setSelectedId(rawCard ? (byId[Number(rawCard)] ? Number(rawCard) : null) : null)
    setSelectedNpcId(rawNpc ? (npcById[Number(rawNpc)] ? Number(rawNpc) : null) : null)
    setSelectedType(rawType !== null
      ? (Number(rawType) >= 0 && Number(rawType) < TYPE_NAMES.length ? Number(rawType) : null)
      : null)
    setSelectedAttr(rawAttr !== null
      ? (Number(rawAttr) >= 0 && Number(rawAttr) < ATTR_NAMES.length ? Number(rawAttr) : null)
      : null)
    setSelectedCategory(rawCat === 'monster' || rawCat === 'field' ? rawCat : null)
    setGame(searchParams.get('game') ?? DEFAULT_GAME)
    setQuery(searchParams.get('q') ?? '')
    setFadingOut(false)
  }, [searchParams])

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
    if (selectedType !== null)
      return new Set(cards.filter(c => c.Type === selectedType).map(c => c.Id))
    if (selectedAttr !== null)
      return new Set(cards.filter(c => c.Attribute === selectedAttr).map(c => c.Id))
    if (selectedCategory === 'monster')
      return new Set(cards.filter(c => c.Type < 20).map(c => c.Id))
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
  }, [selectedId, selectedNpcId, selectedType, selectedAttr, query])

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
    const params = new URLSearchParams()
    if (selectedId !== null) params.set('card', String(selectedId))
    if (selectedNpcId !== null) params.set('npc', String(selectedNpcId))
    if (selectedType !== null) params.set('type', String(selectedType))
    if (selectedAttr !== null) params.set('attr', String(selectedAttr))
    if (q) params.set('q', q)
    if (game !== DEFAULT_GAME) params.set('game', game)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [selectedId, selectedNpcId, selectedType, selectedAttr, pathname, router, game])

  const handleGameChange = useCallback((newGame: string) => {
    setGame(newGame)
    const params = new URLSearchParams(searchParams.toString())
    if (newGame === DEFAULT_GAME) params.delete('game')
    else params.set('game', newGame)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, pathname, router])

  const clearAllSelections = () => {
    setSelectedId(null); setSelectedNpcId(null)
    setSelectedType(null); setSelectedAttr(null); setSelectedCategory(null)
  }

  const handleSelect = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedId(id); setSelectedNpcId(null); setSelectedType(null); setSelectedAttr(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('card', String(id))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleSelectNpc = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedNpcId(id); setSelectedId(null); setSelectedType(null); setSelectedAttr(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('npc', String(id))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleSelectType = useCallback((typeIdx: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedType(typeIdx); setSelectedId(null); setSelectedNpcId(null); setSelectedAttr(null); setSelectedCategory(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('type', String(typeIdx))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleSelectAttr = useCallback((attrIdx: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedAttr(attrIdx); setSelectedId(null); setSelectedNpcId(null); setSelectedType(null); setSelectedCategory(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('attr', String(attrIdx))
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleSelectCategory = useCallback((cat: CategoryId) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedCategory(cat); setSelectedId(null); setSelectedNpcId(null); setSelectedType(null); setSelectedAttr(null)
    setQuery('')
    const params = new URLSearchParams()
    params.set('cat', cat)
    if (game !== DEFAULT_GAME) params.set('game', game)
    router.push(`${pathname}?${params}`, { scroll: false })
  }, [pathname, router, game])

  const handleClear = useCallback(() => {
    setQuery('')
    if (!hasSelection) return
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(true)
    fadeTimerRef.current = setTimeout(() => {
      clearAllSelections()
      setFadingOut(false)
      const dest = game !== DEFAULT_GAME ? `${pathname}?game=${game}` : pathname
      router.push(dest, { scroll: false })
    }, FADE_MS)
  }, [hasSelection, pathname, router, game]) // eslint-disable-line react-hooks/exhaustive-deps

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

      <main className="flex-1 overflow-y-auto">
        {selectedId !== null && (
          <div key={`card-${selectedId}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <CardDetail cardId={selectedId} onSelect={handleSelect}
              onSelectNpc={handleSelectNpc} onSelectType={handleSelectType}
              onSelectAttr={handleSelectAttr} query={query} />
          </div>
        )}
        {selectedNpcId !== null && (
          <div key={`npc-${selectedNpcId}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <NpcDetail npcId={selectedNpcId} onSelect={handleSelect} />
          </div>
        )}
        {selectedType !== null && (
          <div key={`type-${selectedType}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <TypeDetail typeIdx={selectedType} onSelect={handleSelect} />
          </div>
        )}
        {selectedAttr !== null && (
          <div key={`attr-${selectedAttr}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <AttributeDetail attrIdx={selectedAttr} onSelect={handleSelect} />
          </div>
        )}
        {selectedCategory !== null && (
          <div key={`cat-${selectedCategory}`} className={fadingOut ? 'card-detail-exit' : 'card-detail-enter'}>
            <CategoryDetail category={selectedCategory} onSelect={handleSelect} />
          </div>
        )}
        {isInitial && !fadingOut && (
          <CategoryBrowser
            onSelectType={handleSelectType}
            onSelectAttr={handleSelectAttr}
            onSelectCategory={handleSelectCategory}
          />
        )}
        <CardGrid brightIds={brightIds} isInitial={isInitial} onSelect={handleSelect} />
      </main>
    </div>
    </TooltipProvider>
  )
}
