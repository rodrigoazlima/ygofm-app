'use client'

import { useMemo } from 'react'
import type { FusionEntry, ResultEntry } from '@/lib/types'
import { fusionsList, resultsList, mat2Idx, monster2Equips, byId } from '@/lib/dataLoader'
import { FIELD_BOOSTS } from '@/lib/constants'

export interface CardRelations {
  fusesInto: Map<number, number[]>   // resultId → partnerIds[]
  combinesWith: Map<number, number>  // partnerId → resultId
  compatibleSpells: number[]
  madeFrom: ResultEntry[]
}

export function useCardRelations(cardId: number | null): CardRelations | null {
  return useMemo(() => {
    if (cardId === null) return null
    const card = byId[cardId]
    if (!card) return null

    // FUSES INTO: group by result, deduplicate partners per result
    const fusesIntoSets = new Map<number, Set<number>>()
    const asMat1 = (fusionsList[cardId] || []) as FusionEntry[]
    for (const fu of asMat1) {
      if (!fusesIntoSets.has(fu.result)) fusesIntoSets.set(fu.result, new Set())
      fusesIntoSets.get(fu.result)!.add(fu.card)
    }
    const asMat2 = mat2Idx[cardId] || []
    for (const [mat1Id, resId] of asMat2) {
      if (!fusesIntoSets.has(resId)) fusesIntoSets.set(resId, new Set())
      fusesIntoSets.get(resId)!.add(mat1Id)
    }
    const fusesInto = new Map<number, number[]>()
    for (const [resId, partnerSet] of fusesIntoSets) {
      fusesInto.set(resId, [...partnerSet])
    }

    // COMBINES WITH: unique partner → result (first wins)
    const combinesWith = new Map<number, number>()
    for (const fu of asMat1) {
      if (!combinesWith.has(fu.card)) combinesWith.set(fu.card, fu.result)
    }
    for (const [mat1Id, resId] of asMat2) {
      if (!combinesWith.has(mat1Id)) combinesWith.set(mat1Id, resId)
    }

    // COMPATIBLE SPELLS
    let compatibleSpells: number[]
    if (card.Type === 23) {
      compatibleSpells = card.Equip || []
    } else if (card.Type < 20) {
      const equips = monster2Equips[cardId] || []
      const fieldCards = Object.entries(FIELD_BOOSTS)
        .filter(([, types]) => types.includes(card.Type))
        .map(([id]) => Number(id))
      compatibleSpells = [...equips, ...fieldCards]
    } else {
      compatibleSpells = []
    }

    // MADE FROM
    const madeFrom = (resultsList[cardId] || []) as ResultEntry[]

    return { fusesInto, combinesWith, compatibleSpells, madeFrom }
  }, [cardId])
}
