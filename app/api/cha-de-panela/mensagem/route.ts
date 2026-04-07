import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { nome, email, mensagem, usuario_id } = await req.json()

    if (!nome || !email || !mensagem) {
      return NextResponse.json({ error: 'Nome, email e mensagem são obrigatórios' }, { status: 400 })
    }

    // Salva no banco
    const { error: dbError } = await supabase
      .from('mensagens')
      .insert({ nome, email, mensagem, usuario_id: usuario_id ?? null })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Envia e-mail
    try {
      await transporter.sendMail({
        from: `"Chá de Panela" <${process.env.EMAIL_USER}>`,
        to: 'contato@jeanrufino.com',
        subject: `Nova mensagem do Chá de Panela - ${nome}`,
        text: `De: ${nome} <${email}>\n\n${mensagem}`,
        html: `
          <h2>Nova mensagem do Chá de Panela</h2>
          <p><strong>De:</strong> ${nome} &lt;${email}&gt;</p>
          <hr />
          <p>${mensagem.replace(/\n/g, '<br />')}</p>
        `,
      })
    } catch (emailError) {
      // E-mail falhou mas mensagem já foi salva — não quebra a resposta
      console.error('Erro ao enviar e-mail:', emailError)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
