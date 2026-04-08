import { NextRequest, NextResponse } from 'next/server'
import { signSession, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Servidor mal configurado' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }

    const token = await signSession(adminEmail)

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return res
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
