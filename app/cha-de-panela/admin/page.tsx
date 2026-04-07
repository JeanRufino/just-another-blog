'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'beatryzsrabelo@gmail.com'
const ADMIN_SENHA = '123456'

type Presente = {
  id: string
  nome: string
  loja: string | null
  url: string
  imagem_url: string | null
  reservado: boolean
  reserva: { id: string; reservado_por: { nome: string; email: string } | null } | null
}

type Form = {
  id?: string
  nome: string
  loja: string
  url: string
  imagem_url: string
}

const formVazio: Form = { nome: '', loja: '', url: '', imagem_url: '' }

export default function AdminChaDePanela() {
  const router = useRouter()
  const [autenticado, setAutenticado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [senhaErro, setSenhaErro] = useState('')
  const [emailAdmin, setEmailAdmin] = useState(false)

  const [presentes, setPresentes] = useState<Presente[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Form>(formVazio)
  const [editando, setEditando] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Verifica se usuário é admin
  useEffect(() => {
    const stored = localStorage.getItem('cha_usuario')
    if (!stored) {
      router.replace('/cha-de-panela')
      return
    }
    try {
      const u = JSON.parse(stored)
      if (u.email !== ADMIN_EMAIL) {
        router.replace('/cha-de-panela')
      } else {
        setEmailAdmin(true)
      }
    } catch {
      router.replace('/cha-de-panela')
    }
  }, [router])

  function handleSenha(e: React.FormEvent) {
    e.preventDefault()
    if (senhaInput === ADMIN_SENHA) {
      setAutenticado(true)
      fetchPresentes()
    } else {
      setSenhaErro('Senha incorreta')
      setSenhaInput('')
    }
  }

  async function fetchPresentes() {
    setLoading(true)
    const res = await fetch('/api/cha-de-panela/presentes')
    const json = await res.json()
    setPresentes(json.presentes ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback('')

    const method = editando ? 'PUT' : 'POST'
    const body = editando
      ? { id: form.id, nome: form.nome, loja: form.loja, url: form.url, imagem_url: form.imagem_url || null }
      : { nome: form.nome, loja: form.loja, url: form.url, imagem_url: form.imagem_url || null }

    const res = await fetch('/api/cha-de-panela/presentes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()

    if (!res.ok) {
      setFeedback(json.error ?? 'Erro')
    } else {
      setFeedback(editando ? 'Presente atualizado!' : 'Presente adicionado!')
      setForm(formVazio)
      setEditando(false)
      fetchPresentes()
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Confirmar remoção deste presente?')) return
    const res = await fetch('/api/cha-de-panela/presentes', {
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
    setForm({
      id: p.id,
      nome: p.nome,
      loja: p.loja ?? '',
      url: p.url,
      imagem_url: p.imagem_url ?? '',
    })
    setEditando(true)
    setFeedback('')
  }

  function handleCancelar() {
    setForm(formVazio)
    setEditando(false)
    setFeedback('')
  }

  if (!emailAdmin) return null

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={handleSenha} className="space-y-4 w-full max-w-xs">
          <h1 className="text-xl font-bold text-center">Admin — Chá de Panela</h1>
          <input
            type="password"
            placeholder="Senha"
            value={senhaInput}
            onChange={(e) => setSenhaInput(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            autoFocus
          />
          {senhaErro && <p className="text-red-500 text-sm">{senhaErro}</p>}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white rounded px-4 py-2 text-sm"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b flex items-center justify-between">
        <h1 className="font-bold text-lg">Admin — Chá de Panela</h1>
        <a href="/cha-de-panela" className="text-sm text-gray-500 hover:text-gray-800">
          ← Voltar
        </a>
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
            {feedback && (
              <p
                className={`text-sm md:col-span-2 ${
                  feedback.includes('Erro') || feedback.includes('erro')
                    ? 'text-red-500'
                    : 'text-green-600'
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
          <h2 className="font-semibold mb-4">Presentes ({presentes.length})</h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {presentes.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg px-4 py-3 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.nome}</p>
                    <p className="text-xs text-gray-400">
                      {p.loja && `${p.loja} · `}
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        ver produto
                      </a>
                    </p>
                    {p.reservado && p.reserva?.reservado_por && (
                      <p className="text-xs text-orange-500 mt-1">
                        Reservado por {p.reserva.reservado_por.nome} ({p.reserva.reservado_por.email})
                      </p>
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
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
