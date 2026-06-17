import type { Card, FusionEntry, FusionsList, ResultEntry, ResultsList } from './types'
import { FIELD_BOOSTS } from './constants'

import cardsRaw from '@/data/cards.json'
import fusionsRaw from '@/data/fusions.json'
import resultsRaw from '@/data/results.json'
import localImagesRaw from '@/data/localImages.json'
import fandomImagesRaw from '@/data/fandomImages.json'

export const cards = cardsRaw as Card[]
export const fusionsList = fusionsRaw as FusionsList
export const resultsList = resultsRaw as ResultsList
export const localImages = localImagesRaw as Record<string, string>
export const fandomImages = fandomImagesRaw as Record<string, string>

export const byId: Record<number, Card> = {}
export const mat2Idx: Record<number, [number, number][]> = {}
export const monster2Equips: Record<number, number[]> = {}

for (const c of cards) {
  byId[c.Id] = c
  if (c.Equip?.length) {
    for (const mid of c.Equip) {
      if (!monster2Equips[mid]) monster2Equips[mid] = []
      monster2Equips[mid].push(c.Id)
    }
  }
}

for (let i = 1; i < fusionsList.length; i++) {
  const list = fusionsList[i]
  if (!list) continue
  for (const fu of list) {
    if (!mat2Idx[fu.card]) mat2Idx[fu.card] = []
    mat2Idx[fu.card].push([i, fu.result])
  }
}

export function computeRelatedIds(cardId: number): Set<number> {
  const ids = new Set<number>()
  ids.add(cardId)

  const asMat1 = fusionsList[cardId] || []
  for (const fu of asMat1 as FusionEntry[]) {
    ids.add(fu.result)
    ids.add(fu.card)
  }

  const asMat2 = mat2Idx[cardId] || []
  for (const [mat1Id, resId] of asMat2) {
    ids.add(resId)
    ids.add(mat1Id)
  }

  const materials = (resultsList[cardId] || []) as ResultEntry[]
  for (const pair of materials) {
    ids.add(pair.card1)
    ids.add(pair.card2)
  }

  const card = byId[cardId]
  if (card) {
    if (card.Type === 23 && card.Equip) {
      for (const mid of card.Equip) ids.add(mid)
    } else if (card.Type < 20) {
      for (const eid of (monster2Equips[cardId] || [])) ids.add(eid)
      for (const [fieldIdStr, types] of Object.entries(FIELD_BOOSTS)) {
        if (types.includes(card.Type)) ids.add(Number(fieldIdStr))
      }
    }
  }

  return ids
}
