'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Presente = {
  id: string
  nome: string
  loja: string | null
  url: string
  imagem_url: string | null
  preco: string | null
  reservado: boolean
}

type Form = {
  id?: string
  nome: string
  loja: string
  url: string
  imagem_url: string
  preco: string
}

const FORM_VAZIO: Form = { nome: '', loja: '', url: '', imagem_url: '', preco: '' }
const POR_PAGINA = 20

function formatPreco(digits: string): string {
  if (!digits) return ''
  const d = digits.replace(/\D/g, '').slice(0, 7) // max 99999,99
  const padded = d.padStart(3, '0')
  const intPart = padded.slice(0, -2).replace(/^0+/, '') || '0'
  const decPart = padded.slice(-2)
  return `${intPart},${decPart}`
}

export default function AdminChaDePanela() {
  const router = useRouter()
  const [presentes, setPresentes] = useState<Presente[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Form>(FORM_VAZIO)
  const [editando, setEditando] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [pagina, setPagina] = useState(1)
  const [filtro, setFiltro] = useState('')
  const [ordenacao, setOrdenacao] = useState<'preco-asc' | 'preco-desc' | ''>('')
  const [mostrarReservados, setMostrarReservados] = useState(true)

  const presentesFiltrados = filtro.trim()
    ? presentes.filter((p) => p.nome.toLowerCase().includes(filtro.toLowerCase()))
    : presentes

  const presentesVisiveis = (() => {
    let list = mostrarReservados ? presentesFiltrados : presentesFiltrados.filter((p) => !p.reservado)
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

  useEffect(() => {
    fetchPresentes()
  }, [])

  async function fetchPresentes() {
    setLoading(true)
    const res = await fetch('/api/cha-de-panela/admin/presentes')
    if (res.status === 401) {
      router.replace('/cha-de-panela/admin/login')
      return
    }
    const json = await res.json()
    setPresentes(json.presentes ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback('')

    const method = editando ? 'PUT' : 'POST'
    const body = editando
      ? { id: form.id, nome: form.nome, loja: form.loja || null, url: form.url, imagem_url: form.imagem_url || null, preco: form.preco || null }
      : { nome: form.nome, loja: form.loja || null, url: form.url, imagem_url: form.imagem_url || null, preco: form.preco || null }

    const res = await fetch('/api/cha-de-panela/admin/presentes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()

    if (!res.ok) {
      setFeedback(json.error ?? 'Erro')
    } else {
      setFeedback(editando ? 'Presente atualizado!' : 'Presente adicionado!')
      setForm(FORM_VAZIO)
      setEditando(false)
      setPagina(1)
      fetchPresentes()
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Confirmar remoção deste presente?')) return
    const res = await fetch('/api/cha-de-panela/admin/presentes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const json = await res.json()
    if (!res.ok) {
      setFeedback(json.error ?? 'Erro ao deletar')
    } else {
      setFeedback('Presente removido.')
      fetchPresentes()
    }
  }

  function handleEditar(p: Presente) {
    setPagina(1)
    setForm({
      id: p.id,
      nome: p.nome,
      loja: p.loja ?? '',
      url: p.url,
      imagem_url: p.imagem_url ?? '',
      preco: p.preco ? formatPreco(p.preco.replace(/\D/g, '')) : '',
    })
    setEditando(true)
    setFeedback('')
  }

  function handlePrecoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    setForm({ ...form, preco: formatPreco(digits) })
  }

  function handleCancelar() {
    setForm(FORM_VAZIO)
    setEditando(false)
    setFeedback('')
  }

  async function handleLogout() {
    await fetch('/api/cha-de-panela/admin/logout', { method: 'POST' })
    router.replace('/cha-de-panela/admin/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b flex items-center justify-between">
        <h1 className="font-bold text-lg">Admin — Chá de Panela</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Sair
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Formulário de adicionar/editar */}
        <section>
          <h2 className="font-semibold mb-4">{editando ? 'Editar Presente' : 'Adicionar Presente'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nome *"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Loja"
              value={form.loja}
              onChange={(e) => setForm({ ...form, loja: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              type="url"
              placeholder="URL do produto *"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
              className="border rounded px-3 py-2 text-sm md:col-span-2"
            />
            <input
              type="url"
              placeholder="URL da imagem (opcional)"
              value={form.imagem_url}
              onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
              className="border rounded px-3 py-2 text-sm md:col-span-2"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={form.preco}
              onChange={handlePrecoChange}
              className="border rounded px-3 py-2 text-sm"
            />
            {feedback && (
              <p
                className={`text-sm md:col-span-2 ${
                  feedback.toLowerCase().includes('erro') ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {feedback}
              </p>
            )}
            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                className="bg-gray-800 text-white rounded px-4 py-2 text-sm"
              >
                {editando ? 'Salvar alterações' : 'Adicionar'}
              </button>
              {editando && (
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="border rounded px-4 py-2 text-sm text-gray-600"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista de presentes */}
        <section>
          {(() => {
            const total = Math.ceil(presentesVisiveis.length / POR_PAGINA)
            const paginaAtual = Math.min(pagina, Math.max(1, total))
            const slice = presentesVisiveis.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA)

            const inicio = Math.min(Math.max(1, paginaAtual - 2), Math.max(1, total - 4))
            const fim = Math.min(total, inicio + 4)
            const paginas = Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i)
            const btnBase = 'px-2 py-1 text-xs border rounded transition-all duration-300'
            const btnInativo = `${btnBase} border-gray-300 hover:border-gray-500`
            const btnAtivo = `${btnBase} bg-gray-800 text-white border-gray-800`
            const btnDisabled = `${btnBase} border-gray-200 text-gray-300 cursor-default`

            const Paginacao = () => {
              if (total <= 1) return null
              return (
                <div className="flex items-center gap-1 flex-wrap">
                  <button onClick={() => setPagina(1)} disabled={paginaAtual === 1} className={paginaAtual === 1 ? btnDisabled : btnInativo}>&laquo;</button>
                  <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaAtual === 1} className={paginaAtual === 1 ? btnDisabled : btnInativo}>&lsaquo;</button>
                  {paginas.map((n) => (
                    <button key={n} onClick={() => setPagina(n)} className={n === paginaAtual ? btnAtivo : btnInativo}>{n}</button>
                  ))}
                  <button onClick={() => setPagina((p) => Math.min(total, p + 1))} disabled={paginaAtual === total} className={paginaAtual === total ? btnDisabled : btnInativo}>&rsaquo;</button>
                  <button onClick={() => setPagina(total)} disabled={paginaAtual === total} className={paginaAtual === total ? btnDisabled : btnInativo}>&raquo;</button>
                </div>
              )
            }

            return (
              <>
                <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                  <h2 className="font-semibold">
                    Presentes ({presentesVisiveis.length}{presentes.length !== presentesVisiveis.length ? ` de ${presentes.length}` : ''})
                    {total > 1 && <span className="text-gray-400 font-normal text-sm ml-2">— pág. {paginaAtual}/{total}</span>}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap w-full">
                    <input
                      type="text"
                      placeholder="Filtrar por nome..."
                      value={filtro}
                      onChange={(e) => { setFiltro(e.target.value); setPagina(1) }}
                      className="border rounded px-3 py-1 text-sm w-48"
                    />
                    {(['', 'preco-asc', 'preco-desc'] as const).map((o) => (
                      <button
                        key={o}
                        onClick={() => { setOrdenacao(o); setPagina(1) }}
                        className={`text-xs border rounded px-2 py-1 transition-all ${ordenacao === o ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 hover:border-gray-500'}`}
                      >
                        {o === '' ? 'Padrão' : o === 'preco-asc' ? '↑ Preço' : '↓ Preço'}
                      </button>
                    ))}
                    <button
                      onClick={() => { setMostrarReservados((v) => !v); setPagina(1) }}
                      className={`text-xs border rounded px-2 py-1 transition-all ${!mostrarReservados ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 hover:border-gray-500'}`}
                    >
                      {mostrarReservados ? 'Ocultar escolhidos' : 'Ver escolhidos'}
                    </button>
                    <div className="ml-auto"><Paginacao /></div>
                  </div>
                </div>
                {loading ? (
                  <p className="text-gray-400">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {slice.map((p) => (
                      <div
                        key={p.id}
                        className="border rounded-lg px-4 py-3 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{p.nome}</p>
                          <p className="text-xs text-gray-400">
                            {p.loja ? `${p.loja} · ` : ''}
                            {p.preco ?? 'Sem preço'} ·{' '}
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              ver produto
                            </a>
                          </p>
                          {p.reservado && (
                            <p className="text-xs text-orange-500 mt-1">Reservado</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditar(p)}
                            className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletar(p.id)}
                            className="text-xs border border-red-200 text-red-500 rounded px-2 py-1 hover:bg-red-50"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    {presentesFiltrados.length === 0 && (
                      <p className="text-gray-400 text-sm">
                        {filtro ? `Nenhum presente encontrado para "${filtro}".` : 'Nenhum presente cadastrado.'}
                      </p>
                    )}
                  </div>
                )}
                {total > 1 && <div className="mt-4 flex justify-end"><Paginacao /></div>}
              </>
            )
          })()}
        </section>
      </main>
    </div>
  )
}
