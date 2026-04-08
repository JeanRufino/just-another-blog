import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(req: NextRequest) {
  try {
    const { presente_id } = await req.json()

    if (!presente_id) {
      return NextResponse.json({ error: 'presente_id é obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('presente_id', presente_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { presente_id, usuario_id } = await req.json()

    if (!presente_id || !usuario_id) {
      return NextResponse.json({ error: 'presente_id e usuario_id são obrigatórios' }, { status: 400 })
    }

    // Verifica se já foi reservado
    const { data: existente } = await supabase
      .from('reservas')
      .select('id')
      .eq('presente_id', presente_id)
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ error: 'Este presente já foi reservado' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('reservas')
      .insert({ presente_id, usuario_id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reserva: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
