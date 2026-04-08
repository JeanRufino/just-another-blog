'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Usuario = {
  id: string
  nome: string
  email: string
}

type Reserva = {
  id: string
  reservado_por: { nome: string; email: string } | null
} | null

type Presente = {
  id: string
  nome: string
  descricao: string | null
  loja: string | null
  url: string
  imagem_url: string | null
  preco: string | null
  reservado: boolean
  reserva: Reserva
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function ChaDePanela() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [presentes, setPresentes] = useState<Presente[]>([])
  const [ogImages, setOgImages] = useState<Record<string, string>>({})
  const [loadingPresentes, setLoadingPresentes] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(20)
  const [ordenacao, setOrdenacao] = useState<'preco-asc' | 'preco-desc' | ''>('')
  const [mostrarReservados, setMostrarReservados] = useState(true)

  const presentesFiltrados = (() => {
    let list = mostrarReservados ? presentes : presentes.filter((p) => !p.reservado)
    if (ordenacao) {
      list = [...list].sort((a, b) => {
        const pa = a.preco ? parseFloat(a.preco.replace(',', '.')) : null
        const pb = b.preco ? parseFloat(b.preco.replace(',', '.')) : null
        if (pa === null && pb === null) return 0
        if (pa === null) return 1
        if (pb === null) return -1
        return ordenacao === 'preco-asc' ? pa - pb : pb - pa
      })
    }
    return list
  })()

  // Login form
  const [loginNome, setLoginNome] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginNovo, setLoginNovo] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Modal
  const [modalPresenteId, setModalPresenteId] = useState<string | null>(null)
  const [modalLoginNome, setModalLoginNome] = useState('')
  const [modalLoginEmail, setModalLoginEmail] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalMsg, setModalMsg] = useState('')

  const modalPresente = presentes.find((p) => p.id === modalPresenteId) ?? null

  // Meus presentes (dropdown header)
  const [showMeusPresentes, setShowMeusPresentes] = useState(false)

  // Mensagem
  const [msgTexto, setMsgTexto] = useState('')
  const [msgNome, setMsgNome] = useState('')
  const [msgEmail, setMsgEmail] = useState('')
  const [msgLoading, setMsgLoading] = useState(false)
  const [msgFeedback, setMsgFeedback] = useState('')
  const [pixCopiado, setPixCopiado] = useState(false)

  // Carrega usuário do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cha_usuario')
    if (stored) {
      try {
        setUsuario(JSON.parse(stored))
      } catch {}
    }
  }, [])

  // Carrega presentes
  useEffect(() => {
    const controller = new AbortController()
    fetchPresentes(controller.signal)
    return () => controller.abort()
  }, [])

  async function fetchPresentes(signal?: AbortSignal) {
    setLoadingPresentes(true)
    const res = await fetch('/api/cha-de-panela/presentes', { signal })
    const json = await res.json()
    setPresentes(json.presentes ?? [])
    setLoadingPresentes(false)

    // Popula imagens e preços já cacheados no banco
    const lista: Presente[] = json.presentes ?? []
    const semImagem: Presente[] = []

    for (const p of lista) {
      if (p.imagem_url) setOgImages((prev) => ({ ...prev, [p.id]: p.imagem_url! }))
      if (!p.imagem_url) semImagem.push(p)
    }

    // Busca OG apenas para quem ainda não tem imagem cacheada
    const CONCURRENCY = 4

    async function fetchOg(p: Presente) {
      if (signal?.aborted) return
      try {
        const ogRes = await fetch(`/api/cha-de-panela/og?id=${p.id}&url=${encodeURIComponent(p.url)}`, { signal })
        const ogJson = await ogRes.json()
        if (ogJson.success) {
          if (ogJson.image) setOgImages((prev) => ({ ...prev, [p.id]: ogJson.image }))
        }
      } catch {}
    }

    for (let i = 0; i < semImagem.length; i += CONCURRENCY) {
      if (signal?.aborted) break
      await Promise.all(semImagem.slice(i, i + CONCURRENCY).map(fetchOg))
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/cha-de-panela/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, nome: loginNovo ? loginNome : undefined }),
      })
      const json = await res.json()
      if (!res.ok) {
        setLoginError(json.error ?? 'Erro ao fazer login')
      } else if (json.novo) {
        // Usuário não existe ainda — pede o nome
        setLoginNovo(true)
      } else {
        localStorage.setItem('cha_usuario', JSON.stringify(json.usuario))
        setUsuario(json.usuario)
        setLoginNome('')
        setLoginEmail('')
        setLoginNovo(false)
      }
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('cha_usuario')
    setUsuario(null)
  }

  async function handleReservar(presente: Presente, usuarioAtual: Usuario) {
    setModalLoading(true)
    setModalMsg('')
    try {
      const res = await fetch('/api/cha-de-panela/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presente_id: presente.id, usuario_id: usuarioAtual.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setModalMsg(json.error ?? 'Erro ao reservar')
      } else {
        setModalMsg('Presente reservado com sucesso! Obrigada!')
        setPresentes((prev) => prev.map((p) =>
          p.id === presente.id ? { ...p, reservado: true, reserva: { id: json.reserva?.id ?? '', reservado_por: { nome: usuarioAtual.nome, email: usuarioAtual.email } } } : p
        ))
      }
    } finally {
      setModalLoading(false)
    }
  }

  async function handleModalComLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!modalPresente) return
    setModalLoading(true)
    setModalMsg('')
    try {
      // Login primeiro
      const loginRes = await fetch('/api/cha-de-panela/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: modalLoginNome, email: modalLoginEmail }),
      })
      const loginJson = await loginRes.json()
      if (!loginRes.ok) {
        setModalMsg(loginJson.error ?? 'Erro ao identificar usuário')
        setModalLoading(false)
        return
      }
      const novoUsuario = loginJson.usuario
      localStorage.setItem('cha_usuario', JSON.stringify(novoUsuario))
      setUsuario(novoUsuario)

      // Depois reserva
      await handleReservar(modalPresente, novoUsuario)
    } finally {
      setModalLoading(false)
    }
  }

  async function handleCancelarReserva(presente: Presente) {
    setModalLoading(true)
    setModalMsg('')
    try {
      const res = await fetch('/api/cha-de-panela/reservar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presente_id: presente.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setModalMsg(json.error ?? 'Erro ao cancelar reserva')
      } else {
        setModalMsg('Reserva cancelada.')
        setPresentes((prev) => prev.map((p) =>
          p.id === presente.id ? { ...p, reservado: false, reserva: null } : p
        ))
      }
    } finally {
      setModalLoading(false)
    }
  }

  async function handleMensagem(e: React.FormEvent) {
    e.preventDefault()
    setMsgLoading(true)
    setMsgFeedback('')
    try {
      const body = usuario
        ? { nome: usuario.nome, email: usuario.email, mensagem: msgTexto, usuario_id: usuario.id }
        : { nome: msgNome, email: msgEmail, mensagem: msgTexto }

      const res = await fetch('/api/cha-de-panela/mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        setMsgFeedback(json.error ?? 'Erro ao enviar mensagem')
      } else {
        setMsgFeedback('Mensagem enviada com sucesso!')
        setMsgTexto('')
        setMsgNome('')
        setMsgEmail('')
      }
    } finally {
      setMsgLoading(false)
    }
  }

  return (
    <div className="paper min-h-screen text-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-end px-4 py-3 border-b gap-3 bg-[#fef7f8]">
        {usuario ? (
          <>
            <span className="text-sm text-gray-600 truncate min-w-0 hidden sm:inline">{usuario.nome}</span>
            <span className="text-gray-400 hidden sm:inline">·</span>

            {/* Meus presentes */}
            {(() => {
              const meusPresentes = presentes.filter(
                (p) => p.reserva?.reservado_por?.email === usuario.email
              )
              return (
                <div className="relative">
                  <button
                    onClick={() => setShowMeusPresentes((v) => !v)}
                    className="text-sm text-gray-600 hover:text-gray-900 shrink-0"
                  >
                    Meus presentes{meusPresentes.length > 0 ? ` (${meusPresentes.length})` : ''}
                  </button>
                  {showMeusPresentes && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMeusPresentes(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-72 max-h-80 overflow-y-auto z-50">
                        <div className="p-3 space-y-2">
                          {meusPresentes.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Você não selecionou nenhum presente ainda.</p>
                          ) : meusPresentes.map((p) => (
                            <div key={p.id} className="flex items-start justify-between gap-2">
                              <span className="text-sm text-gray-700 line-clamp-2 flex-1">{p.nome}</span>
                              <button
                                onClick={() => {
                                  setModalPresenteId(p.id)
                                  setModalMsg('')
                                  setModalLoginNome('')
                                  setModalLoginEmail('')
                                  setShowMeusPresentes(false)
                                }}
                                className="text-xs text-gray-400 hover:text-gray-700 shrink-0 mt-0.5"
                              >
                                ver
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })()}

            {usuario.email === ADMIN_EMAIL && (
              <>
                <span className="text-gray-400">·</span>
                <Link href="/cha-de-panela/admin" className="text-gray-600 hover:text-gray-900 shrink-0" title="Admin">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/gear.svg" alt="Admin" width={18} height={18} style={{ filter: 'brightness(0) saturate(100%) invert(40%)' }} />
                </Link>
              </>
            )}
            <span className="text-gray-400">·</span>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900 shrink-0">
              Sair
            </button>
          </>
        ) : (
          <form onSubmit={handleLogin} className="flex items-center gap-2 flex-wrap justify-end">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={loginEmail}
              onChange={(e) => { setLoginEmail(e.target.value); setLoginNovo(false) }}
              required
              className="border rounded px-2 py-1 text-sm w-44"
            />
            {loginNovo && (
              <input
                type="text"
                placeholder="Seu nome"
                value={loginNome}
                onChange={(e) => setLoginNome(e.target.value)}
                required
                autoFocus
                className="border rounded px-2 py-1 text-sm w-36"
              />
            )}
            {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="text-sm bg-gray-800 text-white rounded px-3 py-1 disabled:opacity-50 shrink-0"
            >
              {loginLoading ? '...' : loginNovo ? 'Confirmar' : 'Entrar'}
            </button>
          </form>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 space-y-8 max-[525px]:pt-14 min-[526px]:max-[1023px]:pt-16 lg:pt-20">
        {/* Seção de topo */}
        <section className="space-y-6">
          <div>
            {/* Alianças */}
            <div className="flex justify-center max-[525px]:mb-0 min-[526px]:max-[1023px]:mb-1 lg:mb-6 max-[525px]:scale-[0.65] min-[526px]:max-[1023px]:scale-[0.82] lg:scale-100 origin-center">
              <svg width="180" height="125" viewBox="0 0 180 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <clipPath id="ring-a-top">
                    <rect x="0" y="0" width="180" height="63"/>
                  </clipPath>
                  {/* Máscara: só o filete claro central de cada anel */}
                  <mask id="rings-mask">
                    <circle cx="65" cy="62" r="40" fill="none" stroke="white" strokeWidth="5"/>
                    <circle cx="115" cy="62" r="40" fill="none" stroke="white" strokeWidth="5"/>
                  </mask>
                  {/* Gradiente do brilho */}
                  <linearGradient id="rings-shimmer" x1="0" y1="0" x2="1" y2="0.25">
                    <stop offset="0%"   stopColor="white" stopOpacity="0"/>
                    <stop offset="38%"  stopColor="white" stopOpacity="0"/>
                    <stop offset="46%"  stopColor="#fffce0" stopOpacity="0.55"/>
                    <stop offset="50%"  stopColor="white"  stopOpacity="0.92"/>
                    <stop offset="54%"  stopColor="#fffce0" stopOpacity="0.55"/>
                    <stop offset="62%"  stopColor="white" stopOpacity="0"/>
                    <stop offset="100%" stopColor="white" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Ring A back */}
                <circle cx="65" cy="62" r="40" fill="none" stroke="#5A3B00" strokeWidth="18"/>
                <circle cx="65" cy="62" r="40" fill="none" stroke="#C9960C" strokeWidth="12"/>
                <circle cx="65" cy="62" r="40" fill="none" stroke="#F5D878" strokeWidth="4"/>
                {/* Ring B full */}
                <circle cx="115" cy="62" r="40" fill="none" stroke="#5A3B00" strokeWidth="18"/>
                <circle cx="115" cy="62" r="40" fill="none" stroke="#C9960C" strokeWidth="12"/>
                <circle cx="115" cy="62" r="40" fill="none" stroke="#F5D878" strokeWidth="4"/>
                {/* Ring A top arc (frente no cruzamento) */}
                <g clipPath="url(#ring-a-top)">
                  <circle cx="65" cy="62" r="40" fill="none" stroke="#5A3B00" strokeWidth="18"/>
                  <circle cx="65" cy="62" r="40" fill="none" stroke="#C9960C" strokeWidth="12"/>
                  <circle cx="65" cy="62" r="40" fill="none" stroke="#F5D878" strokeWidth="4"/>
                </g>

                {/* Brilho: varre da direita para a esquerda, mascarado aos traços */}
                <g mask="url(#rings-mask)">
                  <rect x="0" y="0" width="180" height="125" fill="url(#rings-shimmer)">
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="180 0;180 0;-180 0"
                      keyTimes="0;0.72;1"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </g>
              </svg>
            </div>

            {/* Texto acima */}
            <div className="mb-4 text-center">
              <p className="text-lg font-semibold">Oie! Bem-vindos à nossa lista de Chá de Panela \o/</p>
              <p className="text-gray-600 mt-1">Nossa história é feita de amor, tempero e comida boa e você faz parte dessa cozinha! &lt;3</p>
            </div>

            {/* Fotos + coração — mobile/tablet */}
            <div className="flex lg:hidden items-center justify-center mb-4 gap-3 min-[526px]:gap-6">
              {/* Fotos Jean */}
              <div className="relative shrink-0 rotate-[-6deg] z-10 w-[88px] h-[118px] min-[526px]:w-[116px] min-[526px]:h-[154px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/alfredo_jean.webp" alt="" className="photo-a absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/jean.JPG" alt="" className="photo-b absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
              </div>
              {/* Coração — escalado via wrapper */}
              <div className="relative flex items-center justify-center shrink-0 scale-[0.65] min-[526px]:scale-[0.82] origin-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hearts-cloud.svg" alt="" width={280} height={200} className="absolute pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/heart-deco.svg" alt="" width={70} height={100} style={{ transform: 'rotate(-60deg)', marginRight: '-44px', marginTop: '80px' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/heart.svg" alt="" width={128} height={128} className="relative" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/heart-deco.svg" alt="" width={70} height={100} style={{ transform: 'scaleX(-1) rotate(-60deg)', marginLeft: '-44px', marginTop: '80px' }} />
              </div>
              {/* Fotos Bia */}
              <div className="relative shrink-0 rotate-[6deg] z-10 w-[88px] h-[118px] min-[526px]:w-[116px] min-[526px]:h-[154px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/bia.jpeg" alt="" className="photo-a absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/colette_bia.webp" alt="" className="photo-b absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
              </div>
            </div>

            {/* Fotos + coração — desktop (layout original) */}
            <div className="hidden lg:flex relative items-center justify-center mb-4">
              <div className="absolute left-2 -top-10 z-10 rotate-[-6deg]" style={{ width: 144, height: 192 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/alfredo_jean.webp" alt="" className="photo-a absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/jean.JPG" alt="" className="photo-b absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
              </div>
              <div className="absolute right-2 -top-10 z-10 rotate-[6deg]" style={{ width: 144, height: 192 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/bia.jpeg" alt="" className="photo-a absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ygqwnveaaimzipotjvkq.supabase.co/storage/v1/object/public/cha-de-panela/colette_bia.webp" alt="" className="photo-b absolute inset-0 w-full h-full object-cover rounded-lg shadow-md" />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hearts-cloud.svg" alt="" width={280} height={200} className="absolute pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/heart-deco.svg" alt="" width={70} height={100} style={{ transform: 'rotate(-60deg)', marginRight: '-44px', marginTop: '80px' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/heart.svg" alt="" width={128} height={128} className="relative" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/heart-deco.svg" alt="" width={70} height={100} style={{ transform: 'scaleX(-1) rotate(-60deg)', marginLeft: '-44px', marginTop: '80px' }} />
            </div>

            {/* Banner full width — escapa do padding do main */}
            <div className="flex flex-col text-center" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
              <div className="w-full py-1" style={{ background: '#ca9f9f' }} />
              <div className="w-full py-1" style={{ background: '#dfacb3' }} />
              <div className="w-full py-5 flex flex-col items-center justify-center gap-1" style={{ background: '#f9ccd3' }}>
                <p className="text-rose-900 font-medium px-4">Salão de festas — Av. dos Mananciais, 1501, Taquara.</p>
                <p className="text-rose-900 text-lg font-semibold">17 de maio de 2026</p>
                <p className="text-rose-800 text-sm">13:00</p>
              </div>
              <div className="w-full py-1" style={{ background: '#dfacb3' }} />
              <div className="w-full py-1" style={{ background: '#ca9f9f' }} />
            </div>
          </div>

          {!usuario && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-sm">
              <h2 className="font-semibold">Identifique-se para escolher presentes! 🎁 </h2>
              <input
                type="email"
                placeholder="Seu e-mail"
                value={loginEmail}
                onChange={(e) => { setLoginEmail(e.target.value); setLoginNovo(false) }}
                required
                className="border rounded px-3 py-2 text-sm"
              />
              {loginNovo && (
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={loginNome}
                  onChange={(e) => setLoginNome(e.target.value)}
                  required
                  autoFocus
                  className="border rounded px-3 py-2 text-sm"
                />
              )}
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button
                type="submit"
                disabled={loginLoading}
                className="bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {loginLoading ? '...' : loginNovo ? 'Confirmar' : 'Entrar'}
              </button>
            </form>
          )}
        </section>

        {/* Grade de presentes */}
        <section className="relative">
          <div className="relative z-10 flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Lista de Presentes</h2>
            <div className="flex items-center gap-2 flex-wrap w-full">
              {(['', 'preco-asc', 'preco-desc'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => { setOrdenacao(o); setPagina(1) }}
                  className={`text-xs border rounded px-2 py-1 transition-all duration-200 ${ordenacao === o ? 'bg-gray-700 text-white border-gray-700' : 'bg-white/90 border-gray-300 hover:border-gray-500'}`}
                >
                  {o === '' ? 'Padrão' : o === 'preco-asc' ? '↑ Preço' : '↓ Preço'}
                </button>
              ))}
              <button
                onClick={() => { setMostrarReservados((v) => !v); setPagina(1) }}
                className={`text-xs border rounded px-2 py-1 transition-all duration-200 ${!mostrarReservados ? 'bg-gray-700 text-white border-gray-700' : 'bg-white/90 border-gray-300 hover:border-gray-500'}`}
              >
                {mostrarReservados ? 'Ocultar escolhidos' : 'Ver escolhidos'}
              </button>
            </div>
          </div>
          {loadingPresentes ? (
            <p className="text-gray-400 relative z-10">Carregando...</p>
          ) : (
            <div className="relative z-10 space-y-6">
              {/* Controles de paginação — topo */}
              {(() => {
                const total = Math.ceil(presentesFiltrados.length / porPagina)
                const inicio = Math.min(Math.max(1, pagina - 2), Math.max(1, total - 4))
                const fim = Math.min(total, inicio + 4)
                const paginas = Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i)
                const btnBase = 'px-2 py-1 text-xs border rounded transition-all duration-300 bg-white/90'
                const btnInativo = `${btnBase} border-gray-300 hover:border-gray-500`
                const btnAtivo = `${btnBase} page-active`
                const btnDisabled = `${btnBase} border-gray-200 opacity-30 cursor-not-allowed`
                return (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="shrink-0">Itens por página:</span>
                      <div className="flex gap-1">
                        {[10, 20, 40, 100].map((n) => (
                          <button key={n} onClick={() => { setPorPagina(n); setPagina(1) }} className={n === porPagina ? btnAtivo : btnInativo}>{n}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button onClick={() => setPagina(1)} disabled={pagina === 1} className={pagina === 1 ? btnDisabled : btnInativo}>&laquo;</button>
                      <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} className={pagina === 1 ? btnDisabled : btnInativo}>&lsaquo;</button>
                      {paginas.map((n) => (
                        <button key={n} onClick={() => setPagina(n)} className={n === pagina ? btnAtivo : btnInativo}>{n}</button>
                      ))}
                      <button onClick={() => setPagina((p) => Math.min(total, p + 1))} disabled={pagina === total} className={pagina === total ? btnDisabled : btnInativo}>&rsaquo;</button>
                      <button onClick={() => setPagina(total)} disabled={pagina === total} className={pagina === total ? btnDisabled : btnInativo}>&raquo;</button>
                    </div>
                  </div>
                )
              })()}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {presentesFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setModalPresenteId(p.id)
                      setModalMsg('')
                      setModalLoginNome('')
                      setModalLoginEmail('')
                    }}
                    className="border border-gray-300 rounded-lg overflow-hidden text-left transition-all duration-200 hover:-translate-y-1 hover:outline hover:outline-2 hover:outline-rose-200 cursor-pointer"
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {ogImages[p.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ogImages[p.id]}
                          alt={p.nome}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-4xl">🎁</span>
                      )}
                      {p.reservado ? (
                        <span className="absolute top-2 right-2 text-xs font-medium bg-red-100 text-red-600 rounded px-2 py-0.5">
                          Já escolhido
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 text-xs font-medium bg-green-100 text-green-700 rounded px-2 py-0.5">
                          Disponível
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50">
                      <p className="text-sm font-medium line-clamp-2 h-10">{p.nome}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.loja ?? '\u00a0'}</p>
                      <p className="text-xs text-gray-700 mt-1">{p.preco ? `R$ ${p.preco}` : 'Sem preço'}</p>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          )}
        </section>

        {/* Separator */}
        <hr className="border-gray-300" />

        {/* Seção — Pix */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Outra forma de contribuir</h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/qrcode-pix.png" alt="QR Code Pix" width={160} height={160} className="rounded-lg border border-gray-200 shrink-0" />
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Se não achou o presente ideal ou não vai poder ir no dia ou por qualquer outro motivo você quer nos presentear com um PIX <s>pra eu comprar meu monitor curvo de 49&quot;</s> <s>pra eu comprar minha batedeira KitchenAid</s> pra gente comprar comida pros nossos salsichas, use o QR code <span className="max-[639px]:hidden">ao lado</span><span className="min-[640px]:hidden">acima</span> ou o código abaixo!</p>
              <div>
                <p className="text-xs text-gray-400 mb-1">Pix copia e cola</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 rounded px-2 py-1.5 break-all flex-1 leading-relaxed">
                    00020126330014BR.GOV.BCB.PIX0111130801977715204000053039865802BR5901N6001C62160512PGTCHAPANELA630469D8
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('00020126330014BR.GOV.BCB.PIX0111130801977715204000053039865802BR5901N6001C62160512PGTCHAPANELA630469D8')
                      setPixCopiado(true)
                      setTimeout(() => setPixCopiado(false), 2000)
                    }}
                    className={`shrink-0 text-xs border rounded px-2 py-1.5 transition-all duration-300 ${pixCopiado ? 'border-green-400 text-green-600' : 'border-gray-300 hover:border-gray-500'}`}
                  >
                    {pixCopiado ? '✓ Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-300" />

        {/* Seção — Mensagem */}
        <section className="relative space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hearts-cloud.svg" alt="" width={280} height={200} className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0" style={{ opacity: 0.22 }} />
          <h2 className="text-xl font-semibold relative z-10">Deixe uma mensagem de carinho!</h2>
          <form onSubmit={handleMensagem} className="flex flex-col gap-3 max-w-lg relative z-10">
              {!usuario && (
                <>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={msgNome}
                    onChange={(e) => setMsgNome(e.target.value)}
                    required
                    className="border rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    value={msgEmail}
                    onChange={(e) => setMsgEmail(e.target.value)}
                    required
                    className="border rounded px-3 py-2 text-sm"
                  />
                </>
              )}
              {usuario && (
                <p className="text-sm text-gray-500">
                  Enviando como <strong>{usuario.nome}</strong>
                </p>
              )}
              <textarea
                placeholder="Sua mensagem..."
                value={msgTexto}
                onChange={(e) => setMsgTexto(e.target.value)}
                required
                rows={4}
                className="border rounded px-3 py-2 text-sm resize-none"
              />
              {msgFeedback && (
                <p className={`text-sm ${msgFeedback.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>
                  {msgFeedback}
                </p>
              )}
              <button
                type="submit"
                disabled={msgLoading}
                className="bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50 self-start"
              >
                {msgLoading ? 'Enviando...' : 'Enviar mensagem ❤️'}
              </button>
            </form>
        </section>

        <footer className="pt-6 pb-2 text-center text-xs text-gray-400">
          Criado por <a href="https://jeanrufino.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Jean Rufino</a>
          {' · © '}{new Date().getFullYear()}{' · Todos os direitos reservados'}
        </footer>
      </main>

      {/* Modal de presente */}
      {modalPresente && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalPresenteId(null)
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start pb-4">
              <h3 className="font-semibold text-lg">{modalPresente.nome}</h3>
              <button
                onClick={() => setModalPresenteId(null)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {ogImages[modalPresente.id] && (
              <a href={modalPresente.url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogImages[modalPresente.id]}
                  alt={modalPresente.nome}
                  className="w-full h-72 object-cover rounded-lg cursor-pointer"
                />
              </a>
            )}

            {modalPresente.descricao && (
              <p className="text-sm text-gray-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{modalPresente.descricao}</p>
            )}

            {modalPresente.loja && (
              <p className="text-sm text-gray-500">Loja: {modalPresente.loja}</p>
            )}

            {modalPresente.preco && (
              <p className="text-base font-semibold">R$ {modalPresente.preco}</p>
            )}

            <a
              href={modalPresente.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline block"
            >
              Ver produto →
            </a>

            {modalMsg && (
              <p className={`text-sm ${modalMsg.includes('sucesso') || modalMsg.includes('cancelada') ? 'text-green-600' : 'text-red-500'}`}>
                {modalMsg}
              </p>
            )}

            {(() => {
              const reservadoPorMim =
                modalPresente.reservado &&
                usuario &&
                modalPresente.reserva?.reservado_por?.email === usuario.email

              const reservadoPorOutro =
                modalPresente.reservado && !reservadoPorMim

              if (reservadoPorMim) {
                return (
                  <div className="space-y-2">
                    <p className="text-sm text-orange-600">Você escolheu este presente.</p>
                    <button
                      onClick={() => handleCancelarReserva(modalPresente)}
                      disabled={modalLoading}
                      className="w-full border border-red-300 text-red-500 rounded px-4 py-2 text-sm hover:bg-red-50 disabled:opacity-50"
                    >
                      {modalLoading ? 'Cancelando...' : 'Cancelar escolha'}
                    </button>
                  </div>
                )
              }

              if (reservadoPorOutro) {
                return (
                  <p className="text-sm text-gray-400 italic">
                    Este presente já foi escolhido por outra pessoa.
                  </p>
                )
              }

              if (usuario) {
                return (
                  <button
                    onClick={() => handleReservar(modalPresente, usuario)}
                    disabled={modalLoading}
                    className="w-full bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {modalLoading ? 'Reservando...' : 'Quero dar esse presente'}
                  </button>
                )
              }

              return (
                <form onSubmit={handleModalComLogin} className="space-y-3">
                  <p className="text-sm text-gray-600">Informe seus dados para confirmar:</p>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={modalLoginNome}
                    onChange={(e) => setModalLoginNome(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    value={modalLoginEmail}
                    onChange={(e) => setModalLoginEmail(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {modalLoading ? 'Confirmando...' : 'Quero dar esse presente'}
                  </button>
                </form>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
