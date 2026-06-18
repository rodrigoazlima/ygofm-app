import type { Card } from './games/fm/types'
import { THUMB_BASE, FULL_BASE, CODE_FIXES } from './games/fm/constants'
import { localImages, fandomImages } from './games/fm/dataLoader'

function getCode(card: Card): string {
  let code = card.CardCode || ''
  if (!code || code === '00000000') code = CODE_FIXES[card.Name] || ''
  return code
}

export function thumbUrl(card: Card): string {
  const k = getCode(card)
  return k ? `${THUMB_BASE}/${k}.jpg` : ''
}

export function fullUrl(card: Card): string {
  const k = getCode(card)
  return k ? `${FULL_BASE}/${k}.jpg` : ''
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function localUrl(card: Card): string {
  const path = localImages[card.Id] || fandomImages[card.Id] || ''
  return path ? `${BASE_PATH}${path}` : ''
}

// Returns the pre-generated 48×48 thumbnail, if a local image exists for this card
export function localThumbUrl(card: Card): string {
  if (!localUrl(card)) return ''
  return `${BASE_PATH}/images/thumbs/${card.Id}.jpg`
}

// Returns ordered fallback sources for thumbnails: local thumb → local full → CDN
export function thumbSources(card: Card): string[] {
  return [localThumbUrl(card), localUrl(card), thumbUrl(card)].filter(Boolean)
}

// Returns ordered fallback sources for large card display
export function fullSources(card: Card): string[] {
  const local = localUrl(card)
  const full = fullUrl(card)
  const thumb = thumbUrl(card)
  return [local, full, thumb].filter(Boolean)
}
