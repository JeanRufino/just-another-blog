'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const res = await fetch('/api/cha-de-panela/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const json = await res.json()

      if (!res.ok) {
        setErro(json.error ?? 'Erro ao autenticar')
      } else {
        window.location.replace('/cha-de-panela/admin')
      }
    } catch {
      setErro('Erro de rede')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-end px-4 py-4 border-b">
        <Link href="/cha-de-panela" className="text-base text-gray-600 hover:text-gray-900">← Chá de Panela</Link>
      </header>
      <div className="flex items-center justify-center py-20">
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
          <h1 className="text-xl font-bold text-center">Admin</h1>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border rounded px-3 py-2 text-sm"
            autoFocus
          />
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
