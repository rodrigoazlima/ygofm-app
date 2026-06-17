'use client'

import { useState } from 'react'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

interface Props {
  slug: string
  name: string
  size?: number
}

export function NpcImage({ slug, name, size = 36 }: Props) {
  const [idx, setIdx] = useState(0)
  const sources = [
    `${BASE_PATH}/images/npc/${slug}.png`,
    `https://www.yugiohfm.com/imgs/personagens/${slug}.png`,
  ]
  const rounded = 'rounded-full'
  const style = { width: size, height: size }

  if (idx >= sources.length) {
    return (
      <div
        className={`${rounded} bg-[#1a1a2e] flex items-center justify-center text-[#444] shrink-0`}
        style={{ ...style, fontSize: size * 0.22 }}
      >
        {name.slice(0, 2)}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[idx]}
      alt={name}
      width={size}
      height={size}
      onError={() => setIdx(i => i + 1)}
      className={`${rounded} object-cover bg-[#1a1a2e] shrink-0`}
      style={style}
    />
  )
}
