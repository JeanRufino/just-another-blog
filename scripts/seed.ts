import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load env manually since we're outside Next.js
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  const jsonPath = path.join(__dirname, '..', 'lista_cha_de_panela.json')
  const raw = fs.readFileSync(jsonPath, 'utf-8')
  const lista: { nome: string; loja: string; url: string }[] = JSON.parse(raw)

  const primeiros4 = lista.slice(0, 4)

  console.log('Inserindo presentes:', primeiros4.map(p => p.nome))

  const { data, error } = await supabase
    .from('presentes')
    .upsert(primeiros4, { onConflict: 'url' })
    .select()

  if (error) {
    console.error('Erro ao inserir presentes:', error)
    process.exit(1)
  }

  console.log('Presentes inseridos com sucesso:', data)
}

seed()
