'use client'

import { useEffect, useRef, useState } from 'react'
import NavDots from './NavDots'

function AboutSection() {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function ping() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch {
      setResult('Erro ao conectar com a API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
      <h2 className="text-white text-5xl font-bold">About</h2>
      <p className="text-white/60 text-lg max-w-xl">Seção dois — em breve.</p>
      <button
        onClick={ping}
        disabled={loading}
        className="mt-4 px-6 py-2 border border-white/20 text-white/70 rounded hover:border-green-500 hover:text-green-400 transition-colors duration-200 text-sm disabled:opacity-40"
      >
        {loading ? 'Aguardando...' : 'Ping API'}
      </button>
      {result && (
        <pre className="text-green-400 text-xs bg-black/40 px-4 py-3 rounded border border-white/10">
          {result}
        </pre>
      )}
    </div>
  )
}

const sections = [
  {
    id: 'hero',
    content: (
      <div className="flex items-center justify-center h-full">
        <span className="text-white text-8xl font-bold select-none">&lt;/&gt;</span>
      </div>
    ),
    bg: 'bg-gradient-to-b from-black to-[#021a0a]',
  },
  {
    id: 'about',
    content: <AboutSection />,
    bg: 'bg-[#021a0a]',
  },
  {
    id: 'blog',
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <h2 className="text-white text-5xl font-bold tracking-widest uppercase">
          SCREAMING_SNAKE_CASE
        </h2>
        <p className="text-white/60 text-lg max-w-xl">Blog — em breve.</p>
      </div>
    ),
    bg: 'bg-gradient-to-b from-[#021a0a] to-black',
  },
]

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setCurrent(index)
          }
        }
      },
      { root: container, threshold: 0.6 },
    )

    const children = container.querySelectorAll('[data-index]')
    children.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const scrollTo = (index: number) => {
    const container = containerRef.current
    if (!container) return
    const target = container.querySelector(`[data-index="${index}"]`)
    target?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {sections.map((section, i) => (
          <section
            key={section.id}
            data-index={i}
            className={`h-screen w-full snap-start snap-always ${section.bg}`}
          >
            {section.content}
          </section>
        ))}
      </div>

      <NavDots total={sections.length} current={current} onDotClick={scrollTo} />
    </>
  )
}
