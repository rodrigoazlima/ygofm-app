import type { Card } from '@/lib/types'
import { TYPE_IMAGES, ATTR_IMAGES, TYPE_NAMES, ATTR_NAMES } from '@/lib/constants'

interface Props {
  card: Card
  iconSize?: number
  className?: string
  onClick?: () => void
}

export function CardLabel({ card, iconSize = 12, className = '', onClick }: Props) {
  const typeImg = TYPE_IMAGES[card.Type]
  const attrImg = card.Attribute != null && card.Attribute >= 0 ? ATTR_IMAGES[card.Attribute] : null
  const typeName = TYPE_NAMES[card.Type] || ''
  const attrName = card.Attribute != null ? ATTR_NAMES[card.Attribute] || '' : ''

  return (
    <span
      className={`inline-flex items-center gap-1 min-w-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {typeImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={typeImg}
          alt={typeName}
          title={typeName}
          width={iconSize}
          height={iconSize}
          style={{ width: iconSize, height: iconSize, objectFit: 'contain', flexShrink: 0 }}
        />
      )}
      <span className="truncate">{card.Name}</span>
      {attrImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attrImg}
          alt={attrName}
          title={attrName}
          width={iconSize}
          height={iconSize}
          style={{ width: iconSize, height: iconSize, objectFit: 'contain', flexShrink: 0 }}
        />
      )}
    </span>
  )
}
