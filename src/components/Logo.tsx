import { GAMES, DEFAULT_GAME, getGame } from '@/lib/games'

interface Props {
  compact: boolean
  game?: string
  onGameChange?: (game: string) => void
  onClear?: () => void
}

export function Logo({ compact, game = DEFAULT_GAME, onGameChange, onClear }: Props) {
  const currentGame = getGame(game)

  if (compact) {
    return (
      <span
        onClick={onClear}
        className={`font-bold text-lg leading-none shrink-0 ${onClear ? 'cursor-pointer opacity-90 hover:opacity-100 transition-opacity' : ''}`}
        style={{
          background: 'linear-gradient(90deg, #f5c842, #fff8dc, #d4a017)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: "'IBM Plex Sans', sans-serif",
          letterSpacing: '-0.5px',
        }}
      >
        Yu-Gi-Oh! {currentGame.shortName} &gt; Search
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center py-8 select-none px-4">
      <svg width="100%" style={{ maxWidth: 700 }} viewBox="0 0 700 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gf" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
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
          x="350" y="85"
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

      <div className="flex gap-2 mt-4 overflow-x-auto pb-1 max-w-full px-1">
        {GAMES.map(g => {
          const isSelected = game === g.id
          return (
            <button
              key={g.id}
              onClick={() => g.available && onGameChange?.(g.id)}
              title={g.available ? g.name : `${g.name} — coming soon`}
              className={`flex-shrink-0 flex flex-col items-center gap-1 rounded p-1.5 transition-all border ${
                isSelected
                  ? 'border-[#f5c842]/50 bg-[#f5c842]/5'
                  : g.available
                    ? 'border-[#222] hover:border-[#444] cursor-pointer'
                    : 'border-[#111] cursor-not-allowed opacity-35'
              }`}
              style={{ width: 68 }}
            >
              {g.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.cover}
                  alt={g.name}
                  className={`w-12 h-[62px] object-cover rounded ${!g.available && !isSelected ? 'grayscale' : ''}`}
                />
              ) : (
                <div className="w-12 h-[62px] bg-[#111] border border-[#1a1a1a] rounded flex items-center justify-center text-[#444] text-[8px] text-center px-1 leading-tight">
                  {g.shortName}
                </div>
              )}
              <span className={`text-[8px] font-mono text-center leading-tight w-full truncate ${
                isSelected ? 'text-[#f5c842]' : 'text-[#555]'
              }`}>
                {g.shortName}
              </span>
              <span className="text-[7px] text-[#333] font-mono">{g.platform}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
