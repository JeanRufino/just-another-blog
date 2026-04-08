'use client'

interface NavDotsProps {
  total: number
  current: number
  onDotClick: (index: number) => void
}

interface IconProps {
  active: boolean
}

function NavIcon({ active, children }: IconProps & { children: React.ReactNode }) {
  const stroke = active ? 'url(#wave)' : '#9ca3af'
  const strokeWidth = active ? 4 : 2.2

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
    >
      <defs>
        <linearGradient id="wave" x1="-128" y1="-128" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#22c55e" />
          <stop offset="38%"  stopColor="#22c55e" />
          <stop offset="46%"  stopColor="#86efac" />
          <stop offset="50%"  stopColor="#f0fdf4" />
          <stop offset="54%"  stopColor="#86efac" />
          <stop offset="62%"  stopColor="#22c55e" />
          <stop offset="100%" stopColor="#22c55e" />
          {active && (
            <>
              <animate attributeName="x1" values="-128;-128;64"  keyTimes="0;0.72;1" dur="4s" repeatCount="indefinite" />
              <animate attributeName="y1" values="-128;-128;64"  keyTimes="0;0.72;1" dur="4s" repeatCount="indefinite" />
              <animate attributeName="x2" values="0;0;192"       keyTimes="0;0.72;1" dur="4s" repeatCount="indefinite" />
              <animate attributeName="y2" values="0;0;192"       keyTimes="0;0.72;1" dur="4s" repeatCount="indefinite" />
            </>
          )}
        </linearGradient>
      </defs>
      {children}
    </svg>
  )
}

function AIIcon({ active }: IconProps) {
  const stroke = active ? 'url(#wave)' : '#9ca3af'
  const sw = active ? 4 : 2.2
  const rsw = active ? 3.2 : 2
  return (
    <NavIcon active={active}>
      <rect x="2" y="2" width="60" height="60" rx="6"
        stroke={stroke} strokeWidth={rsw} fill="none"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <line x1="15" y1="47" x2="28" y2="17"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <line x1="28" y1="17" x2="41" y2="47"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <line x1="48" y1="17" x2="48" y2="47"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        style={{ transition: 'stroke-width 0.5s ease' }} />
    </NavIcon>
  )
}

function QuestionMarkIcon({ active }: IconProps) {
  const stroke = active ? 'url(#wave)' : '#9ca3af'
  const sw = active ? 4 : 2.2
  return (
    <NavIcon active={active}>
      <polygon points="2,2 62,2 32,62"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" fill="none"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <path d="M 24,22 Q 24,12 32,12 Q 40,12 40,20 Q 40,28 32,32 L 32,38"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none"
        style={{ transition: 'stroke-width 0.5s ease' }} />
    </NavIcon>
  )
}

function StackIcon({ active }: IconProps) {
  const stroke = active ? 'url(#wave)' : '#9ca3af'
  const sw = active ? 4 : 2.2
  return (
    <NavIcon active={active}>
      <polygon points="32,4 62,14 62,48 32,58 2,48 2,14"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" fill="none"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <polyline points="53,19 32,12 11,19 32,26"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" fill="none"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <line x1="53" y1="19" x2="53" y2="32"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <polyline points="11,32 32,39 53,32"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" fill="none"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <line x1="11" y1="32" x2="11" y2="43"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        style={{ transition: 'stroke-width 0.5s ease' }} />
      <polyline points="11,43 32,50 53,43"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" fill="none"
        style={{ transition: 'stroke-width 0.5s ease' }} />
    </NavIcon>
  )
}

const ICONS = [AIIcon, QuestionMarkIcon, StackIcon]

export default function NavDots({ total, current, onDotClick }: NavDotsProps) {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current
        const Icon = ICONS[i]

        return (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
            style={{ opacity: active ? 1 : undefined }}
            aria-label={`Ir para seção ${i + 1}`}
          >
            {Icon
              ? <Icon active={active} />
              : (
                <span className={`block w-2.5 h-2.5 rounded-full border border-white/40 transition-all duration-300
                  ${active ? 'bg-white scale-125 border-white' : 'bg-white/20'}`}
                />
              )
            }
          </button>
        )
      })}
    </nav>
  )
}
