import { CardThumb } from '../CardThumb'
import { byId } from '@/lib/dataLoader'
import { TYPE_NAMES, TYPE_IMAGES, atkColor } from '@/lib/constants'

export const CARD_W = 72
export const TILE_W = 290

interface SlotProps {
  id: number
  isResult?: boolean
  onSelect: (id: number) => void
}

export function CardSlot({ id, isResult, onSelect }: SlotProps) {
  const card = byId[id]
  if (!card) return <div style={{ width: CARD_W }} />
  const typeImg = TYPE_IMAGES[card.Type]
  const typeName = TYPE_NAMES[card.Type] || ''
  const isMonster = card.Type < 20

  return (
    <div
      style={{ width: CARD_W }}
      className="flex flex-col items-center gap-0.5 cursor-pointer group shrink-0"
      onClick={() => onSelect(id)}
    >
      <CardThumb card={card} size={isResult ? 48 : 44} />
      <div className="flex items-center gap-0.5 w-full overflow-hidden justify-center">
        {typeImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={typeImg} alt={typeName} title={typeName} width={9} height={9}
            style={{ width: 9, height: 9, objectFit: 'contain', flexShrink: 0 }} />
        )}
        <span
          className="text-[9px] text-[#777] group-hover:text-[#bbb] truncate leading-tight"
          style={{ maxWidth: CARD_W - 14 }}
        >
          {card.Name}
        </span>
      </div>
      {isMonster ? (
        <div className="text-[8px] text-center leading-tight">
          <span style={{ color: atkColor(card.Attack) }}>{card.Attack}</span>
          <span className="text-[#2a2a3a]">/</span>
          <span className="text-[#444]">{card.Defense}</span>
        </div>
      ) : (
        <div style={{ height: 12 }} />
      )}
    </div>
  )
}
