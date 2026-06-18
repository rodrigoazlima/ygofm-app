'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cards, computeRelatedIds, byId } from '@/lib/dataLoader'
import { npcList, npcById } from '@/lib/dropsLoader'
import { TYPE_NAMES, ATTR_NAMES } from '@/lib/constants'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import type { TypeSearchItem, AttrSearchItem } from './SearchBar'
import { CardDetail } from './CardDetail'
import { NpcDetail } from './NpcDetail'
import { TypeDetail } from './TypeDetail'
import { AttributeDetail } from './AttributeDetail'
import { CardGrid } from './CardGrid'
import { localUrl } from '@/lib/imageHelpers'

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
  const [fadingOut, setFadingOut] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasSelection = selectedId !== null || selectedNpcId !== null ||
    selectedType !== null || selectedAttr !== null
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

    setSelectedId(rawCard ? (byId[Number(rawCard)] ? Number(rawCard) : null) : null)
    setSelectedNpcId(rawNpc ? (npcById[Number(rawNpc)] ? Number(rawNpc) : null) : null)
    setSelectedType(rawType !== null
      ? (Number(rawType) >= 0 && Number(rawType) < TYPE_NAMES.length ? Number(rawType) : null)
      : null)
    setSelectedAttr(rawAttr !== null
      ? (Number(rawAttr) >= 0 && Number(rawAttr) < ATTR_NAMES.length ? Number(rawAttr) : null)
      : null)
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
      .map((name, typeIdx) => ({ typeIdx, name, count: TYPE_COUNTS[typeIdx] }))
      .filter(t => t.name.toLowerCase().includes(q))
  }, [query])

  const autocompleteAttrs = useMemo((): AttrSearchItem[] => {
    if (!query) return []
    const q = query.toLowerCase()
    return ATTR_NAMES
      .map((name, attrIdx) => ({ attrIdx, name, count: ATTR_COUNTS[attrIdx] }))
      .filter(a => a.name.toLowerCase().includes(q))
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
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [selectedId, selectedNpcId, selectedType, selectedAttr, pathname, router])

  const clearAllSelections = () => {
    setSelectedId(null); setSelectedNpcId(null)
    setSelectedType(null); setSelectedAttr(null)
  }

  const handleSelect = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedId(id); setSelectedNpcId(null); setSelectedType(null); setSelectedAttr(null)
    setQuery('')
    router.push(`${pathname}?card=${id}`, { scroll: false })
  }, [pathname, router])

  const handleSelectNpc = useCallback((id: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedNpcId(id); setSelectedId(null); setSelectedType(null); setSelectedAttr(null)
    setQuery('')
    router.push(`${pathname}?npc=${id}`, { scroll: false })
  }, [pathname, router])

  const handleSelectType = useCallback((typeIdx: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedType(typeIdx); setSelectedId(null); setSelectedNpcId(null); setSelectedAttr(null)
    setQuery('')
    router.push(`${pathname}?type=${typeIdx}`, { scroll: false })
  }, [pathname, router])

  const handleSelectAttr = useCallback((attrIdx: number) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(false)
    setSelectedAttr(attrIdx); setSelectedId(null); setSelectedNpcId(null); setSelectedType(null)
    setQuery('')
    router.push(`${pathname}?attr=${attrIdx}`, { scroll: false })
  }, [pathname, router])

  const handleClear = useCallback(() => {
    setQuery('')
    if (!hasSelection) return
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFadingOut(true)
    fadeTimerRef.current = setTimeout(() => {
      clearAllSelections()
      setFadingOut(false)
      router.push(pathname, { scroll: false })
    }, FADE_MS)
  }, [hasSelection, pathname, router]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasSelection && !fadingOut &&
        autocompleteCards.length === 1 &&
        autocompleteNpcs.length === 0 &&
        autocompleteTypes.length === 0 &&
        autocompleteAttrs.length === 0) {
      handleSelect(autocompleteCards[0].Id)
    }
  }, [autocompleteCards, autocompleteNpcs, autocompleteTypes, autocompleteAttrs,
      hasSelection, fadingOut, handleSelect])

  useEffect(() => () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }, [])

  const compact = hasSelection || fadingOut || !!query

  const searchBarProps = {
    query, onChange: handleQueryChange,
    onSelect: handleSelect, onSelectNpc: handleSelectNpc,
    onSelectType: handleSelectType, onSelectAttr: handleSelectAttr,
    items: autocompleteCards, npcItems: autocompleteNpcs,
    typeItems: autocompleteTypes, attrItems: autocompleteAttrs,
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#09090b]">
      <header className="shrink-0 z-40 bg-[#09090b] border-b border-[#151520] px-4 pt-3 pb-3">
        {compact ? (
          <div className="flex items-center gap-3">
            <Logo compact onClear={handleClear} />
            <div className="flex-1">
              <SearchBar {...searchBarProps} onClear={handleClear} hasSelection={hasSelection} />
            </div>
          </div>
        ) : (
          <>
            <Logo compact={false} />
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
        <CardGrid brightIds={brightIds} isInitial={isInitial} onSelect={handleSelect} />
      </main>
    </div>
  )
}
