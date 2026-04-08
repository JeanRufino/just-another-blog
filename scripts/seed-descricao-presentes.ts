import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const raw = fs.readFileSync('./lista_descricoes_presentes.json', 'utf-8');
type Item = {
  link: string;
  descricao: string;
};
const data: Item[] = JSON.parse(raw);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
)

function normalizeUrl(url: string) {
  try {
    const u = new URL(url.trim().toLowerCase())

    let path = u.pathname

    if (path.includes('/ref=')) {
      path = path.split('/ref=')[0]
    }

    return u.origin + path
  } catch {
    return url.trim().toLowerCase()
  }
}

async function run() {
  let total = data.length
  let updated = 0
  let notFound = 0
  let noChange = 0

  for (const item of data) {
    const normalized = normalizeUrl(item.link)

    // busca candidatos (menos restritivo)
    const { data: rows, error } = await supabase
      .from('presentes')
      .select('id, url, descricao')

    if (error) {
      console.error('Erro ao buscar:', error)
      continue
    }

    const match = rows.find(r =>
      normalizeUrl(r.url) === normalized
    )

    if (!match) {
      notFound++
      continue
    }

    if (match.descricao === item.descricao) {
      noChange++
      continue
    }

    const { error: updateError } = await supabase
      .from('presentes')
      .update({ descricao: item.descricao })
      .eq('id', match.id)

    if (updateError) {
      console.error('Erro ao atualizar:', updateError)
      continue
    }

    updated++
  }

  console.log('\n===== RESUMO =====')
  console.log('Total:', total)
  console.log('Atualizados:', updated)
  console.log('Sem mudança:', noChange)
  console.log('Não encontrados:', notFound)
}

run()