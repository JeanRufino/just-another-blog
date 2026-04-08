import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET — lista todos os presentes com info de reserva
export async function GET() {
  const { data, error } = await supabase
    .from('presentes')
    .select(`
      *,
      reservas (
        id,
        usuarios (
          nome,
          email
        )
      )
    `)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const presentes = data.map((p) => {
    const reserva = p.reservas ?? null
    return {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      loja: p.loja,
      url: p.url,
      imagem_url: p.imagem_url,
      preco: p.preco,
      created_at: p.created_at,
      reservado: !!reserva,
      reserva: reserva
        ? {
            id: reserva.id,
            reservado_por: reserva.usuarios,
          }
        : null,
    }
  })

  return NextResponse.json({ presentes })
}

// POST — adiciona novo presente (admin)
export async function POST(req: NextRequest) {
  try {
    const { nome, loja, url, imagem_url, preco } = await req.json()

    if (!nome || !url) {
      return NextResponse.json({ error: 'Nome e URL são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('presentes')
      .insert({ nome, loja, url, imagem_url, preco })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ presente: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT — edita presente existente (admin)
export async function PUT(req: NextRequest) {
  try {
    const { id, nome, loja, url, imagem_url, preco } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('presentes')
      .update({ nome, loja, url, imagem_url, preco })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ presente: data })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE — remove presente (admin)
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Remove reservas associadas primeiro
    await supabase.from('reservas').delete().eq('presente_id', id)

    const { error } = await supabase.from('presentes').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
