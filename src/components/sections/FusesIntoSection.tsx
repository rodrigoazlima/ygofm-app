'use client'

import { CardThumb } from '../CardThumb'
import { CardLabel } from '../CardLabel'
import { byId } from '@/lib/dataLoader'
import { atkColor } from '@/lib/constants'

interface Props {
  fusesInto: Map<number, number[]>
  onSelect: (id: number) => void
}

export function FusesIntoSection({ fusesInto, onSelect }: Props) {
  if (fusesInto.size === 0) return null

  const sorted = [...fusesInto.entries()].sort((a, b) => {
    const ra = byId[a[0]]?.Attack ?? 0
    const rb = byId[b[0]]?.Attack ?? 0
    return rb - ra
  })

  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-2 px-4">
        ⚔ Fuses Into
        <span className="ml-2 text-[#333]">{fusesInto.size}</span>
      </h3>
      <div className="space-y-1">
        {sorted.map(([resultId, partners]) => {
          const result = byId[resultId]
          if (!result) return null
          return (
            <div
              key={resultId}
              className="flex items-center gap-2 px-4 py-1 hover:bg-[#0e0e1a] cursor-pointer group"
            >
              <CardThumb card={result} size={56} onClick={() => onSelect(resultId)} />
              <div className="flex-1 min-w-0">
                <CardLabel
                  card={result}
                  iconSize={13}
                  className="text-sm text-[#ddd] hover:text-white"
                  onClick={() => onSelect(resultId)}
                />
                {result.Type < 20 && (
                  <div className="text-xs">
                    <span style={{ color: atkColor(result.Attack) }}>{result.Attack} ATK</span>
                    <span className="text-[#444] mx-1">/</span>
                    <span className="text-[#555]">{result.Defense} DEF</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {partners.slice(0, 6).map(pid => {
                  const p = byId[pid]
                  return p ? (
                    <CardThumb key={pid} card={p} size={40} onClick={() => onSelect(pid)} />
                  ) : null
                })}
                {partners.length > 6 && (
                  <span className="text-xs text-[#444] self-center">+{partners.length - 6}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
