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
  loja: string | null
  url: string
  imagem_url: string | null
  reservado: boolean
  reserva: Reserva
}

const ADMIN_EMAIL = 'beatryzsrabelo@gmail.com'

export default function ChaDePanela() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [presentes, setPresentes] = useState<Presente[]>([])
  const [ogImages, setOgImages] = useState<Record<string, string>>({})
  const [ogPrices, setOgPrices] = useState<Record<string, string>>({})
  const [loadingPresentes, setLoadingPresentes] = useState(true)

  // Login form
  const [loginNome, setLoginNome] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Modal
  const [modalPresente, setModalPresente] = useState<Presente | null>(null)
  const [modalLoginNome, setModalLoginNome] = useState('')
  const [modalLoginEmail, setModalLoginEmail] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalMsg, setModalMsg] = useState('')

  // Mensagem
  const [msgTexto, setMsgTexto] = useState('')
  const [msgNome, setMsgNome] = useState('')
  const [msgEmail, setMsgEmail] = useState('')
  const [msgLoading, setMsgLoading] = useState(false)
  const [msgFeedback, setMsgFeedback] = useState('')

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
    fetchPresentes()
  }, [])

  async function fetchPresentes() {
    setLoadingPresentes(true)
    const res = await fetch('/api/cha-de-panela/presentes')
    const json = await res.json()
    setPresentes(json.presentes ?? [])
    setLoadingPresentes(false)

    // Busca OG images em paralelo
    const lista: Presente[] = json.presentes ?? []
    lista.forEach(async (p) => {
      if (p.imagem_url) {
        setOgImages((prev) => ({ ...prev, [p.id]: p.imagem_url! }))
        return
      }
      try {
        const ogRes = await fetch(`/api/cha-de-panela/og?url=${encodeURIComponent(p.url)}`)
        const ogJson = await ogRes.json()
        if (ogJson.success) {
          if (ogJson.image) setOgImages((prev) => ({ ...prev, [p.id]: ogJson.image }))
          if (ogJson.price) setOgPrices((prev) => ({ ...prev, [p.id]: ogJson.price }))
        }
      } catch {}
    })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/cha-de-panela/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: loginNome, email: loginEmail }),
      })
      const json = await res.json()
      if (!res.ok) {
        setLoginError(json.error ?? 'Erro ao fazer login')
      } else {
        localStorage.setItem('cha_usuario', JSON.stringify(json.usuario))
        setUsuario(json.usuario)
        setLoginNome('')
        setLoginEmail('')
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
        await fetchPresentes()
        setTimeout(() => setModalPresente(null), 2000)
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
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
          ← Jean Rufino
        </Link>
        <div className="flex items-center gap-4">
          {usuario ? (
            <>
              <span className="text-sm">
                {usuario.nome} · {usuario.email}
              </span>
              {usuario.email === ADMIN_EMAIL && (
                <Link href="/cha-de-panela/admin" className="text-gray-400 hover:text-gray-700" title="Admin">
                  ⚙️
                </Link>
              )}
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-700">
                Sair
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-400">Não identificado</span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">
        {/* Seção de topo */}
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Chá de Panela</h1>
            <p className="mt-2 text-gray-600">
              Bem-vindo à lista de presentes do nosso chá de panela! Escolha um presente para nos
              dar, basta se identificar e clicar no item desejado.
            </p>
          </div>

          {!usuario && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-sm">
              <h2 className="font-semibold">Identificar-se</h2>
              <input
                type="text"
                placeholder="Seu nome"
                value={loginNome}
                onChange={(e) => setLoginNome(e.target.value)}
                required
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="border rounded px-3 py-2 text-sm"
              />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button
                type="submit"
                disabled={loginLoading}
                className="bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}
        </section>

        {/* Grade de presentes */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Lista de Presentes</h2>
          {loadingPresentes ? (
            <p className="text-gray-400">Carregando...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presentes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (!p.reservado) {
                      setModalPresente(p)
                      setModalMsg('')
                      setModalLoginNome('')
                      setModalLoginEmail('')
                    }
                  }}
                  className={`border rounded-lg overflow-hidden text-left transition ${
                    p.reservado
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {ogImages[p.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ogImages[p.id]}
                        alt={p.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🎁</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-2">{p.nome}</p>
                    {p.loja && <p className="text-xs text-gray-400 mt-1">{p.loja}</p>}
                    {ogPrices[p.id] && (
                      <p className="text-xs text-gray-700 mt-1">R$ {ogPrices[p.id]}</p>
                    )}
                    {p.reservado && (
                      <p className="text-xs text-red-400 mt-1 font-medium">Indisponível</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Seção de mensagem */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Deixe uma mensagem</h2>
          <form onSubmit={handleMensagem} className="flex flex-col gap-3 max-w-lg">
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
              {msgLoading ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </form>
        </section>
      </main>

      {/* Modal de presente */}
      {modalPresente && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalPresente(null)
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{modalPresente.nome}</h3>
              <button
                onClick={() => setModalPresente(null)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {modalPresente.loja && (
              <p className="text-sm text-gray-500">Loja: {modalPresente.loja}</p>
            )}

            {ogPrices[modalPresente.id] && (
              <p className="text-base font-semibold">R$ {ogPrices[modalPresente.id]}</p>
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
              <p className={`text-sm ${modalMsg.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>
                {modalMsg}
              </p>
            )}

            {usuario ? (
              <button
                onClick={() => handleReservar(modalPresente, usuario)}
                disabled={modalLoading}
                className="w-full bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {modalLoading ? 'Reservando...' : 'Quero dar esse presente'}
              </button>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
