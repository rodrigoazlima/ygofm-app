'use client'

import { CardThumb } from '../CardThumb'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES } from '@/lib/constants'

interface Props {
  compatibleSpells: number[]
  isEquip: boolean
  onSelect: (id: number) => void
}

export function CompatibleSpellsSection({ compatibleSpells, isEquip, onSelect }: Props) {
  if (compatibleSpells.length === 0) return null

  const label = isEquip ? '✦ Equips Onto' : '✦ Compatible Spells'

  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-2 px-4">
        {label}
        <span className="ml-2 text-[#333]">{compatibleSpells.length}</span>
      </h3>
      <div className="flex flex-wrap gap-2 px-4">
        {compatibleSpells.map(id => {
          const card = byId[id]
          if (!card) return null
          const typeName = TYPE_NAMES[card.Type] || ''
          return (
            <div
              key={id}
              className="flex flex-col items-center gap-1 cursor-pointer group"
              onClick={() => onSelect(id)}
            >
              <CardThumb card={card} size={52} />
              <span className="text-[10px] text-[#555] group-hover:text-[#888] text-center w-14 truncate leading-tight">
                {typeName === 'Equip' || typeName === 'Magic' ? card.Name : typeName}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
