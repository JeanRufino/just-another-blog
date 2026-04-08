import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { nome, email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Tenta buscar usuário existente pelo email
    const { data: existente } = await supabase
      .from('usuarios')
      .select()
      .eq('email', email)
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ usuario: existente })
    }

    // Usuário novo — precisa do nome
    if (!nome) {
      return NextResponse.json({ novo: true }, { status: 200 })
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert({ nome, email })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ usuario: data })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
