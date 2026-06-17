interface Props {
  compact: boolean
}

export function Logo({ compact }: Props) {
  if (compact) {
    return (
      <span
        className="font-bold text-lg leading-none shrink-0"
        style={{
          background: 'linear-gradient(90deg, #f5c842, #fff8dc, #d4a017)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: "'IBM Plex Sans', sans-serif",
          letterSpacing: '-0.5px',
        }}
      >
        Yu-Gi-Oh! FM &gt; Search
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center py-10 select-none">
      <svg width="680" height="90" viewBox="0 0 600 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gf" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5c842"/>
            <stop offset="45%" stopColor="#fff8dc"/>
            <stop offset="100%" stopColor="#d4a017"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <text
          x="300" y="85"
          textAnchor="middle"
          fontFamily="'IBM Plex Sans', sans-serif"
          fontWeight="800"
          fontSize="88"
          fill="url(#gf)"
          filter="url(#glow)"
          letterSpacing="-2"
        >
          Yu-Gi-Oh! Search
        </text>
      </svg>
      <p className="text-[#555] text-xs mt-1 tracking-widest uppercase">Forbidden Memories</p>
    </div>
  )
}
