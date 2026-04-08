import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Middleware já garante autenticação para /api/cha-de-panela/admin/* antes de chegar aqui

// GET — lista todos os presentes com info de reserva
export async function GET() {
  const { data, error } = await supabase
    .from('presentes')
    .select('id, nome, descricao, loja, url, imagem_url, preco, created_at, reservas(id, usuario_id)')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const presentes = data.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    loja: p.loja,
    url: p.url,
    imagem_url: p.imagem_url,
    preco: p.preco,
    created_at: p.created_at,
    reservado: !!p.reservas,
  }))

  const res = NextResponse.json({ presentes })
  res.headers.set('Cache-Control', 'no-store')
  return res
}

// POST — insere novo presente
export async function POST(req: NextRequest) {
  try {
    const { nome, descricao, loja, url, imagem_url, preco } = await req.json()

    if (!nome || !url) {
      return NextResponse.json({ error: 'Nome e URL são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('presentes')
      .insert({ nome, descricao, loja, url, imagem_url, preco })
      .select()
      .single()

    if (error) {
      const msg = error.code === '23505' && error.message.includes('url')
        ? 'Esse link já está cadastrado. Verifique se o presente já existe na lista.'
        : 'Erro ao salvar presente.'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({ presente: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT — edita presente existente (recebe id + campos)
export async function PUT(req: NextRequest) {
  try {
    const { id, nome, descricao, loja, url, imagem_url, preco } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('presentes')
      .update({ nome, descricao, loja, url, imagem_url, preco })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      const msg = error.code === '23505' && error.message.includes('url')
        ? 'Esse link já está cadastrado em outro presente.'
        : 'Erro ao atualizar presente.'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({ presente: data })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE — remove presente (recebe id)
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
